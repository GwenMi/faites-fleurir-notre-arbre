import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import ClassicTemplate from "@/components/public/templates/ClassicTemplate";
import RusticTemplate from "@/components/public/templates/RusticTemplate";
import MinimalTemplate from "@/components/public/templates/MinimalTemplate";
import ElegantTemplate from "@/components/public/templates/ElegantTemplate";
import FestiveTemplate from "@/components/public/templates/FestiveTemplate";

const getTemplateComponent = (templateKey) => {
  const map = {
    classique: ClassicTemplate,
    champetre: RusticTemplate,
    minimal: MinimalTemplate,
    elegant: ElegantTemplate,
    boheme: RusticTemplate,
    floral: RusticTemplate,
    moderne: MinimalTemplate,
    joyeux: FestiveTemplate,
    festif: FestiveTemplate,
    vintage_anni: RusticTemplate,
    douceur: ClassicTemplate,
    nuage: MinimalTemplate,
    nature_bebe: RusticTemplate,
    lumiere: ElegantTemplate,
    azur: ElegantTemplate,
    rose_communion: FestiveTemplate,
    corporate: MinimalTemplate,
    dynamique: ElegantTemplate,
    nature: RusticTemplate,
    provencal: RusticTemplate,
    sobre: MinimalTemplate,
  };
  return map[templateKey] || ClassicTemplate;
};

export default function TemplatePreviewModal({ isOpen, templateKey, event, onOpenChange }) {
  const TemplateComponent = getTemplateComponent(templateKey);
  const primaryColor = event?.primary_color || "#f43f5e";
  const secondaryColor = event?.secondary_color || "#86efac";
  const fontHeading = event?.font_heading || "Cormorant Garamond";
  const fontBody = event?.font_body || "Lato";
  const fontImportUrl = `https://fonts.googleapis.com/css2?family=${fontHeading.replace(/ /g, "+")}:wght@400;600;700&family=${fontBody.replace(/ /g, "+")}:wght@300;400;700&display=swap`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[90vh] p-0 max-w-4xl overflow-hidden flex flex-col">
        <DialogHeader className="border-b px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <div>
            <DialogTitle>Aperçu du template</DialogTitle>
            <p className="text-xs text-gray-500 mt-1">Vue complète avec tous les éléments premium</p>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <TemplateComponent
            event={event}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            fontHeading={fontHeading}
            fontBody={fontBody}
            fontImportUrl={fontImportUrl}
          >
            <div className="w-full space-y-16">
              {/* Section Bienvenue */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-4">Bienvenue</h2>
                <p className="text-gray-600 leading-relaxed">{event?.welcome_message || "Soyez les bienvenus à notre célébration. Un moment de joie et de partage à vos côtés."}</p>
              </section>

              {/* Section Programme */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">📅 Déroulement de la journée</h2>
                <div className="space-y-4">
                  {[
                    { time: "10:00", title: "Accueil", desc: "Café et viennoiseries" },
                    { time: "11:30", title: "Cérémonie", desc: "Le moment tant attendu" },
                    { time: "12:30", title: "Apéritif", desc: "Champagne et amuse-bouches" },
                    { time: "14:00", title: "Repas", desc: "Dégustation 3 plats" },
                    { time: "20:00", title: "Danse", desc: "Musique et célébration" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 pb-4 border-b border-gray-100">
                      <div style={{ color: primaryColor }} className="font-bold min-w-16">{item.time}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section Galerie */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">📸 Galerie photos</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 to-gray-300" />
                  ))}
                </div>
              </section>

              {/* Section Wishlist */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">💝 Liste de cadeaux</h2>
                <div className="space-y-4">
                  {[
                    { title: "Service de vaisselle", price: "120€" },
                    { title: "Weekend en amoureux", price: "500€" },
                    { title: "Œuvre d'art", price: "300€" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: `${secondaryColor}20` }}>
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                      <span style={{ color: primaryColor }} className="font-bold">{item.price}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section FAQ */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">❓ Questions fréquentes</h2>
                <div className="space-y-4">
                  {[
                    { q: "Comment se déplacer ?", a: "Parking gratuit sur place, navettes disponibles" },
                    { q: "Code vestimentaire ?", a: "Tenue de cérémonie, couleurs : rose & gris" },
                    { q: "Repas végatariens ?", a: "Oui, à signaler lors du RSVP" }
                  ].map((item, i) => (
                    <div key={i} className="border-b border-gray-100 pb-4">
                      <h3 className="font-semibold text-gray-800 mb-2">{item.q}</h3>
                      <p className="text-sm text-gray-600">{item.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section RSVP */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">✉️ Confirmez votre présence</h2>
                <button style={{ backgroundColor: primaryColor }} className="w-full py-4 text-white font-semibold rounded-lg hover:opacity-90">
                  Je confirme ma présence
                </button>
              </section>

              {/* Section Livre d'or */}
              <section className="max-w-2xl mx-auto px-4">
                <h2 style={{ color: primaryColor }} className="text-3xl font-bold mb-6">📝 Livre d'or</h2>
                <div className="space-y-4">
                  {[
                    { name: "Marie", msg: "Un magnifique jour, merci pour cette belle célébration!" },
                    { name: "Jean", msg: "Bravo à vous deux, on était ravi de partager ce moment." }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}08`, borderLeft: `3px solid ${primaryColor}` }}>
                      <p className="font-semibold text-gray-800 mb-1">{item.name}</p>
                      <p className="text-sm text-gray-600 italic">"{item.msg}"</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </TemplateComponent>
        </div>
      </DialogContent>
    </Dialog>
  );
}