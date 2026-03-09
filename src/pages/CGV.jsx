import { createPageUrl } from "@/utils";

const LEGAL = `
**Responsable :** Papin Gwenaëlle  
**Enseigne :** Fleurs en fête  
**E-mail :** contact@fleursenfete.com  
**Téléphone :** 06 30 77 80 36
`;

export default function CGV() {
  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .font-serif-elegant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-clean { font-family: 'Lato', system-ui, sans-serif; }
        .gold-line { background: linear-gradient(90deg, transparent, #c9a96e, transparent); height: 1px; }
        .prose-legal h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-legal h3 { font-size: 1rem; font-weight: 700; color: #374151; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .prose-legal p, .prose-legal li { font-family: 'Lato', system-ui, sans-serif; font-size: 0.875rem; color: #6b7280; line-height: 1.8; margin-bottom: 0.5rem; }
        .prose-legal ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .prose-legal a { color: #f43f5e; text-decoration: underline; }
        .prose-legal strong { color: #374151; }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10" />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3">Juridique</p>
        <h1 className="font-serif-elegant text-5xl font-bold text-gray-800 mb-4">Conditions générales de vente</h1>
        <div className="gold-line max-w-[120px] mb-8" />

        <div className="prose-legal space-y-2">
          <p className="text-xs text-gray-400 italic">En vigueur au 01/03/2025 — Droit applicable : droit français</p>

          <h2>1. Vendeur</h2>
          <p>
            <strong>Papin Gwenaëlle</strong> — Fleurs en fête<br />
            E-mail : <a href="mailto:contact@fleursenfete.com">contact@fleursenfete.com</a><br />
            Téléphone : 06 30 77 80 36
          </p>

          <h2>2. Produits</h2>
          <p>Les produits proposés sont des kits de graines et objets personnalisés liés aux événements (mariages, anniversaires, etc.). Les photos et descriptions sont données à titre indicatif et ne sont pas contractuelles.</p>

          <h2>3. Prix</h2>
          <p>Les prix sont indiqués en euros TTC. Fleurs en fête se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande. Les frais de livraison sont indiqués avant la validation du paiement.</p>

          <h2>4. Commande</h2>
          <p>Toute commande implique l'acceptation des présentes CGV. La commande est définitivement validée à réception du paiement. Un email de confirmation est envoyé à l'adresse fournie lors de la commande.</p>

          <h2>5. Paiement</h2>
          <p>Le paiement est exigible immédiatement à la commande. Les moyens de paiement acceptés sont indiqués sur la page de paiement. La transaction est sécurisée.</p>

          <h2>6. Livraison</h2>
          <p>Les commandes sont expédiées en France métropolitaine et dans les pays de l'Union européenne. Les délais indicatifs sont précisés lors de la commande. En cas de dépassement de délai de 7 jours ouvrés, le client peut demander l'annulation par email.</p>

          <h2>7. Droit de rétractation (14 jours — Art. L221-18 Code de la consommation)</h2>
          <p>Conformément à la directive européenne 2011/83/UE et aux articles L221-18 à L221-28 du Code de la consommation, <strong>le consommateur dispose d'un délai de 14 jours calendaires</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.</p>
          <h3>Exercice du droit de rétractation</h3>
          <p>Pour exercer ce droit, le client doit notifier sa décision par :</p>
          <ul>
            <li>Email : <a href="mailto:contact@fleursenfete.com">contact@fleursenfete.com</a></li>
            <li>Téléphone : 06 30 77 80 36</li>
          </ul>
          <p>Le client peut utiliser le formulaire de rétractation type ci-dessous ou toute autre déclaration dénuée d'ambiguïté.</p>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 my-4 text-xs text-gray-600">
            <strong className="block mb-2">Formulaire de rétractation type :</strong>
            À l'attention de Fleurs en fête — contact@fleursenfete.com<br /><br />
            Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*) ci-dessous :<br />
            Commandé le (*) / reçu le (*) :<br />
            Nom du/des consommateur(s) :<br />
            Adresse du/des consommateur(s) :<br />
            Signature du/des consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) :<br />
            Date :<br />
            (*) Rayez la mention inutile.
          </div>

          <h2>8. Retour et remboursement</h2>
          <p>En cas de rétractation, le client doit retourner les produits en bon état, dans leur emballage d'origine, à l'adresse communiquée par email, <strong>dans un délai de 14 jours</strong> à compter de la notification de la rétractation, à sa charge.</p>
          <p><strong>Le remboursement sera effectué dès réception du retour et vérification de l'état du produit</strong>, et au plus tard dans les 14 jours suivant la réception du colis retourné, par le même moyen de paiement que celui utilisé lors de la commande.</p>
          <p>Les produits personnalisés (au nom de l'événement) sont exclus du droit de rétractation conformément à l'article L221-28 4° du Code de la consommation, sauf défaut avéré.</p>

          <h2>9. Garanties légales</h2>
          <p>Tous les produits bénéficient de la <strong>garantie légale de conformité</strong> (Art. L217-4 à L217-14 Code de la consommation) et de la <strong>garantie contre les vices cachés</strong> (Art. 1641 à 1649 Code civil). En cas de défaut constaté, contactez-nous à <a href="mailto:contact@fleursenfete.com">contact@fleursenfete.com</a>.</p>

          <h2>10. Service après-vente et litiges</h2>
          <p>Pour tout litige, le client peut contacter Fleurs en fête à <a href="mailto:contact@fleursenfete.com">contact@fleursenfete.com</a>. En cas de litige non résolu, le client peut recourir gratuitement à la <strong>médiation de la consommation</strong>, conformément à la directive 2013/11/UE, via la plateforme européenne de règlement en ligne des litiges : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>

          <h2>11. Droit applicable et juridiction compétente</h2>
          <p>Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents. Pour les consommateurs de l'Union européenne, les dispositions plus favorables de la législation de leur pays de résidence peuvent s'appliquer.</p>
        </div>
      </div>

      <footer className="text-center py-8 px-4 border-t border-gray-100">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
          <a href={createPageUrl("CGV")} className="hover:text-rose-400">CGV</a>
          <span>·</span>
          <a href={createPageUrl("CGU")} className="hover:text-rose-400">CGU</a>
          <span>·</span>
          <a href={createPageUrl("MentionsLegales")} className="hover:text-rose-400">Mentions légales & RGPD</a>
          <span>·</span>
          <a href={createPageUrl("Contact")} className="hover:text-rose-400">Contact</a>
        </div>
      </footer>
    </div>
  );
}