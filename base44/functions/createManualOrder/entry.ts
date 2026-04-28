import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      kit_id,
      kit_name,
      quantity,
      total_price,
      event_date,
      event_type,
      couple_names,
      delivery_address,
      custom_text,
      payment_status,
      source, // "manual", "etsy", "salon", "phone", etc.
      external_ref,
      notes,
      send_email,
      create_event_site,
    } = await req.json();

    if (!customer_name || !customer_email || !kit_id) {
      return Response.json({ error: 'Champs obligatoires manquants (nom, email, kit)' }, { status: 400 });
    }

    // 1. Créer la commande
    const orderData = {
      customer_name,
      customer_email,
      product_id: kit_id,
      product_name: kit_name,
      quantity: quantity || 1,
      total_price: total_price || 0,
      status: 'confirmed',
      payment_status: payment_status || 'unpaid',
      event_date: event_date || null,
      options_selected: {
        delivery_address: delivery_address || '',
        custom_text: custom_text || '',
        source: source || 'manual',
        external_ref: external_ref || '',
        customer_phone: customer_phone || '',
      },
      payment_notes: notes || '',
    };

    const order = await base44.asServiceRole.entities.Order.create(orderData);

    // 2. Créer le site événement si demandé
    let event = null;
    if (create_event_site && couple_names) {
      const slug = `${couple_names.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
      event = await base44.asServiceRole.entities.Event.create({
        couple_names: couple_names || customer_name,
        event_name: `Mariage de ${couple_names || customer_name}`,
        event_type: event_type || 'mariage',
        event_date: event_date || null,
        slug,
        status: 'active',
        plan: 'basic',
      });

      // Lier l'événement à la commande
      await base44.asServiceRole.entities.Order.update(order.id, { event_id: event.id });
    }

    // 3. Notifier Gwenaëlle de la nouvelle commande manuelle
    const adminNotifBody = `🌸 Nouvelle commande manuelle enregistrée !

👤 Client : ${customer_name} (${customer_email})
📦 Kit : ${kit_name} × ${quantity || 1}
💰 Montant : ${Number(total_price || 0).toFixed(2)} €
💳 Paiement : ${payment_status || 'unpaid'}
🔖 Source : ${source || 'manual'}
${external_ref ? `📋 Réf. externe : ${external_ref}` : ''}
${event_date ? `📅 Événement le : ${new Date(event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
${notes ? `📝 Notes : ${notes}` : ''}

ID commande : ${order.id}`;

    await Promise.all([
      base44.asServiceRole.integrations.Core.SendEmail({
        to: 'gwen@fleursdefete.fr',
        subject: `🌸 Nouvelle commande manuelle — ${kit_name} (${customer_name})`,
        body: adminNotifBody,
      }),
      base44.asServiceRole.integrations.Core.SendEmail({
        to: 'milletgwenaelle@gmail.com',
        subject: `🌸 Nouvelle commande manuelle — ${kit_name} (${customer_name})`,
        body: adminNotifBody,
      }),
    ]);

    // 4. Envoyer l'email de confirmation si demandé
    if (send_email) {
      const eventUrl = event
        ? `${req.headers.get('origin') || 'https://fleursenfete.com'}/event/${event.slug}`
        : null;

      const sourceLabel = {
        manual: 'commande manuelle',
        etsy: 'commande Etsy',
        salon: 'commande au salon',
        phone: 'commande par téléphone',
      }[source] || 'commande';

      const emailBody = `Bonjour ${customer_name},

Nous avons bien enregistré votre ${sourceLabel} pour :
🌸 ${kit_name} × ${quantity}
${total_price ? `💰 Montant : ${Number(total_price).toFixed(2)} €` : ''}
${event_date ? `📅 Événement le : ${new Date(event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
${external_ref ? `📋 Référence commande : ${external_ref}` : ''}

${delivery_address ? `📦 Adresse de livraison :\n${delivery_address}` : ''}

${event
  ? `🎉 Votre espace événement personnalisé a été créé ! Vous pouvez y accéder ici :\n${eventUrl}`
  : ''}

Pour toute question, n'hésitez pas à nous contacter.

Avec tout notre amour fleuri,
Gwenaëlle — Fleurs de fête 🌸
contact@fleursenfete.com`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: customer_email,
        subject: `🌸 Confirmation de votre commande — ${kit_name}`,
        body: emailBody,
      });
    }

    return Response.json({
      success: true,
      order_id: order.id,
      event_id: event?.id || null,
      event_slug: event?.slug || null,
    });

  } catch (error) {
    console.error('createManualOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});