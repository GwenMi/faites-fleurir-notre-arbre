import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    // Vérification : on récupère l'événement directement depuis Stripe pour éviter la falsification
    const eventType = body?.type;
    const paymentIntentId = body?.data?.object?.id;

    if (!eventType || !paymentIntentId) {
      return Response.json({ error: 'Payload invalide' }, { status: 400 });
    }

    // Vérifier que le paiement existe vraiment côté Stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (eventType === 'payment_intent.succeeded' && intent.status === 'succeeded') {
      const base44 = createClientFromRequest(req);

      // Trouver la StripePayment correspondante
      const stripePayments = await base44.asServiceRole.entities.StripePayment.filter({
        stripe_payment_intent_id: paymentIntentId
      });

      if (stripePayments.length > 0) {
        const sp = stripePayments[0];

        // Mettre à jour StripePayment
        await base44.asServiceRole.entities.StripePayment.update(sp.id, {
          status: 'succeeded',
          receipt_url: intent.charges?.data?.[0]?.receipt_url || '',
          charge_id: intent.charges?.data?.[0]?.id || '',
        });

        // Mettre à jour la commande associée
        if (sp.order_id) {
          const orders = await base44.asServiceRole.entities.Order.filter({ id: sp.order_id });
          if (orders.length > 0) {
            const order = orders[0];
            const newPaymentStatus = sp.payment_type === 'full' ? 'paid' : 'partial';
            const depositAmount = sp.payment_type === 'deposit' ? (sp.amount_cents / 100) : 0;

            await base44.asServiceRole.entities.Order.update(order.id, {
              payment_status: newPaymentStatus,
              status: order.status === 'pending' ? 'confirmed' : order.status,
              ...(depositAmount > 0 ? { deposit_amount: depositAmount } : {}),
            });
          }
        }
      }
    }

    if (eventType === 'payment_intent.payment_failed') {
      const base44 = createClientFromRequest(req);
      const stripePayments = await base44.asServiceRole.entities.StripePayment.filter({
        stripe_payment_intent_id: paymentIntentId
      });
      if (stripePayments.length > 0) {
        await base44.asServiceRole.entities.StripePayment.update(stripePayments[0].id, {
          status: 'failed',
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});