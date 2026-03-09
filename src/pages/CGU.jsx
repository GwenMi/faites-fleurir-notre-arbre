import { createPageUrl } from "@/utils";

export default function CGU() {
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
        <h1 className="font-serif-elegant text-5xl font-bold text-gray-800 mb-4">Conditions générales d'utilisation</h1>
        <div className="gold-line max-w-[120px] mb-8" />

        <div className="prose-legal space-y-2">
          <p className="text-xs text-gray-400 italic">En vigueur au 01/03/2025</p>

          <h2>1. Objet</h2>
          <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site <strong>Fleurs en fête</strong> (ci-après "la Plateforme"), éditée par Papin Gwenaëlle. En accédant à la Plateforme, l'utilisateur accepte sans réserve les présentes CGU.</p>

          <h2>2. Accès à la Plateforme</h2>
          <p>La Plateforme est accessible gratuitement à tout utilisateur disposant d'un accès Internet. Tous les frais nécessaires à la connexion restent à la charge de l'utilisateur. Les organisateurs d'événements (mariés, etc.) doivent créer un compte pour accéder aux fonctionnalités de gestion.</p>

          <h2>3. Propriété intellectuelle</h2>
          <p>L'ensemble des éléments constituant la Plateforme (textes, images, logo, code source) sont la propriété exclusive de Fleurs en fête ou de ses partenaires. Toute reproduction, représentation ou diffusion non autorisée est interdite.</p>
          <p>Les photos et contenus déposés par les invités restent la propriété de leurs auteurs. En les déposant, ils accordent à Fleurs en fête et aux organisateurs de l'événement une licence d'utilisation non exclusive pour l'affichage sur la Plateforme.</p>

          <h2>4. Responsabilité des utilisateurs</h2>
          <p>L'utilisateur s'engage à :</p>
          <ul>
            <li>Utiliser la Plateforme conformément aux lois françaises et européennes en vigueur ;</li>
            <li>Ne pas déposer de contenus illicites, injurieux, diffamatoires, obscènes ou portant atteinte aux droits de tiers ;</li>
            <li>Ne pas tenter d'accéder frauduleusement aux données d'autres utilisateurs ;</li>
            <li>Ne pas utiliser la Plateforme à des fins commerciales sans autorisation expresse.</li>
          </ul>
          <p>Fleurs en fête se réserve le droit de supprimer tout contenu non conforme et de suspendre l'accès de l'utilisateur responsable.</p>

          <h2>5. Modération des contenus</h2>
          <p>Les photos et messages déposés par les invités sont soumis à une validation préalable par l'organisateur de l'événement avant publication. Fleurs en fête n'est pas responsable des contenus publiés par les utilisateurs.</p>

          <h2>6. Données personnelles</h2>
          <p>Le traitement des données personnelles est détaillé dans notre <a href={createPageUrl("MentionsLegales")}>Politique de confidentialité et mentions légales</a>, conformément au RGPD (Règlement UE 2016/679).</p>

          <h2>7. Cookies</h2>
          <p>La Plateforme utilise des cookies strictement nécessaires à son fonctionnement. Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement.</p>

          <h2>8. Limitation de responsabilité</h2>
          <p>Fleurs en fête s'efforce d'assurer la disponibilité continue de la Plateforme mais ne peut garantir son accès ininterrompu. La Plateforme ne pourra être tenue responsable de dommages indirects liés à son utilisation.</p>

          <h2>9. Modification des CGU</h2>
          <p>Les présentes CGU peuvent être modifiées à tout moment. Les utilisateurs seront informés des modifications importantes. La poursuite de l'utilisation de la Plateforme après modification vaut acceptation des nouvelles CGU.</p>

          <h2>10. Droit applicable</h2>
          <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux français, sans préjudice des droits reconnus aux consommateurs de l'UE par leur législation nationale.</p>
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