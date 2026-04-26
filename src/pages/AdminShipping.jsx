import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AdminGuard from "@/components/admin/AdminGuard";
import { ChevronLeft, Loader2, Truck, Package, CheckCircle, AlertCircle, Download, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CARRIERS = [
  { id: "chronopost", label: "Chronopost", color: "bg-blue-600", products: [
    { code: "01", label: "Chrono 13h" },
    { code: "16", label: "Chrono 18h" },
    { code: "2", label: "Chrono Express" },
  ]},
  { id: "colissimo", label: "Colissimo", color: "bg-yellow-500", products: [
    { code: "DOM", label: "Domicile" },
    { code: "DOS", label: "Sans signature" },
    { code: "BPR", label: "Bureau de poste" },
  ]},
  { id: "mondial_relay", label: "Mondial Relay", color: "bg-green-600", products: [
    { code: "24R", label: "Point Relais 24h" },
    { code: "DRI", label: "Domicile 24h" },
  ]},
];

const FUNCTION_MAP = {
  chronopost: "chronopostShipment",
  colissimo: "colissimoShipment",
  mondial_relay: "mondialRelayShipment",
};

export default function AdminShipping() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [carrier, setCarrier] = useState("chronopost");
  const [productCode, setProductCode] = useState("01");
  const [weight, setWeight] = useState("0.5");
  const [relayId, setRelayId] = useState("");
  const [shipping, setShipping] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await base44.entities.Order.filter({}, "-created_date", 50);
    setOrders((data || []).filter(o => o.status !== "cancelled" && o.status !== "delivered"));
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.product_name?.toLowerCase().includes(q)
    );
  });

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setResult(null);
    // Pre-fill weight based on quantity
    const estimatedWeight = ((order.quantity || 1) * 0.15 + 0.2).toFixed(2);
    setWeight(estimatedWeight);
  };

  const parseAddress = (addr) => {
    if (!addr) return {};
    const lines = addr.split("\n").map(l => l.trim()).filter(Boolean);
    // Try to find zip + city on last line
    const lastLine = lines[lines.length - 1] || "";
    const zipCityMatch = lastLine.match(/^(\d{5})\s+(.+)$/);
    return {
      line1: lines[0] || "",
      line2: lines.length > 2 ? lines[1] : "",
      zip: zipCityMatch ? zipCityMatch[1] : "",
      city: zipCityMatch ? zipCityMatch[2] : lastLine,
    };
  };

  const handleShip = async () => {
    if (!selectedOrder) return;
    setShipping(true);
    setResult(null);

    const addrParsed = parseAddress(selectedOrder.options_selected?.delivery_address);
    const carrierConfig = CARRIERS.find(c => c.id === carrier);
    const functionName = FUNCTION_MAP[carrier];

    const payload = {
      order_id: selectedOrder.id,
      parcel: {
        weight: parseFloat(weight),
        product_code: productCode,
      },
      recipient: {
        name: selectedOrder.customer_name,
        address: addrParsed.line1,
        address1: addrParsed.line1,
        address2: addrParsed.line2,
        line1: addrParsed.line1,
        line2: addrParsed.line2,
        city: addrParsed.city,
        zip: addrParsed.zip,
        country: "FR",
        email: selectedOrder.customer_email,
        phone: selectedOrder.options_selected?.phone || "",
        relay_id: relayId,
      },
    };

    const res = await base44.functions.invoke(functionName, payload);
    const data = res.data;

    if (data.error) {
      toast.error(data.error);
      setResult({ error: data.error });
    } else {
      toast.success(`Étiquette générée ! N° de suivi : ${data.tracking_number}`);
      setResult(data);
      // Send tracking email to customer
      await sendTrackingEmail(selectedOrder, data.tracking_number, carrierConfig.label);
      await loadOrders();
    }
    setShipping(false);
  };

  const sendTrackingEmail = async (order, trackingNumber, carrierName) => {
    const trackingUrls = {
      "Chronopost": `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${trackingNumber}`,
      "Colissimo": `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
      "Mondial Relay": `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${trackingNumber}`,
    };
    const trackingUrl = trackingUrls[carrierName] || "#";

    await base44.integrations.Core.SendEmail({
      to: order.customer_email,
      subject: `📦 Votre commande est en route — ${order.product_name}`,
      body: `Bonjour ${order.customer_name},\n\nVotre commande "${order.product_name}" a été expédiée ! 🌸\n\nNuméro de suivi : ${trackingNumber}\nTransporteur : ${carrierName}\n\nSuivez votre colis ici :\n${trackingUrl}\n\nMerci pour votre confiance,\nL'équipe Fleurs de fête`,
    });
    await base44.entities.Order.update(order.id, { tracking_email_sent: true });
    toast.success("Email de suivi envoyé au client ✓");
  };

  const downloadLabel = (data) => {
    if (data.label_url) {
      window.open(data.label_url, "_blank");
      return;
    }
    if (data.label_base64) {
      const byteChars = atob(data.label_base64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `etiquette-${data.tracking_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentCarrier = CARRIERS.find(c => c.id === carrier);

  return (
    <AdminGuard allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <style>{`
          .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        `}</style>

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <a href={createPageUrl("AdminOrders")} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </a>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              <h1 className="font-bold text-gray-800">Expédition</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: order selection */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">1. Sélectionner la commande</h2>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un client ou produit..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-300" /></div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">Aucune commande à expédier</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => handleSelectOrder(order)}
                    className={`w-full text-left p-4 rounded-xl border transition ${
                      selectedOrder?.id === order.id
                        ? "border-blue-400 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{order.customer_name}</p>
                        <p className="text-xs text-gray-400 truncate">{order.customer_email}</p>
                        <p className="text-xs text-rose-600 mt-1 font-medium">🌸 {order.product_name} × {order.quantity}</p>
                        {order.options_selected?.delivery_address && (
                          <p className="text-xs text-gray-500 mt-1 truncate">📦 {order.options_selected.delivery_address.split("\n")[0]}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {order.tracking_number ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Expédié</span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">À expédier</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: shipping form */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">2. Configurer l'expédition</h2>

            {!selectedOrder ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sélectionnez une commande à gauche</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
                {/* Selected order recap */}
                <div className="bg-rose-50 rounded-xl p-3">
                  <p className="font-semibold text-gray-800 text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.customer_email}</p>
                  {selectedOrder.options_selected?.delivery_address && (
                    <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{selectedOrder.options_selected.delivery_address}</p>
                  )}
                </div>

                {/* Carrier selection */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Transporteur</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CARRIERS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setCarrier(c.id); setProductCode(c.products[0].code); }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                          carrier === c.id
                            ? `${c.color} text-white border-transparent`
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product / service */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Service</label>
                  <select
                    value={productCode}
                    onChange={e => setProductCode(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {currentCarrier?.products.map(p => (
                      <option key={p.code} value={p.code}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Poids (kg)</label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-gray-400 mt-1">Estimé : {selectedOrder.quantity} kit(s) ≈ {(selectedOrder.quantity * 0.15 + 0.2).toFixed(2)} kg</p>
                </div>

                {/* Relay ID (Mondial Relay only) */}
                {carrier === "mondial_relay" && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Numéro du Point Relais</label>
                    <Input
                      placeholder="Ex: 04752"
                      value={relayId}
                      onChange={e => setRelayId(e.target.value)}
                      className="rounded-xl"
                    />
                    <a
                      href="https://www.mondialrelay.fr/trouver-le-point-relais-le-plus-proche/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      Trouver un point relais →
                    </a>
                  </div>
                )}

                {/* Ship button */}
                <Button
                  onClick={handleShip}
                  disabled={shipping}
                  className={`w-full h-11 rounded-xl text-white font-semibold ${currentCarrier?.color} hover:opacity-90 transition`}
                >
                  {shipping ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération en cours...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Générer l'étiquette & expédier</>
                  )}
                </Button>

                {/* Result */}
                {result && !result.error && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <p className="font-semibold text-green-800 text-sm">Expédition créée !</p>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p>Transporteur : <strong>{result.carrier}</strong></p>
                      <p>N° de suivi : <strong className="font-mono">{result.tracking_number}</strong></p>
                    </div>
                    {(result.label_base64 || result.label_url) && (
                      <Button
                        onClick={() => downloadLabel(result)}
                        variant="outline"
                        className="w-full rounded-xl border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Download className="w-4 h-4 mr-2" /> Télécharger l'étiquette PDF
                      </Button>
                    )}
                  </div>
                )}

                {result?.error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}