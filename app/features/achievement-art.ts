/**
 * Achievement art is deliberately independent from title posters.
 *
 * - `thumb` is the compact 256px Steam-like badge used in menus.
 * - `badge` is the 512px version used in the expanded achievement panel.
 * - `hero` is original, SFW panoramic art designed for wide UI crops.
 *
 * Asset provenance lives in `/public/achievement-art/manifest.json`.
 */
export type AchievementArt = {
  thumb: string;
  badge: string;
  hero: string;
  source: string;
  focalPoint: string;
  sfwReviewed: true;
};

type BadgeFamily =
  | "iron-man"
  | "captain"
  | "thor"
  | "amazing-spider"
  | "loki"
  | "marathon"
  | "mutants"
  | "team"
  | "mystic"
  | "guardians"
  | "scarlet"
  | "wolverine"
  | "street"
  | "symbiote"
  | "first-family"
  | "wakanda";

const IDS: Partial<Record<BadgeFamily, string[]>> = {
  "iron-man": ["iron-trilogy", "legacy-iron", "boom-looking-for-this", "first-movie"],
  captain: ["on-your-left", "on-your-order", "end-of-line", "red-room"],
  thor: ["still-worthy", "always-angry"],
  "amazing-spider": [
    "great-power", "bad-lizard", "back-home", "three-spiders", "wear-mask",
    "always-spectacular", "animated-neighbor", "web-destiny", "multiverse-visitors",
  ],
  loki: [
    "glorious-purpose", "timeline-protector", "phase-traveler", "one-reality",
    "half-multiverse", "through-time", "after-blip", "portals-open",
  ],
  mystic: [
    "bargain", "sorcerer-oath", "when-night-falls", "spirit-vengeance",
    "knows-fear", "under-spell", "battleworld-destiny",
  ],
  guardians: [
    "galaxy-misfits", "need-that-arm", "we-are-groot", "daughters-thanos",
    "cosmic-limits", "higher-further", "marvels-together", "seven-thousand-years",
  ],
  scarlet: [
    "what-is-grief", "beautiful-because-lasting", "agatha-all-along",
    "embrace-chaos", "next-generation",
  ],
  wolverine: ["best-at-what-i-do", "maximum-effort"],
  street: [
    "hells-kitchen-devil", "street-heroes", "one-batch", "heroes-new-york",
    "alias-investigations", "sweet-christmas", "red-sai", "protector-kun-lun",
    "man-without-fear", "king-of-city", "punishment-served",
  ],
  symbiote: ["we-are-venom", "symbiote-web"],
  "first-family": ["clobbering-time", "first-family", "the-herald", "flame-on"],
  wakanda: ["wakanda-forever", "she-is-not-alone"],
  mutants: [
    "to-me-xmen", "future-reunited", "mutant-proud", "legacy-keepers",
    "eyes-on-target", "storm-goddess", "fire-life-incarnate", "sugar-rogue",
    "name-is-gambit", "peace-never-option", "hope-coexistence",
  ],
  team: [
    "avengers-assembled", "avengers-idea", "new-avengers", "avengers-all-worlds",
    "everything-connected", "soul-price", "ready-doomsday", "together-now",
    "animated-mightiest", "watcher-saw-all", "every-frame", "daughters-thanos",
    "level-seven", "marvels-together",
  ],
};

const FAMILY_BY_ID = new Map<string, BadgeFamily>(
  Object.entries(IDS).flatMap(([family, ids]) =>
    (ids ?? []).map((id) => [id, family as BadgeFamily] as const),
  ),
);

const HERO_BY_FAMILY: Record<BadgeFamily, string> = {
  "iron-man": "team",
  captain: "team",
  thor: "team",
  "amazing-spider": "spider",
  loki: "timeline",
  marathon: "timeline",
  mutants: "mutants",
  team: "team",
  mystic: "mystic",
  guardians: "cosmic",
  scarlet: "scarlet",
  wolverine: "wolverine",
  street: "street",
  symbiote: "symbiote",
  "first-family": "quartet",
  wakanda: "wakanda",
};

function familyFromGroup(group: string): BadgeFamily {
  const value = group.toLowerCase();
  if (value.includes("spider")) return "amazing-spider";
  if (value.includes("mutant") || value.includes("legado")) return "mutants";
  if (value.includes("animaci")) return "team";
  if (value.includes("actividad")) return "marathon";
  if (value.includes("era") || value.includes("saga") || value.includes("universo")) return "loki";
  return "team";
}

export function achievementArtFor(id: string, group: string, _coverId?: string): AchievementArt {
  void _coverId; // Kept for API compatibility with callers that also resolve a title cover.
  const family = FAMILY_BY_ID.get(id) ?? familyFromGroup(group);
  const hero = HERO_BY_FAMILY[family];
  return {
    thumb: `./achievement-art/badges/by-id/256/${id}.webp`,
    badge: `./achievement-art/badges/by-id/512/${id}.webp`,
    hero: `./achievement-art/heroes/${hero}.webp`,
    source: "Ilustración original SFW creada para Nexus",
    focalPoint: "center",
    sfwReviewed: true,
  };
}
