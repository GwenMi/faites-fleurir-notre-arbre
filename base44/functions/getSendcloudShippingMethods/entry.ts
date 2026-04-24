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
        const min = parseFloat(m.min_weight ?? 0);
        const max = parseFloat(m.max_weight ?? 9999);
        return weightKg >= min && weightKg <= max;
      })
      .map((m) => {
        // Prix réels dans countries[].price (pas dans m.price qui est toujours 0)
        const countryData = (m.countries || []).find(c => c.iso_2 === toCountry);
        const price = countryData?.price ?? null;
        const leadTimeHours = countryData?.lead_time_hours ?? m.lead_time_hours ?? null;
        return {
          id: m.id,
          name: m.name,
          carrier: m.carrier,
          minWeight: m.min_weight,
          maxWeight: m.max_weight,
          price: price !== null ? parseFloat(price) : null,
          deliveryDays: leadTimeHours ? Math.ceil(leadTimeHours / 24) : null,
          servicePointRequired: m.service_point_input === 'required',
        };
      });

    return Response.json({ methods });
  } catch (error) {
    console.error('getSendcloudShippingMethods error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});