import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, customerInfo, selection, pricing, PRICING } = await req.json();

    // Fetch order from database
    const order = await base44.entities.Order.get(orderId);
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(244, 63, 94); // rose-500
    doc.text('DEVIS', margin, yPos);
    yPos += 10;

    // Logo/Company info
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Fleurs de fête', margin, yPos);
    doc.text('contact@fleursenfete.com', margin, yPos + 4);
    yPos += 12;

    // Separator
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    // Invoice info
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Devis #${order.id.substring(0, 8).toUpperCase()}`, margin, yPos);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin - 40, yPos);
    yPos += 7;
    doc.text(`Événement : ${customerInfo.eventDate ? new Date(customerInfo.eventDate).toLocaleDateString('fr-FR') : 'N/A'}`, margin, yPos);
    yPos += 8;

    // Client info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Facturé à :', margin, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(customerInfo.name, margin, yPos);
    doc.text(customerInfo.email, margin, yPos + 4);
    if (customerInfo.phone) doc.text(customerInfo.phone, margin, yPos + 8);
    if (customerInfo.address) doc.text(customerInfo.address, margin, yPos + 12);
    yPos += 18;

    // Table header
    doc.setFontSize(9);
    doc.setTextColor(255);
    doc.setFillColor(244, 63, 94); // rose-500
    doc.rect(margin, yPos - 3, contentWidth, 5, 'F');
    doc.text('Description', margin + 2, yPos);
    doc.text('Prix unitaire', pageWidth - margin - 50, yPos);
    doc.text('Quantité', pageWidth - margin - 25, yPos);
    doc.text('Total', pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 7;

    // Items
    doc.setTextColor(0);
    const kitLabel = selection.kitType === "pret" ? "Kit prêt à offrir" : "Kit à composer";
    const containerLabel = selection.containerType === "rond_clip" ? "Pot rond fermoir"
      : selection.containerType === "carre_liege" ? "Pot carré liège"
      : "Pot";

    const items = [
      { desc: `${kitLabel} — ${containerLabel}`, price: pricing.pricePerPot, qty: pricing.totalPots }
    ];

    items.forEach(item => {
      const total = item.price * item.qty;
      doc.setFontSize(8);
      doc.text(item.desc, margin + 2, yPos);
      doc.text(`${item.price.toFixed(2)}€`, pageWidth - margin - 50, yPos);
      doc.text(item.qty.toString(), pageWidth - margin - 25, yPos);
      doc.text(`${total.toFixed(2)}€`, pageWidth - margin - 10, yPos, { align: 'right' });
      yPos += 4;
    });

    yPos += 2;

    // Totals
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;

    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('Sous-total :', pageWidth - margin - 50, yPos, { align: 'right' });
    doc.text(`${pricing.subtotal.toFixed(2)}€`, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 5;

    if (pricing.discount > 0) {
      doc.setTextColor(34, 197, 94); // green
      doc.text('Réduction 10% :', pageWidth - margin - 50, yPos, { align: 'right' });
      doc.text(`−${pricing.discount.toFixed(2)}€`, pageWidth - margin - 10, yPos, { align: 'right' });
      yPos += 5;
    }

    doc.setTextColor(244, 63, 94); // rose
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Total TTC :', pageWidth - margin - 50, yPos, { align: 'right' });
    doc.text(`${pricing.total.toFixed(2)}€`, pageWidth - margin - 10, yPos, { align: 'right' });
    yPos += 10;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Validité : 30 jours', margin, pageHeight - 15);
    doc.text('© 2025 Fleurs de fête', pageWidth - margin - 30, pageHeight - 15);

    const pdfBytes = doc.output('arraybuffer');
    const fileName = `devis_${order.id.substring(0, 8)}_${new Date().getTime()}.pdf`;

    // Send emails
    try {
      // Email to customer
      const invoiceUrl = `${Deno.env.get('BASE44_APP_URL') || 'https://app.base44.com'}/api/download-invoice/${order.id}`;
      
      await base44.integrations.Core.SendEmail({
        to: customerInfo.email,
        subject: `Votre devis Fleurs de fête #${order.id.substring(0, 8).toUpperCase()}`,
        body: `Bonjour ${customerInfo.name},\n\nVoici votre devis pour votre commande de pots de graines.\n\nMontant total : ${pricing.total.toFixed(2)}€\n\nEn cas de questions, n'hésitez pas à nous contacter.\n\nCordialement,\nFleurs de fête`
      });

      // Email to admin
      await base44.integrations.Core.SendEmail({
        to: 'contact@fleursenfete.com',
        subject: `Nouvelle commande : ${customerInfo.name} - ${pricing.total.toFixed(2)}€`,
        body: `Nouvelle commande reçue !\n\nClient : ${customerInfo.name}\nEmail : ${customerInfo.email}\nTéléphone : ${customerInfo.phone || 'N/A'}\n\nProduit : ${(selection.packs || []).map((p: {size: number, qty: number}) => `Pack ${p.size} × ${p.qty}`).join(', ')}\nQuantité : ${pricing.totalPots} pots\nMontant : ${pricing.total.toFixed(2)}€\n\nAdresse de livraison : ${customerInfo.address}`
      });
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
      // Don't fail the whole operation if email fails
    }

    // Return PDF for download
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});