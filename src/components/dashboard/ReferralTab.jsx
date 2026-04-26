import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck, Gift, Users, Share2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

export default function ReferralTab({ user }) {
  const [referralCode, setReferralCode] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      // Charger tous les referrals liés à cet utilisateur
      const data = await base44.entities.Referral.filter({ referrer_email: user.email }, "-created_date", 50);
      const master = data?.find(r => !r.referee_email);
      if (master) setReferralCode(master.referral_code);
      const used = data?.filter(r => r.referee_email) || [];
      setReferrals(used);
    } catch {}
    setLoading(false);
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("createReferralCode", {});
      setReferralCode(res.data?.referralCode);
    } catch {
      toast.error("Erreur lors de la génération du code");
    }
    setGenerating(false);
  };

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Code copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareMessage = `🌸 Commande tes pots de graines personnalisés sur fleursdefete.fr et utilise mon code ${referralCode} pour obtenir 5€ de réduction !`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareMessage, url: "https://fleursdefete.fr" });
    } else {
      navigator.clipboard.writeText(shareMessage);
      toast.success("Message copié !");
    }
  };

  const totalEarned = referrals.filter(r => r.status === "used" || r.status === "rewarded").length * (referrals[0]?.reward_amount || 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="font-serif-elegant text-2xl font-bold text-gray-800">Parrainage</h2>
        <p className="font-sans-clean text-sm text-gray-500 mt-1">Invitez vos amis et gagnez tous les deux 5€ de réduction.</p>
      </div>

      {/* Explication */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: "1", icon: "🔗", title: "Partagez votre code", desc: "Envoyez votre code unique à vos amis" },
          { step: "2", icon: "🛒", title: "Votre ami commande", desc: "Il bénéficie de 5€ de réduction sur sa commande" },
          { step: "3", icon: "🎁", title: "Vous êtes récompensé", desc: "Recevez un bon d'achat de 5€ par email" },
        ].map(s => (
          <div key={s.step} className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="font-sans-clean text-xs font-bold text-rose-600 uppercase tracking-wide mb-1">{s.title}</p>
            <p className="font-sans-clean text-xs text-gray-500">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Code parrainage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-rose-400" />
          <p className="font-sans-clean font-bold text-gray-800">Votre code parrainage</p>
        </div>

        {referralCode ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-rose-50 border-2 border-dashed border-rose-200 rounded-xl px-5 py-4 text-center">
                <p className="font-serif-elegant text-3xl font-bold text-rose-600 tracking-widest">{referralCode}</p>
              </div>
              <button
                onClick={copyCode}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition"
              >
                {copied ? <CheckCheck className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                <span className="font-sans-clean text-xs text-gray-400">{copied ? "Copié !" : "Copier"}</span>
              </button>
            </div>

            <Button
              onClick={handleShare}
              className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-sans-clean font-semibold gap-2"
            >
              <Share2 className="w-4 h-4" /> Partager mon code
            </Button>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="font-sans-clean text-xs text-amber-700">
                💡 Votre ami saisit ce code lors de sa commande pour obtenir <strong>5€ de réduction</strong>.<br />
                Vous recevez ensuite <strong>un bon d'achat de 5€</strong> par email.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="font-sans-clean text-sm text-gray-500 mb-4">Générez votre code unique pour commencer à parrainer.</p>
            <Button
              onClick={generateCode}
              disabled={generating}
              className="h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-sans-clean font-semibold gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              {generating ? "Génération…" : "Obtenir mon code"}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {referrals.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <Users className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="font-serif-elegant text-3xl font-bold text-gray-800">{referrals.length}</p>
            <p className="font-sans-clean text-xs text-gray-400 mt-1">Filleul{referrals.length > 1 ? "s" : ""} parrainé{referrals.length > 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <Gift className="w-6 h-6 text-rose-400 mx-auto mb-2" />
            <p className="font-serif-elegant text-3xl font-bold text-rose-600">{totalEarned}€</p>
            <p className="font-sans-clean text-xs text-gray-400 mt-1">Bons d'achat gagnés</p>
          </div>
        </div>
      )}

      {/* Historique */}
      {referrals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-sans-clean font-bold text-gray-800 text-sm">Historique des parrainages</p>
          </div>
          <div className="divide-y divide-gray-50">
            {referrals.map((r, i) => (
              <div key={r.id || i} className="flex items-center gap-3 px-5 py-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif-elegant text-sm font-bold text-rose-500">
                    {(r.referee_name || r.referee_email || "?")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans-clean text-sm font-semibold text-gray-800 truncate">
                    {r.referee_name || r.referee_email || "Filleul"}
                  </p>
                  <p className="font-sans-clean text-xs text-gray-400">
                    {new Date(r.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold font-sans-clean ${
                    r.status === "rewarded" ? "bg-green-100 text-green-700" :
                    r.status === "used" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {r.status === "rewarded" ? "✅ Récompensé" : r.status === "used" ? "🎁 +5€ gagné" : "En attente"}
                  </span>
                  {r.reward_code && (
                    <p className="font-sans-clean text-xs text-gray-300 mt-0.5">Code : {r.reward_code}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {referrals.length === 0 && referralCode && (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-sans-clean text-sm text-gray-400">Aucun filleul pour l'instant</p>
          <p className="font-sans-clean text-xs text-gray-300 mt-1">Partagez votre code pour commencer !</p>
        </div>
      )}
    </div>
  );
}