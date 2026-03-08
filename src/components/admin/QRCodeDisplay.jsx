import { useState, useEffect } from "react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QRCodeDisplay({ event }) {
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (event?.public_url) {
      const encoded = encodeURIComponent(event.public_url);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=10`);
    }
  }, [event?.public_url]);

  if (!qrUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qrcode-${event.slug}.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 text-gray-600 font-semibold">
        <QrCode className="w-5 h-5" />
        QR Code de l'événement
      </div>
      <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-xl border border-gray-100 shadow" />
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Ce QR code redirige vos invités vers la page de l'événement
      </p>
      <p className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-lg text-gray-600 w-full text-center break-all">
        {event.public_url}
      </p>
      <Button onClick={handleDownload} variant="outline" className="w-full rounded-xl">
        <Download className="w-4 h-4 mr-2" /> Télécharger le QR Code
      </Button>
    </div>
  );
}