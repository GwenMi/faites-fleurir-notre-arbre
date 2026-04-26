import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Vérifier s'il a déjà un code
    const existing = await base44.asServiceRole.entities.Referral.filter({
      referrer_email: user.email,
      referee_email: null
    });

    // Chercher le code "maître" (sans referee = le code personnel du parrain)
    const masterCodes = await base44.asServiceRole.entities.Referral.filter({ referrer_email: user.email });
    const masterCode = masterCodes?.find(r => !r.referee_email);

    if (masterCode) {
      return Response.json({ referralCode: masterCode.referral_code });
    }

    // Générer un code unique basé sur le nom + année
    const namePart = (user.full_name || user.email)
      .split(/[\s@]/)[0]
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 6);
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 900 + 100);
    const code = `${namePart}${year}${random}`;

    await base44.asServiceRole.entities.Referral.create({
      referrer_email: user.email,
      referrer_name: user.full_name || user.email,
      referral_code: code,
      discount_amount: 5,
      reward_amount: 5,
      status: 'pending',
    });

    return Response.json({ referralCode: code });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});