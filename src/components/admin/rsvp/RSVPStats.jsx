export default function RSVPStats({ responses }) {
  const attending = responses.filter(r => r.attending);
  const declining = responses.filter(r => !r.attending);
  const totalPeople = attending.reduce((s, r) => s + (r.party_size || 1), 0);

  const stats = [
    { label: "Réponses reçues", value: responses.length, color: "purple", bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-600" },
    { label: "Présents ✅", value: attending.length, color: "green", bg: "bg-green-50", border: "border-green-100", text: "text-green-600" },
    { label: "Absents ❌", value: declining.length, color: "red", bg: "bg-red-50", border: "border-red-100", text: "text-red-500" },
    { label: "Personnes au total", value: totalPeople, color: "blue", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map(s => (
        <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 text-center`}>
          <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}