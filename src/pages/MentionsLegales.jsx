import { createPageUrl } from "@/utils";

export default function MentionsLegales() {
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

      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <a href={createPageUrl("Home")}>
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693710239f4846bc4d68444e/746b310d8_image.png"
            alt="Fleurs en fête" className="h-10" />
        </a>
        <a href={createPageUrl("Home")} className="font-sans-clean text-sm text-gray-400 hover:text-rose-400 transition">← Retour à l'accueil</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-sans-clean text-xs tracking-[0.3em] uppercase text-rose-400 mb-3">Juridique</p>
        <h1 className="font-serif-elegant text-5xl font-bold text-gray-800 mb-4">Mentions légales & Confidentialité</h1>
        <div className="gold-line max-w-[120px] mb-8" />

        <div className="prose-legal space-y-2">

          <h2>1. Éditeur du site</h2>
          <p>
            <strong>Papin Gwenaëlle</strong><br />
            Statut : Micro-entreprise<br />
            Enseigne : Fleurs en fête<br />
            Adresse : 2 Place Jean V, Bureau 3, 44000 Nantes<br />
            E-mail : <a href="mailto:contact@fleursdefete.fr">contact@fleursdefete.fr</a><br />
            Téléphone : 06 30 77 80 36<br />
            RCS Nantes : 848 506 861<br />
            TVA non applicable — article 293 B du CGI
          </p>

          <h2>2. Hébergement</h2>
          <p>Le site est hébergé par <strong>Base44 Ltd</strong> — 30 Kalischer St, Tel Aviv, Israël — infrastructure cloud, données hébergées dans l'Union Européenne.</p>

          <h2>3. Propriété intellectuelle</h2>
          <p>L'ensemble du contenu de ce site (textes, images, logo, code) est protégé par le droit d'auteur français et les conventions internationales. Toute reproduction est interdite sans autorisation préalable écrite.</p>

          <h2>4. Protection des données personnelles (RGPD)</h2>
          <p>Conformément au <strong>Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679)</strong> et à la loi Informatique et Libertés modifiée, Fleurs en fête s'engage à protéger vos données personnelles.</p>

          <h3>4.1 Responsable du traitement</h3>
          <p>Papin Gwenaëlle — contact@fleursdefete.fr — 06 30 77 80 36</p>

          <h3>4.2 Données collectées</h3>
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li><strong>Organisateurs d'événements :</strong> adresse e-mail, nom, données de l'événement.</li>
            <li><strong>Invités :</strong> pseudo, adresse e-mail (optionnelle), photos et messages déposés volontairement.</li>
            <li><strong>Acheteurs :</strong> nom, prénom, adresse e-mail, adresse de livraison.</li>
          </ul>

          <h3>4.3 Finalités du traitement</h3>
          <ul>
            <li>Gestion des comptes et des événements ;</li>
            <li>Traitement des commandes et livraisons ;</li>
            <li>Envoi de communications liées à l'événement (notifications, remerciements) ;</li>
            <li>Respect des obligations légales (comptabilité, etc.).</li>
          </ul>

          <h3>4.4 Base légale</h3>
          <p>Le traitement est fondé sur l'exécution du contrat (art. 6.1.b RGPD), le consentement (art. 6.1.a) pour les communications optionnelles, et l'obligation légale (art. 6.1.c) pour la comptabilité.</p>

          <h3>4.5 Durée de conservation</h3>
          <ul>
            <li>Données de compte : jusqu'à suppression du compte + 1 an</li>
            <li>Données de commande : 10 ans (obligation légale comptable)</li>
            <li>Photos et contenus des invités : durée de l'événement + 6 mois, sauf demande de suppression</li>
          </ul>

          <h3>4.6 Destinataires</h3>
          <p>Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec des prestataires techniques (hébergement, envoi d'e-mails) dans le respect du RGPD et sous accord de traitement des données.</p>

          <h3>4.7 Transferts hors UE</h3>
          <p>Les données sont hébergées au sein de l'Union Européenne. Tout transfert éventuel hors UE sera encadré par des garanties appropriées (clauses contractuelles types de la Commission européenne).</p>

          <h3>4.8 Vos droits</h3>
          <p>Conformément aux articles 15 à 22 du RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès</strong> à vos données</li>
            <li><strong>Droit de rectification</strong> de vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> ("droit à l'oubli")</li>
            <li><strong>Droit à la limitation</strong> du traitement</li>
            <li><strong>Droit à la portabilité</strong> de vos données</li>
            <li><strong>Droit d'opposition</strong> au traitement</li>
            <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
          </ul>
          <p>Pour exercer ces droits : <a href="mailto:contact@fleursdefete.fr">contact@fleursdefete.fr</a> ou par téléphone au 06 30 77 80 36. En cas de désaccord, vous pouvez saisir la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a> — 3 Place de Fontenoy, 75007 Paris.</p>

          <h2>5. Cookies</h2>
          <p>Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement technique de la plateforme (session utilisateur, préférences). Aucun cookie publicitaire ou de profilage n'est utilisé. Vous pouvez paramétrer votre navigateur pour refuser les cookies, ce qui peut affecter certaines fonctionnalités du site.</p>

          <h2>6. Médiation et litiges en ligne</h2>
          <p>En cas de litige non résolu amiablement, vous pouvez recourir à la médiation de la consommation (art. L616-1 Code de la consommation). Médiateur désigné : <strong>ANM Conso</strong> — <a href="https://www.anm-conso.com" target="_blank" rel="noopener noreferrer">www.anm-conso.com</a> — 2 rue de Colmar, 94300 Vincennes.<br />
          Vous pouvez également utiliser la plateforme européenne de résolution des litiges en ligne : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</p>

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