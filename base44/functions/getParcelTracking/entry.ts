import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const { tracking_number } = await req.json();

    if (!tracking_number) {
      return Response.json({ error: 'tracking_number requis' }, { status: 400 });
    }

    const publicKey = Deno.env.get('sencloud_publickey');
    const secretKey = Deno.env.get('sendcloud');

    if (!publicKey || !secretKey) {
      return Response.json({ error: 'Sendcloud non configuré' }, { status: 503 });
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    // Rechercher le colis par numéro de tracking
    const parcelsRes = await fetch(
      `https://panel.sendcloud.sc/api/v2/parcels?tracking_number=${encodeURIComponent(tracking_number)}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!parcelsRes.ok) {
      return Response.json({ error: `Sendcloud API error: ${parcelsRes.status}` }, { status: parcelsRes.status });
    }

    const parcelsData = await parcelsRes.json();
    const parcels = parcelsData.parcels || [];

    if (parcels.length === 0) {
      return Response.json({ parcel: null, events: [] });
    }

    const parcel = parcels[0];
    const parcelId = parcel.id;

    // Récupérer les événements de suivi
    const trackingRes = await fetch(
      `https://panel.sendcloud.sc/api/v2/tracking/${parcelId}`,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let events = [];
    if (trackingRes.ok) {
      const trackingData = await trackingRes.json();
      events = trackingData.parcel?.tracking || [];
    }

    return Response.json({
      parcel: {
        id: parcel.id,
        tracking_number: parcel.tracking_number,
        status: parcel.status?.message || parcel.status,
        status_id: parcel.status?.id,
        carrier: parcel.carrier?.code,
        carrier_name: parcel.carrier?.name,
        tracking_url: parcel.tracking_url,
        weight: parcel.weight,
        updated_at: parcel.updated_at,
      },
      events: events.map(e => ({
        message: e.message || e.description,
        date: e.timestamp || e.date,
        location: e.city || e.location,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});