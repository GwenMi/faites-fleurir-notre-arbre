import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req);

    const { weightGrams = 500, toCountry = 'FR' } = await req.json();

    const publicKey = Deno.env.get('sencloud_publickey');
    const secretKey = Deno.env.get('sendcloud');

    if (!publicKey || !secretKey) {
      return Response.json(
        { error: 'Sendcloud credentials not configured' },
        { status: 503 }
      );
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    const url = new URL('https://panel.sendcloud.sc/api/v2/shipping_methods');
    url.searchParams.set('from_country', 'FR');
    url.searchParams.set('to_country', toCountry);
    url.searchParams.set('weight', String(weightGrams));

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Sendcloud error:', response.status, text);
      return Response.json(
        { error: `Sendcloud API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter methods compatible with the given weight, keep only relevant fields
    const methods = (data.shipping_methods || [])
      .filter((m: any) => {
        const min = m.min_weight ?? 0;
        const max = m.max_weight ?? Infinity;
        return weightGrams >= min && weightGrams <= max;
      })
      .map((m: any) => ({
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
