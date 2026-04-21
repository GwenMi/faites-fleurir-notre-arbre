import { useState, useEffect } from "react";

function getTimeData(eventDate) {
  const now = new Date();
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);
  const diff = target - now;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: diff < 0, isToday: diff >= 0 && diff < 86400000 };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3 min-w-[64px] shadow-sm">
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }} className="text-3xl md:text-4xl font-bold text-gray-800 block text-center leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span style={{ fontFamily: "'Lato', system-ui, sans-serif" }} className="text-xs text-gray-400 mt-1.5 tracking-wide uppercase">{label}</span>
    </div>
  );
}

export default function CountdownWidget({ eventDate, primaryColor }) {
  const [timeData, setTimeData] = useState(getTimeData(eventDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeData(getTimeData(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  const serifStyle = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
  const sansStyle = { fontFamily: "'Lato', system-ui, sans-serif" };
  const color = primaryColor || "#f43f5e";

  if (timeData.isToday) {
    return (
      <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
        style={{ ...sansStyle, background: color + "22", color }}>
        🎉 C'est aujourd'hui !
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p style={sansStyle} className="text-xs tracking-[0.25em] uppercase text-gray-400 mb-3 text-center">
        {timeData.isPast ? "Depuis votre grand jour" : "Compte à rebours"}
      </p>
      <div className="flex items-start justify-center gap-3 md:gap-5">
        <Unit value={timeData.days} label="Jours" />
        <span style={serifStyle} className="text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeData.hours} label="Heures" />
        <span style={serifStyle} className="text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeData.minutes} label="Minutes" />
        <span style={serifStyle} className="text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeData.seconds} label="Secondes" />
      </div>
    </div>
  );
}