export default function WizardProgress({ currentStep, steps }) {
  return (
    <div>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-rose-400 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((label, i) => {
          const n = i + 1;
          const done = n < currentStep;
          const active = n === currentStep;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? "bg-rose-400 text-white" :
                active ? "bg-rose-400 text-white shadow-lg ring-4 ring-rose-100" :
                "bg-white text-gray-400 border-2 border-gray-200"
              }`}>
                {done ? "✓" : n}
              </div>
              <span className={`text-xs font-medium hidden sm:block whitespace-nowrap ${active ? "text-rose-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}