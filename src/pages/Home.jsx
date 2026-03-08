import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { Flower, Heart, Camera, QrCode, Star, ChevronRight, Sparkles } from "lucide-react";

const FEATURES_BASIC = [
  { icon: "🌱", text: "Page événement personnalisée" },
  { icon: "🌻", text: "Défi fleur & galerie" },
  { icon: "📲", text: "QR code téléchargeable" },
  { icon: "🎨", text: "Templates gratuits" },
  { icon: "🌸", text: "Compteur de fleurs" },
];

const FEATURES_PREMIUM = [
  { icon: "📸", text: "Album photo du mariage" },
  { icon: "❤️", text: "Likes & commentaires" },
  { icon: "📢", text: "Actualités des mariés" },
  { icon: "🗳", text: "Sondages RSVP & menus" },
  { icon: "⭐", text: "Templates premium" },
  { icon: "🎨", text: "Personnalisation couleurs" },
];

export default function Home() {
  const [slugInput, setSlugInput] = useState("");

  const handleGoToEvent = () => {
    if (slugInput.trim()) {
      window.location.href = createPageUrl(`EventPublic`) + `?slug=${slugInput.trim()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@600&display=swap');
      `}</style>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {["🌸", "🌻", "🌹", "🌼", "🌺"].map((f, i) => (
            <span key={i} className="absolute text-3xl opacity-20 animate-pulse"
              style={{ top: `${10 + i * 15}%`, left: `${5 + i * 20}%`, animationDelay: `${i * 0.5}s` }}>
              {f}
            </span>
          ))}
        </div>

        <div className="relative z-10 text-center px-6 pt-16 pb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flower className="w-7 h-7 text-pink-400" />
            <span className="text-sm font-semibold tracking-widest uppercase text-pink-400">Mariages & Événements</span>
            <Flower className="w-7 h-7 text-pink-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Faites Fleurir<br />
            <span className="text-pink-500">Notre Arbre</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto mb-8 leading-relaxed">
            Offrez à vos invités un petit pot de graines. Quand leur fleur pousse, ils partagent leur photo — et votre amour fleurit à l'infini.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <a href={createPageUrl("AdminDashboard")}
              className="flex-1 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition">
              <Sparkles className="w-5 h-5" /> Créer mon événement
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 max-w-xs mx-auto">
            <p className="text-sm text-gray-400">Vous avez un lien d'événement ?</p>
            <div className="flex gap-2 w-full">
              <Input placeholder="nom-du-couple" value={slugInput} onChange={e => setSlugInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGoToEvent()}
                className="rounded-xl h-11 text-sm border-gray-200" />
              <Button onClick={handleGoToEvent} className="rounded-xl h-11 px-4 bg-pink-500 hover:bg-pink-600 text-white">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Comment ça marche ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "1", icon: "🌱", title: "Offrez des graines", desc: "Chaque invité reçoit un petit pot avec des graines à planter." },
            { step: "2", icon: "🌸", title: "La fleur pousse", desc: "Quelques semaines plus tard, la fleur s'épanouit chez eux." },
            { step: "3", icon: "📸", title: "Ils partagent", desc: "Ils scannent le QR code et partagent leur photo sur votre arbre." },
          ].map(item => (
            <div key={item.step} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-500 text-xs font-bold flex items-center justify-center mx-auto mb-2">
                {item.step}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="px-6 py-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Nos formules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Basic */}
          <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🌱</span>
              <h3 className="text-xl font-bold text-gray-800">Essentiel</h3>
            </div>
            <p className="text-3xl font-bold text-green-500 mb-1">Gratuit</p>
            <p className="text-sm text-gray-400 mb-5">Pour commencer</p>
            <ul className="space-y-2 mb-6">
              {FEATURES_BASIC.map(f => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{f.icon}</span> {f.text}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("AdminDashboard")}
              className="block text-center py-3 rounded-2xl font-semibold border-2 border-green-200 text-green-600 hover:bg-green-50 transition">
              Commencer gratuitement
            </a>
          </div>

          {/* Premium */}
          <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-xl text-white overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Populaire</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <h3 className="text-xl font-bold">Premium</h3>
            </div>
            <p className="text-3xl font-bold mb-1">19 €</p>
            <p className="text-sm text-white/70 mb-5">Par événement</p>
            <ul className="space-y-2 mb-6">
              {FEATURES_PREMIUM.map(f => (
                <li key={f.text} className="flex items-center gap-2 text-sm text-white/90">
                  <span>{f.icon}</span> {f.text}
                </li>
              ))}
            </ul>
            <a href={createPageUrl("AdminDashboard")}
              className="block text-center py-3 rounded-2xl font-semibold bg-white text-purple-600 hover:bg-white/90 transition">
              Choisir Premium
            </a>
          </div>
        </div>
      </div>

      <footer className="text-center py-8 px-4 text-xs text-gray-400">
        <p className="text-pink-400 font-semibold text-sm mb-1">Faites Fleurir Notre Arbre 🌸</p>
        <p>"Merci d'avoir partagé ce moment avec nous"</p>
      </footer>
    </div>
  );
}