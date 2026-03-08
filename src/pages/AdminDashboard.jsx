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
import { Plus, Settings, Image, BarChart2, Newspaper, ExternalLink, ChevronLeft, Flower } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [polls, setPolls] = useState([]);
  const [responses, setResponses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState("list"); // list | create | edit | detail
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (selectedEvent) loadEventData(selectedEvent.id); }, [selectedEvent]);

  const loadEvents = async () => {
    setLoading(true);
    const ev = await base44.entities.Event.list("-created_date");
    setEvents(ev || []);
    setLoading(false);
  };

  const loadEventData = async (eventId) => {
    const [ph, po, pl, rs] = await Promise.all([
      base44.entities.Photo.filter({ event_id: eventId }),
      base44.entities.Post.filter({ event_id: eventId }),
      base44.entities.Poll.filter({ event_id: eventId }),
      base44.entities.PollResponse.list(),
    ]);
    setPhotos(ph || []);
    setPosts(po || []);
    setPolls(pl || []);
    setResponses((rs || []).filter(r => (pl || []).some(p => p.id === r.poll_id)));
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
            <Flower className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-gray-800">Faites Fleurir</h1>
          </div>
          <Button onClick={() => setView("create")} className="rounded-xl bg-purple-500 hover:bg-purple-600 text-white shadow-md">
            <Plus className="w-4 h-4 mr-1" /> Nouvel événement
          </Button>
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
                        {ev.plan === "premium" ? "⭐ Premium" : "Basic"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{ev.event_date}</p>
                    <p className="text-xs text-purple-400 font-mono truncate mt-1">/e/{ev.slug}</p>
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