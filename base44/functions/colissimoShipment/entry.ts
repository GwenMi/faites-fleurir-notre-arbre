import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGIN = Deno.env.get("COLISSIMO_LOGIN");
const PASSWORD = Deno.env.get("COLISSIMO_PASSWORD");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!LOGIN || !PASSWORD) {
    return Response.json({ error: 'Credentials Colissimo non configurés. Ajoutez COLISSIMO_LOGIN et COLISSIMO_PASSWORD dans les secrets.' }, { status: 500 });
  }

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const { order_id, recipient, parcel, sender } = body;
  // recipient: { name, line1, line2, city, zip, country, email, phone }
  // parcel: { weight } in kg
  // sender: { name, line1, city, zip }

  const payload = {
    contractNumber: LOGIN,
    password: PASSWORD,
    outputFormat: {
      x: 0,
      y: 0,
      outputPrintingType: "PDF_10x15_300dpi",
    },
    letter: {
    service: {
      productCode: parcel.product_code || "DOM",
      depositDate: new Date().toISOString().slice(0, 10),
      orderNumber: order_id,
    },
      parcel: {
        weight: parcel.weight,
      },
      sender: {
        senderParcelRef: order_id,
        address: {
          companyName: sender?.name || "Fleurs en Fête",
          line1: sender?.line1 || "Votre adresse",
          city: sender?.city || "Nantes",
          zipCode: sender?.zip || "44000",
          countryCode: "FR",
        },
      },
      addressee: {
        address: {
          lastName: recipient.name,
          line1: recipient.line1 || recipient.address,
          line2: recipient.line2 || "",
          city: recipient.city,
          zipCode: recipient.zip,
          countryCode: recipient.country || "FR",
          email: recipient.email,
          mobileNumber: recipient.phone || "",
        },
      },
    },
  };

  const response = await fetch('https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/generateLabel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  // Colissimo returns multipart: first part JSON, second part PDF label
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return Response.json({ error: data?.messages?.[0]?.messageContent || 'Erreur Colissimo', raw: data }, { status: 400 });
  }

  // Multipart response: parse manually
  const buffer = await response.arrayBuffer();
  const text = new TextDecoder().decode(buffer);

  // Extract JSON part
  const jsonMatch = text.match(/\{[\s\S]*?"parcelNumber"\s*:\s*"([^"]+)"/);
  const tracking_number = jsonMatch ? jsonMatch[1] : null;

  // Extract PDF part (base64 encode the bytes after boundary)
  const boundary = contentType.match(/boundary=([^\s;]+)/)?.[1];
  let label_base64 = null;
  if (boundary && tracking_number) {
    const parts = text.split(`--${boundary}`);
    const pdfPart = parts.find(p => p.includes('application/pdf'));
    if (pdfPart) {
      const pdfStart = pdfPart.indexOf('\r\n\r\n') + 4;
      const pdfBytes = new TextEncoder().encode(pdfPart.slice(pdfStart).replace(/--$/, '').trim());
      label_base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    }
  }

  if (tracking_number && order_id) {
    await base44.asServiceRole.entities.Order.update(order_id, {
      tracking_number,
      tracking_carrier: 'Colissimo',
      status: 'shipped',
    });
  }

  return Response.json({
    tracking_number,
    label_base64,
    carrier: 'Colissimo',
  });
});