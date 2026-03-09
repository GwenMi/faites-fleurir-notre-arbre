import { base44 } from "@/api/base44Client";

export async function notifyAdminNewOrder(order, eventUrl) {
  const statusText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NOUVELLE COMMANDE REÇUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIENT
Nom : ${order.customer_name}
Email : ${order.customer_email}

COMMANDE
Produit : ${order.product_name}
Quantité : ${order.quantity}
Montant : ${order.total_price?.toFixed(2) || "—"} €
Statut : ${order.status}
Paiement : ${order.payment_status}

ÉVÉNEMENT
Date : ${order.options_selected?.event_date 
  ? new Date(order.options_selected.event_date).toLocaleDateString("fr-FR", { 
      day: "numeric", month: "long", year: "numeric" 
    })
  : "Non renseignée"}
Site événement : ${eventUrl || "—"}

LIVRAISON
Adresse : ${order.options_selected?.delivery_address || "—"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️ À faire : Confirmer la commande et vérifier les délais de livraison
`;

  try {
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursenfete.com",
      subject: `📦 Nouvelle commande : ${order.customer_name}`,
      body: statusText,
    });
  } catch (e) {
    console.error("Erreur notification admin:", e);
  }
}

export async function notifyAdminPaymentReceived(order, paymentAmount, paymentType) {
  const typeLabel = paymentType === "full" ? "paiement intégral" : "acompte (50%)";
  
  try {
    await base44.integrations.Core.SendEmail({
      to: "contact@fleursenfete.com",
      subject: `💳 Paiement reçu : ${order.customer_name}`,
      body: `
Paiement reçu via Stripe

Client : ${order.customer_name} (${order.customer_email})
Commande : ${order.product_name}
Montant : ${paymentAmount.toFixed(2)} €
Type : ${typeLabel}

Total commande : ${order.total_price?.toFixed(2) || "—"} €
Statut paiement : ${order.payment_status}

${paymentType === "partial" ? `\nSOLDE À RÉGLER : ${(order.total_price - paymentAmount).toFixed(2)} € (à la livraison)` : ""}
      `,
    });
  } catch (e) {
    console.error("Erreur notification paiement:", e);
  }
}

export async function notifyCustomerPaymentReminder(order) {
  const balanceDue = order.total_price - (order.deposit_amount || 0);
  
  try {
    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `💳 Solde à régler — ${order.product_name}`,
      body: `
Bonjour ${order.customer_name},

Merci pour votre acompte de ${(order.deposit_amount || 0).toFixed(2)} € reçu sur votre commande.

📋 RÉCAPITULATIF
Montant à régler : ${balanceDue.toFixed(2)} €
Commande : ${order.product_name}
Quantité : ${order.quantity}

Le solde sera à régler à la livraison de votre commande.

Si vous avez des questions, n'hésitez pas à nous contacter.

Merci et à bientôt !
Gwenaëlle — Fleurs en fête 🌸
contact@fleursenfete.com
      `,
    });
  } catch (e) {
    console.error("Erreur notification solde:", e);
  }
}