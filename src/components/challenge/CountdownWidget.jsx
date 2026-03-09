import { useState, useEffect } from "react";

function getTimeLeft(eventDate) {
  const now = new Date();
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);
  const diff = target - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3 min-w-[64px] shadow-sm">
        <span className="font-serif-elegant text-3xl md:text-4xl font-bold text-gray-800 block text-center leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="font-sans-clean text-xs text-gray-400 mt-1.5 tracking-wide uppercase">{label}</span>
    </div>
  );
}

export default function CountdownWidget({ eventDate, primaryColor }) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(eventDate)), 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  if (!timeLeft) {
    return (
      <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold font-sans-clean"
        style={{ background: (primaryColor || "#f43f5e") + "22", color: primaryColor || "#f43f5e" }}>
        🎉 C'est aujourd'hui !
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="font-sans-clean text-xs tracking-[0.25em] uppercase text-gray-400 mb-3 text-center">
        Compte à rebours
      </p>
      <div className="flex items-start justify-center gap-3 md:gap-5">
        <Unit value={timeLeft.days} label="Jours" />
        <span className="font-serif-elegant text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeLeft.hours} label="Heures" />
        <span className="font-serif-elegant text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeLeft.minutes} label="Minutes" />
        <span className="font-serif-elegant text-3xl font-bold text-gray-300 mt-2">:</span>
        <Unit value={timeLeft.seconds} label="Secondes" />
      </div>
    </div>
  );
}