import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GuestSessionModal({ eventName, tpl, onConfirm }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({ name: name.trim(), email: email.trim() });
  };

  const primary = tpl?.primary || "#f43f5e";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="text-5xl mb-4">🌸</div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Bienvenue !</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Pour participer à <span className="font-semibold text-gray-700">{eventName || "cet événement"}</span>,<br />
          entrez votre prénom.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Votre prénom *
            </label>
            <Input
              placeholder="Ex : Marie"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-xl h-12 text-base"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Email <span className="text-gray-300 font-normal normal-case">(optionnel)</span>
            </label>
            <Input
              type="email"
              placeholder="vous@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl h-12 text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-12 rounded-xl text-white font-semibold mt-2 text-sm"
            style={{ background: primary }}
          >
            Rejoindre l'événement 🎉
          </Button>
        </form>
      </div>
    </div>
  );
}