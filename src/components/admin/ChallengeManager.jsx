import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Flower2, Trophy, Lock, Users, Calendar, Eye, Trash2, RefreshCw, Mail } from "lucide-react";

const GAGE_SUGGESTIONS = [
  "Photo grimace 😜",
  "Photo en déguisement 🎭",
  "Photo avec un objet jaune 🟡",
  "Danse ridicule filmée 💃",
  "Selfie avec un autre invité 🤳",
  "Photo en pyjama 😴",
  "Photo sous la pluie ☔",
  "Imiter un animal 🐔",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ChallengeManager({ event, onRefresh }) {
  const [challenge, setChallenge] = useState(null);
  const [flowerPosts, setFlowerPosts] = useState([]);
  const [challengePosts, setChallengePosts] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    flower_deadline: "",
    challenge_deadline: "",
    challenge_secret: "",
    challenge_description: "",
  });
  const [activeTab, setActiveTab] = useState("settings"); // settings | flowers | challenges | participants
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => {
    loadData();
  }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [challenges, fp, cp, gs] = await Promise.all([
      base44.entities.FlowerChallenge.filter({ event_id: event.id }),
      base44.entities.FlowerPost.filter({ event_id: event.id, type: "flower" }),
      base44.entities.FlowerPost.filter({ event_id: event.id, type: "challenge" }),
      base44.entities.GuestSession.filter({ event_id: event.id }),
    ]);
    const ch = challenges?.[0] || null;
    setChallenge(ch);
    setFlowerPosts(fp || []);
    setChallengePosts(cp || []);
    setGuests(gs || []);
    if (ch) {
      setForm({
        flower_deadline: ch.flower_deadline || "",
        challenge_deadline: ch.challenge_deadline || "",
        challenge_secret: ch.challenge_secret || "",
        challenge_description: ch.challenge_description || "",
      });
    } else if (event.event_date) {
      // Auto-init dates
      const base = new Date(event.event_date);
      const fd = new Date(base); fd.setDate(fd.getDate() + 30);
      const cd = new Date(fd); cd.setDate(cd.getDate() + 7);
      setForm(f => ({
        ...f,
        flower_deadline: fd.toISOString().split("T")[0],
        challenge_deadline: cd.toISOString().split("T")[0],
      }));
    }
    setLoading(false);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.flower_deadline || !form.challenge_deadline) {
      toast.error("Veuillez définir les deux dates");
      return;
    }
    setSaving(true);
    if (challenge) {
      await base44.entities.FlowerChallenge.update(challenge.id, { ...form, is_active: true });
      toast.success("Défi mis à jour !");
    } else {
      await base44.entities.FlowerChallenge.create({ event_id: event.id, ...form, is_active: true });
      toast.success("Défi des fleurs créé ! 🌸");
    }
    await loadData();
    setSaving(false);
  };

  const handleSendThankYouEmails = async () => {
    const guestsWithFlower = guests.filter(g => flowerPosts.some(p => p.user_email === g.email));
    if (guestsWithFlower.length === 0) {
      toast.error("Aucun invité avec une fleur partagée");
      return;
    }
    setSendingEmails(true);
    let sent = 0;
    for (const guest of guestsWithFlower) {
      await base44.integrations.Core.SendEmail({
        to: guest.email,
        subject: `Merci pour votre fleur 🌸 — ${event.couple_names}`,
        body: `Bonjour ${guest.pseudo},\n\nMerci d'avoir participé au défi des fleurs pour l'événement de ${event.couple_names} !\n\nVotre contribution fleurie fait partie d'un souvenir unique que nous chérissons. Retrouvez toute la galerie des fleurs partagées via ce lien :\n\n${event.public_url}\n\nAvec toute notre gratitude,\n${event.couple_names} 🌸`,
      });
      sent++;
    }
    setSendingEmails(false);
    toast.success(`${sent} email${sent > 1 ? "s" : ""} de remerciement envoyé${sent > 1 ? "s" : ""} !`);
  };

  const handleDeletePost = async (postId) => {
    await base44.entities.FlowerPost.delete(postId);
    toast.success("Photo supprimée");
    loadData();
  };

  if (loading) return <div className="py-8 text-center text-gray-400 text-sm">Chargement...</div>;

  const now = new Date();
  const isFlowerPhase = challenge && now <= new Date(challenge.flower_deadline);
  const isChallengePhase = challenge && now > new Date(challenge.flower_deadline) && now <= new Date(challenge.challenge_deadline);

  const tabs = [
    { key: "settings", label: "⚙️ Paramètres" },
    { key: "flowers", label: `🌸 Fleurs (${flowerPosts.length})` },
    { key: "challenges", label: `🎭 Défis (${challengePosts.length})` },
    { key: "participants", label: `👥 Invités (${guests.length})` },
  ];

  return (
    <div>
      {/* Status banner */}
      {challenge && (
        <div className={`rounded-xl p-3 mb-4 text-center text-sm font-medium ${
          isFlowerPhase ? "bg-green-50 text-green-700 border border-green-200" :
          isChallengePhase ? "bg-orange-50 text-orange-700 border border-orange-200" :
          "bg-gray-50 text-gray-500 border border-gray-200"
        }`}>
          {isFlowerPhase ? "🌱 Phase des fleurs active" :
           isChallengePhase ? "🎭 Phase du défi en cours" :
           "✅ Défi terminé"}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-max px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
              activeTab === tab.key ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      {activeTab === "settings" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Flower2 className="w-3 h-3 text-green-500" /> Date limite — Fleurs
              </Label>
              <Input type="date" value={form.flower_deadline} onChange={e => set("flower_deadline", e.target.value)} className="rounded-xl h-11" />
              <p className="text-xs text-gray-400">Les invités doivent partager leur fleur avant cette date</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-orange-500" /> Date limite — Défi
              </Label>
              <Input type="date" value={form.challenge_deadline} onChange={e => set("challenge_deadline", e.target.value)} className="rounded-xl h-11" />
              <p className="text-xs text-gray-400">Fin de la période pour réaliser le gage</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-gray-500 flex items-center gap-2">
              <Lock className="w-3 h-3 text-purple-500" />
              Gage secret
              <Badge className="bg-purple-100 text-purple-600 text-xs">Caché aux invités jusqu'à la deadline</Badge>
            </Label>
            <Input
              placeholder="Ex: Photo grimace, danse ridicule..."
              value={form.challenge_secret}
              onChange={e => set("challenge_secret", e.target.value)}
              className="rounded-xl h-11"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {GAGE_SUGGESTIONS.map(s => (
                <button key={s} type="button"
                  onClick={() => set("challenge_secret", s)}
                  className={`text-xs px-3 py-2 rounded-xl border transition text-left ${form.challenge_secret === s ? "border-purple-400 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Description (optionnel)</Label>
            <Textarea
              placeholder="Instructions supplémentaires pour les invités..."
              value={form.challenge_description}
              onChange={e => set("challenge_description", e.target.value)}
              className="rounded-xl"
              rows={2}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold hover:opacity-90 transition">
            {saving ? "Enregistrement..." : challenge ? "Mettre à jour le défi" : "🌸 Créer le défi des fleurs"}
          </Button>
        </div>
      )}

      {/* Flower posts */}
      {activeTab === "flowers" && (
        <div>
          {flowerPosts.length > 0 && guests.filter(g => flowerPosts.some(p => p.user_email === g.email)).length > 0 && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-rose-700">Envoyer un email de remerciement</p>
                <p className="text-xs text-rose-500 mt-0.5">
                  {guests.filter(g => flowerPosts.some(p => p.user_email === g.email)).length} invité(s) ayant partagé une fleur recevront un email avec un lien vers la galerie.
                </p>
              </div>
              <Button
                onClick={handleSendThankYouEmails}
                disabled={sendingEmails}
                size="sm"
                className="flex-shrink-0 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                {sendingEmails ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          )}
          {flowerPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Flower2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune fleur partagée pour l'instant</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {flowerPosts.map(post => (
                <div key={post.id} className="relative rounded-2xl overflow-hidden group bg-gray-100 aspect-square">
                  <img src={post.image} alt={post.user_pseudo} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-end p-3">
                    <p className="text-white text-xs font-semibold">{post.user_pseudo}</p>
                    {post.caption && <p className="text-white/80 text-xs truncate">{post.caption}</p>}
                    <button onClick={() => handleDeletePost(post.id)}
                      className="mt-2 bg-red-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-red-600 transition flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700">
                    {post.user_pseudo}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Challenge posts */}
      {activeTab === "challenges" && (
        <div>
          {challengePosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun défi relevé pour l'instant</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {challengePosts.map(post => (
                <div key={post.id} className="relative rounded-2xl overflow-hidden group bg-gray-100 aspect-square">
                  <img src={post.image} alt={post.user_pseudo} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-end p-3">
                    <p className="text-white text-xs font-semibold">{post.user_pseudo}</p>
                    <button onClick={() => handleDeletePost(post.id)}
                      className="mt-2 bg-red-500 text-white rounded-lg px-3 py-1 text-xs hover:bg-red-600 transition flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-orange-500/90 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                    🎭 {post.user_pseudo}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participants */}
      {activeTab === "participants" && (
        <div>
          {guests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun participant inscrit pour l'instant</p>
            </div>
          ) : (() => {
            // Sort guests who posted flowers by post date
            const rankedGuests = guests
              .map(g => {
                const post = flowerPosts.find(p => p.user_email === g.email);
                return { ...g, flowerPost: post || null };
              })
              .sort((a, b) => {
                if (a.flowerPost && b.flowerPost) return new Date(a.flowerPost.created_date) - new Date(b.flowerPost.created_date);
                if (a.flowerPost) return -1;
                if (b.flowerPost) return 1;
                return 0;
              });

            const rankBadges = [
              { label: "🌿 Main verte", bg: "bg-green-100", text: "text-green-700" },
              { label: "🥈 2ème fleur", bg: "bg-gray-100", text: "text-gray-600" },
              { label: "🥉 3ème fleur", bg: "bg-amber-100", text: "text-amber-700" },
            ];

            let flowerRank = 0;
            return (
              <div className="space-y-2">
                {rankedGuests.map(g => {
                  const hasFlower = !!g.flowerPost;
                  const hasChallenge = challengePosts.some(p => p.user_email === g.email);
                  let rankBadge = null;
                  if (hasFlower) {
                    rankBadge = rankBadges[flowerRank] || { label: `🌸 #${flowerRank + 1}`, bg: "bg-rose-50", text: "text-rose-500" };
                    flowerRank++;
                  }
                  return (
                    <div key={g.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${flowerRank === 1 && hasFlower ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasFlower ? "bg-green-100" : "bg-rose-100"}`}>
                          <span className={`font-bold text-sm ${hasFlower ? "text-green-600" : "text-rose-500"}`}>{g.pseudo[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{g.pseudo}</p>
                          <p className="text-xs text-gray-400">{g.email}</p>
                          {g.flowerPost && (
                            <p className="text-xs text-gray-400">
                              {new Date(g.flowerPost.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {rankBadge && <Badge className={`${rankBadge.bg} ${rankBadge.text} text-xs font-semibold`}>{rankBadge.label}</Badge>}
                        {hasChallenge && <Badge className="bg-orange-100 text-orange-700 text-xs">🎭 Défi</Badge>}
                        {!hasFlower && !hasChallenge && <Badge className="bg-gray-100 text-gray-500 text-xs">En attente</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}