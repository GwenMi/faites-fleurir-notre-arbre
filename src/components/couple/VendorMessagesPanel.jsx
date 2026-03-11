import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function VendorMessagesPanel({ vendor, event }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [fromCouple, setFromCouple] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { load(); }, [vendor.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.VendorMessage.filter({ vendor_id: vendor.id }, "created_date", 100);
    setMessages(data || []);
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    await base44.entities.VendorMessage.create({
      vendor_id: vendor.id,
      event_id: event.id,
      from_couple: fromCouple,
      author: fromCouple ? "Nous" : vendor.name,
      content: content.trim(),
    });
    setContent("");
    await load();
    setSending(false);
  };

  return (
    <div className="flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
        <MessageSquare className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-gray-600">Échanges avec {vendor.name}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Aucun message pour l'instant</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.from_couple ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.from_couple
                  ? "bg-rose-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}>
                <p className="leading-snug">{m.content}</p>
                <p className={`text-xs mt-0.5 opacity-60`}>
                  {new Date(m.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="pt-3 border-t border-gray-100 space-y-2">
        <div className="flex gap-2 text-xs">
          <button type="button"
            onClick={() => setFromCouple(true)}
            className={`px-3 py-1 rounded-full font-semibold transition ${fromCouple ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"}`}>
            Nous
          </button>
          <button type="button"
            onClick={() => setFromCouple(false)}
            className={`px-3 py-1 rounded-full font-semibold transition ${!fromCouple ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}>
            {vendor.name}
          </button>
        </div>
        <div className="flex gap-2">
          <Input
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Votre message…"
            className="rounded-xl text-sm flex-1"
          />
          <Button type="submit" disabled={sending || !content.trim()}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-3">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}