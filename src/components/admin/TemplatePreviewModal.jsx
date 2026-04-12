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
        <DialogHeader className="border-b px-6 py-4 flex-shrink-0">
          <DialogTitle>Aperçu du template</DialogTitle>
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
            <div className="max-w-2xl mx-auto px-4 py-16">
              <div className="space-y-12">
                <section>
                  <h2 style={{ color: primaryColor }} className="font-serif-elegant text-3xl font-bold mb-4">
                    Bienvenue
                  </h2>
                  <p className="text-gray-600">{event?.welcome_message || "Message de bienvenue..."}</p>
                </section>

                <section>
                  <h2 style={{ color: primaryColor }} className="font-serif-elegant text-3xl font-bold mb-4">
                    📅 Jour de l'événement
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
                    <div>10:00 - Accueil</div>
                    <div>12:30 - Apéritif</div>
                    <div>14:00 - Repas</div>
                    <div>20:00 - Danse</div>
                  </div>
                </section>

                <section>
                  <h2 style={{ color: primaryColor }} className="font-serif-elegant text-3xl font-bold mb-4">
                    📸 Galerie photos
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg"
                        style={{ backgroundColor: secondaryColor, opacity: 0.3 }}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <h2 style={{ color: primaryColor }} className="font-serif-elegant text-3xl font-bold mb-4">
                    💝 Liste de cadeaux
                  </h2>
                  <p className="text-gray-600">Partagez vos envies avec vos proches</p>
                </section>

                <section>
                  <h2 style={{ color: primaryColor }} className="font-serif-elegant text-3xl font-bold mb-4">
                    Merci de votre visite !
                  </h2>
                </section>
              </div>
            </div>
          </TemplateComponent>
        </div>
      </DialogContent>
    </Dialog>
  );
}