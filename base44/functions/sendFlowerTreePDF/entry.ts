import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Appelée chaque matin par l'automation nocturne.
// Pour les commandes dont event_date + 45j = hier (fin du défi),
// génère un email de clôture aux mariés avec le lien vers la galerie et l'arbre fleuri.
// (Le PDF de l'arbre est généré côté front via FlowerTree — ici on envoie l'email de fin avec le lien galerie)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // La fin du défi = event_date + 46 jours (on envoie le lendemain du J+45)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 46);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const orders = await base44.asServiceRole.entities.Order.filter({
      event_date: targetDateStr,
      flower_reminder_sent: true,
    });

    const kitIds = ['compose', 'pret', 'kit_compose', 'kit_pret'];
    let sent = 0;

    for (const order of orders) {
      if (order.status === 'cancelled') continue;

      const opts = order.options_selected || {};
      const kitType = opts.kitType || order.product_id || '';
      const isFlower = kitIds.some(k => kitType.includes(k)) || kitType === 'compose' || kitType === 'pret';
      if (!isFlower) continue;

      // Éviter de renvoyer si déjà envoyé (vérifier via un champ dédié)
      if (order.flower_tree_pdf_sent) continue;

      // Récupérer les infos de l'événement
      let siteUrl = null;
      let coupleNames = null;
      let flowerPostsCount = 0;

      if (order.event_id) {
        const [events, flowerPosts] = await Promise.all([
          base44.asServiceRole.entities.Event.filter({ id: order.event_id }),
          base44.asServiceRole.entities.FlowerPost.filter({ event_id: order.event_id }),
        ]);

        if (events?.length > 0) {
          siteUrl = events[0].public_url || null;
          coupleNames = events[0].couple_names || null;
        }
        flowerPostsCount = (flowerPosts || []).filter(p => p.type === 'flower').length;
      }

      const galleryLink = siteUrl ? `${siteUrl}#galerie-fleurs` : 'https://fleursdefete.fr';
      const coupleLabel = coupleNames || order.customer_name;

      // Email de clôture aux mariés
      const body = `
Bonjour ${order.customer_name} 🌸

Les 45 jours du défi floraison sont terminés !

${flowerPostsCount > 0
  ? `🌻 ${flowerPostsCount} invité${flowerPostsCount > 1 ? 's ont' : ' a'} partagé ${flowerPostsCount > 1 ? 'leurs fleurs' : 'sa fleur'} sur votre galerie.`
  : 'Peut-être que vos invités ont fleuri dans leurs cœurs, même sans poster de photo 🌸'}

Retrouvez toutes les photos et l'arbre fleuri de votre événement ici :
👉 ${galleryLink}

Sur votre galerie, vous pouvez maintenant générer votre arbre fleuri avec les photos de tous vos invités — un magnifique souvenir à télécharger en PDF.

─────────────────────────────────
🌳 COMMENT GÉNÉRER VOTRE ARBRE ?
─────────────────────────────────

1. Ouvrez votre galerie : ${galleryLink}
2. Dans la section "Le défi des fleurs", cliquez sur "Générer notre arbre fleuri"
3. Choisissez votre silhouette (Chêne, Cerisier, Élégant ou Olivier)
4. Téléchargez votre arbre en PDF — un souvenir unique à encadrer !

─────────────────────────────────

Merci d'avoir choisi Fleurs de fête pour votre événement. Ce fut un honneur de faire partie de votre journée. 🌿

Avec toute notre affection,
L'équipe Fleurs de fête 🌸
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `🌳 Les 45 jours sont terminés — Votre arbre fleuri vous attend !`,
        body,
        from_name: 'Fleurs de fête',
      });

      // Marquer comme envoyé
      await base44.asServiceRole.entities.Order.update(order.id, {
        flower_tree_pdf_sent: true,
        flower_tree_pdf_sent_at: new Date().toISOString(),
      });

      sent++;
      console.log(`Flower tree closure email sent for order ${order.id}`);
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('sendFlowerTreePDF error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});