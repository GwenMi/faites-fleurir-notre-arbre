import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Envoyé chaque lundi matin.
// Pour toutes les commandes dont le défi floraison est en cours (event_date passée, < 45j),
// envoie un rappel hebdomadaire aux mariés + invités pour poster leur photo.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Toutes les commandes dont le rappel J+1 a été envoyé (= défi en cours)
    const orders = await base44.asServiceRole.entities.Order.filter({
      flower_reminder_sent: true,
    });

    const kitIds = ['compose', 'pret', 'kit_compose', 'kit_pret'];
    let sent = 0;

    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      if (!order.event_date) continue;

      // Vérifier que c'est bien un kit fleurs
      const opts = order.options_selected || {};
      const kitType = opts.kitType || order.product_id || '';
      const isFlower = kitIds.some(k => kitType.includes(k)) || kitType === 'compose' || kitType === 'pret';
      if (!isFlower) continue;

      // Calculer le jour J du défi (= event_date + 1 jour)
      const eventDate = new Date(order.event_date);
      const challengeStart = new Date(eventDate);
      challengeStart.setDate(challengeStart.getDate() + 1);
      const challengeEnd = new Date(challengeStart);
      challengeEnd.setDate(challengeEnd.getDate() + 45);

      // On n'envoie que pendant les 45 jours du défi
      if (today < challengeStart || today > challengeEnd) continue;

      const daysElapsed = Math.floor((today - challengeStart) / (1000 * 60 * 60 * 24));
      const daysLeft = 45 - daysElapsed;
      const weekNumber = Math.ceil(daysElapsed / 7);

      // Trouver le site de mariage
      let siteUrl = null;
      let coupleNames = null;
      if (order.event_id) {
        const events = await base44.asServiceRole.entities.Event.filter({ id: order.event_id });
        if (events?.length > 0) {
          siteUrl = events[0].public_url || null;
          coupleNames = events[0].couple_names || null;
        }
      }

      const galleryLink = siteUrl ? `${siteUrl}#galerie-fleurs` : 'https://fleursdefete.fr';
      const coupleLabel = coupleNames || 'vos mariés';

      // Récupérer les emails invités
      let guestEmails = order.guest_emails || [];
      if (guestEmails.length === 0 && order.event_id) {
        const invitations = await base44.asServiceRole.entities.GuestInvitation.filter({ event_id: order.event_id });
        guestEmails = (invitations || [])
          .map(g => g.guest_email)
          .filter(email => email && email.includes('@'));
      }

      // Messages selon la semaine
      const weekMessages = [
        { subject: "🌱 Semaine 1 — Vos graines ont-elles germé ?", tip: "Les premières pousses apparaissent souvent entre le 5e et 10e jour. Soyez patients ! 🌿" },
        { subject: "🌿 Semaine 2 — La pousse est lancée !", tip: "C'est le bon moment de retirer le couvercle si ce n'est pas encore fait. Donnez un peu plus d'eau." },
        { subject: "🌻 Semaine 3 — On voit la tige grandir !", tip: "Tournez le pot vers la lumière si la tige penche. Votre tournesol cherche le soleil ☀️" },
        { subject: "🌻 Semaine 4 — Presque là… le bouton floral arrive !", tip: "Le bouton floral va bientôt apparaître. Continuez l'arrosage régulier !" },
        { subject: "🌸 Semaine 5 — La floraison est imminente !", tip: "Vous y êtes presque ! Préparez votre appareil photo, la fleur va s'épanouir cette semaine. 📸" },
        { subject: "🌸 Semaine 6 — Votre fleur est épanouie !", tip: "C'est le moment de partager votre plus belle photo sur la galerie !" },
      ];

      const wm = weekMessages[Math.min(weekNumber - 1, weekMessages.length - 1)];

      // Email aux mariés
      const bodyCouple = `
Bonjour ${order.customer_name} 🌻

Semaine ${weekNumber} du défi floraison — Il reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''} !

${wm.tip}

Encouragez vos invités à partager leur photo sur votre galerie :
👉 ${galleryLink}

C'est le meilleur moyen de garder vivant le souvenir de votre journée 🌸

À très bientôt,
L'équipe Fleurs de fête
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `[Défi floraison] ${wm.subject} — ${daysLeft} jours restants`,
        body: bodyCouple,
        from_name: 'Fleurs de fête',
      });

      // Email aux invités
      for (const guestEmail of guestEmails) {
        if (!guestEmail || !guestEmail.includes('@')) continue;

        const bodyGuest = `
Bonjour ! 🌻

Semaine ${weekNumber} du défi floraison de ${coupleLabel}.
Il reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''} pour partager votre photo !

${wm.tip}

Postez votre photo sur la galerie et découvrez les pots de tous les invités :
👉 ${galleryLink}

Belle floraison ! 🌸
L'équipe Fleurs de fête
        `.trim();

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: guestEmail,
          subject: `[Défi floraison] ${wm.subject}`,
          body: bodyGuest,
          from_name: 'Fleurs de fête',
        });
      }

      sent++;
      console.log(`Weekly nudge sent for order ${order.id}, week ${weekNumber}, ${guestEmails.length} guest(s)`);
    }

    return Response.json({ success: true, sent });
  } catch (error) {
    console.error('sendWeeklyFlowerNudge error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});