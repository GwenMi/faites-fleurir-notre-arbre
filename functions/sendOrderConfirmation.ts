import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, customerEmail, customerName, orderDetails } = await req.json();

    // Générer QR code si slug fourni
    let qrCodeUrl = null;
    if (orderDetails?.slug) {
      const qrDataUrl = await QRCode.toDataURL(`https://fleursen.fete/${orderDetails.slug}`);
      qrCodeUrl = qrDataUrl;
    }

    // Formater l'email
    const emailBody = `
Bonjour ${customerName},

Merci pour votre commande ! Voici les détails :

📦 Récapitulatif
─────────────────────────────────────────
Type d'événement : ${orderDetails.eventType}
Type de kit : ${orderDetails.kitType}
Type de graine : ${orderDetails.seedType}
Quantité : ${orderDetails.totalPots} pots
Prix unitaire : ${orderDetails.pricePerPot}€
Sous-total : ${orderDetails.subtotal}€
Réduction : -${orderDetails.discount}€
TOTAL : ${orderDetails.total}€

${orderDetails.slug ? `🔗 Votre site d'événement
─────────────────────────────────────────
https://fleursen.fete/${orderDetails.slug}` : ''}

${orderDetails.customization?.names ? `Personnalisation : ${orderDetails.customization.names} - ${orderDetails.customization.date}` : ''}

📱 Suivi de commande
─────────────────────────────────────────
Vous pouvez suivre votre commande ici :
https://fleursen.fete/order-tracking?id=${orderId}&email=${customerEmail}

Si vous avez des questions, contactez-nous à support@fleursen.fete

Cordialement,
L'équipe Fleurs en fête 🌸
    `.trim();

    // Envoyer l'email
    const response = await base44.integrations.Core.SendEmail({
      to: customerEmail,
      subject: `Confirmation de votre commande #${orderId}`,
      body: emailBody,
      from_name: "Fleurs en fête"
    });

    return Response.json({
      success: true,
      message: "Email de confirmation envoyé",
      orderId,
      qrCodeUrl
    });

  } catch (error) {
    console.error('Error in sendOrderConfirmation:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});