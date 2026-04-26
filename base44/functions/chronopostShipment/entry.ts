import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ACCOUNT = Deno.env.get("CHRONOPOST_ACCOUNT_NUMBER");
const PASSWORD = Deno.env.get("CHRONOPOST_PASSWORD");

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!ACCOUNT || !PASSWORD) {
    return Response.json({ error: 'Credentials Chronopost non configurés. Ajoutez CHRONOPOST_ACCOUNT_NUMBER et CHRONOPOST_PASSWORD dans les secrets.' }, { status: 500 });
  }

  const body = await req.json();
  const { order_id, recipient, parcel } = body;
  // recipient: { name, address, city, zip, country, email, phone }
  // parcel: { weight, product_code } (ex: product_code: "01" = Chrono 13h)

  const senderXml = `
    <esdValue>
      <accountNumber>${ACCOUNT}</accountNumber>
      <password>${PASSWORD}</password>
      <depositDate>${new Date().toISOString().slice(0, 10)}</depositDate>
      <scheduledValue>0</scheduledValue>
      <volumeWeight>0</volumeWeight>
      <weight>${parcel.weight}</weight>
      <largeSize>0</largeSize>
      <obModeObjet>0</obModeObjet>
      <codification>
        <productCode>${parcel.product_code || "01"}</productCode>
        <subProductCode>01</subProductCode>
      </codification>
      <refValue>${order_id}</refValue>
      <recipientValue>
        <recipientName>${recipient.name}</recipientName>
        <recipientAddress1>${recipient.address}</recipientAddress1>
        <recipientCity>${recipient.city}</recipientCity>
        <recipientPostalCode>${recipient.zip}</recipientPostalCode>
        <recipientCountry>${recipient.country || "FR"}</recipientCountry>
        <recipientEmail>${recipient.email}</recipientEmail>
        <recipientMobilePhone>${recipient.phone || ""}</recipientMobilePhone>
      </recipientValue>
    </esdValue>`;

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cxf="http://cxf.shipping.soap.chronopost.fr/">
  <soapenv:Header/>
  <soapenv:Body>
    <cxf:shippingV6>
      ${senderXml}
    </cxf:shippingV6>
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await fetch('https://ws.chronopost.fr/shipping-cxf/ShippingServiceWS', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': '',
    },
    body: soapEnvelope,
  });

  const text = await response.text();

  // Extract tracking number and label URL from SOAP response
  const ltMatch = text.match(/<lt>([^<]+)<\/lt>/);
  const labelMatch = text.match(/<labelV2>([^<]+)<\/labelV2>/);
  const errorMatch = text.match(/<errorCode>([^<]+)<\/errorCode>/);
  const errorMsgMatch = text.match(/<errorMessage>([^<]+)<\/errorMessage>/);

  if (errorMatch && errorMatch[1] !== '0') {
    return Response.json({
      error: errorMsgMatch ? errorMsgMatch[1] : 'Erreur Chronopost',
      error_code: errorMatch[1],
      raw: text,
    }, { status: 400 });
  }

  const tracking_number = ltMatch ? ltMatch[1] : null;
  const label_base64 = labelMatch ? labelMatch[1] : null;

  // Update order with tracking info
  if (tracking_number && order_id) {
    await base44.asServiceRole.entities.Order.update(order_id, {
      tracking_number,
      tracking_carrier: 'Chronopost',
      status: 'shipped',
    });
  }

  return Response.json({
    tracking_number,
    label_base64, // base64 PDF label
    carrier: 'Chronopost',
  });
});