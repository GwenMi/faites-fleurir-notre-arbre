import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const campaigns = await base44.asServiceRole.entities.EmailCampaign.filter({ status: 'scheduled' });

    const now = new Date();
    const results = [];

    for (const campaign of campaigns) {
      const events = await base44.asServiceRole.entities.Event.filter({ id: campaign.event_id });
      if (!events || events.length === 0) continue;
      const event = events[0];

      let shouldSend = false;
      if (campaign.schedule_type === 'immediate') {
        shouldSend = true;
      } else if (campaign.schedule_type === 'specific_date' && campaign.scheduled_date) {
        shouldSend = new Date(campaign.scheduled_date) <= now;
      } else if (campaign.schedule_type === 'days_before_event' && campaign.days_before_event && event.event_date) {
        const sendDate = new Date(event.event_date);
        sendDate.setDate(sendDate.getDate() - campaign.days_before_event);
        shouldSend = sendDate <= now;
      }

      if (!shouldSend) continue;

      let allGuests = await base44.asServiceRole.entities.GuestInvitation.filter({ event_id: campaign.event_id });
      allGuests = allGuests.filter(g => g.guest_email);

      let targetGuests = allGuests;
      if (campaign.target_audience === 'pending_rsvp') {
        targetGuests = allGuests.filter(g => g.rsvp_status === 'pending');
      } else if (campaign.target_audience === 'confirmed') {
        targetGuests = allGuests.filter(g => g.rsvp_status === 'confirmed');
      }

      const eventDateStr = event.event_date
        ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "";

      let sentCount = 0;
      for (const guest of targetGuests) {
        const body = campaign.body_template
          .replace(/\{\{guest_name\}\}/g, guest.guest_name || '')
          .replace(/\{\{couple_names\}\}/g, event.couple_names || '')
          .replace(/\{\{event_date\}\}/g, eventDateStr)
          .replace(/\{\{rsvp_link\}\}/g, event.public_url || '')
          .replace(/\{\{welcome_message\}\}/g, event.welcome_message || '');

        const subject = campaign.subject
          .replace(/\{\{guest_name\}\}/g, guest.guest_name || '')
          .replace(/\{\{couple_names\}\}/g, event.couple_names || '')
          .replace(/\{\{event_date\}\}/g, eventDateStr);

        await base44.asServiceRole.integrations.Core.SendEmail({ to: guest.guest_email, subject, body });
        sentCount++;
      }

      await base44.asServiceRole.entities.EmailCampaign.update(campaign.id, {
        status: 'sent',
        sent_count: sentCount,
        sent_date: new Date().toISOString(),
      });

      results.push({ campaign_id: campaign.id, name: campaign.name, sent: sentCount });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});