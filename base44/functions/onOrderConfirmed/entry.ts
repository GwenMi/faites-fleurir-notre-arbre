import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Automation déclenchée quand une commande passe au statut "confirmed"
// Crée automatiquement la facture dans Qonto

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;
    const orderId = event?.entity_id || data?.id;

    if (!orderId) {
      return Response.json({ error: "Pas d'orderId dans le payload" }, { status: 400 });
    }

    // Appeler la fonction de création Qonto en service role
    const result = await base44.asServiceRole.functions.invoke("createQontoInvoice", {
      orderId,
    });

    console.log(`Facture Qonto créée pour commande ${orderId}:`, result);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("Erreur onOrderConfirmed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});