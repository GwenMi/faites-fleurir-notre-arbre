import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENSEIGNE = Deno.env.get("MONDIAL_RELAY_ENSEIGNE");
const PRIVATE_KEY = Deno.env.get("MONDIAL_RELAY_PRIVATE_KEY");

// Mondial Relay requires MD5 security key
async function md5(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!ENSEIGNE || !PRIVATE_KEY) {
    return Response.json({ error: 'Credentials Mondial Relay non configurés.' }, { status: 500 });
  }

  const body = await req.json();
  const { order_id, recipient, parcel } = body;
  // recipient: { name, address1, address2, city, zip, country, email, phone, relay_id }
  // parcel: { weight } in grams

  const weight = Math.round((parcel.weight || 1) * 1000); // kg → g
  const numRelais = recipient.relay_id || ''; // Point relais ID
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // Build security key string (MD5)
  const securityStr = [
    ENSEIGNE,
    '24R',          // mode livraison: 24R = point relais 24h
    today,
    '',             // ref client
    '',             // expediteur ref
    numRelais,
    recipient.name.slice(0, 30),
    '',
    recipient.address1 || '',
    recipient.address2 || '',
    recipient.zip,
    recipient.city,
    recipient.country || 'FR',
    recipient.phone || '',
    recipient.email || '',
    String(weight),
    '',             // assurance
    '',             // instructions
    PRIVATE_KEY,
  ].join('');

  const security = await md5(securityStr.toUpperCase());

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${ENSEIGNE}</Enseigne>
      <ModeCol>REL</ModeCol>
      <ModeLiv>24R</ModeLiv>
      <Expe_Langage>FR</Expe_Langage>
      <Expe_Ad1>Fleurs en Fête</Expe_Ad1>
      <Expe_Ad3>44000 Nantes</Expe_Ad3>
      <Expe_Ville>Nantes</Expe_Ville>
      <Expe_CP>44000</Expe_CP>
      <Expe_Pays>FR</Expe_Pays>
      <Expe_Tel1></Expe_Tel1>
      <Expe_Mail>contact@fleursdefete.fr</Expe_Mail>
      <Dest_Langage>FR</Dest_Langage>
      <Dest_Ad1>${recipient.name.slice(0, 30)}</Dest_Ad1>
      <Dest_Ad3>${recipient.address1 || ''}</Dest_Ad3>
      <Dest_Ad4>${recipient.address2 || ''}</Dest_Ad4>
      <Dest_Ville>${recipient.city}</Dest_Ville>
      <Dest_CP>${recipient.zip}</Dest_CP>
      <Dest_Pays>${recipient.country || 'FR'}</Dest_Pays>
      <Dest_Tel1>${recipient.phone || ''}</Dest_Tel1>
      <Dest_Mail>${recipient.email || ''}</Dest_Mail>
      <Poids>${weight}</Poids>
      <NbColis>1</NbColis>
      <CRT_Valeur>0</CRT_Valeur>
      <NumRelais>${numRelais}</NumRelais>
      <URL_Retour_OK></URL_Retour_OK>
      <URL_Retour_Echec></URL_Retour_Echec>
      <Security>${security}</Security>
    </WSI2_CreationEtiquette>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch('https://api.mondialrelay.com/Web_Services.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.mondialrelay.fr/webservice/WSI2_CreationEtiquette',
    },
    body: soapBody,
  });

  const text = await response.text();

  const statMatch = text.match(/<STAT>([^<]+)<\/STAT>/);
  const numColisMatch = text.match(/<NumColis>([^<]+)<\/NumColis>/);
  const labelUrlMatch = text.match(/<URL_Etiquette>([^<]+)<\/URL_Etiquette>/);

  if (!statMatch || statMatch[1] !== '0') {
    return Response.json({
      error: `Erreur Mondial Relay (code: ${statMatch?.[1] || '?'})`,
      raw: text,
    }, { status: 400 });
  }

  const tracking_number = numColisMatch ? numColisMatch[1] : null;
  const label_url = labelUrlMatch ? labelUrlMatch[1] : null;

  if (tracking_number && order_id) {
    await base44.asServiceRole.entities.Order.update(order_id, {
      tracking_number,
      tracking_carrier: 'Mondial Relay',
      status: 'shipped',
    });
  }

  return Response.json({
    tracking_number,
    label_url, // Mondial Relay returns a URL to the label PDF (not base64)
    carrier: 'Mondial Relay',
  });
});