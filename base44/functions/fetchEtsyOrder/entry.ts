import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const apiSecret = Deno.env.get('ETSY_API_SECRET');
    const shopId = Deno.env.get('ETSY_SHOP_ID');

    if (!apiKey || !apiSecret || !shopId) {
      return Response.json({ error: 'Etsy credentials not configured' }, { status: 500 });
    }

    // Fetch order from Etsy API
    const response = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shopId}/orders/${order_id}`,
      {
        headers: {
          'x-api-key': apiKey,
          'Authorization': `Bearer ${apiSecret}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Etsy API error:', error);
      return Response.json({ error: 'Failed to fetch Etsy order' }, { status: response.status });
    }

    const orderData = await response.json();

    // Extract relevant data
    const order = orderData.data || orderData;
    
    return Response.json({
      order_id: order.order_id,
      order_number: order.order_number,
      buyer_email: order.buyer_email,
      buyer_user_id: order.buyer_user_id,
      status: order.status,
      shipping_address: order.shipping_address || {},
      items: order.items || [],
      total_price: order.total_price,
      created_timestamp: order.created_timestamp,
    });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});