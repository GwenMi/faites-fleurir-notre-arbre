import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileImage, BookOpen, Tag } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Template: Affiche A4
function PosterTemplate({ event, qrUrl, templateRef }) {
  return (
    <div ref={templateRef} style={{
      width: "794px", height: "1123px", background: "linear-gradient(160deg, #fff9f5 0%, #fff 50%, #fdf2f8 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", padding: "60px", boxSizing: "border-box", position: "relative"
    }}>
      {/* Decorative border */}
      <div style={{ position: "absolute", inset: "24px", border: "1.5px solid #f9a8d4", borderRadius: "16px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: "30px", border: "0.5px solid #fce7f3", borderRadius: "12px", pointerEvents: "none" }} />

      {/* Top flowers */}
      <div style={{ fontSize: "52px", marginBottom: "8px", letterSpacing: "12px" }}>🌸 🌷 🌸</div>

      <p style={{ fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase", color: "#f472b6", margin: "0 0 16px" }}>
        Vous êtes invités
      </p>

      <h1 style={{ fontSize: "52px", fontWeight: "700", color: "#1f2937", margin: "0 0 8px", textAlign: "center", lineHeight: 1.15 }}>
        {event.couple_names}
      </h1>

      <div style={{ width: "120px", height: "1px", background: "linear-gradient(90deg, transparent, #c9a96e, transparent)", margin: "16px auto" }} />

      <p style={{ fontSize: "18px", color: "#6b7280", margin: "0 0 6px", fontStyle: "italic" }}>
        {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      {event.welcome_message && (
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: "0 0 32px", textAlign: "center", maxWidth: "480px", lineHeight: 1.6, fontStyle: "italic" }}>
          « {event.welcome_message} »
        </p>
      )}

      <div style={{ margin: "24px 0", padding: "16px", background: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(244,114,182,0.12)", border: "1px solid #fce7f3" }}>
        <img src={qrUrl} alt="QR Code" style={{ width: "200px", height: "200px", display: "block" }} crossOrigin="anonymous" />
      </div>

      <p style={{ fontSize: "13px", color: "#d1d5db", margin: "4px 0 2px", letterSpacing: "1px" }}>
        Scannez pour partager votre photo
      </p>
      <p style={{ fontSize: "11px", color: "#e9d5ff", margin: "0", letterSpacing: "0.5px" }}>
        fleursfete.com
      </p>

      <div style={{ fontSize: "32px", marginTop: "28px", letterSpacing: "8px" }}>🌿 🌸 🌿</div>
    </div>
  );
}

// Template: Carte de table / étiquette
function CardTemplate({ event, qrUrl, templateRef }) {
  return (
    <div ref={templateRef} style={{
      width: "600px", height: "380px", background: "linear-gradient(135deg, #fff9f5, #fdf2f8)",
      display: "flex", alignItems: "center", gap: "40px", padding: "40px",
      fontFamily: "'Georgia', serif", boxSizing: "border-box", borderRadius: "16px",
      border: "1.5px solid #f9a8d4", position: "relative"
    }}>
      <div style={{ position: "absolute", inset: "8px", border: "0.5px solid #fce7f3", borderRadius: "10px", pointerEvents: "none" }} />

      {/* Left: QR */}
      <div style={{ flexShrink: 0, padding: "12px", background: "white", borderRadius: "12px", boxShadow: "0 2px 16px rgba(244,114,182,0.1)", border: "1px solid #fce7f3" }}>
        <img src={qrUrl} alt="QR" style={{ width: "160px", height: "160px", display: "block" }} crossOrigin="anonymous" />
      </div>

      {/* Right: Text */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#f472b6", margin: "0 0 10px" }}>Scannez &amp; partagez</p>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", margin: "0 0 8px", lineHeight: 1.2 }}>{event.couple_names}</h2>
        <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, #c9a96e, transparent)", margin: "10px 0" }} />
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 6px", fontStyle: "italic" }}>
          {new Date(event.event_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <p style={{ fontSize: "12px", color: "#9ca3af", margin: "12px 0 0", lineHeight: 1.5 }}>
          Plantez les graines 🌱<br />
          Photographiez votre fleur 🌸<br />
          Partagez le souvenir 📸
        </p>
      </div>
    </div>
  );
}

// Template: Petit carton d'invitation instruction
function InstructionCard({ event, qrUrl, templateRef }) {
  return (
    <div ref={templateRef} style={{
      width: "420px", height: "560px", background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
      padding: "36px 32px", fontFamily: "'Georgia', serif", boxSizing: "border-box",
      border: "1.5px solid #f9a8d4", borderRadius: "16px", position: "relative"
    }}>
      <div style={{ position: "absolute", inset: "8px", border: "0.5px solid #fce7f3", borderRadius: "10px", pointerEvents: "none" }} />

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🌱</div>
        <p style={{ fontSize: "9px", letterSpacing: "4px", textTransform: "uppercase", color: "#f472b6", margin: "0 0 8px" }}>Mode d'emploi</p>
        <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", margin: "0" }}>Votre pot de graines</h3>
        <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #c9a96e, transparent)", margin: "12px auto" }} />
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { n: "1", icon: "🪴", t: "Plantez", d: "Déposez les graines dans de la terre et arrosez régulièrement." },
          { n: "2", icon: "🌸", t: "Attendez", d: "Votre fleur s'épanouira dans quelques semaines." },
          { n: "3", icon: "📸", t: "Photographiez", d: "Capturez ce beau moment en photo." },
          { n: "4", icon: "💌", t: "Partagez", d: "Scannez le QR code ci-dessous et offrez ce souvenir aux mariés." },
        ].map(step => (
          <div key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#f472b6", flexShrink: 0 }}>{step.n}</div>
            <div>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151" }}>{step.icon} {step.t} — </span>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>{step.d}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ padding: "10px", background: "white", borderRadius: "10px", border: "1px solid #fce7f3", display: "inline-block", boxShadow: "0 2px 12px rgba(244,114,182,0.08)" }}>
          <img src={qrUrl} alt="QR" style={{ width: "100px", height: "100px", display: "block" }} crossOrigin="anonymous" />
        </div>
        <p style={{ fontSize: "10px", color: "#d1d5db", margin: "6px 0 0" }}>{event.couple_names} · {event.event_date}</p>
      </div>
    </div>
  );
}

export default function VisualPackGenerator({ event }) {
  const posterRef = useRef(null);
  const cardRef = useRef(null);
  const instructionRef = useRef(null);
  const [generating, setGenerating] = useState(null);

  const qrUrl = event?.public_url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(event.public_url)}&margin=10&color=1f2937`
    : null;

  const captureAndDownload = async (ref, filename, format = "pdf") => {
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: null });
    if (format === "png") {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else {
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const isLandscape = canvas.width > canvas.height;
      const pdf = new jsPDF({ orientation: isLandscape ? "landscape" : "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(filename);
    }
  };

  const downloadAll = async () => {
    setGenerating("all");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Page 1: Poster
    const c1 = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: "#fff9f5" });
    pdf.addImage(c1.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);

    // Page 2: Card (landscape A5)
    pdf.addPage([210, 148], "landscape");
    const c2 = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: "#fff9f5" });
    const cardH = (148 * c2.height) / c2.width;
    pdf.addImage(c2.toDataURL("image/jpeg", 0.95), "JPEG", (210 - 148 * c2.width / c2.height) / 2, (148 - cardH) / 2, 148 * c2.width / c2.height, cardH);

    // Page 3: Instruction card
    pdf.addPage([105, 148], "portrait");
    const c3 = await html2canvas(instructionRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    pdf.addImage(c3.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 105, 148);

    pdf.save(`pack-visuel-${event.slug}.pdf`);
    setGenerating(null);
  };

  if (!qrUrl) return null;

  const items = [
    { key: "poster", label: "Affiche A4", desc: "À imprimer et afficher le jour J", icon: <FileImage className="w-5 h-5" />, ref: posterRef, file: `affiche-${event.slug}.pdf` },
    { key: "card", label: "Carte de table", desc: "Format horizontal, idéal sur les tables", icon: <Tag className="w-5 h-5" />, ref: cardRef, file: `carte-${event.slug}.pdf` },
    { key: "instruction", label: "Carton d'instructions", desc: "À glisser dans chaque pot de graines", icon: <BookOpen className="w-5 h-5" />, ref: instructionRef, file: `instructions-${event.slug}.pdf` },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">Pack de supports visuels</p>
        <p className="text-xs text-gray-400">Chaque support intègre automatiquement votre QR code. Téléchargez-les séparément ou en pack complet.</p>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-sm transition">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl flex-shrink-0"
              disabled={generating === item.key}
              onClick={async () => { setGenerating(item.key); await captureAndDownload(item.ref, item.file); setGenerating(null); }}>
              {generating === item.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={downloadAll} disabled={!!generating}
        className="w-full h-11 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-semibold">
        {generating === "all" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération du pack...</>
        ) : (
          <><Download className="w-4 h-4 mr-2" /> Télécharger le pack complet (PDF)</>
        )}
      </Button>

      {/* Hidden render zone */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, zIndex: -1 }}>
        <PosterTemplate event={event} qrUrl={qrUrl} templateRef={posterRef} />
        <CardTemplate event={event} qrUrl={qrUrl} templateRef={cardRef} />
        <InstructionCard event={event} qrUrl={qrUrl} templateRef={instructionRef} />
      </div>
    </div>
  );
}