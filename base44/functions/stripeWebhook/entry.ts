import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const eventType = body?.type;
    const session = body?.data?.object;

    if (!eventType || !session) {
      return Response.json({ error: 'Payload invalide' }, { status: 400 });
    }

    // Vérifier que la session existe vraiment côté Stripe
    const verified = await stripe.checkout.sessions.retrieve(session.id);

    if (eventType === 'checkout.session.completed' && verified.payment_status === 'paid') {
      const base44 = createClientFromRequest(req);

      // L'order_id est passé dans les metadata du lien de paiement
      const orderId = verified.metadata?.order_id || verified.client_reference_id;

      if (orderId) {
        const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
        if (orders.length > 0) {
          await base44.asServiceRole.entities.Order.update(orders[0].id, {
            payment_status: 'paid',
            status: orders[0].status === 'pending' ? 'confirmed' : orders[0].status,
          });
        }
      }

      // Mettre à jour StripePayment si elle existe
      const paymentIntentId = verified.payment_intent;
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