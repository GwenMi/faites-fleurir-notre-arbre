import jsPDF from "jspdf";
import { base44 } from "@/api/base44Client";

// TVA non applicable — franchise en base (EI art. 293 B CGI)
const TVA_EXEMPT = true;

const BUSINESS = {
  name: "Fleurs en fête",
  legal_name: "MONTIER Gwenaëlle",
  form: "Entreprise individuelle",
  email: "contact@fleursdefete.fr",
  address: "2 Place Jean V, Bureau 3, 44000 Nantes",
  siret: "843 299 041 00049",
  tva: "FR74843299041",
  rcs: "RCS Nantes 848 506 861",
  ape: "",
};

// Génère le prochain numéro de facture séquentiel (FEF-2026-0001)
export async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();
  const counters = await base44.entities.InvoiceCounter.filter({ year });
  let counter = counters?.[0];
  if (!counter) {
    counter = await base44.entities.InvoiceCounter.create({ year, last_number: 0 });
  }
  const next = (counter.last_number || 0) + 1;
  await base44.entities.InvoiceCounter.update(counter.id, { last_number: next });
  return `FEF-${year}-${String(next).padStart(4, "0")}`;
}

async function loadImageAsBase64(url) {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
    if (!img.naturalWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch { return null; }
}

export async function generateInvoicePDF(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const opts = order.options_selected || {};
  const pageW = 210;

  // Utiliser le numéro déjà stocké sur la commande, ou en générer un nouveau
  let invoiceNumber = order.invoice_number;
  if (!invoiceNumber) {
    invoiceNumber = await getNextInvoiceNumber();
    // Sauvegarder le numéro sur la commande pour la prochaine fois
    try {
      await base44.entities.Order.update(order.id, { invoice_number: invoiceNumber });
    } catch {}
  }

  const invoiceDate = new Date(order.created_date || Date.now()).toLocaleDateString("fr-FR");

  // Récupérer le paiement Stripe associé
  let stripePayment = null;
  try {
    const payments = await base44.entities.StripePayment.filter({ order_id: order.id }, "-created_date", 1);
    stripePayment = payments?.[0];
  } catch {}

  const totalTTC = order.total_price || 0;
  // Franchise TVA : HT = TTC, pas de TVA
  const totalHT = TVA_EXEMPT ? totalTTC : totalTTC / 1.20;
  const tvaAmount = TVA_EXEMPT ? 0 : totalTTC - totalHT;
  const unitPriceHT = totalHT / (order.quantity || 1);

  // ── Header band ─────────────────────────────────────────────────────
  doc.setFillColor(236, 90, 112);
  doc.rect(0, 0, pageW, 52, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("FACTURE", 20, 24);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(BUSINESS.name, 20, 32);
  doc.text(`${BUSINESS.form} — SIRET ${BUSINESS.siret}`, 20, 37);
  doc.text(BUSINESS.address, 20, 42);
  doc.text(BUSINESS.email, 20, 47);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`N° ${invoiceNumber}`, pageW - 18, 24, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date : ${invoiceDate}`, pageW - 18, 32, { align: "right" });
  const statusLabel = { pending: "En attente", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée" }[order.status] || order.status;
  doc.text(`Statut : ${statusLabel}`, pageW - 18, 38, { align: "right" });

  // ── Bloc "Facturé à" ────────────────────────────────────────────────
  let y = 66;
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Facturé à :", 20, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(order.customer_name || "", 20, y);
  y += 5;
  doc.text(order.customer_email || "", 20, y);

  if (opts.phone) { y += 5; doc.text(opts.phone, 20, y); }

  if (opts.delivery_address) {
    const lines = opts.delivery_address.split(/[\n,]/).map(l => l.trim()).filter(Boolean);
    lines.forEach(line => { y += 5; doc.text(line, 20, y); });
  }

  // Infos entreprise client si B2B
  if (opts.is_company) {
    if (opts.company_name) { y += 5; doc.setFont("helvetica", "bold"); doc.text(opts.company_name, 20, y); doc.setFont("helvetica", "normal"); }
    if (opts.siret) { y += 5; doc.text(`SIRET : ${opts.siret}`, 20, y); }
    if (opts.vat_number) { y += 5; doc.text(`TVA : ${opts.vat_number}`, 20, y); }
  }

  if (opts.event_date) {
    y += 7;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Événement prévu le : ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`, 20, y);
    doc.setTextColor(50, 50, 50);
  }

  // ── Tableau produits ────────────────────────────────────────────────
  y = Math.max(y + 14, 122);

  doc.setFillColor(248, 248, 248);
  doc.rect(15, y - 6, pageW - 30, 10, "F");
  doc.setDrawColor(230, 230, 230);
  doc.rect(15, y - 6, pageW - 30, 10, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Désignation", 20, y);
  doc.text("Options", 82, y);
  doc.text("Qté", 137, y, { align: "center" });
  doc.text("P.U. HT", 161, y, { align: "right" });
  doc.text("Total HT", 192, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  // Construire les options à partir des nouveaux champs
  const KIT_LABELS = { pret: "Kit prêt à offrir", compose: "Kit à composer", entreprise_standard: 'Pack Standard "Bureau"', entreprise_premium: 'Pack Premium "Moniteur"', naturel_essentiel: "Kit Naturel Essentiel", naturel_douceur: "Kit Naturel Douceur" };
  const VARIANT_LABELS = { tournesol: "Graines de tournesol", crackers: "Kit Apéro Crackers Italiens" };
  const CONTAINER_LABELS = { rond_clip: "Pot rond fermoir", carre_liege: "Pot carré liège" };

  const optionsParts = [
    opts.kitVariant && VARIANT_LABELS[opts.kitVariant],
    opts.containerType && CONTAINER_LABELS[opts.containerType],
    opts.sacCadeau && "Sac cadeau",
    opts.customization?.names && `Personnalisation : ${opts.customization.names}`,
    opts.customization?.companyName && `Entreprise : ${opts.customization.companyName}`,
    // Anciens champs
    opts.pot_type && `Pot : ${opts.pot_type}`,
    opts.seed_type && `Graines : ${opts.seed_type}`,
    opts.custom_text && `Texte : "${opts.custom_text}"`,
    opts.shipping_method_name && `Livraison : ${opts.shipping_method_name}`,
  ].filter(Boolean).join(" · ");

  const productLines = doc.splitTextToSize(order.product_name || "", 55);
  doc.text(productLines, 20, y);

  const optLines = doc.splitTextToSize(optionsParts || "—", 52);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(optLines, 82, y);

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(String(order.quantity || 1), 137, y, { align: "center" });
  doc.text(`${unitPriceHT.toFixed(2)} €`, 161, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(`${totalHT.toFixed(2)} €`, 192, y, { align: "right" });

  const rowH = Math.max(productLines.length, optLines.length) * 5 + 8;
  y += rowH;

  // ── Totaux ──────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageW - 15, y);
  y += 10;

  const totX = 130;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  doc.text("Sous-total HT :", totX, y);
  doc.text(`${totalHT.toFixed(2)} €`, 192, y, { align: "right" });
  y += 7;

  if (TVA_EXEMPT) {
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("TVA : non applicable — art. 293 B du CGI", totX, y);
    doc.text("0,00 €", 192, y, { align: "right" });
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
  } else {
    doc.text("TVA (20%) :", totX, y);
    doc.text(`${tvaAmount.toFixed(2)} €`, 192, y, { align: "right" });
    y += 7;
  }

  // Remise éventuelle
  if (opts.discount > 0) {
    doc.setTextColor(22, 163, 74);
    doc.text("Remise :", totX, y);
    doc.text(`−${opts.discount.toFixed(2)} €`, 192, y, { align: "right" });
    y += 7;
    doc.setTextColor(100, 100, 100);
  }

  y += 3;
  doc.setFillColor(236, 90, 112);
  doc.roundedRect(totX - 5, y - 6, pageW - totX - 10, 11, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL TTC :", totX, y);
  doc.text(`${totalTTC.toFixed(2)} €`, 192, y, { align: "right" });

  // ── Paiement Stripe ─────────────────────────────────────────────────
  let sectionY = y + 14;

  if (stripePayment?.status === "succeeded") {
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(14, sectionY - 2, 90, 32, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74);
    doc.text("✓ PAIEMENT SÉCURISÉ REÇU", 17, sectionY + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Montant : ${(stripePayment.amount_cents / 100).toFixed(2)} €`, 17, sectionY + 8);
    doc.text(`Type : ${stripePayment.payment_type === "full" ? "Paiement intégral" : "Acompte (50%)"}`, 17, sectionY + 13);
    if (stripePayment.charge_id) doc.text(`ID : ${stripePayment.charge_id.slice(-12)}`, 17, sectionY + 18);
    doc.text(`Via Stripe | ${new Date(stripePayment.created_date).toLocaleDateString("fr-FR")}`, 17, sectionY + 23);
    sectionY += 38;
  }

  // ── QR Code site événement ──────────────────────────────────────────
  const siteUrl = opts.site_public_url;
  if (siteUrl) {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(siteUrl)}`;
    const qrBase64 = await loadImageAsBase64(qrApiUrl);
    if (qrBase64) {
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(14, sectionY - 2, 50, 54, 3, 3, "S");
      doc.addImage(qrBase64, "PNG", 16, sectionY, 22, 22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(236, 90, 112);
      doc.text("Espace événement", 40, sectionY + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Scannez ce QR code", 40, sectionY + 9);
      doc.text("pour accéder au site", 40, sectionY + 13.5);
      doc.text("de votre événement 🌸", 40, sectionY + 18);
      const urlLines = doc.splitTextToSize(siteUrl, 47);
      doc.setTextColor(100, 149, 237);
      doc.text(urlLines, 16, sectionY + 27);
    }
  }

  // ── Footer légal ────────────────────────────────────────────────────
  const footY = 272;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, footY - 8, pageW - 15, footY - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);

  doc.text(
    `${BUSINESS.legal_name} — ${BUSINESS.form} — SIRET ${BUSINESS.siret} — N° TVA ${BUSINESS.tva} — ${BUSINESS.rcs}`,
    pageW / 2, footY - 3, { align: "center" }
  );
  doc.text(
    `${BUSINESS.address} — ${BUSINESS.email}`,
    pageW / 2, footY + 2, { align: "center" }
  );
  doc.text(
    "TVA non applicable, art. 293 B du CGI — Droit de rétractation : 14 jours à compter de la réception (hors produits personnalisés).",
    pageW / 2, footY + 7, { align: "center" }
  );

  return doc;
}

export function getInvoiceEmailBody(order) {
  const opts = order.options_selected || {};
  const ttc = order.total_price || 0;
  const invoiceNumber = order.invoice_number || `FEF-${(order.id || "").slice(-8).toUpperCase()}`;

  const optionsList = [
    opts.kitVariant === "crackers" ? "  · Variante : Kit Apéro Crackers Italiens" : opts.kitVariant === "tournesol" ? "  · Variante : Graines de tournesol" : null,
    opts.containerType && `  · Contenant : ${opts.containerType === "rond_clip" ? "Pot rond fermoir" : "Pot carré liège"}`,
    opts.sacCadeau && "  · Sacs cadeaux inclus",
    opts.customization?.names && `  · Personnalisation : ${opts.customization.names}`,
    opts.delivery_address && `  · Livraison : ${opts.delivery_address}`,
    opts.event_date && `  · Événement le : ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    opts.shipping_method_name && `  · Mode de livraison : ${opts.shipping_method_name}`,
  ].filter(Boolean).join("\n");

  return `Bonjour ${order.customer_name},

Voici votre facture pour votre commande Fleurs en fête 🌸

━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FACTURE N° ${invoiceNumber}
   Date : ${new Date(order.created_date || Date.now()).toLocaleDateString("fr-FR")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMANDE

Produit : ${order.product_name}
Quantité : ${order.quantity}
${optionsList}

RÉCAPITULATIF

Total HT ............ ${ttc.toFixed(2)} €
TVA ................. Non applicable — art. 293 B du CGI
─────────────────────────────
Total TTC ........... ${ttc.toFixed(2)} €

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Merci pour votre confiance et à très bientôt pour votre beau jour ! 💐

Gwenaëlle — Fleurs en fête
MONTIER Gwenaëlle — EI — SIRET 843 299 041 00049
contact@fleursdefete.fr

— TVA non applicable, art. 293 B du CGI.
— Droit de rétractation : 14 jours à compter de la réception (hors produits personnalisés).`;
}

export function getReminderEmailBody(order) {
  const opts = order.options_selected || {};
  const productName = order.product_name || "votre kit graines";
  const eventDate = opts.event_date
    ? `le ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : "bientôt";

  return `Bonjour ${order.customer_name} 🌸

Vos petites pousses d'amour t'attendent toujours dans leur panier… et elles ont hâte de fleurir pour ${eventDate} ! 🌱

Il semblerait que votre commande "${productName}" soit encore en cours de traitement. Pas d'inquiétude — on est juste là pour s'assurer que tout se passe bien de votre côté.

Si vous avez des questions, un petit détail à modifier ou si vous souhaitez qu'on procède à la confirmation, n'hésitez pas à nous écrire en répondant directement à cet email. On est là, avec le sourire 😊

À très vite,
Gwenaëlle — Fleurs en fête 🌸
contact@fleursdefete.fr`;
}