import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
    } catch (err) {
      return Response.json({ error: `Signature invalide: ${err.message}` }, { status: 400 });
    }

    const eventType = event.type;
    const session = event.data?.object;

    if (eventType === 'checkout.session.completed' && session.payment_status === 'paid') {
      const base44 = createClientFromRequest(req);

      const orderId = session.metadata?.order_id || session.client_reference_id;

      if (orderId) {
        const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
        if (orders.length > 0) {
          await base44.asServiceRole.entities.Order.update(orders[0].id, {
            payment_status: 'paid',
            status: orders[0].status === 'pending' ? 'confirmed' : orders[0].status,
          });
        }
      }

      const paymentIntentId = session.payment_intent;
      if (paymentIntentId) {
        const stripePayments = await base44.asServiceRole.entities.StripePayment.filter({
          stripe_payment_intent_id: paymentIntentId
        });
        if (stripePayments.length > 0) {
          await base44.asServiceRole.entities.StripePayment.update(stripePayments[0].id, {
            status: 'succeeded',
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});