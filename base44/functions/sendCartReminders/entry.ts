import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Récupérer les paniers actifs sans rappel envoyé, créés depuis + de 2h
    const carts = await base44.asServiceRole.entities.AbandonedCart.filter({ 
      status: 'active', 
      reminder_sent: false 
    });

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const cartsToRemind = (carts || []).filter(cart => 
      new Date(cart.created_date) < twoHoursAgo
    );

    let sent = 0;
    for (const cart of cartsToRemind) {
      const name = cart.customer_info?.firstName || cart.customer_info?.name || 'là';
      const totalPots = (cart.selection?.packs || []).reduce((s, p) => s + p.size * p.qty, 0);
      
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: cart.user_email,
        from_name: 'Fleurs en fête',
        subject: '🌸 Votre panier vous attend !',
        body: `Bonjour ${name},\n\nVous avez commencé à composer votre kit de graines personnalisé mais n'avez pas finalisé votre commande.\n\n${totalPots > 0 ? `🌱 ${totalPots} pots de graines sont dans votre panier.` : 'Votre panier est encore actif.'}\n\nRevenez terminer votre commande en quelques clics :\n👉 https://fleursdefete.fr/Shop\n\nVotre panier est sauvegardé et vous retrouverez tout où vous en étiez.\n\nÀ très vite,\nGwenaëlle — Fleurs en fête\ncontact@fleursdefete.fr`
      });

      await base44.asServiceRole.entities.AbandonedCart.update(cart.id, {
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString()
      });
      sent++;
    }

    return Response.json({ success: true, sent, total: cartsToRemind.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});