import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, email, role, message } = await req.json();

    if (!team_id || !email || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns the team
    const teams = await base44.asServiceRole.entities.Team.filter({ id: team_id });
    if (!teams?.length || teams[0].owner_email !== user.email) {
      return Response.json({ error: 'Not authorized to manage this team' }, { status: 403 });
    }

    // Check if member already exists
    const existing = await base44.asServiceRole.entities.TeamMember.filter({ 
      team_id, 
      email 
    });

    if (existing?.length > 0) {
      return Response.json({ error: 'Member already invited' }, { status: 409 });
    }

    // Create invitation
    const invitation = await base44.asServiceRole.entities.TeamMember.create({
      team_id,
      email,
      role,
      status: 'pending',
      invitation_sent_date: new Date().toISOString(),
    });

    // Send invitation email
    const team = teams[0];
    const inviteLink = `${Deno.env.get('APP_URL') || 'https://fleursdefete.fr'}/team-invitation?id=${invitation.id}&email=${encodeURIComponent(email)}`;
    
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `${user.full_name} vous invite à rejoindre ${team.name}`,
      body: `Bonjour,\n\n${user.full_name} vous invite à rejoindre l'équipe "${team.name}" en tant que ${role}.\n\n${message ? `Message personnel : ${message}\n\n` : ''}Accepter l'invitation : ${inviteLink}\n\nCordialement,\nFleurs de Fête`,
    });

    return Response.json({ 
      success: true, 
      invitation 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});