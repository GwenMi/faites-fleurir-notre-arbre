import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flower2, Lock, Mail, User } from "lucide-react";

// Simple hash for demo purposes (not cryptographic)
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return String(Math.abs(hash));
}

const SESSION_KEY = "flower_guest_session";

export function getGuestSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setGuestSession(guest) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(guest));
}

export function clearGuestSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function GuestAuth({ eventId, onAuthenticated }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ pseudo: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.pseudo.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("Tous les champs sont requis");
      return;
    }
    setLoading(true);
    // Check if email already exists for this event
    const existing = await base44.entities.GuestSession.filter({ event_id: eventId, email: form.email.trim().toLowerCase() });
    if (existing && existing.length > 0) {
      toast.error("Cet email est déjà utilisé. Connectez-vous.");
      setMode("login");
      setLoading(false);
      return;
    }
    const hash = simpleHash(form.password);
    const guest = await base44.entities.GuestSession.create({
      event_id: eventId,
      pseudo: form.pseudo.trim(),
      email: form.email.trim().toLowerCase(),
      password_hash: hash,
    });
    setGuestSession({ id: guest.id, pseudo: guest.pseudo, email: guest.email, event_id: eventId });
    toast.success(`Bienvenue ${guest.pseudo} ! 🌸`);
    onAuthenticated({ id: guest.id, pseudo: guest.pseudo, email: guest.email });
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Email et mot de passe requis");
      return;
    }
    setLoading(true);
    const hash = simpleHash(form.password);
    const existing = await base44.entities.GuestSession.filter({ event_id: eventId, email: form.email.trim().toLowerCase() });
    if (!existing || existing.length === 0) {
      toast.error("Compte introuvable. Inscrivez-vous d'abord.");
      setMode("register");
      setLoading(false);
      return;
    }
    const guest = existing[0];
    if (guest.password_hash !== hash) {
      toast.error("Mot de passe incorrect");
      setLoading(false);
      return;
    }
    setGuestSession({ id: guest.id, pseudo: guest.pseudo, email: guest.email, event_id: eventId });
    toast.success(`Ravi de vous revoir, ${guest.pseudo} ! 🌸`);
    onAuthenticated({ id: guest.id, pseudo: guest.pseudo, email: guest.email });
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-rose-100 p-8 max-w-sm mx-auto text-center">
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Flower2 className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-1">Défi des fleurs</h3>
      <p className="text-sm text-gray-500 mb-6">
        {mode === "login" ? "Connectez-vous pour participer" : "Créez votre compte pour participer"}
      </p>

      <div className="space-y-3 text-left">
        {mode === "register" && (
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Votre pseudo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
              <Input placeholder="Votre prénom ou pseudo" value={form.pseudo}
                onChange={e => set("pseudo", e.target.value)}
                className="pl-9 rounded-xl h-11" />
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <Input type="email" placeholder="votre@email.com" value={form.email}
              onChange={e => set("email", e.target.value)}
              className="pl-9 rounded-xl h-11" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
            <Input type="password" placeholder="••••••••" value={form.password}
              onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())}
              className="pl-9 rounded-xl h-11" />
          </div>
        </div>
      </div>

      <Button
        onClick={mode === "login" ? handleLogin : handleRegister}
        disabled={loading}
        className="w-full mt-5 h-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold hover:opacity-90 transition"
      >
        {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </Button>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        className="mt-4 text-xs text-gray-400 hover:text-rose-400 transition underline"
      >
        {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
}