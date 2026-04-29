import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const KIT_LABELS = {
  pret: "Kit prêt à offrir (5,90€/invité)",
  compose: "Kit à composer (3,90€/invité)",
};

const CONTAINER_LABELS = {
  rond_clip: "Pot rond avec fermoir métallique",
  carre_liege: "Pot carré avec bouchon en liège",
};

const EVENT_LABELS = {
  mariage: "Mariage",
  bapteme: "Baptême",
  communion: "Communion",
  anniversaire: "Anniversaire",
  entreprise: "Entreprise",
  maison_hotes: "Maison d'hôtes",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, customerInfo, selection, pricing } = await req.json();

    if (!customerInfo?.email || !orderId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const packs = selection.packs || [];
    const packsDetail = packs
      .map(p => `  • Pack ${p.size} invités × ${p.qty} = ${p.size * p.qty} pots (${(p.size * p.qty * pricing.pricePerPot).toFixed(2)}€)`)
      .join("\n");

    const customization = selection.customization || {};
    const customLines = [];
    if (customization.names) customLines.push(`  • Texte gravé : ${customization.names}`);
    if (customization.date) customLines.push(`  • Date de l'événement : ${customization.date}`);
    if (customization.seedType) customLines.push(`  • Graine choisie : ${customization.seedType}`);
    if (customization.logoUrl) customLines.push(`  • Logo personnalisé : fourni ✓`);

    const containerLabel = CONTAINER_LABELS[selection.containerType] || selection.containerType || "Non précisé";
    const kitLabel = KIT_LABELS[selection.kitType] || selection.kitType;
    const eventLabel = EVENT_LABELS[selection.eventType] || selection.eventType || "Non précisé";

    const eventDateStr = customerInfo.eventDate
      ? new Date(customerInfo.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : "Non précisée";

    const emailBody = `
Bonjour ${customerInfo.name},

Merci pour votre commande ! 🌸 Nous avons bien reçu votre paiement et votre commande est confirmée.

─────────────────────────────────────────
📦 RÉCAPITULATIF DE VOTRE COMMANDE #${orderId}
─────────────────────────────────────────

🎉 Type d'événement : ${eventLabel}
🧺 Type de kit : ${kitLabel}
🫙 Contenant : ${containerLabel}
${selection.sacCadeau ? "🎀 Sacs cadeaux : inclus\n" : ""}
📦 Packs commandés :
${packsDetail}

Total pots : ${pricing.totalPots} pots
${customLines.length > 0 ? `\n✍️ PERSONNALISATION\n${customLines.join("\n")}\n` : ""}
─────────────────────────────────────────
💶 DÉTAIL DES PRIX
─────────────────────────────────────────

Sous-total kits : ${pricing.subtotal.toFixed(2)}€${pricing.sacCadeauTotal > 0 ? `\nSacs cadeaux : +${pricing.sacCadeauTotal.toFixed(2)}€` : ""}${pricing.discount > 0 ? `\nRéduction multi-packs (-10%) : -${pricing.discount.toFixed(2)}€` : ""}
Livraison : ${pricing.shippingCost > 0 ? `${pricing.shippingCost.toFixed(2)}€` : "Offerte 🎁"}
━━━━━━━━━━━━━━━━━━━━━
TOTAL PAYÉ : ${pricing.total.toFixed(2)}€

─────────────────────────────────────────
📅 INFORMATIONS DE LIVRAISON
─────────────────────────────────────────

Nom : ${customerInfo.name}
Email : ${customerInfo.email}
Téléphone : ${customerInfo.phone || "Non renseigné"}
Adresse : ${[customerInfo.street, customerInfo.zipCode, customerInfo.city, customerInfo.country].filter(Boolean).join(", ") || "Non renseignée"}
Date de votre événement : ${eventDateStr}

Nous vous recommandons de prévoir la réception au moins 7 jours avant votre événement.

─────────────────────────────────────────

📱 SUIVI DE VOTRE COMMANDE
Suivez l'avancement de votre commande ici :
https://fleursdefete.fr/OrderTracking

Pour toute question : contact@fleursdefete.fr

À très bientôt,
L'équipe Fleurs de fête 🌸
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customerInfo.email,
      subject: `🌸 Confirmation de commande #${orderId} — Fleurs de fête`,
      body: emailBody,
      from_name: "Fleurs de fête"
    });

    // Notification interne à la boutique
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "contact@fleursdefete.fr",
      subject: `[Nouvelle commande] #${orderId} — ${customerInfo.name} — ${pricing.total.toFixed(2)}€`,
      body: `Nouvelle commande reçue !\n\nClient : ${customerInfo.name} (${customerInfo.email})\nMontant : ${pricing.total.toFixed(2)}€\nPots : ${pricing.totalPots}\nKit : ${kitLabel}\nÉvénement : ${eventLabel} le ${eventDateStr}\n\nConnectez-vous au dashboard pour traiter cette commande.`,
      from_name: "Fleurs de fête — Bot"
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendOrderConfirmation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});