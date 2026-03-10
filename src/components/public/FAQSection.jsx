import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown } from "lucide-react";

function FAQItem({ item, primaryColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-3 group"
      >
        <span className="font-sans-clean font-semibold text-gray-800 text-sm group-hover:text-rose-600 transition pr-2">
          {item.question}
        </span>
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: open ? primaryColor : undefined }}
        />
      </button>
      {open && (
        <p className="font-sans-clean text-sm text-gray-500 leading-relaxed pb-4 pr-8 whitespace-pre-line">
          {item.answer}
        </p>
      )}
    </div>
  );
}

export default function FAQSection({ event, primaryColor }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const color = primaryColor || "#f43f5e";

  useEffect(() => {
    base44.entities.FAQItem.filter({ event_id: event.id }, "order").then(res => {
      setItems(res || []);
      setLoading(false);
    });
  }, [event.id]);

  if (loading || items.length === 0) return null;

  return (
    <div className="px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${color}66)` }} />
          <span className="text-lg">❓</span>
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${color}66)` }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-2">Questions fréquentes</h2>
        <p className="font-sans-clean text-gray-500 text-sm">Tout ce que vous devez savoir avant le grand jour.</p>
      </div>

      {/* Accordion */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 divide-y divide-gray-100">
        {items.map(item => (
          <FAQItem key={item.id} item={item} primaryColor={color} />
        ))}
      </div>
    </div>
  );
}