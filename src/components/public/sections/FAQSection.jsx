import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection({ event, faqs = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (faqs.length === 0) {
    return (
      <section>
        <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">❓ FAQ</h2>
        <p className="text-gray-400 text-center py-8">Aucune question pour le moment</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-serif-elegant text-3xl font-bold mb-6 text-gray-900">❓ FAQ</h2>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === idx ? null : idx)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition font-semibold text-gray-800"
            >
              {faq.question}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition ${expanded === idx ? "rotate-180" : ""}`}
              />
            </button>
            {expanded === idx && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}