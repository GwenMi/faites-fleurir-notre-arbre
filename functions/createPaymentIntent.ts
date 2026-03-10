import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, orderId, customerEmail, customerName } = await req.json();

    if (!amount || !orderId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        orderId,
        customerEmail,
        customerName,
        userId: user.id,
      },
      receipt_email: customerEmail,
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});