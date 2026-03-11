import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, UtensilsCrossed, ToggleLeft, ToggleRight, AlertTriangle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const COURSE_CONFIG = [
  { key: "menu_starters", label: "Entrées", emoji: "🥗", mcKey: "starter" },
  { key: "menu_mains",    label: "Plats principaux", emoji: "🍽️", mcKey: "main" },
  { key: "menu_desserts", label: "Desserts", emoji: "🍰", mcKey: "dessert" },
];

export default function MenuEditor({ event }) {
  const [activeTab, setActiveTab] = useState("menu");
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(event.menu_enabled || false);
  const [starters, setStarters] = useState(event.menu_starters || []);
  const [mains, setMains] = useState(event.menu_mains || []);
  const [desserts, setDesserts] = useState(event.menu_desserts || []);
  const [inputs, setInputs] = useState({ starters: "", mains: "", desserts: "" });

  const [rsvpResponses, setRsvpResponses] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const stateByCourse = {
    menu_starters: { items: starters, setter: setStarters, inputKey: "starters" },
    menu_mains:    { items: mains,    setter: setMains,    inputKey: "mains" },
    menu_desserts: { items: desserts, setter: setDesserts, inputKey: "desserts" },
  };

  useEffect(() => {
    if (activeTab === "summary") loadSummary();
  }, [activeTab]);

  const loadSummary = async () => {
    setLoadingSummary(true);
    const responses = await base44.entities.RSVPResponse.filter({ event_id: event.id, attending: true }, "-created_date", 500);
    setRsvpResponses(responses || []);
    setLoadingSummary(false);
  };

  const addItem = (courseKey) => {
    const { items, setter, inputKey } = stateByCourse[courseKey];
    const val = inputs[inputKey].trim();
    if (!val) return;
    setter([...items, val]);
    setInputs(i => ({ ...i, [inputKey]: "" }));
  };

  const removeItem = (courseKey, idx) => {
    const { items, setter } = stateByCourse[courseKey];
    setter(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Event.update(event.id, {
      menu_enabled: enabled,
      menu_starters: starters,
      menu_mains: mains,
      menu_desserts: desserts,
    });
    toast.success("Menu enregistré ✓");
    setSaving(false);
  };

  // ── Summary helpers ──
  const countChoices = (mcKey) => {
    const map = {};
    rsvpResponses.forEach(r => {
      (r.meal_choices || []).forEach(mc => {
        const choice = mc[mcKey];
        if (choice) map[choice] = (map[choice] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const allAllergies = rsvpResponses.filter(r => r.allergies?.trim()).map(r => ({ name: r.guest_name, allergy: r.allergies }));
  const totalGuests = rsvpResponses.reduce((s, r) => s + (r.party_size || 1), 0);
  const totalWithChoices = rsvpResponses.filter(r => (r.meal_choices || []).length > 0).reduce((s, r) => s + r.meal_choices.length, 0);

  const exportCatererPDF = () => {
    const doc = new jsPDF();
    const couple = event.couple_names || "Mariage";
    const dateStr = event.event_date
      ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";

    doc.setFontSize(22); doc.setFont(undefined, "bold");
    doc.text("Récapitulatif Traiteur", 105, 22, { align: "center" });
    doc.setFontSize(13); doc.setFont(undefined, "normal");
    doc.text(couple, 105, 32, { align: "center" });
    if (dateStr) {
      doc.setFontSize(11); doc.setTextColor(130, 130, 130);
      doc.text(dateStr, 105, 40, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }
    doc.setDrawColor(244, 63, 94); doc.setLineWidth(0.8);
    doc.line(20, 47, 190, 47);

    doc.setFontSize(11); doc.setFont(undefined, "normal");
    doc.text(`Invités confirmés : ${totalGuests}`, 20, 57);
    doc.text(`Choix de menu renseignés : ${totalWithChoices} personnes`, 20, 64);

    let y = 78;
    COURSE_CONFIG.forEach(({ label, mcKey }) => {
      const counts = countChoices(mcKey);
      doc.setFont(undefined, "bold"); doc.setFontSize(13);
      doc.text(label.toUpperCase(), 20, y); y += 7;
      doc.setFont(undefined, "normal"); doc.setFontSize(11);
      if (counts.length === 0) {
        doc.setTextColor(180, 180, 180);
        doc.text("  Aucun choix enregistré", 20, y); y += 7;
        doc.setTextColor(0, 0, 0);
      } else {
        counts.forEach(([opt, count]) => {
          doc.text(`  • ${opt} : ${count} personne${count > 1 ? "s" : ""}`, 20, y); y += 7;
        });
      }
      y += 4;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    if (allAllergies.length > 0) {
      doc.setFont(undefined, "bold"); doc.setFontSize(13);
      doc.setTextColor(200, 100, 0);
      doc.text("⚠  ALLERGIES / RÉGIMES SPÉCIAUX", 20, y); y += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "normal"); doc.setFontSize(11);
      allAllergies.forEach(({ name, allergy }) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`  • ${name} : ${allergy}`, 170);
        doc.text(lines, 20, y);
        y += lines.length * 7;
      });
    }

    doc.save(`Recap-Traiteur-${couple.replace(/\s/g, "-")}.pdf`);
    toast.success("PDF traiteur généré ✓");
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl">
        {[
          { key: "menu",    label: "🍽️ Conception du menu" },
          { key: "summary", label: "📋 Récap traiteur" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition ${activeTab === t.key ? "border-rose-400 text-rose-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── MENU TAB ── */}
      {activeTab === "menu" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-rose-400" />
                Choix du menu dans le RSVP
              </h2>
              <p className="text-xs text-gray-400 mt-1">Vos invités pourront sélectionner leurs plats lors de leur réponse.</p>
            </div>
            <button onClick={() => setEnabled(!enabled)} className="transition">
              {enabled ? <ToggleRight className="w-10 h-10 text-rose-500" /> : <ToggleLeft className="w-10 h-10 text-gray-300" />}
            </button>
          </div>

          {enabled && COURSE_CONFIG.map(({ key, label, emoji }) => {
            const { items, inputKey } = stateByCourse[key];
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm">{emoji} {label}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={`Ajouter une option ${label.toLowerCase()}…`}
                    value={inputs[inputKey]}
                    onChange={e => setInputs(i => ({ ...i, [inputKey]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(key)}
                    className="rounded-xl flex-1 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addItem(key)} className="rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {items.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">Aucune option ajoutée</p>
                ) : (
                  <ul className="space-y-1.5">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-sm text-gray-700">{item}</span>
                        <button onClick={() => removeItem(key, idx)} className="text-gray-300 hover:text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-rose-500 hover:bg-rose-600 text-white h-10">
            {saving ? "Enregistrement…" : "Enregistrer le menu"}
          </Button>
        </div>
      )}

      {/* ── SUMMARY TAB ── */}
      {activeTab === "summary" && (
        <div className="space-y-5">
          {loadingSummary ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-rose-300 mx-auto" />
              <p className="text-sm text-gray-400 mt-3">Chargement des données RSVP…</p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Invités confirmés", value: totalGuests, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Choix de menu", value: totalWithChoices, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "Régimes spéciaux", value: allAllergies.length, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(k => (
                  <div key={k.label} className={`${k.bg} rounded-2xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Meal choice charts */}
              {COURSE_CONFIG.map(({ key, label, emoji, mcKey }) => {
                const counts = countChoices(mcKey);
                const max = counts[0]?.[1] || 1;
                return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">{emoji} {label}</h3>
                    {counts.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">Aucun choix enregistré</p>
                    ) : (
                      <div className="space-y-2.5">
                        {counts.map(([option, count]) => (
                          <div key={option} className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden relative">
                              <div
                                className="h-7 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center pl-3 transition-all"
                                style={{ width: `${Math.max((count / max) * 100, 20)}%` }}
                              >
                                <span className="text-xs text-white font-semibold truncate">{option}</span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-700 w-20 text-right flex-shrink-0">
                              {count} <span className="text-xs text-gray-400 font-normal">pers.</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Allergies */}
              {allAllergies.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-amber-800 text-sm">
                      Allergies & régimes spéciaux ({allAllergies.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {allAllergies.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100">
                        <span className="text-sm font-semibold text-amber-700 min-w-28 flex-shrink-0">{a.name}</span>
                        <span className="text-sm text-gray-700">{a.allergy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {allAllergies.length === 0 && rsvpResponses.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-sm text-green-700 font-medium">✅ Aucune allergie ou régime spécial déclaré</p>
                </div>
              )}

              {rsvpResponses.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Aucune réponse RSVP pour l'instant.</p>
                </div>
              )}

              <Button onClick={exportCatererPDF} className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white h-10 gap-2">
                <Download className="w-4 h-4" /> Exporter le récap traiteur (PDF)
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}