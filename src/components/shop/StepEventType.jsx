const EVENT_TYPES = [
  { id: "mariage", icon: "💍", label: "Mariage" },
  { id: "bapteme", icon: "👶", label: "Baptême" },
  { id: "communion", icon: "✨", label: "Communion" },
  { id: "anniversaire", icon: "🎂", label: "Anniversaire" },
];

export default function StepEventType({ selection, onUpdate, onNext, onBack }) {
  const handleSelect = (eventType) => {
    onUpdate({ eventType });
    onNext();
  };

  return (
    <div>
      <style>{`
        .font-serif-shop { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-shop { font-family: 'Lato', system-ui, sans-serif; }
      `}</style>

      <div className="text-center mb-8">
        <p className="font-sans-shop text-xs tracking-[0.3em] uppercase text-rose-400 mb-2">Étape 2</p>
        <h2 className="font-serif-shop text-3xl font-bold text-gray-800 mb-2">Quel est votre événement ?</h2>
        <p className="font-sans-shop text-sm text-gray-400">Choisissez le type pour personnaliser votre kit</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {EVENT_TYPES.map(et => (
          <button
            key={et.id}
            onClick={() => handleSelect(et.id)}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all hover:border-rose-300 hover:bg-rose-50 ${
              selection.eventType === et.id
                ? "border-rose-400 bg-rose-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className="text-4xl">{et.icon}</span>
            <span className="font-sans-shop font-semibold text-gray-700 text-sm">{et.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="font-sans-shop text-sm text-gray-400 hover:text-rose-400 transition"
        >
          ← Retour au choix du kit
        </button>
      </div>
    </div>
  );
}