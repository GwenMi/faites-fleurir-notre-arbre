import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const QONTO_BASE = "https://thirdparty.qonto.com/v2";

function qontoHeaders() {
  const login = Deno.env.get("QONTO_LOGIN");
  const apiKey = Deno.env.get("QONTO_API_KEY");
  return {
    "Authorization": `${login}:${apiKey}`,
    "Content-Type": "application/json",
  };
}

// Trouve ou crée un client Qonto à partir de l'email
async function findOrCreateQontoClient(order) {
  const opts = order.options_selected || {};
  const email = order.customer_email;
  const fullName = order.customer_name || "";
  const nameParts = fullName.trim().split(" ");
  const firstName = nameParts[0] || "Client";
  const lastName = nameParts.slice(1).join(" ") || fullName;

  // Recherche par email
  const searchRes = await fetch(`${QONTO_BASE}/clients?filter[email]=${encodeURIComponent(email)}`, {
    headers: qontoHeaders(),
  });
  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.clients?.length > 0) return data.clients[0].id;
  }

  // Adresse de facturation
  const billingStreet = opts.billing_street || opts.delivery_address?.split(",")[0] || "";
  const billingCity = opts.billing_city || "";
  const billingZip = opts.billing_zip || "";
  const billingCountry = (opts.billing_country || "FR").toUpperCase().slice(0, 2);

  // Création du client
  let clientBody;
  if (opts.is_company && opts.company_name) {
    clientBody = {
      kind: "company",
      name: opts.company_name,
      email,
      currency: "EUR",
      locale: "fr",
      address: billingStreet,
      city: billingCity,
      zip_code: billingZip,
      country_code: billingCountry,
    };
    if (opts.vat_number) clientBody.vat_number = opts.vat_number;
  } else {
    clientBody = {
      kind: "individual",
      first_name: firstName,
      last_name: lastName,
      email,
      currency: "EUR",
      locale: "fr",
      address: billingStreet,
      city: billingCity,
      zip_code: billingZip,
      country_code: billingCountry,
    };
  }

  const createRes = await fetch(`${QONTO_BASE}/clients`, {
    method: "POST",
    headers: qontoHeaders(),
    body: JSON.stringify(clientBody),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Qonto client creation failed: ${createRes.status} — ${err}`);
  }
  const created = await createRes.json();
  return created.client.id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await req.json();
    if (!orderId) return Response.json({ error: "orderId requis" }, { status: 400 });

    // Récupérer la commande
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    const order = orders?.[0];
    if (!order) return Response.json({ error: "Commande introuvable" }, { status: 404 });

    // Vérifier si une facture Qonto existe déjà
    if (order.qonto_invoice_id) {
      return Response.json({
        success: true,
        already_exists: true,
        qonto_invoice_id: order.qonto_invoice_id,
        invoice_number: order.invoice_number,
      });
    }

    // Obtenir/générer le numéro de facture FEF-XXXX
    let invoiceNumber = order.invoice_number;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const counters = await base44.asServiceRole.entities.InvoiceCounter.filter({ year });
      let counter = counters?.[0];
      if (!counter) {
        counter = await base44.asServiceRole.entities.InvoiceCounter.create({ year, last_number: 0 });
      }
      const next = (counter.last_number || 0) + 1;
      await base44.asServiceRole.entities.InvoiceCounter.update(counter.id, { last_number: next });
      invoiceNumber = `FEF-${year}-${String(next).padStart(4, "0")}`;
      await base44.asServiceRole.entities.Order.update(order.id, { invoice_number: invoiceNumber });
    }

    // Trouver ou créer le client Qonto
    const clientId = await findOrCreateQontoClient(order);

    // Construire les lignes de facture
    const opts = order.options_selected || {};
    const totalTTC = order.total_price || 0;
    const qty = order.quantity || 1;
    const unitPrice = (totalTTC / qty).toFixed(2);

    // Options détail
    const optionParts = [
      opts.kitVariant === "crackers" ? "Kit Apéro Crackers Italiens" : opts.kitVariant === "tournesol" ? "Graines de tournesol" : null,
      opts.containerType === "rond_clip" ? "Pot rond fermoir" : opts.containerType === "carre_liege" ? "Pot carré liège" : null,
      opts.sacCadeau ? "Sac cadeau inclus" : null,
      opts.customization?.names ? `Personnalisation : ${opts.customization.names}` : null,
      opts.customization?.companyName ? `Entreprise : ${opts.customization.companyName}` : null,
      opts.shipping_method_name ? `Livraison : ${opts.shipping_method_name}` : null,
    ].filter(Boolean).join(" · ");

    const issueDate = new Date().toISOString().split("T")[0];
    // Échéance : 30 jours (déjà payé via Stripe, mais requis par Qonto)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const invoiceBody = {
      client_id: clientId,
      number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      currency: "EUR",
      status: "paid", // déjà payé via Stripe
      items: [
        {
          title: order.product_name || "Kit Fleurs de fête",
          description: optionParts || undefined,
          quantity: String(qty),
          unit_price: {
            value: unitPrice,
            currency: "EUR",
          },
          vat_rate: "0", // franchise TVA art. 293 B
          vat_exemption_reason: "N1",
        },
      ],
      footer: "TVA non applicable, art. 293 B du CGI. SIRET 843 299 041 00049.",
      settings: {
        vat_number: "FR74843299041",
        late_payment_penalties: "En cas de retard : pénalités de 3× le taux légal + indemnité forfaitaire de 40€.",
      },
    };

    const invoiceRes = await fetch(`${QONTO_BASE}/client_invoices`, {
      method: "POST",
      headers: qontoHeaders(),
      body: JSON.stringify(invoiceBody),
    });

    if (!invoiceRes.ok) {
      const err = await invoiceRes.text();
      throw new Error(`Qonto invoice creation failed: ${invoiceRes.status} — ${err}`);
    }

    const invoiceData = await invoiceRes.json();
    const qontoInvoice = invoiceData.client_invoice;

    // Sauvegarder l'ID Qonto sur la commande
    await base44.asServiceRole.entities.Order.update(order.id, {
      qonto_invoice_id: qontoInvoice.id,
      qonto_invoice_url: qontoInvoice.invoice_url || null,
    });

    return Response.json({
      success: true,
      qonto_invoice_id: qontoInvoice.id,
      invoice_number: invoiceNumber,
      invoice_url: qontoInvoice.invoice_url,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});