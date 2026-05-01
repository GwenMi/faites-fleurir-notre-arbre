import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { page = "home" } = await req.json();

    const today = new Date().toISOString().split("T")[0];

    // Chercher un enregistrement existant pour aujourd'hui + cette page
    const existing = await base44.asServiceRole.entities.PageView.filter({ date: today, page });

    if (existing && existing.length > 0) {
      await base44.asServiceRole.entities.PageView.update(existing[0].id, {
        count: (existing[0].count || 1) + 1
      });
    } else {
      await base44.asServiceRole.entities.PageView.create({ date: today, page, count: 1 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});