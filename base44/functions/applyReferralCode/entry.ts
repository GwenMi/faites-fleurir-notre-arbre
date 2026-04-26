import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { referralCode, refereeEmail } = await req.json();
    if (!referralCode) return Response.json({ valid: false, error: 'Code manquant' });

    const code = referralCode.trim().toUpperCase();

    // Chercher le code dans les referrals existants
    const referrals = await base44.asServiceRole.entities.Referral.filter({ referral_code: code });
    if (!referrals || referrals.length === 0) {
      return Response.json({ valid: false, error: 'Code parrainage invalide' });
    }

    const referral = referrals[0];

    // Le parrain ne peut pas utiliser son propre code
    if (referral.referrer_email === refereeEmail) {
      return Response.json({ valid: false, error: 'Vous ne pouvez pas utiliser votre propre code' });
    }

    // Vérifier que ce filleul n'a pas déjà utilisé ce code
    const alreadyUsed = await base44.asServiceRole.entities.Referral.filter({
      referral_code: code,
      referee_email: refereeEmail
    });
    if (alreadyUsed && alreadyUsed.length > 0) {
      return Response.json({ valid: false, error: 'Vous avez déjà utilisé ce code' });
    }

    // Vérifier que l'email n'a pas déjà bénéficié d'un parrainage
    const previousReferrals = await base44.asServiceRole.entities.Referral.filter({
      referee_email: refereeEmail,
      status: 'used'
    });
    if (previousReferrals && previousReferrals.length > 0) {
      return Response.json({ valid: false, error: 'Vous avez déjà bénéficié d\'un parrainage' });
    }

    return Response.json({
      valid: true,
      referralId: referral.id,
      referrerName: referral.referrer_name,
      discountAmount: referral.discount_amount || 5,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});