import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SHOP_ID = '63211095';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ETSY_API_KEY');

    if (!apiKey) {
      return Response.json({ error: 'ETSY_API_KEY non configuré' }, { status: 500 });
    }

    // Etsy v3 API — récupérer la commande de la boutique
    const response = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}/receipts/${order_id}`,
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    );

    const responseText = await response.text();
    console.log('Etsy API status:', response.status);
    console.log('Etsy API response:', responseText.slice(0, 500));

    if (!response.ok) {
      return Response.json({ error: `Etsy API error ${response.status}: ${responseText}` }, { status: response.status });
    }

    const order = JSON.parse(responseText);

    return Response.json({
      order_id: order.receipt_id,
      order_number: order.receipt_id,
      buyer_email: order.buyer_email,
      buyer_name: order.name,
      status: order.status,
      shipping_address: {
        name: order.name,
        first_line: order.first_line,
        second_line: order.second_line,
        city: order.city,
        state: order.state,
        zip: order.zip,
        country: order.country_iso,
      },
      items: (order.transactions || []).map(t => ({
        title: t.title,
        quantity: t.quantity,
        price: t.price?.amount / t.price?.divisor,
      })),
      total_price: order.grand_total?.amount / order.grand_total?.divisor,
      created_timestamp: order.create_timestamp,
    });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});