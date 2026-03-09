import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventForm from "@/components/admin/EventForm";
import PhotoModeration from "@/components/admin/PhotoModeration";
import PollManager from "@/components/admin/PollManager";
import PostManager from "@/components/admin/PostManager";
import QRCodeDisplay from "@/components/admin/QRCodeDisplay";
import { Plus, Settings, Image, BarChart2, Newspaper, ExternalLink, ChevronLeft, Copy, Check, Link, MessageSquare, Package, Flower2, LayoutGrid, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { createPageUrl } from "@/utils";
import CommentModeration from "@/components/admin/CommentModeration";
import ChallengeManager from "@/components/admin/ChallengeManager";
import SeatingManager from "@/components/admin/SeatingManager";
import RSVPManager from "@/components/admin/rsvp/RSVPManager";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [polls, setPolls] = useState([]);
  const [responses, setResponses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [view, setView] = useState("list"); // list | create | edit | detail
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const copyLink = (e, ev) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ev.public_url);
    setCopiedId(ev.id);
    toast.success("Lien copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (selectedEvent) loadEventData(selectedEvent.id); }, [selectedEvent]);

  const loadEvents = async () => {
    setLoading(true);
    const ev = await base44.entities.Event.list("-created_date");
    setEvents(ev || []);
    setLoading(false);
  };

  const loadEventData = async (eventId) => {
    const [ph, po, pl, rs, cm, rx] = await Promise.all([
      base44.entities.Photo.filter({ event_id: eventId }),
      base44.entities.Post.filter({ event_id: eventId }),
      base44.entities.Poll.filter({ event_id: eventId }),
      base44.entities.PollResponse.list(),
      base44.entities.Comment.list(),
      base44.entities.Reaction.filter({ event_id: eventId }),
    ]);
    const photoIds = (ph || []).map(p => p.id);
    setPhotos(ph || []);
    setPosts(po || []);
    setPolls(pl || []);
    setResponses((rs || []).filter(r => (pl || []).some(p => p.id === r.poll_id)));
    setComments((cm || []).filter(c => photoIds.includes(c.photo_id)));
    setReactions(rx || []);
  };

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev);
    setView("detail");
  };

  const handleSave = () => {
    loadEvents();
    setView("list");
  };

  if (view === "create") return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("list")} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Créer un événement</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <EventForm onSave={handleSave} onCancel={() => setView("list")} />
        </div>
      </div>
    </div>
  );

  if (view === "edit" && selectedEvent) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView("detail")} className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Modifier l'événement</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <EventForm event={selectedEvent} onSave={() => { loadEvents(); setView("detail"); }} onCancel={() => setView("detail")} />
        </div>
      </div>
    </div>
  );

  if (view === "detail" && selectedEvent) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("list")} className="p-2 rounded-xl hover:bg-gray-50 transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="font-bold text-gray-800 text-sm md:text-base">{selectedEvent.couple_names}</h1>
              <Badge className={selectedEvent.plan === "premium" ? "bg-amber-100 text-amber-700 text-xs" : "bg-green-100 text-green-700 text-xs"}>
                {selectedEvent.plan === "premium" ? "⭐ Complet" : "Essentiel"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={selectedEvent.public_url} target="_blank" rel="noopener noreferrer"
              className="p-2 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 transition">
              <ExternalLink className="w-4 h-4" />
            </a>
            <Button size="sm" onClick={() => setView("edit")} variant="outline" className="rounded-xl text-xs">
              <Settings className="w-3 h-3 mr-1" /> Modifier
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* Lien public */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 mb-4 flex items-center gap-3">
          <Link className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Lien de votre page événement</p>
            <p className="text-sm font-mono text-purple-600 truncate">{selectedEvent.public_url}</p>
          </div>
          <button onClick={(e) => copyLink(e, selectedEvent)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition text-xs font-semibold">
            {copiedId === selectedEvent.id ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copié</> : <><Copy className="w-3.5 h-3.5" /> Copier</>}
          </button>
          <a href={selectedEvent.public_url} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition text-xs font-semibold">
            <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
          </a>
        </div>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="w-full mb-4 rounded-2xl bg-white shadow-sm border border-gray-100 p-1">
            <TabsTrigger value="photos" className="flex-1 rounded-xl text-xs">
              <Image className="w-3 h-3 mr-1" /> Photos
              {photos.filter(p => !p.approved).length > 0 && (
                <span className="ml-1 bg-amber-400 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {photos.filter(p => !p.approved).length}
                </span>
              )}
            </TabsTrigger>
            {selectedEvent.plan === "premium" && <>
              <TabsTrigger value="polls" className="flex-1 rounded-xl text-xs">
                <BarChart2 className="w-3 h-3 mr-1" /> Sondages
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex-1 rounded-xl text-xs">
                <Newspaper className="w-3 h-3 mr-1" /> Actus
              </TabsTrigger>
            </>}
            <TabsTrigger value="comments" className="flex-1 rounded-xl text-xs">
              <MessageSquare className="w-3 h-3 mr-1" /> Comm.
              {(comments.length + reactions.length) > 0 && (
                <span className="ml-1 bg-blue-400 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                  {comments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="rsvp" className="flex-1 rounded-xl text-xs">
              <ClipboardList className="w-3 h-3 mr-1" /> RSVP
            </TabsTrigger>
            <TabsTrigger value="seating" className="flex-1 rounded-xl text-xs">
              <LayoutGrid className="w-3 h-3 mr-1" /> Tables
            </TabsTrigger>
            <TabsTrigger value="challenge" className="flex-1 rounded-xl text-xs">
              <Flower2 className="w-3 h-3 mr-1" /> Défi
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex-1 rounded-xl text-xs">
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <PhotoModeration photos={photos} onRefresh={() => loadEventData(selectedEvent.id)} />
            </div>
          </TabsContent>

          {selectedEvent.plan === "premium" && <>
            <TabsContent value="polls">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <PollManager eventId={selectedEvent.id} polls={polls} responses={responses} onRefresh={() => loadEventData(selectedEvent.id)} />
              </div>
            </TabsContent>
            <TabsContent value="posts">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <PostManager eventId={selectedEvent.id} posts={posts} onRefresh={() => loadEventData(selectedEvent.id)} />
              </div>
            </TabsContent>
          </>}

          <TabsContent value="comments">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <CommentModeration
                comments={comments}
                reactions={reactions}
                photos={photos}
                onRefresh={() => loadEventData(selectedEvent.id)}
              />
            </div>
          </TabsContent>

          <TabsContent value="seating">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <SeatingManager event={selectedEvent} />
            </div>
          </TabsContent>

          <TabsContent value="challenge">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <ChallengeManager event={selectedEvent} onRefresh={() => loadEventData(selectedEvent.id)} />
            </div>
          </TabsContent>

          <TabsContent value="qr">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <QRCodeDisplay event={selectedEvent} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  // EVENT LIST
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png" alt="Fleurs de fête" className="h-9" />
          </div>
          <div className="flex items-center gap-2">
            <a href={createPageUrl("AdminOrders")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition text-sm font-semibold">
              <Package className="w-4 h-4" /> Commandes
            </a>
            <Button onClick={() => setView("create")} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Nouvel événement
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl">🌸</span>
            <h2 className="text-xl font-bold text-gray-700 mt-4">Bienvenue !</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">Créez votre premier événement pour commencer à partager des souvenirs fleuris.</p>
            <Button onClick={() => setView("create")} className="mt-6 rounded-xl bg-purple-500 hover:bg-purple-600 text-white px-8">
              Créer un événement
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium">{events.length} événement{events.length > 1 ? "s" : ""}</p>
            {events.map(ev => (
              <div key={ev.id} onClick={() => handleSelectEvent(ev)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {ev.cover_image ? (
                    <img src={ev.cover_image} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" alt={ev.couple_names} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{ background: ev.primary_color + "22" }}>
                      🌸
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{ev.couple_names}</p>
                      <Badge className={ev.plan === "premium" ? "bg-amber-100 text-amber-700 text-xs" : "bg-green-100 text-green-700 text-xs"}>
                        {ev.plan === "premium" ? "⭐ Complet" : "Essentiel"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{ev.event_date}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-xs text-purple-400 font-mono truncate">?slug={ev.slug}</p>
                      <button onClick={(e) => copyLink(e, ev)}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-purple-50 transition text-purple-400 hover:text-purple-600">
                        {copiedId === ev.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a href={ev.public_url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-purple-50 transition text-purple-400 hover:text-purple-600">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}