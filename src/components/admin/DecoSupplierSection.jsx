const FABRIC_SUPPLIERS = [
  { coloris: "Ivoire", matiere: "Crépon de coton", ref: "Crépon Ivoire", prix_chemin: "5–7€", prix_noeud: "2,50–3€" },
  { coloris: "Crème", matiere: "Gaze de coton", ref: "Gaze Crème", prix_chemin: "5–7€", prix_noeud: "2,50–3€" },
  { coloris: "Vert Sauge", matiere: "Gaze de coton", ref: "Gaze Vert Sauge", prix_chemin: "6–8€", prix_noeud: "3–3,50€" },
  { coloris: "Terracotta", matiere: "Gaze de coton / Jute", ref: "Gaze Terracotta", prix_chemin: "6–9€", prix_noeud: "3–4€" },
  { coloris: "Ocre", matiere: "Mousseline coton", ref: "Mousseline Ocre Moutarde", prix_chemin: "6–8€", prix_noeud: "3–3,50€" },
  { coloris: "Nude-Beige Lin", matiere: "Gaze de coton", ref: "Gaze Beige Lin", prix_chemin: "5–7€", prix_noeud: "2,50–3€" },
];

const OTHER_SUPPLIERS = [
  {
    name: "Artiflor",
    url: "https://artiflor.fr",
    role: "Mousse sèche",
    costs: [{ label: "Mousse chemin", price: "0,80€" }, { label: "Mousse nœud", price: "0,10€" }],
  },
  {
    name: "Fleurs de la Clarté",
    url: "https://fleursdelaclarte.com",
    role: "Ambiance Naturel (gypsophile, statice blanc, lagurus)",
    costs: [{ label: "Fleurs chemin", price: "2–3€" }, { label: "Fleurs nœud", price: "0,50€" }],
  },
  {
    name: "Le Jardin de Sophie",
    url: "https://lejardindesophie.fr",
    role: "Ambiance Sauge (hortensia blanc, eucalyptus, feuillage)",
    costs: [{ label: "Fleurs chemin", price: "2–3€" }, { label: "Fleurs nœud", price: "0,50€" }],
  },
  {
    name: "Renaud Distribution",
    url: "https://renaud-distribution.com",
    role: "Ambiance Terra (achillée, chardon, statice rose)",
    costs: [{ label: "Fleurs chemin", price: "2–3€" }, { label: "Fleurs nœud", price: "0,50€" }],
  },
  {
    name: "Perlesmania",
    url: "https://perlesmania.com",
    role: "Broches plateau 33mm dorées",
    costs: [{ label: "Broche / pièce", price: "0,25–0,35€" }],
  },
];

const MARGINS = [
  { name: "Chemin Nude", cost: "5–9€", sale: "8–10€", margin: "~1–5€" },
  { name: "Chemin Prêt à fleurir", cost: "7–10€", sale: "15–18€", margin: "~5–11€" },
  { name: "Chemin Fleuri", cost: "10–13€", sale: "45–55€", margin: "~32–45€" },
  { name: "Nœud Essentiel (x1)", cost: "3–4€", sale: "8–10€", margin: "~4–7€" },
  { name: "Nœud Premium (x1)", cost: "3,50–5€", sale: "14–16€", margin: "~9–12,50€" },
  { name: "Pack Essentiel / table", cost: "13–20€", sale: "95–115€", margin: "~75–102€" },
  { name: "Pack Premium / table", cost: "24–38€", sale: "185–205€", margin: "~147–181€" },
];

const WORKFLOW = [
  "Vérifier date mariage et planifier production",
  "Commander tissu sur mariage.fr selon coloris choisi",
  "Commander fleurs selon ambiance choisie si version fleurie",
  "Assembler selon délai annoncé au client",
  "Expédier avec notice de pose incluse dans le colis",
];

export default function DecoSupplierSection() {
  return (
    <div className="space-y-8 pt-2">
      {/* Tissu */}
      <div className="rounded-2xl border-2 border-rose-100 bg-rose-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧵</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Fournisseur tissu — mariage.fr</h3>
            <a href="https://mariage.fr" target="_blank" rel="noopener noreferrer" className="text-rose-400 text-sm hover:underline">mariage.fr</a>
            <span className="text-gray-400 text-sm ml-2">— Commande à la réception de chaque ordre client</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-rose-200">
                <th className="text-left py-2 pr-4">Coloris</th>
                <th className="text-left py-2 pr-4">Matière</th>
                <th className="text-left py-2 pr-4">Référence</th>
                <th className="text-left py-2 pr-4">Chemin 3m</th>
                <th className="text-left py-2">Nœud 1,5m</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {FABRIC_SUPPLIERS.map(f => (
                <tr key={f.coloris} className="hover:bg-white/70 transition">
                  <td className="py-2.5 pr-4 font-semibold text-gray-700">{f.coloris}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{f.matiere}</td>
                  <td className="py-2.5 pr-4 text-gray-500 font-mono text-xs">{f.ref}</td>
                  <td className="py-2.5 pr-4 text-gray-700">{f.prix_chemin}</td>
                  <td className="py-2.5 text-gray-700">{f.prix_noeud}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autres fournisseurs */}
      <div>
        <h3 className="font-bold text-gray-700 text-base mb-3">🌿 Fournisseurs mousse & fleurs séchées & broches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OTHER_SUPPLIERS.map(s => (
            <div key={s.name} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 hover:text-rose-500 text-sm">{s.name}</a>
                  <p className="text-xs text-gray-400 mt-0.5">{s.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {s.costs.map(c => (
                  <span key={c.label} className="bg-gray-100 rounded-full px-2.5 py-1 text-xs text-gray-600">
                    {c.label} : <strong>{c.price}</strong>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marges */}
      <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📊</span>
          <h3 className="font-bold text-gray-800 text-lg">Coûts de revient & marges</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-green-200">
                <th className="text-left py-2 pr-4">Produit</th>
                <th className="text-left py-2 pr-4">Coût revient</th>
                <th className="text-left py-2 pr-4">Prix de vente</th>
                <th className="text-left py-2">Marge nette</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-100">
              {MARGINS.map(m => (
                <tr key={m.name} className="hover:bg-white/60 transition">
                  <td className="py-2.5 pr-4 font-semibold text-gray-700">{m.name}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{m.cost}</td>
                  <td className="py-2.5 pr-4 font-semibold text-green-700">{m.sale}</td>
                  <td className="py-2.5 font-bold text-green-700">{m.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-2xl border-2 border-amber-100 bg-amber-50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚙️</span>
          <h3 className="font-bold text-gray-800 text-lg">Workflow production (par commande)</h3>
        </div>
        <ol className="space-y-2">
          {WORKFLOW.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-sm text-gray-700 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}