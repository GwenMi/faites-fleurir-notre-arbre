import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Flower2, Camera, Trophy, Clock, Users, Lock, LogOut, Upload } from "lucide-react";
import GuestAuth, { getGuestSession, setGuestSession, clearGuestSession } from "./GuestAuth";
import FlowerGallery from "./FlowerGallery";
import PostUploadModal from "./PostUploadModal";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function FlowerChallengeSection({ event }) {
  const [challenge, setChallenge] = useState(null);
  const [posts, setPosts] = useState([]);
  const [guest, setGuest] = useState(getGuestSession());
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(null); // "flower" | "challenge"

  const eventId = event?.id;

  useEffect(() => {
    if (!eventId) return;
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const [challenges, flowerPosts] = await Promise.all([
      base44.entities.FlowerChallenge.filter({ event_id: eventId }),
      base44.entities.FlowerPost.filter({ event_id: eventId }),
    ]);
    setChallenge(challenges?.[0] || null);
    setPosts(flowerPosts || []);
    setLoading(false);
  };

  const handleAuth = (guestData) => {
    setGuest(guestData);
  };

  const handleLogout = () => {
    clearGuestSession();
    setGuest(null);
    toast.success("Déconnecté");
  };

  if (loading) return (
    <div className="py-12 text-center text-gray-400 text-sm">Chargement du défi...</div>
  );

  if (!challenge || !challenge.is_active) return null;

  const now = new Date();
  const flowerDeadline = new Date(challenge.flower_deadline);
  const challengeDeadline = new Date(challenge.challenge_deadline);
  const isFlowerPhase = now <= flowerDeadline;
  const isChallengePhase = now > flowerDeadline && now <= challengeDeadline;
  const isOver = now > challengeDeadline;

  const flowerPosts = posts.filter(p => p.type === "flower");
  const challengePosts = posts.filter(p => p.type === "challenge");
  const daysLeftFlower = getDaysLeft(challenge.flower_deadline);
  const daysLeftChallenge = getDaysLeft(challenge.challenge_deadline);

  const hasPostedFlower = guest ? flowerPosts.some(p => p.user_email === guest.email) : false;
  const hasPostedChallenge = guest ? challengePosts.some(p => p.user_email === guest.email) : false;

  const mustDoChallenge = isChallengePhase && guest && !hasPostedFlower;

  return (
    <div className="mt-12">
      <style>{`
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      {/* Section header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-200 max-w-16" />
          <Flower2 className="w-6 h-6 text-rose-400" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-200 max-w-16" />
        </div>
        <h2 className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Le défi des fleurs
        </h2>
        <p className="font-sans-clean text-gray-500 text-sm max-w-md mx-auto">
          Faites fleurir ce souvenir — plantez votre graine et partagez votre fleur !
        </p>
      </div>

      {/* Phase banner */}
      <div className={`rounded-2xl p-5 mb-6 text-center ${
        isFlowerPhase ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200" :
        isChallengePhase ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200" :
        "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
      }`}>
        {isFlowerPhase && (
          <>
            <p className="font-sans-clean font-bold text-green-700 text-sm uppercase tracking-wide mb-1">🌱 Phase des fleurs</p>
            <p className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">
              {daysLeftFlower !== null && daysLeftFlower > 0
                ? `Plus que ${daysLeftFlower} jour${daysLeftFlower > 1 ? "s" : ""} pour partager votre fleur`
                : "Dernière chance aujourd'hui !"}
            </p>
            <p className="font-sans-clean text-xs text-gray-500">Date limite : {formatDate(challenge.flower_deadline)}</p>
          </>
        )}
        {isChallengePhase && (
          <>
            <p className="font-sans-clean font-bold text-orange-600 text-sm uppercase tracking-wide mb-1">🎭 Phase du défi</p>
            <p className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">
              Le gage a été révélé !
            </p>
            <p className="font-sans-clean text-xs text-gray-500 mb-2">Termine le {formatDate(challenge.challenge_deadline)}</p>
            {challenge.challenge_secret && (
              <div className="inline-block bg-white border border-orange-200 rounded-xl px-6 py-3 mt-1">
                <p className="font-sans-clean text-xs text-orange-400 uppercase tracking-wide mb-1">Le gage</p>
                <p className="font-serif-elegant text-lg font-bold text-gray-800">{challenge.challenge_secret}</p>
              </div>
            )}
          </>
        )}
        {isOver && (
          <>
            <p className="font-sans-clean font-bold text-purple-600 text-sm uppercase tracking-wide mb-1">🏆 Défi terminé</p>
            <p className="font-serif-elegant text-xl font-bold text-gray-800 mb-1">
              Merci à tous les participants !
            </p>
            {challenge.challenge_secret && (
              <p className="font-sans-clean text-xs text-gray-500 mt-1">Gage : {challenge.challenge_secret}</p>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white border border-rose-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-rose-500">{flowerPosts.length}</p>
          <p className="font-sans-clean text-xs text-gray-500 mt-1">🌸 Fleurs partagées</p>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-orange-500">{challengePosts.length}</p>
          <p className="font-sans-clean text-xs text-gray-500 mt-1">🎭 Défis relevés</p>
        </div>
      </div>

      {/* Auth section */}
      {!guest ? (
        <div className="mb-6">
          <GuestAuth eventId={eventId} onAuthenticated={handleAuth} />
        </div>
      ) : (
        <div className="mb-6">
          {/* Logged in bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-rose-500 font-bold text-sm">{guest.pseudo[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="font-sans-clean font-semibold text-gray-800 text-sm">{guest.pseudo}</p>
                <p className="font-sans-clean text-xs text-gray-400">{guest.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          {isFlowerPhase && (
            <div>
              {hasPostedFlower ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-green-600 font-semibold font-sans-clean text-sm">✅ Vous avez déjà partagé votre fleur !</p>
                </div>
              ) : (
                <Button
                  onClick={() => setShowUpload("flower")}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold text-base hover:opacity-90 transition"
                >
                  <Camera className="w-5 h-5 mr-2" /> Partager ma fleur 🌸
                </Button>
              )}
            </div>
          )}

          {isChallengePhase && (
            <div className="space-y-3">
              {mustDoChallenge ? (
                <div>
                  {hasPostedChallenge ? (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
                      <p className="text-orange-600 font-semibold font-sans-clean text-sm">✅ Vous avez relevé le défi !</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center mb-3">
                        <p className="font-sans-clean text-orange-700 font-semibold text-sm">
                          🎭 Vous n'avez pas partagé de fleur — vous devez relever le gage !
                        </p>
                        {challenge.challenge_secret && (
                          <p className="font-serif-elegant text-xl font-bold text-gray-800 mt-2">{challenge.challenge_secret}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => setShowUpload("challenge")}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold text-base hover:opacity-90 transition"
                      >
                        <Trophy className="w-5 h-5 mr-2" /> Relever le défi 🎭
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-green-600 font-semibold font-sans-clean text-sm">
                    🌸 Vous avez partagé votre fleur, bravo ! Vous avez évité le gage.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Galleries */}
      {flowerPosts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🌸 Galerie des fleurs
            <span className="text-base font-normal text-gray-400 font-sans-clean">({flowerPosts.length})</span>
          </h3>
          <FlowerGallery posts={flowerPosts} />
        </div>
      )}

      {(isChallengePhase || isOver) && challengePosts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-serif-elegant text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🎭 Galerie des défis
            <span className="text-base font-normal text-gray-400 font-sans-clean">({challengePosts.length})</span>
          </h3>
          <FlowerGallery posts={challengePosts} type="challenge" />
        </div>
      )}

      {/* Gage secret hidden during flower phase */}
      {isFlowerPhase && (
        <div className="text-center mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-gray-400 text-xs font-sans-clean">
            <Lock className="w-3 h-3" /> Le gage secret sera révélé après la date limite
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && guest && (
        <PostUploadModal
          type={showUpload}
          eventId={eventId}
          guest={guest}
          challenge={challenge}
          onClose={() => setShowUpload(null)}
          onSuccess={() => { setShowUpload(null); loadData(); }}
        />
      )}
    </div>
  );
}