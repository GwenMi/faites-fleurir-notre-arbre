import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Download, UtensilsCrossed, AlertTriangle } from "lucide-react";

const COURSE_LABELS = {
  starter: "Entrées",
  main: "Plats principaux",
  dessert: "Desserts",
};

export default function MealSummary({ responses }) {
  const attending = responses.filter(r => r.attending);

  // Aggregate all meal choices across all responses
  const aggregated = useMemo(() => {
    const counts = { starter: {}, main: {}, dessert: {} };
    let totalPeople = 0;
    let withMeals = 0;

    attending.forEach(r => {
      const choices = r.meal_choices || [];
      if (choices.length > 0) withMeals++;
      // If meal_choices is filled, use it; otherwise count party_size empty slots
      const people = choices.length > 0 ? choices : Array.from({ length: r.party_size || 1 }).map(() => ({}));
      totalPeople += r.party_size || 1;

      people.forEach(p => {
        ["starter", "main", "dessert"].forEach(course => {
          const val = p[course];
          if (val) {
            counts[course][val] = (counts[course][val] || 0) + 1;
          }
        });
      });
    });

    return { counts, totalPeople, withMeals };
  }, [responses]);

  const allergiesList = attending
    .filter(r => r.allergies && r.allergies.trim())
    .map(r => ({ name: r.guest_name, note: r.allergies }));

  const exportCSV = () => {
    const rows = [["Invité", "Personnes", "Entrées", "Plats", "Desserts", "Allergies"]];
    attending.forEach(r => {
      const choices = r.meal_choices || [];
      if (choices.length === 0) {
        rows.push([r.guest_name, r.party_size || 1, "", "", "", r.allergies || ""]);
      } else {
        choices.forEach((p, i) => {
          rows.push([
            i === 0 ? r.guest_name : "",
            i === 0 ? r.party_size || 1 : "",
            p.starter || "",
            p.main || "",
            p.dessert || "",
            i === 0 ? (r.allergies || "") : "",
          ]);
        });
      }
    });
    const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "menu-traiteur.csv"; a.click();
  };

  if (attending.length === 0) {
    return <p className="text-center text-gray-400 text-sm py-8">Aucune réponse présent reçue pour l'instant.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-rose-400" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">{aggregated.totalPeople} convives présents</p>
            <p className="text-xs text-gray-400">{aggregated.withMeals} réponses avec choix de plats</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} className="rounded-xl gap-1.5 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Counts by course */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(COURSE_LABELS).map(([course, label]) => {
          const counts = aggregated.counts[course];
          const total = Object.values(counts).reduce((s, v) => s + v, 0);
          return (
            <div key={course} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">{label}</h3>
              {Object.keys(counts).length === 0 ? (
                <p className="text-xs text-gray-300 italic">Aucun choix</p>
              ) : (
                <ul className="space-y-2">
                  {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([option, count]) => (
                    <li key={option} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate flex-1">{option}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-1.5 rounded-full bg-rose-100 w-16 overflow-hidden">
                          <div
                            className="h-full bg-rose-400 rounded-full"
                            style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-xs font-bold text-rose-500 w-6 text-right">{count}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Allergies */}
      {allergiesList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <h3 className="font-semibold text-amber-800 text-sm flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Allergies / intolérances ({allergiesList.length} invité{allergiesList.length > 1 ? "s" : ""})
          </h3>
          <ul className="space-y-2">
            {allergiesList.map((a, i) => (
              <li key={i} className="flex gap-3 bg-white rounded-xl px-3 py-2 border border-amber-100">
                <span className="font-semibold text-sm text-gray-700 min-w-[120px]">{a.name}</span>
                <span className="text-sm text-gray-600">{a.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detail per guest */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-600">Détail par invité</h3>
        {attending.map(r => {
          const choices = r.meal_choices || [];
          return (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-gray-800">
                  {r.guest_name}
                  {r.party_size > 1 && <span className="text-xs text-gray-400 ml-1">· {r.party_size} pers.</span>}
                </p>
                {r.allergies && (
                  <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {r.allergies}
                  </span>
                )}
              </div>
              {choices.length === 0 ? (
                <p className="text-xs text-gray-300 italic">Pas de choix de plats</p>
              ) : (
                <div className="space-y-1 mt-1">
                  {choices.map((p, i) => (
                    <div key={i} className="text-xs text-gray-500 flex gap-4 flex-wrap">
                      {choices.length > 1 && <span className="text-gray-300">{p.person_label || `Personne ${i + 1}`} :</span>}
                      {p.starter && <span>🥗 {p.starter}</span>}
                      {p.main && <span>🍽️ {p.main}</span>}
                      {p.dessert && <span>🍰 {p.dessert}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}