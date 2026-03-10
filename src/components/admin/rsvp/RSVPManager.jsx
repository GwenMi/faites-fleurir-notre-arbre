import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, HelpCircle, UtensilsCrossed } from "lucide-react";
import RSVPStats from "./RSVPStats";
import RSVPQuestions from "./RSVPQuestions";
import RSVPResponseList from "./RSVPResponseList";
import MealSummary from "./MealSummary";

export default function RSVPManager({ event }) {
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [event?.id]);

  const loadData = async () => {
    setLoading(true);
    const [r, q, g] = await Promise.all([
      base44.entities.RSVPResponse.filter({ event_id: event.id }),
      base44.entities.RSVPQuestion.filter({ event_id: event.id }),
      base44.entities.SeatingGuest.filter({ event_id: event.id }),
    ]);
    setResponses(r || []);
    setQuestions((q || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    setGuests(g || []);
    setLoading(false);
  };

  if (loading) return <div className="py-10 text-center text-gray-400 text-sm">Chargement RSVP...</div>;

  return (
    <div>
      <RSVPStats responses={responses} />

      <Tabs defaultValue="responses" className="w-full">
        <TabsList className="w-full mb-4 rounded-2xl bg-gray-50 border border-gray-100 p-1">
          <TabsTrigger value="responses" className="flex-1 rounded-xl text-xs">
            <List className="w-3 h-3 mr-1" /> Réponses ({responses.length})
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex-1 rounded-xl text-xs">
            <HelpCircle className="w-3 h-3 mr-1" /> Questions
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex-1 rounded-xl text-xs">
            <UtensilsCrossed className="w-3 h-3 mr-1" /> Traiteur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <RSVPResponseList
            responses={responses} questions={questions}
            guests={guests} eventId={event.id} onRefresh={loadData}
          />
        </TabsContent>
        <TabsContent value="questions">
          <RSVPQuestions eventId={event.id} questions={questions} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="meals">
          <MealSummary responses={responses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}