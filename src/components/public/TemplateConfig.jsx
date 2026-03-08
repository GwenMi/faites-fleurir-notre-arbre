// Templates organisés par type d'événement
// plan: "basic" = gratuit, "premium" = payant

export const TEMPLATES = {
  // ── MARIAGE & FIANÇAILLES ──────────────────────────────
  classique: {
    name: "Classique",
    plan: "basic",
    eventTypes: ["mariage", "fiançailles"],
    primaryColor: "#c084fc",
    secondaryColor: "#86efac",
    emoji: "💍",
  },
  champetre: {
    name: "Champêtre",
    plan: "basic",
    eventTypes: ["mariage", "fiançailles"],
    primaryColor: "#86efac",
    secondaryColor: "#fde68a",
    emoji: "🌿",
  },
  floral: {
    name: "Floral",
    plan: "basic",
    eventTypes: ["mariage", "fiançailles"],
    primaryColor: "#f9a8d4",
    secondaryColor: "#bbf7d0",
    emoji: "🌸",
  },
  elegant: {
    name: "Élégant",
    plan: "premium",
    eventTypes: ["mariage", "fiançailles"],
    primaryColor: "#c9a96e",
    secondaryColor: "#e5e7eb",
    emoji: "✨",
  },
  boheme: {
    name: "Bohème",
    plan: "premium",
    eventTypes: ["mariage", "fiançailles"],
    primaryColor: "#d97706",
    secondaryColor: "#fde68a",
    emoji: "🪶",
  },

  // ── ANNIVERSAIRE ──────────────────────────────────────
  joyeux: {
    name: "Joyeux",
    plan: "basic",
    eventTypes: ["anniversaire"],
    primaryColor: "#f472b6",
    secondaryColor: "#fbbf24",
    emoji: "🎂",
  },
  festif: {
    name: "Festif",
    plan: "basic",
    eventTypes: ["anniversaire"],
    primaryColor: "#a78bfa",
    secondaryColor: "#34d399",
    emoji: "🎉",
  },
  moderne: {
    name: "Moderne",
    plan: "premium",
    eventTypes: ["anniversaire"],
    primaryColor: "#1e293b",
    secondaryColor: "#f43f5e",
    emoji: "🎈",
  },

  // ── BAPTÊME ──────────────────────────────────────────
  douceur: {
    name: "Douceur",
    plan: "basic",
    eventTypes: ["bapteme"],
    primaryColor: "#93c5fd",
    secondaryColor: "#d9f99d",
    emoji: "👶",
  },
  nature: {
    name: "Nature",
    plan: "basic",
    eventTypes: ["bapteme"],
    primaryColor: "#6ee7b7",
    secondaryColor: "#fde68a",
    emoji: "🌱",
  },

  // ── FÊTE D'ENTREPRISE ────────────────────────────────
  corporate: {
    name: "Corporate",
    plan: "basic",
    eventTypes: ["fete_entreprise"],
    primaryColor: "#3b82f6",
    secondaryColor: "#e2e8f0",
    emoji: "🏢",
  },

  // ── MAISON D'HÔTE / AUTRE ───────────────────────────
  minimal: {
    name: "Minimal",
    plan: "basic",
    eventTypes: ["maison_hote", "autre", "mariage", "anniversaire", "bapteme", "fete_entreprise", "fiançailles"],
    primaryColor: "#64748b",
    secondaryColor: "#f1f5f9",
    emoji: "🍃",
  },
};

// Retourne les templates adaptés à un type d'événement
export function getTemplatesForEventType(eventType) {
  return Object.entries(TEMPLATES).filter(
    ([, tpl]) => tpl.eventTypes.includes(eventType)
  );
}

export const EVENT_TYPE_LABELS = {
  mariage: { label: "Mariage", emoji: "💍" },
  "fiançailles": { label: "Fiançailles", emoji: "💎" },
  anniversaire: { label: "Anniversaire", emoji: "🎂" },
  bapteme: { label: "Baptême", emoji: "👶" },
  fete_entreprise: { label: "Fête d'entreprise", emoji: "🏢" },
  maison_hote: { label: "Maison d'hôte", emoji: "🏡" },
  autre: { label: "Autre", emoji: "🎊" },
};