// TemplateConfig.js — Templates par type d'événement

export const EVENT_TYPE_LABELS = {
  mariage:        { label: "Mariage",          emoji: "💍" },
  fiançailles:    { label: "Fiançailles",      emoji: "💑" },
  anniversaire:   { label: "Anniversaire",     emoji: "🎂" },
  bapteme:        { label: "Baptême",          emoji: "🕊️" },
  communion:      { label: "Communion",        emoji: "✝️" },
  fete_entreprise:{ label: "Fête d'entreprise",emoji: "🏢" },
  maison_hote:    { label: "Maison d'hôte",   emoji: "🏡" },
  autre:          { label: "Autre",            emoji: "🎉" },
};

// Chaque template: name, emoji, plan (basic/premium), primaryColor, secondaryColor, eventTypes (quels types y ont accès)
export const TEMPLATES = {
  // ── MARIAGE ──────────────────────────────────────────────────────────
  classique: {
    name: "Classique",
    emoji: "🤍",
    plan: "basic",
    primaryColor: "#c084fc",
    secondaryColor: "#86efac",
    eventTypes: ["mariage", "fiançailles"],
    description: "Élégant et intemporel, parfait pour un mariage traditionnel",
  },
  champetre: {
    name: "Champêtre",
    emoji: "🌿",
    plan: "basic",
    primaryColor: "#84cc16",
    secondaryColor: "#fde68a",
    eventTypes: ["mariage", "fiançailles"],
    description: "Verdoyant et naturel, idéal pour une cérémonie en plein air",
  },
  elegant: {
    name: "Élégant",
    emoji: "✨",
    plan: "premium",
    primaryColor: "#c9a96e",
    secondaryColor: "#f5f0e8",
    eventTypes: ["mariage", "fiançailles"],
    description: "Raffiné et doré, pour un mariage haut de gamme",
  },
  boheme: {
    name: "Bohème",
    emoji: "🌸",
    plan: "premium",
    primaryColor: "#f43f5e",
    secondaryColor: "#fcd34d",
    eventTypes: ["mariage", "fiançailles"],
    description: "Coloré et libre, pour un mariage plein de vie",
  },
  floral: {
    name: "Floral",
    emoji: "💐",
    plan: "premium",
    primaryColor: "#ec4899",
    secondaryColor: "#bbf7d0",
    eventTypes: ["mariage", "fiançailles"],
    description: "Fleuri et romantique, pour une cérémonie printanière",
  },
  minimal: {
    name: "Minimal",
    emoji: "⬜",
    plan: "basic",
    primaryColor: "#64748b",
    secondaryColor: "#f1f5f9",
    eventTypes: ["mariage", "fiançailles", "autre"],
    description: "Sobre et moderne, pour un mariage épuré",
  },

  // ── ANNIVERSAIRE ──────────────────────────────────────────────────────
  joyeux: {
    name: "Joyeux",
    emoji: "🎉",
    plan: "basic",
    primaryColor: "#f59e0b",
    secondaryColor: "#fde68a",
    eventTypes: ["anniversaire"],
    description: "Festif et coloré, pour un anniversaire plein de bonheur",
  },
  festif: {
    name: "Festif",
    emoji: "🎊",
    plan: "basic",
    primaryColor: "#8b5cf6",
    secondaryColor: "#c4b5fd",
    eventTypes: ["anniversaire"],
    description: "Pétillant et dynamique, pour une fête mémorable",
  },
  moderne: {
    name: "Moderne",
    emoji: "🎈",
    plan: "premium",
    primaryColor: "#0ea5e9",
    secondaryColor: "#bae6fd",
    eventTypes: ["anniversaire"],
    description: "Tendance et design, pour un anniversaire contemporain",
  },
  vintage_anni: {
    name: "Vintage",
    emoji: "🍰",
    plan: "premium",
    primaryColor: "#d97706",
    secondaryColor: "#fef3c7",
    eventTypes: ["anniversaire"],
    description: "Rétro et chaleureux, pour fêter un bel âge",
  },

  // ── BAPTÊME ──────────────────────────────────────────────────────────
  douceur: {
    name: "Douceur",
    emoji: "🕊️",
    plan: "basic",
    primaryColor: "#a78bfa",
    secondaryColor: "#ede9fe",
    eventTypes: ["bapteme"],
    description: "Doux et lumineux, pour accueillir un nouveau né",
  },
  nuage: {
    name: "Nuage",
    emoji: "☁️",
    plan: "basic",
    primaryColor: "#7dd3fc",
    secondaryColor: "#e0f2fe",
    eventTypes: ["bapteme"],
    description: "Aérien et délicat, pour un baptême tout en légèreté",
  },
  nature_bebe: {
    name: "Nature",
    emoji: "🌱",
    plan: "premium",
    primaryColor: "#4ade80",
    secondaryColor: "#d1fae5",
    eventTypes: ["bapteme"],
    description: "Naturel et verdoyant, pour un baptême ressourçant",
  },

  // ── COMMUNION ────────────────────────────────────────────────────────
  lumiere: {
    name: "Lumière",
    emoji: "✝️",
    plan: "basic",
    primaryColor: "#fbbf24",
    secondaryColor: "#fef9c3",
    eventTypes: ["communion"],
    description: "Doré et solennel, pour une première communion",
  },
  azur: {
    name: "Azur",
    emoji: "🌤️",
    plan: "basic",
    primaryColor: "#38bdf8",
    secondaryColor: "#e0f2fe",
    eventTypes: ["communion"],
    description: "Ciel et paix, pour un grand jour spirituel",
  },
  rose_communion: {
    name: "Rose & Or",
    emoji: "🌹",
    plan: "premium",
    primaryColor: "#f472b6",
    secondaryColor: "#fef3c7",
    eventTypes: ["communion"],
    description: "Élégant et féminin, pour une communion mémorable",
  },

  // ── ENTREPRISE ────────────────────────────────────────────────────────
  corporate: {
    name: "Corporate",
    emoji: "🏢",
    plan: "basic",
    primaryColor: "#1e40af",
    secondaryColor: "#bfdbfe",
    eventTypes: ["fete_entreprise"],
    description: "Professionnel et sobre, pour un événement d'entreprise",
  },
  dynamique: {
    name: "Dynamique",
    emoji: "⚡",
    plan: "premium",
    primaryColor: "#0f172a",
    secondaryColor: "#38bdf8",
    eventTypes: ["fete_entreprise"],
    description: "Moderne et impact, pour un team building ou séminaire",
  },

  // ── MAISON D'HÔTE ────────────────────────────────────────────────────
  nature: {
    name: "Nature",
    emoji: "🌿",
    plan: "basic",
    primaryColor: "#16a34a",
    secondaryColor: "#dcfce7",
    eventTypes: ["maison_hote"],
    description: "Reposant et verdoyant, pour une maison d'hôte à la campagne",
  },
  provencal: {
    name: "Provençal",
    emoji: "🏡",
    plan: "premium",
    primaryColor: "#a78b3a",
    secondaryColor: "#fef9c3",
    eventTypes: ["maison_hote"],
    description: "Ensoleillé et authentique, pour un gîte du sud",
  },

  // ── AUTRE ────────────────────────────────────────────────────────────
  sobre: {
    name: "Sobre",
    emoji: "🎪",
    plan: "basic",
    primaryColor: "#6366f1",
    secondaryColor: "#e0e7ff",
    eventTypes: ["autre"],
    description: "Polyvalent et élégant, pour tout type d'événement",
  },
};

/**
 * Retourne les templates disponibles pour un type d'événement donné
 * sous forme [[key, templateData], ...]
 */
export function getTemplatesForEventType(eventType) {
  return Object.entries(TEMPLATES).filter(
    ([, tpl]) => tpl.eventTypes.includes(eventType)
  );
}

/**
 * Retourne le premier template gratuit disponible pour un type d'événement
 */
export function getDefaultTemplateForEventType(eventType) {
  const available = getTemplatesForEventType(eventType);
  const firstFree = available.find(([, t]) => t.plan === "basic");
  return firstFree ? firstFree[0] : available[0]?.[0] || "classique";
}