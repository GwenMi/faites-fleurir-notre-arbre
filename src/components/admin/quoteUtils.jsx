import jsPDF from "jspdf";

const BUSINESS = {
  name: "Fleurs en fête",
  email: "contact@fleursenfete.com",
  tagline: "Des souvenirs qui fleurissent 🌸",
};

export function computeQuoteTotals(quote) {
  const items = [...(quote.items || []), ...(quote.custom_lines || []).map(l => ({
    product_name: l.label,
    quantity: l.quantity,
    unit_price_ht: l.unit_price_ht,
    options: "",
  }))];
  const totalHT = items.reduce((s, it) => s + (it.unit_price_ht || 0) * (it.quantity || 1), 0);
  const discountAmt = totalHT * ((quote.discount_percent || 0) / 100);
  const afterDiscount = totalHT - discountAmt;
  const tvaRate = (quote.tva_rate ?? 20) / 100;
  const tvaAmt = afterDiscount * tvaRate;
  const totalTTC = afterDiscount + tvaAmt;
  return { totalHT, discountAmt, afterDiscount, tvaAmt, totalTTC, items };
}

export function generateQuotePDF(quote) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const { totalHT, discountAmt, afterDiscount, tvaAmt, totalTTC, items } = computeQuoteTotals(quote);

  const quoteDate = new Date().toLocaleDateString("fr-FR");
  const validUntil = new Date(Date.now() + (quote.validity_days || 30) * 86400000).toLocaleDateString("fr-FR");

  // Header band
  doc.setFillColor(167, 139, 250); // purple-400
  doc.rect(0, 0, pageW, 48, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("DEVIS", 20, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(BUSINESS.name, 20, 33);
  doc.text(BUSINESS.email, 20, 39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`N° ${quote.quote_number || "—"}`, pageW - 18, 22, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date : ${quoteDate}`, pageW - 18, 30, { align: "right" });
  doc.text(`Valable jusqu'au : ${validUntil}`, pageW - 18, 37, { align: "right" });

  // Client block
  let y = 62;
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Devis établi pour :", 20, y);

  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(quote.customer_name || "", 20, y);
  y += 6;
  doc.text(quote.customer_email || "", 20, y);
  if (quote.customer_phone) { y += 6; doc.text(quote.customer_phone, 20, y); }
  if (quote.customer_address) {
    quote.customer_address.split("\n").forEach(line => { if (line.trim()) { y += 6; doc.text(line.trim(), 20, y); } });
  }
  if (quote.event_date) {
    y += 8;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Événement ${quote.event_type ? `(${quote.event_type})` : ""} prévu le : ${new Date(quote.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`, 20, y);
    doc.setTextColor(50, 50, 50);
  }

  // Table header
  y = Math.max(y + 16, 118);
  doc.setFillColor(245, 243, 255);
  doc.rect(15, y - 6, pageW - 30, 10, "F");
  doc.setDrawColor(220, 215, 255);
  doc.rect(15, y - 6, pageW - 30, 10, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 80, 180);
  doc.text("Désignation", 20, y);
  doc.text("Options / détails", 82, y);
  doc.text("Qté", 137, y, { align: "center" });
  doc.text("P.U. HT", 161, y, { align: "right" });
  doc.text("Total HT", 192, y, { align: "right" });

  // Table rows
  y += 12;
  items.forEach((it, idx) => {
    doc.setFont("helvetica", idx % 2 === 0 ? "normal" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const nameLines = doc.splitTextToSize(it.product_name || it.label || "", 55);
    doc.text(nameLines, 20, y);
    const optLines = doc.splitTextToSize(it.options || it.description || "—", 50);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(optLines, 82, y);
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(String(it.quantity || 1), 137, y, { align: "center" });
    doc.text(`${(it.unit_price_ht || 0).toFixed(2)} €`, 161, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`${((it.unit_price_ht || 0) * (it.quantity || 1)).toFixed(2)} €`, 192, y, { align: "right" });
    const rowH = Math.max(nameLines.length, optLines.length) * 5 + 8;
    y += rowH;
  });

  // Totals
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, pageW - 15, y);
  y += 10;
  const totX = 130;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Sous-total HT :", totX, y);
  doc.text(`${totalHT.toFixed(2)} €`, 192, y, { align: "right" });
  if (discountAmt > 0) {
    y += 7;
    doc.text(`Remise (${quote.discount_percent}%) :`, totX, y);
    doc.text(`- ${discountAmt.toFixed(2)} €`, 192, y, { align: "right" });
    y += 7;
    doc.text("Après remise HT :", totX, y);
    doc.text(`${afterDiscount.toFixed(2)} €`, 192, y, { align: "right" });
  }
  y += 7;
  doc.text(`TVA (${quote.tva_rate ?? 20}%) :`, totX, y);
  doc.text(`${tvaAmt.toFixed(2)} €`, 192, y, { align: "right" });
  y += 10;
  doc.setFillColor(167, 139, 250);
  doc.roundedRect(totX - 5, y - 6, 67, 11, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL TTC :", totX, y);
  doc.text(`${totalTTC.toFixed(2)} €`, 192, y, { align: "right" });

  // Notes
  if (quote.notes) {
    y += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Notes :", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const noteLines = doc.splitTextToSize(quote.notes, pageW - 40);
    doc.text(noteLines, 20, y);
  }

  // Footer
  const footY = 278;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, footY - 6, pageW - 15, footY - 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(160, 160, 160);
  doc.text(`${BUSINESS.name} — ${BUSINESS.email} — ${BUSINESS.tagline}`, pageW / 2, footY, { align: "center" });
  doc.text(`Devis valable ${quote.validity_days || 30} jours à compter de sa date d'émission.`, pageW / 2, footY + 5.5, { align: "center" });

  return doc;
}

export function getQuoteEmailBody(quote) {
  const { totalHT, discountAmt, tvaAmt, totalTTC } = computeQuoteTotals(quote);
  const validUntil = new Date(Date.now() + (quote.validity_days || 30) * 86400000).toLocaleDateString("fr-FR");
  const allItems = [...(quote.items || []), ...(quote.custom_lines || []).map(l => ({ product_name: l.label, quantity: l.quantity, unit_price_ht: l.unit_price_ht, options: "" }))];

  const itemLines = allItems.map(it =>
    `  · ${it.product_name} × ${it.quantity} — ${((it.unit_price_ht || 0) * (it.quantity || 1)).toFixed(2)} € HT${it.options ? ` (${it.options})` : ""}`
  ).join("\n");

  return `Bonjour ${quote.customer_name},

Veuillez trouver ci-joint votre devis personnalisé Fleurs en fête 🌸

Devis N° ${quote.quote_number || "—"} — valable jusqu'au ${validUntil}

━━━━━━━━━━━━━━━━━━━━━━━━━
RÉCAPITULATIF
━━━━━━━━━━━━━━━━━━━━━━━━━
${itemLines}
${discountAmt > 0 ? `\nRemise (${quote.discount_percent}%) : - ${discountAmt.toFixed(2)} €` : ""}
Sous-total HT ........ ${totalHT.toFixed(2)} €
TVA (${quote.tva_rate ?? 20}%) ......... ${tvaAmt.toFixed(2)} €
─────────────────────────
Total TTC ............ ${totalTTC.toFixed(2)} €
━━━━━━━━━━━━━━━━━━━━━━━━━

Pour accepter ce devis ou pour toute question, n'hésitez pas à nous répondre directement à cet email.

À très bientôt pour votre beau jour ! 💐

Gwenaëlle — Fleurs en fête
contact@fleursenfete.com`;
}