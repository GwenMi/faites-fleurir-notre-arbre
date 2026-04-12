import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { weightGrams = 500, toCountry = 'FR' } = await req.json();

    const publicKey = Deno.env.get('sencloud_publickey');
    const secretKey = Deno.env.get('sendcloud');

    if (!publicKey || !secretKey) {
      return Response.json({ error: 'Sendcloud credentials not configured' }, { status: 503 });
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    // Sendcloud API expects weight in kg, not grams
    const weightKg = weightGrams / 1000;

    const url = new URL('https://panel.sendcloud.sc/api/v2/shipping_methods');
    url.searchParams.set('from_country', 'FR');
    url.searchParams.set('to_country', toCountry);
    url.searchParams.set('weight', weightKg.toFixed(3));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Sendcloud error:', response.status, text);
      return Response.json({ error: `Sendcloud API error: ${response.status} — ${text}` }, { status: response.status });
    }

    const data = await response.json();

    const methods = (data.shipping_methods || [])
      .filter((m) => {
        // min_weight and max_weight from Sendcloud are in kg
        const min = m.min_weight ?? 0;
        const max = m.max_weight ?? Infinity;
        return weightKg >= min && weightKg <= max;
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        carrier: m.carrier,
        minWeight: m.min_weight,
        maxWeight: m.max_weight,
        price: (() => {
          const raw = m.price;
          if (raw === null || raw === undefined) return null;
          const val = typeof raw === 'object' ? Object.values(raw)[0] : raw;
          const n = parseFloat(String(val));
          return isNaN(n) ? null : n;
        })(),
        deliveryDays: m.lead_time_hours ? Math.ceil(m.lead_time_hours / 24) : null,
      }));

    return Response.json({ methods });
  } catch (error) {
    console.error('getSendcloudShippingMethods error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});