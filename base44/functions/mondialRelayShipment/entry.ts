import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENSEIGNE = Deno.env.get("MONDIAL_RELAY_ENSEIGNE");
const PRIVATE_KEY = Deno.env.get("MONDIAL_RELAY_PRIVATE_KEY");

// MD5 implementation (Web Crypto doesn't support MD5, so we use a pure JS impl)
function md5(str) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  const utf8str = unescape(encodeURIComponent(str));
  const binaryStr = utf8str.split('').map(c => c.charCodeAt(0));
  const msgLen = binaryStr.length;
  binaryStr.push(0x80);
  while (binaryStr.length % 64 !== 56) binaryStr.push(0);
  const bitLen = msgLen * 8;
  binaryStr.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff, 0, 0, 0, 0);

  const M = [];
  for (let i = 0; i < binaryStr.length; i += 4) {
    M.push(binaryStr[i] | (binaryStr[i+1] << 8) | (binaryStr[i+2] << 16) | (binaryStr[i+3] << 24));
  }

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let i = 0; i < M.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    a = md5ff(a,b,c,d,M[i+0],7,-680876936); d = md5ff(d,a,b,c,M[i+1],12,-389564586); c = md5ff(c,d,a,b,M[i+2],17,606105819); b = md5ff(b,c,d,a,M[i+3],22,-1044525330);
    a = md5ff(a,b,c,d,M[i+4],7,-176418897); d = md5ff(d,a,b,c,M[i+5],12,1200080426); c = md5ff(c,d,a,b,M[i+6],17,-1473231341); b = md5ff(b,c,d,a,M[i+7],22,-45705983);
    a = md5ff(a,b,c,d,M[i+8],7,1770035416); d = md5ff(d,a,b,c,M[i+9],12,-1958414417); c = md5ff(c,d,a,b,M[i+10],17,-42063); b = md5ff(b,c,d,a,M[i+11],22,-1990404162);
    a = md5ff(a,b,c,d,M[i+12],7,1804603682); d = md5ff(d,a,b,c,M[i+13],12,-40341101); c = md5ff(c,d,a,b,M[i+14],17,-1502002290); b = md5ff(b,c,d,a,M[i+15],22,1236535329);
    a = md5gg(a,b,c,d,M[i+1],5,-165796510); d = md5gg(d,a,b,c,M[i+6],9,-1069501632); c = md5gg(c,d,a,b,M[i+11],14,643717713); b = md5gg(b,c,d,a,M[i+0],20,-373897302);
    a = md5gg(a,b,c,d,M[i+5],5,-701558691); d = md5gg(d,a,b,c,M[i+10],9,38016083); c = md5gg(c,d,a,b,M[i+15],14,-660478335); b = md5gg(b,c,d,a,M[i+4],20,-405537848);
    a = md5gg(a,b,c,d,M[i+9],5,568446438); d = md5gg(d,a,b,c,M[i+14],9,-1019803690); c = md5gg(c,d,a,b,M[i+3],14,-187363961); b = md5gg(b,c,d,a,M[i+8],20,1163531501);
    a = md5gg(a,b,c,d,M[i+13],5,-1444681467); d = md5gg(d,a,b,c,M[i+2],9,-51403784); c = md5gg(c,d,a,b,M[i+7],14,1735328473); b = md5gg(b,c,d,a,M[i+12],20,-1926607734);
    a = md5hh(a,b,c,d,M[i+5],4,-378558); d = md5hh(d,a,b,c,M[i+8],11,-2022574463); c = md5hh(c,d,a,b,M[i+11],16,1839030562); b = md5hh(b,c,d,a,M[i+14],23,-35309556);
    a = md5hh(a,b,c,d,M[i+1],4,-1530992060); d = md5hh(d,a,b,c,M[i+4],11,1272893353); c = md5hh(c,d,a,b,M[i+7],16,-155497632); b = md5hh(b,c,d,a,M[i+10],23,-1094730640);
    a = md5hh(a,b,c,d,M[i+13],4,681279174); d = md5hh(d,a,b,c,M[i+0],11,-358537222); c = md5hh(c,d,a,b,M[i+3],16,-722521979); b = md5hh(b,c,d,a,M[i+6],23,76029189);
    a = md5hh(a,b,c,d,M[i+9],4,-640364487); d = md5hh(d,a,b,c,M[i+12],11,-421815835); c = md5hh(c,d,a,b,M[i+15],16,530742520); b = md5hh(b,c,d,a,M[i+2],23,-995338651);
    a = md5ii(a,b,c,d,M[i+0],6,-198630844); d = md5ii(d,a,b,c,M[i+7],10,1126891415); c = md5ii(c,d,a,b,M[i+14],15,-1416354905); b = md5ii(b,c,d,a,M[i+5],21,-57434055);
    a = md5ii(a,b,c,d,M[i+12],6,1700485571); d = md5ii(d,a,b,c,M[i+3],10,-1894986606); c = md5ii(c,d,a,b,M[i+10],15,-1051523); b = md5ii(b,c,d,a,M[i+1],21,-2054922799);
    a = md5ii(a,b,c,d,M[i+8],6,1873313359); d = md5ii(d,a,b,c,M[i+15],10,-30611744); c = md5ii(c,d,a,b,M[i+6],15,-1560198380); b = md5ii(b,c,d,a,M[i+13],21,1309151649);
    a = md5ii(a,b,c,d,M[i+4],6,-145523070); d = md5ii(d,a,b,c,M[i+11],10,-1120210379); c = md5ii(c,d,a,b,M[i+2],15,718787259); b = md5ii(b,c,d,a,M[i+9],21,-343485551);
    a = safeAdd(a,aa); b = safeAdd(b,bb); c = safeAdd(c,cc); d = safeAdd(d,dd);
  }

  return [a,b,c,d].map(n => {
    let hex = '';
    for (let i = 0; i < 4; i++) hex += ((n >> (i*8)) & 0xff).toString(16).padStart(2, '0');
    return hex;
  }).join('');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!ENSEIGNE || !PRIVATE_KEY) {
    return Response.json({ error: 'Credentials Mondial Relay non configurés (MONDIAL_RELAY_ENSEIGNE, MONDIAL_RELAY_PRIVATE_KEY).' }, { status: 500 });
  }

  const body = await req.json();
  const { order_id, recipient, parcel } = body;
  // recipient: { name, address1, address2, city, zip, country="FR", email, phone, relay_id }
  // parcel: { weight_kg } — on convertit en grammes

  const poids = String(Math.round((parseFloat(parcel.weight_kg) || 1) * 1000)); // kg → g
  const livRel = recipient.relay_id || '';
  const livRelPays = recipient.country || 'FR';

  // Champs pour le calcul de la clé de sécurité (ordre exact selon doc Mondial Relay)
  const fields = [
    ENSEIGNE,
    'CCC',        // ModeCol: collecte chez expéditeur
    '24R',        // ModeLiv: livraison point relais 24h
    '',           // NDossier
    '',           // NClient
    recipient.name.substring(0, 32),
    '',           // Dest_Ad2
    recipient.address1 || '',
    recipient.address2 || '',
    recipient.city,
    recipient.zip,
    livRelPays,
    recipient.phone || '',
    '',           // Dest_Tel2
    recipient.email || '',
    poids,
    '',           // Longueur
    '',           // Taille
    '1',          // NbColis
    '0',          // CRT_Valeur
    '',           // CRT_Devise
    '',           // Exp_Valeur
    '',           // Exp_Devise
    '',           // COL_Rel_Pays
    '',           // COL_Rel
    livRelPays,
    livRel,
    '',           // TAvisage
    '',           // TReprise
    '',           // Montage
    '',           // TRDV
    '0',          // Assurance
    '',           // Instructions
    PRIVATE_KEY,
  ];

  const securityInput = fields.join('').toUpperCase();
  const security = md5(securityInput);

  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <WSI2_CreationEtiquette xmlns="http://www.mondialrelay.fr/webservice/">
      <Enseigne>${ENSEIGNE}</Enseigne>
      <ModeCol>CCC</ModeCol>
      <ModeLiv>24R</ModeLiv>
      <NDossier></NDossier>
      <NClient></NClient>
      <Expe_Langage>FR</Expe_Langage>
      <Expe_Ad1>Fleurs en Fête</Expe_Ad1>
      <Expe_Ad2></Expe_Ad2>
      <Expe_Ad3>Gwenaëlle Papin</Expe_Ad3>
      <Expe_Ad4></Expe_Ad4>
      <Expe_Ville>Nantes</Expe_Ville>
      <Expe_CP>44000</Expe_CP>
      <Expe_Pays>FR</Expe_Pays>
      <Expe_Tel1></Expe_Tel1>
      <Expe_Tel2></Expe_Tel2>
      <Expe_Mail>contact@fleursdefete.fr</Expe_Mail>
      <Dest_Langage>FR</Dest_Langage>
      <Dest_Ad1>${recipient.name.substring(0, 32)}</Dest_Ad1>
      <Dest_Ad2></Dest_Ad2>
      <Dest_Ad3>${recipient.address1 || ''}</Dest_Ad3>
      <Dest_Ad4>${recipient.address2 || ''}</Dest_Ad4>
      <Dest_Ville>${recipient.city}</Dest_Ville>
      <Dest_CP>${recipient.zip}</Dest_CP>
      <Dest_Pays>${recipient.country || 'FR'}</Dest_Pays>
      <Dest_Tel1>${recipient.phone || ''}</Dest_Tel1>
      <Dest_Tel2></Dest_Tel2>
      <Dest_Mail>${recipient.email || ''}</Dest_Mail>
      <Poids>${poids}</Poids>
      <Longueur></Longueur>
      <Taille></Taille>
      <NbColis>1</NbColis>
      <CRT_Valeur>0</CRT_Valeur>
      <CRT_Devise></CRT_Devise>
      <Exp_Valeur></Exp_Valeur>
      <Exp_Devise></Exp_Devise>
      <COL_Rel_Pays></COL_Rel_Pays>
      <COL_Rel></COL_Rel>
      <LIV_Rel_Pays>${livRelPays}</LIV_Rel_Pays>
      <LIV_Rel>${livRel}</LIV_Rel>
      <TAvisage></TAvisage>
      <TReprise></TReprise>
      <Montage></Montage>
      <TRDV></TRDV>
      <Assurance>0</Assurance>
      <Instructions></Instructions>
      <Security>${security}</Security>
      <Texte></Texte>
    </WSI2_CreationEtiquette>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch('https://api.mondialrelay.com/WebService.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.mondialrelay.fr/webservice/WSI2_CreationEtiquette',
    },
    body: soapBody,
  });

  const text = await response.text();

  const expeditionNumMatch = text.match(/<ExpeditionNum>([^<]+)<\/ExpeditionNum>/);
  const labelUrlMatch = text.match(/<URL_Etiquette>([^<]+)<\/URL_Etiquette>/);
  const statMatch = text.match(/<STAT>([^<]*)<\/STAT>/);

  // Check for error (non-empty STAT = error code)
  if (statMatch && statMatch[1] && statMatch[1] !== '0') {
    return Response.json({
      error: `Erreur Mondial Relay (code: ${statMatch[1]})`,
      raw: text,
    }, { status: 400 });
  }

  const tracking_number = expeditionNumMatch ? expeditionNumMatch[1] : null;
  const label_url = labelUrlMatch ? labelUrlMatch[1] : null;

  if (!tracking_number) {
    return Response.json({ error: 'Réponse inattendue de Mondial Relay', raw: text }, { status: 400 });
  }

  // Update order
  await base44.asServiceRole.entities.Order.update(order_id, {
    tracking_number,
    tracking_carrier: 'Mondial Relay',
    status: 'shipped',
  });

  return Response.json({
    tracking_number,
    label_url,
    carrier: 'Mondial Relay',
  });
});