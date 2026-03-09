import jsPDF from "jspdf";

const TVA_RATE = 0.20;

async function loadImageAsBase64(url) {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
    if (!img.naturalWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  } catch { return null; }
}
const BUSINESS = {
  name: "Fleurs en fête",
  email: "contact@fleursenfete.com",
  tagline: "Des souvenirs qui fleurissent 🌸",
};

export async function generateInvoicePDF(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const opts = order.options_selected || {};
  const invoiceNumber = `FEF-${(order.id || "").slice(-8).toUpperCase()}`;
  const invoiceDate = new Date(order.created_date || Date.now()).toLocaleDateString("fr-FR");
  const pageW = 210;

  // Récupérer le paiement Stripe associé
  let stripePayment = null;
  try {
    const { base44 } = await import("@/api/base44Client");
    const payments = await base44.entities.StripePayment.filter({ order_id: order.id }, "-created_date", 1);
    stripePayment = payments?.[0];
  } catch (e) {
    // Paiement non trouvé ou erreur
  }

  const totalTTC = order.total_price || 0;
  const totalHT = totalTTC / (1 + TVA_RATE);
  const tvaAmount = totalTTC - totalHT;
  const unitPriceHT = totalHT / (order.quantity || 1);

  // Header band
  doc.setFillColor(236, 90, 112);
  doc.rect(0, 0, pageW, 48, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("FACTURE", 20, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(BUSINESS.name, 20, 33);
  doc.text(BUSINESS.email, 20, 39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`N° ${invoiceNumber}`, pageW - 18, 24, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date : ${invoiceDate}`, pageW - 18, 31, { align: "right" });
  const statusLabel = { pending: "En attente", confirmed: "Confirmée", shipped: "Expédiée", delivered: "Livrée" }[order.status] || order.status;
  doc.text(`Statut : ${statusLabel}`, pageW - 18, 38, { align: "right" });

  // Bill-to block
  let y = 62;
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Facturé à :", 20, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(order.customer_name || "", 20, y);
  y += 6;
  doc.text(order.customer_email || "", 20, y);

  if (opts.delivery_address) {
    const lines = opts.delivery_address.split(/\n/);
    lines.forEach(line => {
      if (line.trim()) { y += 6; doc.text(line.trim(), 20, y); }
    });
  }

  if (opts.event_date) {
    y += 8;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(
      `Événement prévu le : ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
      20, y
    );
    doc.setTextColor(50, 50, 50);
  }

  // Products table
  y = Math.max(y + 16, 118);

  doc.setFillColor(248, 248, 248);
  doc.rect(15, y - 6, pageW - 30, 10, "F");
  doc.setDrawColor(230, 230, 230);
  doc.rect(15, y - 6, pageW - 30, 10, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Désignation", 20, y);
  doc.text("Options", 82, y);
  doc.text("Qté", 137, y, { align: "center" });
  doc.text("P.U. HT", 161, y, { align: "right" });
  doc.text("Total HT", 192, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const optionsText = [
    opts.pot_type && `Pot : ${opts.pot_type}`,
    opts.ribbon_color && `Ruban : ${opts.ribbon_color}`,
    opts.seed_type && `Graines : ${opts.seed_type}`,
    opts.custom_text && `Texte : "${opts.custom_text}"`,
  ].filter(Boolean).join(" · ");

  const productLines = doc.splitTextToSize(order.product_name || "", 55);
  doc.text(productLines, 20, y);

  const optLines = doc.splitTextToSize(optionsText || "—", 52);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(optLines, 82, y);

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(String(order.quantity || 1), 137, y, { align: "center" });
  doc.text(`${unitPriceHT.toFixed(2)} €`, 161, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(`${totalHT.toFixed(2)} €`, 192, y, { align: "right" });

  const rowH = Math.max(productLines.length, optLines.length) * 5 + 8;
  y += rowH;

  // Totals
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageW - 15, y);
  y += 10;

  const totX = 142;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Sous-total HT :", totX, y);
  doc.text(`${totalHT.toFixed(2)} €`, 192, y, { align: "right" });
  y += 7;
  doc.text(`TVA (${TVA_RATE * 100}%) :`, totX, y);
  doc.text(`${tvaAmount.toFixed(2)} €`, 192, y, { align: "right" });
  y += 10;

  doc.setFillColor(236, 90, 112);
  doc.roundedRect(totX - 5, y - 6, 57, 11, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL TTC :", totX, y);
  doc.text(`${totalTTC.toFixed(2)} €`, 192, y, { align: "right" });

  // Section paiement + QR Code
  let paymentSectionY = y + 10;
  
  // Afficher le paiement Stripe si présent
  if (stripePayment?.status === "succeeded") {
    doc.setDrawColor(230, 230, 230);
    doc.roundedRect(14, paymentSectionY - 2, 90, 32, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74);
    doc.text("✓ PAIEMENT SÉCURISÉ REÇU", 17, paymentSectionY + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Montant : ${(stripePayment.amount_cents / 100).toFixed(2)} €`, 17, paymentSectionY + 8);
    doc.text(`Type : ${stripePayment.payment_type === "full" ? "Paiement intégral" : "Acompte (50%)"}`, 17, paymentSectionY + 13);
    if (stripePayment.charge_id) {
      doc.text(`ID : ${stripePayment.charge_id.slice(-12)}`, 17, paymentSectionY + 18);
    }
    doc.text(`Via Stripe | ${new Date(stripePayment.created_date).toLocaleDateString("fr-FR")}`, 17, paymentSectionY + 23);
    paymentSectionY += 38;
  }

  // QR Code du site événement
  const siteUrl = opts.site_public_url;
  if (siteUrl) {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(siteUrl)}`;
    const qrBase64 = await loadImageAsBase64(qrApiUrl);
    if (qrBase64) {
      doc.setDrawColor(230, 230, 230);
      doc.roundedRect(14, paymentSectionY - 2, 50, 54, 3, 3, "S");
      doc.addImage(qrBase64, "PNG", 16, paymentSectionY, 22, 22);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(236, 90, 112);
      doc.text("Espace événement", 40, paymentSectionY + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Scannez ce QR code", 40, paymentSectionY + 9);
      doc.text("pour accéder au site", 40, paymentSectionY + 13.5);
      doc.text("de votre événement 🌸", 40, paymentSectionY + 18);
      const urlLines = doc.splitTextToSize(siteUrl, 47);
      doc.setTextColor(100, 149, 237);
      doc.text(urlLines, 16, paymentSectionY + 27);
    }
  }

  // Footer
  const footY = 275;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, footY - 6, pageW - 15, footY - 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text(`${BUSINESS.name} — ${BUSINESS.email} — ${BUSINESS.tagline}`, pageW / 2, footY, { align: "center" });
  doc.text("Droit de rétractation : 14 jours à compter de la réception (hors produits personnalisés).", pageW / 2, footY + 5.5, { align: "center" });

  return doc;
}

export function getInvoiceEmailBody(order) {
  const opts = order.options_selected || {};
  const ttc = order.total_price || 0;
  const ht = (ttc / 1.20).toFixed(2);
  const tva = (ttc - ttc / 1.20).toFixed(2);
  const invoiceNumber = `FEF-${(order.id || "").slice(-8).toUpperCase()}`;

  const optionsList = [
    opts.pot_type && `  · Pot : ${opts.pot_type}`,
    opts.ribbon_color && `  · Ruban : ${opts.ribbon_color}`,
    opts.seed_type && `  · Graines : ${opts.seed_type}`,
    opts.custom_text && `  · Texte : "${opts.custom_text}"`,
    opts.delivery_address && `  · Livraison :\n    ${opts.delivery_address.replace(/\n/g, "\n    ")}`,
    opts.event_date && `  · Événement le : ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
  ].filter(Boolean).join("\n");

  return `Bonjour ${order.customer_name},

Voici votre facture pour votre commande Fleurs en fête 🌸

━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FACTURE N° ${invoiceNumber}
   Date : ${new Date(order.created_date || Date.now()).toLocaleDateString("fr-FR")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMANDE

Produit : ${order.product_name}
Quantité : ${order.quantity}
${optionsList}

RÉCAPITULATIF

Sous-total HT ........ ${ht} €
TVA (20%) ............ ${tva} €
─────────────────────────────
Total TTC ............ ${ttc.toFixed(2)} €

━━━━━━━━━━━━━━━━━━━━━━━━━━━

Merci pour votre confiance et à très bientôt pour votre beau jour ! 💐

Gwenaëlle — Fleurs en fête
contact@fleursenfete.com

— Droit de rétractation : 14 jours à compter de la réception (hors produits personnalisés).`;
}

export function getReminderEmailBody(order) {
  const opts = order.options_selected || {};
  const productName = order.product_name || "votre kit graines";
  const eventDate = opts.event_date
    ? `le ${new Date(opts.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : "bientôt";

  return `Bonjour ${order.customer_name} 🌸

Vos petites pousses d'amour t'attendent toujours dans leur panier… et elles ont hâte de fleurir pour ${eventDate} ! 🌱

Il semblerait que votre commande "${productName}" soit encore en cours de traitement. Pas d'inquiétude — on est juste là pour s'assurer que tout se passe bien de votre côté.

Si vous avez des questions, un petit détail à modifier ou si vous souhaitez qu'on procède à la confirmation, n'hésitez pas à nous écrire en répondant directement à cet email. On est là, avec le sourire 😊

À très vite,
Gwenaëlle — Fleurs en fête 🌸
contact@fleursenfete.com`;
}