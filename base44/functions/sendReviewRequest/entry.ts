import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calcul de la date d'hier (J-1)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Récupérer toutes les commandes confirmées/livrées
    const orders = await base44.asServiceRole.entities.Order.filter({ status: "confirmed" });
    const deliveredOrders = await base44.asServiceRole.entities.Order.filter({ status: "delivered" });
    const allOrders = [...(orders || []), ...(deliveredOrders || [])];

    let sent = 0;

    for (const order of allOrders) {
      // Vérifier que event_date est hier
      if (!order.event_date) continue;
      const eventDate = order.event_date.split("T")[0];
      if (eventDate !== yStr) continue;

      // Vérifier qu'un avis n'existe pas déjà
      const existing = await base44.asServiceRole.entities.Review.filter({ order_id: order.id });
      if (existing?.length > 0) continue;

      // Construire le lien d'avis
      const reviewUrl = `https://fleursdefete.fr/ReviewOrder?order_id=${order.id}`;

      // Envoyer l'email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        from_name: "Fleurs de fête",
        subject: "🌸 Comment s'est passée votre journée ? Donnez-nous votre avis",
        body: `
<div style="font-family: 'Lato', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #374151;">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png" alt="Fleurs de fête" style="height: 48px;" />
  </div>

  <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 8px;">
    J + 1 🌸
  </h1>
  <p style="text-align: center; color: #6b7280; font-size: 15px; margin-bottom: 32px;">
    Bonjour ${order.customer_name},<br/>
    Nous espérons que votre événement s'est magnifiquement déroulé !
  </p>

  <div style="background: #fff7f7; border: 1px solid #fecdd3; border-radius: 16px; padding: 24px; margin-bottom: 28px; text-align: center;">
    <p style="font-size: 15px; color: #374151; margin-bottom: 8px;">
      Vos invités ont reçu leurs petits pots de graines — dans quelques semaines, les fleurs vont éclore chez eux. 🌱
    </p>
    <p style="font-size: 14px; color: #9ca3af;">
      En attendant, votre avis nous aiderait beaucoup à faire connaître Fleurs de fête !
    </p>
  </div>

  <div style="text-align: center; margin-bottom: 32px;">
    <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #fb7185, #ec4899); color: white; font-weight: 700; font-size: 16px; padding: 14px 36px; border-radius: 50px; text-decoration: none;">
      ⭐ Laisser mon avis
    </a>
    <p style="font-size: 11px; color: #d1d5db; margin-top: 8px;">2 minutes · anonymisé si vous le souhaitez</p>
  </div>

  <p style="text-align: center; font-size: 12px; color: #9ca3af;">
    © Fleurs de fête · contact@fleursdefete.fr
  </p>
</div>
        `.trim(),
      });

      sent++;
      console.log(`Review request sent to ${order.customer_email} for order ${order.id}`);
    }

    return Response.json({ sent, date: yStr });
  } catch (error) {
    console.error("sendReviewRequest error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});