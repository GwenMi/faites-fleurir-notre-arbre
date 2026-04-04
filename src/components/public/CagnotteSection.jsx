import { ExternalLink, Gift } from "lucide-react";

export default function CagnotteSection({ event, primaryColor }) {
  if (!event.cagnotte_url) return null;

  return (
    <div className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: primaryColor + "18" }}
        >
          <Gift className="w-7 h-7" style={{ color: primaryColor }} />
        </div>
        <h2 className="font-serif-elegant text-3xl font-bold text-gray-800 mb-3">Cagnotte</h2>
        {event.cagnotte_message && (
          <p className="font-sans-clean text-gray-500 text-sm leading-relaxed mb-6">{event.cagnotte_message}</p>
        )}
        <a
          href={event.cagnotte_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-sans-clean font-semibold text-sm transition hover:opacity-90"
          style={{ background: primaryColor }}
        >
          Participer à la cagnotte <ExternalLink className="w-4 h-4" />
        </a>
        <p className="font-sans-clean text-xs text-gray-300 mt-4">Vous serez redirigé vers le service de cagnotte</p>
      </div>
    </div>
  );
}
