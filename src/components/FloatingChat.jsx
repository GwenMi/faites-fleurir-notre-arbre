import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Clock } from "lucide-react";

const OPENING_HOURS = {
  monday: "09:00-18:00",
  tuesday: "09:00-18:00",
  wednesday: "09:00-18:00",
  thursday: "09:00-18:00",
  friday: "09:00-18:00",
  saturday: "10:00-17:00",
  sunday: "Fermé"
};

const FAQ_RESPONSES = {
  personnalis: "Vous pouvez personnaliser vos kits avec : rubans de couleur, types de graines, texte personnalisé (formules premium), types de pots. Tous les détails sont configurables à la commande ! 🎀",
  espace: "L'espace événement est créé automatiquement avec votre commande. Vous y recevrez un lien et un QR code pour le partager avec vos invités. Il permet de gérer les photos, RSVP et l'ambiance ! 🌸",
  delai: "Nous recommandons de commander jusqu'à 21 jours avant votre événement. Les commandes moins de 14 jours avant sont acceptées mais la livraison rapide n'est pas garantie. ⏰",
  cout: "Les prix dépendent du produit et de la quantité. Consultez notre page boutique pour tous les tarifs. Les packs de kits invités ont des prix dégressifs ! 💶",
  paiement: "Vous pouvez payer en intégralité ou verser un acompte (50%) et payer le solde plus tard. Paiements sécurisés par Stripe. 💳",
  custom: "Les textes personnalisés (prénoms, dates) sont disponibles sur les kits Premium. Format : 'Sophie & Thomas · 14 juin 2026'. ✏️",
  livraison: "Nous livrons en France et à l'international. Les frais sont calculés en fonction de l'adresse. Suivi de votre colis inclus ! 📦"
};

const KEYWORDS = {
  personnalis: ["personnaliser", "personnalis", "ruban", "graine", "pot", "texte custom"],
  espace: ["espace événement", "site événement", "partager", "qr code", "invités"],
  delai: ["délai", "quand", "avant l'événement", "préparation", "rush"],
  cout: ["prix", "coût", "tarif", "combien"],
  paiement: ["paiement", "acompte", "dépôt", "carte"],
  custom: ["custom", "nom", "personnalis"],
  livraison: ["livraison", "frais", "adresse", "international"]
};

function isBusinessHours() {
  const now = new Date();
  const day = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][now.getDay()];
  const hours = OPENING_HOURS[day];
  
  if (hours === "Fermé") return false;
  
  const [start, end] = hours.split("-");
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  return currentTime >= startTime && currentTime <= endTime;
}

function getAutoReply(text) {
  const lower = text.toLowerCase();
  for (const [key, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lower.includes(w))) {
      return FAQ_RESPONSES[key];
    }
  }
  return null;
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Bonjour ! 👋 Comment puis-je vous aider pour votre commande ?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const hours = isBusinessHours();
  const now = new Date();
  const day = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][now.getDay()];
  const todayHours = OPENING_HOURS[Object.keys(OPENING_HOURS)[now.getDay()]];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      let response = getAutoReply(input);
      
      if (!response) {
        if (hours) {
          response = "Merci pour votre question ! 😊 Notre équipe vous répondra au plus vite. Vous pouvez aussi nous contacter directement à contact@fleursenfete.com";
        } else {
          response = `Notre équipe est actuellement fermée. Nous sommes ouverts ${todayHours} aujourd'hui (${day}). Envoyez-nous un email à contact@fleursenfete.com et nous vous répondrons dès notre réouverture ! 📧`;
        }
      }

      const botMsg = { id: Date.now() + 1, text: response, sender: "bot" };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h3 className="font-bold">Fleurs en fête</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-2 h-2 rounded-full ${hours ? "bg-green-300" : "bg-gray-300"}`}></div>
                <span className="text-xs opacity-90">
                  {hours ? "En ligne" : "Actuellement fermé"}
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hours Info */}
          {!hours && (
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Fermé actuellement</p>
                <p className="mt-1">Horaires: Lun-Sam 09h-18h, Dim 10h-17h</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-rose-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSend()}
                placeholder="Votre question..."
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-full p-2.5 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all ${
          open
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-gradient-to-r from-rose-400 to-pink-500 hover:scale-110"
        } text-white flex items-center justify-center`}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}