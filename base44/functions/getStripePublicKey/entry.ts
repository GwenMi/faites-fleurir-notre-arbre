import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const publicKey = Deno.env.get('VITE_STRIPE_PUBLIC_KEY');
    if (!publicKey) {
      return Response.json({ error: 'Stripe public key not configured' }, { status: 500 });
    }
    return Response.json({ publicKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});