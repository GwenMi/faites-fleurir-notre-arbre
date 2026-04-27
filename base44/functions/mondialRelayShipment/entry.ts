import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const API_LOGIN = Deno.env.get("MONDIAL_RELAY_API_LOGIN");
const API_PASSWORD = Deno.env.get("MONDIAL_RELAY_API_PASSWORD");
const BRAND_ID = Deno.env.get("MONDIAL_RELAY_ENSEIGNE") || "CC23WIPX";
const API_URL = "https://connect-api.mondialrelay.com/api/Shipment";

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!API_LOGIN || !API_PASSWORD) {
    return Response.json({ error: 'Credentials Mondial Relay API v2 non configurés.' }, { status: 500 });
  }

  const body = await req.json();
  const { order_id, recipient, parcel } = body;

  const weightGrams = Math.round((parseFloat(parcel.weight_kg || parcel.weight) || 1) * 1000);

  // Relay location format: "FR-021834" (country code + 6-digit padded ID)
  const relayIdPadded = (recipient.relay_id || '').toString().replace(/^FR-?/, '').padStart(6, '0');
  const relayLocation = `FR-${relayIdPadded}`;

  const basicAuth = btoa(`${API_LOGIN}:${API_PASSWORD}`);
  const phone = (recipient.phone || '').replace(/\s/g, '');
  const mobileNo = phone ? (phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`) : '';

  const nameParts = (recipient.name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<ShipmentCreationRequest xmlns="http://www.example.org/Request">
  <Context>
    <Login>${API_LOGIN}</Login>
    <Password>${API_PASSWORD}</Password>
    <CustomerId>${BRAND_ID}</CustomerId>
    <Culture>fr-FR</Culture>
    <VersionAPI>1.0</VersionAPI>
  </Context>
  <OutputOptions>
    <OutputFormat>A4</OutputFormat>
    <OutputType>PdfUrl</OutputType>
  </OutputOptions>
  <ShipmentsList>
    <Shipment>
      <OrderNo>${order_id || ''}</OrderNo>
      <CustomerNo></CustomerNo>
      <ParcelCount>1</ParcelCount>
      <DeliveryMode Mode="24R" Location="${relayLocation}" />
      <CollectionMode Mode="REL" Location="" />
      <Parcels>
        <Parcel>
          <Content>Kits fleurs</Content>
          <Weight Unit="gr" Value="${weightGrams}" />
        </Parcel>
      </Parcels>
      <DeliveryInstruction></DeliveryInstruction>
      <Sender>
        <Address>
          <Title></Title>
          <Firstname>Gwenaelle</Firstname>
          <Lastname>Papin</Lastname>
          <Streetname>1 rue de l Expediteur</Streetname>
          <HouseNo></HouseNo>
          <CountryCode>FR</CountryCode>
          <PostCode>44000</PostCode>
          <City>Nantes</City>
          <AddressAdd1></AddressAdd1>
          <AddressAdd2></AddressAdd2>
          <AddressAdd3></AddressAdd3>
          <PhoneNo></PhoneNo>
          <MobileNo>+33600000000</MobileNo>
          <Email>contact@fleursdefete.fr</Email>
        </Address>
      </Sender>
      <Recipient>
        <Address>
          <Title></Title>
          <Firstname>${firstName}</Firstname>
          <Lastname>${lastName}</Lastname>
          <Streetname>${recipient.line1 || recipient.address1 || recipient.address || ''}</Streetname>
          <HouseNo></HouseNo>
          <CountryCode>${recipient.country || 'FR'}</CountryCode>
          <PostCode>${recipient.zip || ''}</PostCode>
          <City>${recipient.city || ''}</City>
          <AddressAdd1></AddressAdd1>
          <AddressAdd2></AddressAdd2>
          <AddressAdd3></AddressAdd3>
          <PhoneNo></PhoneNo>
          <MobileNo>${mobileNo}</MobileNo>
          <Email>${recipient.email || ''}</Email>
        </Address>
      </Recipient>
    </Shipment>
  </ShipmentsList>
</ShipmentCreationRequest>`;

  console.log('XML Payload:', xmlBody);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: xmlBody,
  });

  const responseText = await response.text();
  console.log('Response status:', response.status);
  console.log('Response body:', responseText);

  // Parse errors from StatusList (auto-closing tags: <Status Code="..." Level="Error" Message="..." />)
  const statusAttrMatch = responseText.match(/<Status\s[^/]*/i);
  if (statusAttrMatch) {
    const codeMatch = statusAttrMatch[0].match(/Code="([^"]+)"/i);
    const levelMatch = statusAttrMatch[0].match(/Level="([^"]+)"/i);
    const msgMatch = statusAttrMatch[0].match(/Message="([^"]+)"/i);
    if (levelMatch && levelMatch[1] === 'Error') {
      return Response.json({
        error: `Erreur Mondial Relay (${codeMatch?.[1]}): ${msgMatch?.[1] || 'Erreur inconnue'}`,
        raw: responseText,
      }, { status: 400 });
    }
  }

  // Extract results from ShipmentsList
  const labelOutputMatch = responseText.match(/<Output[^>]*>([^<]+)<\/Output>/i);
  const barcodeMatch = responseText.match(/<Barcode[^>]*Value="([^"]+)"/i);
  const shipmentLabelUrlMatch = responseText.match(/<LabelList>.*?<Label>.*?<Output>([^<]+)<\/Output>/is);

  // Try different patterns for label URL and tracking number
  const labelUrl = shipmentLabelUrlMatch?.[1] || labelOutputMatch?.[1] || null;
  const trackingNumber = barcodeMatch?.[1] || null;

  // Also try to get ShipmentNumber
  const shipmentNumberMatch = responseText.match(/<ShipmentNumber[^>]*>([^<]+)<\/ShipmentNumber>/i);
  const tracking_number = trackingNumber || shipmentNumberMatch?.[1] || null;
  const label_url = labelUrl || null;

  if (!tracking_number && !label_url) {
    return Response.json({ error: 'Pas de numéro de suivi dans la réponse', raw: responseText }, { status: 400 });
  }

  // Update order
  if (order_id && order_id !== 'test-order-123') {
    await base44.asServiceRole.entities.Order.update(order_id, {
      tracking_number: tracking_number || 'MR-' + Date.now(),
      tracking_carrier: 'Mondial Relay',
      status: 'shipped',
    });
  }

  return Response.json({
    tracking_number,
    label_url,
    carrier: 'Mondial Relay',
    raw_response: responseText,
  });
});