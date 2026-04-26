import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, pseudo, invitationLink } = await req.json();

    if (!email || !pseudo || !invitationLink) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Accès administrateur — ${pseudo}`,
      body: `Bonjour,\n\nVous avez été invité à accéder à la page administrative.\n\nVotre pseudo: ${pseudo}\n\nComblez le formulaire de création de mot de passe en cliquant sur le lien ci-dessous:\n\n${invitationLink}\n\nLe lien expire dans 7 jours.\n\nCordialement`,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});