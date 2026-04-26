import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Appelé après paiement confirmé pour marquer le referral comme utilisé
// et créer un bon d'achat pour le parrain
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Pas d'auth user ici — appelé côté serveur post-paiement
    const { referralCode, refereeEmail, refereeName, orderId } = await req.json();

    if (!referralCode || !refereeEmail || !orderId) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const code = referralCode.trim().toUpperCase();
    const referrals = await base44.asServiceRole.entities.Referral.filter({ referral_code: code });
    if (!referrals || referrals.length === 0) return Response.json({ ok: false });

    const referral = referrals[0];

    // Générer un code promo pour le parrain
    const rewardCode = `MERCI${(referral.referrer_name || '').split(' ')[0].toUpperCase().slice(0, 4)}${Math.floor(Math.random() * 9000 + 1000)}`;

    // Créer l'enregistrement de parrainage utilisé
    await base44.asServiceRole.entities.Referral.create({
      referrer_email: referral.referrer_email,
      referrer_name: referral.referrer_name,
      referral_code: code,
      referee_email: refereeEmail,
      referee_name: refereeName || '',
      order_id: orderId,
      discount_amount: referral.discount_amount || 5,
      reward_amount: referral.reward_amount || 5,
      reward_code: rewardCode,
      status: 'used',
    });

    // Envoyer un email au parrain pour l'informer + lui donner son bon d'achat
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: referral.referrer_email,
      from_name: "Fleurs de Fête 🌸",
      subject: `🎁 ${refereeName || 'Un ami'} a utilisé votre code — voici votre récompense !`,
      body: `Bonjour ${referral.referrer_name || ''},\n\nBonne nouvelle ! ${refereeName || 'Un ami'} a passé une commande grâce à votre code de parrainage ${code}.\n\nEn récompense, voici votre bon d'achat de ${referral.reward_amount || 5}€ :\n\n🎁 Code : ${rewardCode}\n\nÀ utiliser sur votre prochaine commande sur fleursdefete.fr — il vous suffit de nous mentionner ce code lors de votre commande.\n\nMerci de recommander Fleurs de Fête !\n\nL'équipe Fleurs de Fête 🌸\ncontact@fleursdefete.fr`
    });

    return Response.json({ ok: true, rewardCode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});