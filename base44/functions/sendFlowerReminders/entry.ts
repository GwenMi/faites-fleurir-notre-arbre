import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Fonction appelée chaque nuit par l'automation schedulée.
// Pour chaque commande de kit fleurs avec une event_date = hier (J+1 après l'événement),
// elle envoie un email aux mariés + aux invités (si renseignés) avec le lien vers la galerie floraison.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Calcul de la date d'hier (J+1 après l'événement = on envoie le lendemain)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Récupérer toutes les commandes avec event_date = hier, pas encore envoyées, non annulées
    const orders = await base44.asServiceRole.entities.Order.filter({
      event_date: yesterdayStr,
      flower_reminder_sent: false,
    });

    const kitIds = ['compose', 'pret', 'kit_compose', 'kit_pret'];
    const flowerOrders = (orders || []).filter(order => {
      if (order.status === 'cancelled') return false;
      // Vérifier que c'est bien un kit fleurs (pas entreprise/naturel)
      const opts = order.options_selected || {};
      const kitType = opts.kitType || order.product_id || '';
      return kitIds.some(k => kitType.includes(k)) || kitType === 'compose' || kitType === 'pret';
    });

    console.log(`Flower reminders: found ${flowerOrders.length} order(s) for event_date=${yesterdayStr}`);

    let sent = 0;

    for (const order of flowerOrders) {
      const opts = order.options_selected || {};

      // Trouver le site de mariage associé (via event_id)
      let siteUrl = null;
      let coupleNames = null;
      if (order.event_id) {
        const events = await base44.asServiceRole.entities.Event.filter({ id: order.event_id });
        if (events?.length > 0) {
          const ev = events[0];
          siteUrl = ev.public_url || null;
          coupleNames = ev.couple_names || null;
        }
      }

      const gallerySuffix = siteUrl ? `${siteUrl}#galerie-fleurs` : null;
      const galleryLink = gallerySuffix || 'https://fleursdefete.fr';

      const eventDateFr = yesterdayStr
        ? new Date(yesterdayStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

      const coupleLabel = coupleNames ? `${coupleNames}` : 'vos mariés';

      // ── Email aux mariés (acheteur) ──────────────────────────────
      const bodyCouples = `
Bonjour ${order.customer_name} 🌸

Hier, c'était le grand jour ! Nous espérons que votre événement était merveilleux.

Maintenant que vos invités sont rentrés chez eux avec leur pot de fleurs, c'est le moment de lancer le grand défi floraison ! 🌱

Les 45 prochains jours vont voir vos graines se transformer en fleurs.
Encouragez vos invités à partager leurs photos sur votre galerie en ligne :

👉 ${galleryLink}

Ils peuvent poster une photo de leur pot chaque semaine pour suivre la croissance ensemble. C'est un super moyen de garder la magie de votre journée encore un peu plus longtemps.

─────────────────────────────────
🌻 COMMENT ÇA MARCHE ?
─────────────────────────────────

1. Vos invités posent leur pot sur un rebord ensoleillé
2. Ils arrosent légèrement 2x par semaine
3. Ils postent une photo sur votre galerie avec le lien ci-dessus
4. Dans ~45 jours, les fleurs s'épanouissent !

─────────────────────────────────

Pour toute question : contact@fleursdefete.fr

Mille mercis et belle floraison à tous ! 🌸
L'équipe Fleurs de fête
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `🌱 C'était hier ! Lancez le défi floraison de ${coupleLabel}`,
        body: bodyCouples,
        from_name: 'Fleurs de fête',
      });

      // ── Emails aux invités (si liste fournie) ────────────────────
      const guestEmails = order.guest_emails || [];
      for (const guestEmail of guestEmails) {
        if (!guestEmail || !guestEmail.includes('@')) continue;

        const bodyGuests = `
Bonjour ! 🌸

Hier, vous avez célébré ${coupleLabel} et repartez avec un précieux souvenir : votre pot de fleurs Fleurs de fête 🌱

Il est temps de lancer le grand défi floraison !
Posez votre pot sur un rebord ensoleillé, arrosez légèrement, et dans 45 jours vous aurez de belles fleurs.

Partagez vos photos sur la galerie de l'événement et suivez la floraison de tous les invités en même temps :

👉 ${galleryLink}

─────────────────────────────────
🌻 CONSEILS DE PLANTATION
─────────────────────────────────

• Posez le pot près d'une fenêtre bien éclairée
• Arrosez avec 2 cuillères à soupe d'eau tous les 2-3 jours
• Retirez le couvercle une fois les premières pousses apparues
• Dans ~45 jours : floraison ! 🌸

─────────────────────────────────

Pour toute question : contact@fleursdefete.fr

Belle floraison et à bientôt sur la galerie ! 🌻
L'équipe Fleurs de fête
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: guestEmail,
          subject: `🌱 Votre pot de fleurs de ${coupleLabel} — Le défi floraison commence !`,
          body: bodyGuests,
          from_name: 'Fleurs de fête',
        });
      }

      // Marquer la commande comme traitée
      await base44.asServiceRole.entities.Order.update(order.id, {
        flower_reminder_sent: true,
        flower_reminder_sent_at: new Date().toISOString(),
      });

      sent++;
      console.log(`Flower reminder sent for order ${order.id} (${order.customer_email}), ${guestEmails.length} guest(s)`);
    }

    return Response.json({ success: true, sent, checked: flowerOrders.length });
  } catch (error) {
    console.error('sendFlowerReminders error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});