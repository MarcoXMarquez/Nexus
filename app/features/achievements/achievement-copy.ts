import type { Achievement } from "../../core/models";
import type { Locale } from "../../i18n/locale";

export type AchievementCopy = {
  title: string;
  description: string;
  /** Present only when the title deliberately uses dialogue from a title. */
  quote?: { speaker: string; sourceId: string };
};

/**
 * English copy is keyed by the permanent achievement ID. IDs and unlock rules
 * never depend on language, so changing locale cannot reset cloud progress.
 *
 * Quote metadata is intentionally conservative: creative achievement names are
 * not presented as official dialogue. Short quoted lines use their original
 * English wording; Spanish remains the Latin-American product copy until an
 * official dub/subtitle source can be documented.
 */
export const ENGLISH_ACHIEVEMENTS: Record<string, AchievementCopy> = {
  "after-blip": {
    title: "After the Blip",
    description: "Complete twenty titles released in the 2020s",
  },
  "agatha-all-along": {
    title: "It Was Agatha All Along",
    description: "Complete WandaVision and Agatha All Along",
    quote: { speaker: "Agatha Harkness", sourceId: "wandavision" },
  },
  "alias-investigations": {
    title: "Alias Investigations",
    description: "Complete Jessica Jones and her connected stories",
  },
  "always-angry": {
    title: "I'm Always Angry",
    description: "Complete Hulk's essential journey",
    quote: { speaker: "Bruce Banner", sourceId: "avengers" },
  },
  "always-spectacular": {
    title: "Always Spectacular",
    description: "Complete The Spectacular Spider-Man",
  },
  "animated-mightiest": {
    title: "Earth's Mightiest, Animated",
    description: "Complete Avengers: Earth's Mightiest Heroes",
  },
  "animated-neighbor": {
    title: "Every Universe's Friendly Neighborhood",
    description: "Complete the animated Spider-Man series",
  },
  "archive-opens": { title: "The Archive Opens", description: "Complete 10 released titles" },
  "assembly-decade": {
    title: "The Decade of Assembly",
    description: "Complete twenty titles released in the 2010s",
  },
  "avengers-all-worlds": {
    title: "Avengers of Every World",
    description: "Complete live-action and animated Avengers teams",
  },
  "avengers-assembled": {
    title: "Avengers Assemble",
    description: "Complete the four main Avengers movies",
    quote: { speaker: "Steve Rogers", sourceId: "endgame" },
  },
  "avengers-idea": {
    title: "There Was an Idea",
    description: "Complete Nick Fury's journey and the creation of the Avengers",
    quote: { speaker: "Nick Fury", sourceId: "avengers" },
  },
  "back-home": { title: "Back Home", description: "Complete the MCU Spider-Man trilogy" },
  "bad-lizard": {
    title: "The Amazing Spider-Man",
    description: "Complete both movies starring Andrew Garfield",
  },
  bargain: {
    title: "Dormammu, I've Come to Bargain",
    description: "Complete the Doctor Strange movies",
    quote: { speaker: "Stephen Strange", sourceId: "doctor-strange" },
  },
  "battleworld-destiny": {
    title: "Destination: Battleworld",
    description: "Complete the required Secret Wars route once it is released",
  },
  "beautiful-because-lasting": {
    title: "A Thing Isn't Beautiful Because It Lasts",
    description: "Complete Vision's essential journey",
    quote: { speaker: "Vision", sourceId: "ultron" },
  },
  "before-mcu": {
    title: "Before the MCU",
    description: "Complete ten titles released in the 2000s",
  },
  "best-at-what-i-do": {
    title: "The Best There Is at What I Do",
    description: "Complete Wolverine's route",
  },
  "best-hawkeye": {
    title: "The Best Hawkeye",
    description: "Complete Hawkeye and Kate Bishop's journey",
  },
  "boom-looking-for-this": {
    title: "Boom! You Looking for This?",
    description: "Complete War Machine's main appearances",
    quote: { speaker: "James Rhodes", sourceId: "ultron" },
  },
  "clobbering-time": {
    title: "It's Clobberin' Time",
    description: "Complete Fantastic Four (2005) and Rise of the Silver Surfer",
    quote: { speaker: "Ben Grimm", sourceId: "fantastic-four-2005" },
  },
  "code-between-worlds": {
    title: "A Code Between Universes",
    description: "Share or import a marathon code",
  },
  "cosmic-limits": {
    title: "The Edge of the Cosmos",
    description: "Complete the MCU cosmic route",
  },
  "daughters-thanos": {
    title: "Daughters of Thanos",
    description: "Complete Gamora and Nebula's shared journey",
  },
  daywalker: { title: "Daywalker", description: "Complete the released Blade trilogy" },
  "dont-give-hope": {
    title: "Don't Give Me Hope",
    description: "Complete Hawkeye's essential journey",
    quote: { speaker: "Clint Barton", sourceId: "endgame" },
  },
  "double-feature": { title: "Double Feature", description: "Complete two titles on the same day" },
  embiggen: {
    title: "Embiggen!",
    description: "Complete Ms. Marvel's route",
    quote: { speaker: "Kamala Khan", sourceId: "ms-marvel" },
  },
  "embrace-chaos": {
    title: "Embrace the Chaos",
    description: "Complete Moon Knight and his supernatural route",
  },
  "end-of-line": {
    title: "Till the End of the Line",
    description: "Complete Bucky Barnes's story",
    quote: { speaker: "Steve Rogers", sourceId: "winter-soldier" },
  },
  "every-frame": {
    title: "Every Frame, a Universe",
    description: "Complete the entire released animation catalog",
  },
  "everything-connected": {
    title: "It's All Connected",
    description: "Complete the entire released catalog",
  },
  "eyes-on-target": {
    title: "Eyes on the Target",
    description: "Complete Cyclops's animated and live-action journey",
  },
  "find-your-voice": { title: "Find Your Voice", description: "Complete Hawkeye and Echo" },
  "fire-life-incarnate": {
    title: "Fire and Life Incarnate",
    description: "Complete Jean Grey and Phoenix's journey",
  },
  "first-assembly": { title: "First Assembly", description: "Complete your first title" },
  "first-episode": { title: "Just One More", description: "Complete your first episode" },
  "first-family": {
    title: "Marvel's First Family",
    description: "Complete every released Fantastic Four universe",
  },
  "first-movie": { title: "First Screening", description: "Complete your first movie" },
  "five-episodes": { title: "Next Episode", description: "Complete five episodes" },
  "five-stars": { title: "Five Stars", description: "Give a title your first maximum rating" },
  "flame-on": {
    title: "Flame On!",
    description: "Complete the different cinematic versions of the Human Torch",
    quote: { speaker: "Johnny Storm", sourceId: "fantastic-four-2005" },
  },
  "future-reunited": {
    title: "Days of a Future Reunited",
    description: "Complete the main X-Men movies",
  },
  "galaxy-misfits": {
    title: "The Galaxy's Misfits",
    description: "Complete Guardians 1–3 and the Holiday Special",
  },
  "glorious-purpose": {
    title: "Glorious Purpose",
    description: "Complete Loki's essential journey",
    quote: { speaker: "Loki", sourceId: "loki-1" },
  },
  "good-taste": { title: "Now This I Like", description: "Mark five titles as favorites" },
  "great-power": {
    title: "With Great Power Comes Great Responsibility",
    description: "Complete Tobey Maguire's trilogy",
    quote: { speaker: "Ben Parker", sourceId: "spiderman-raimi-1" },
  },
  "half-multiverse": {
    title: "Halfway Across the Multiverse",
    description: "Reach 50% of the released catalog",
  },
  "hells-kitchen-devil": {
    title: "The Devil of Hell's Kitchen",
    description: "Complete Daredevil's route",
  },
  "heroes-new-york": {
    title: "Heroes of New York",
    description: "Complete the Defenders' individual stories",
  },
  "heroic-weekend": {
    title: "Heroic Weekend",
    description: "Complete three titles during weekends",
  },
  "higher-further": {
    title: "Higher, Further, Faster",
    description: "Complete Captain Marvel's route",
  },
  "hope-coexistence": {
    title: "Hope for Coexistence",
    description: "Complete Charles Xavier's main stories",
  },
  "hundred-counting": {
    title: "One Hundred and Counting",
    description: "Complete 100 released titles",
  },
  "iron-trilogy": {
    title: "Genius, Billionaire, Playboy, Philanthropist",
    description: "Complete the Iron Man trilogy",
    quote: { speaker: "Tony Stark", sourceId: "avengers" },
  },
  "king-of-city": {
    title: "King of the City",
    description: "Complete the main stories connected to Kingpin",
  },
  "knows-fear": {
    title: "He Who Knows Fear",
    description: "Complete Werewolf by Night and Man-Thing's route",
  },
  "legacy-keepers": {
    title: "Keepers of the Legacy",
    description: "Complete X-Men, Fantastic Four, and legacy universes",
  },
  "level-seven": {
    title: "Level Seven Access",
    description: "Complete the essential S.H.I.E.L.D.-related titles",
  },
  "man-without-fear": {
    title: "The Man Without Fear",
    description: "Complete every available Daredevil story",
  },
  "margin-notes": { title: "Notes in the Margin", description: "Write your first personal note" },
  "marvels-together": {
    title: "Higher, Further, Faster, Together",
    description: "Complete Captain Marvel, Ms. Marvel, and The Marvels",
  },
  "maximum-effort": {
    title: "Maximum Effort",
    description: "Complete every Deadpool movie",
    quote: { speaker: "Wade Wilson", sourceId: "deadpool" },
  },
  "multiverse-critic": { title: "Multiverse Critic", description: "Rate 25 titles" },
  "multiverse-museum": {
    title: "Museum of the Multiverse",
    description: "Complete the released digital collection",
  },
  "multiverse-visitors": {
    title: "Visitors from Other Universes",
    description: "Complete the narrative route to No Way Home",
  },
  "mutant-proud": {
    title: "Mutant and Proud",
    description: "Complete every released X-Men universe",
    quote: { speaker: "Erik Lehnsherr", sourceId: "xmen-first-class" },
  },
  "my-continuity": { title: "My Continuity", description: "Finish a custom order" },
  "name-is-gambit": {
    title: "The Name's Gambit",
    description: "Complete Gambit's main appearances",
  },
  "need-that-arm": {
    title: "I'm Gonna Get That Arm",
    description: "Complete Rocket's essential journey",
    quote: { speaker: "Rocket", sourceId: "infinity-war" },
  },
  "neon-days": { title: "Neon Days", description: "Complete a route from the 1990s" },
  "new-avengers": {
    title: "New Avengers?",
    description: "Complete the titles connected to the Thunderbolts",
  },
  "next-generation": {
    title: "The Next Generation",
    description: "Complete the available young-hero stories",
  },
  "night-marathon": {
    title: "Night Marathon",
    description: "Complete three titles on the same day",
  },
  "one-batch": { title: "One Batch, One Mission", description: "Complete Punisher's route" },
  "one-more-time": { title: "One More Time", description: "Record 10 rewatches" },
  "one-reality": { title: "One Reality at a Time", description: "Complete one map branch" },
  "on-your-left": {
    title: "On Your Left",
    description: "Complete Captain America's individual saga",
    quote: { speaker: "Steve Rogers", sourceId: "winter-soldier" },
  },
  "on-your-order": {
    title: "On Your Command, Captain",
    description: "Complete Sam Wilson's journey",
  },
  "own-story": {
    title: "I Control My Own Story",
    description: "Complete She-Hulk: Attorney at Law",
  },
  "peace-never-option": {
    title: "Peace Was Never an Option",
    description: "Complete Magneto's essential journey",
    quote: { speaker: "Erik Lehnsherr", sourceId: "xmen-first-class" },
  },
  "phase-traveler": { title: "Phase Traveler", description: "Complete any MCU phase" },
  "pocket-vest": {
    title: "A Vest with Pockets",
    description: "Complete Yelena Belova's available story",
  },
  "portals-open": {
    title: "The Portals Are Open",
    description: "Complete the narrative route to Endgame",
  },
  "protector-kun-lun": {
    title: "Protector of K'un-Lun",
    description: "Complete Iron Fist and The Defenders",
  },
  "punishment-served": {
    title: "Punishment Served",
    description: "Complete every available Punisher story",
  },
  "ready-doomsday": {
    title: "Ready for Doomsday",
    description: "Complete the required Doomsday route once it is released",
  },
  "reality-curator": { title: "Curator of Realities", description: "Unlock 50 digital posters" },
  "red-room": {
    title: "Red in My Ledger",
    description: "Complete Black Widow's essential journey",
  },
  "red-sai": { title: "The Red Sai", description: "Complete Elektra's stories" },
  "save-for-later": { title: "Save for Later", description: "Save your first title to My List" },
  "season-closed": { title: "Season Complete", description: "Finish a full season" },
  "seven-thousand-years": {
    title: "Seven Thousand Years",
    description: "Complete Eternals and its available connections",
  },
  "she-is-not-alone": {
    title: "She's Not Alone",
    description: "Complete a special route featuring the MCU's leading heroines",
  },
  showrunner: { title: "Showrunner", description: "Create your first custom marathon" },
  "size-problems": { title: "Size Problems", description: "Complete the Ant-Man trilogy" },
  "sorcerer-oath": {
    title: "The Sorcerer's Oath",
    description: "Complete an essential route with spoiler protection enabled",
  },
  "soul-price": { title: "The Price of a Soul", description: "Complete the Infinity Saga" },
  "spirit-vengeance": {
    title: "Spirit of Vengeance",
    description: "Complete the Ghost Rider movies",
  },
  "still-worthy": { title: "Still Worthy", description: "Complete all four Thor movies" },
  "storm-goddess": { title: "Goddess of the Storm", description: "Complete Storm's main stories" },
  "street-heroes": { title: "Street-Level Heroes", description: "Complete The Defenders Saga" },
  "sugar-rogue": { title: "Sugar", description: "Complete Rogue's journey" },
  "sweet-christmas": {
    title: "Sweet Christmas!",
    description: "Complete Luke Cage and his connections",
    quote: { speaker: "Luke Cage", sourceId: "luke-cage-s1" },
  },
  "symbiote-web": { title: "Symbiote Web", description: "Complete Sony's Spider-Man Universe" },
  "ten-episodes": { title: "Who Needs Sleep?", description: "Complete ten episodes" },
  "ten-rings-legend": {
    title: "The Legend of the Ten Rings",
    description: "Complete Shang-Chi and his available connections",
  },
  "the-herald": {
    title: "The Herald",
    description: "Complete Silver Surfer's available appearances",
  },
  "three-days-realities": {
    title: "Three Days, Three Realities",
    description: "Record activity on three different days",
  },
  "three-spiders": {
    title: "Three Spider-Men, One Destiny",
    description: "Complete all three live-action routes through No Way Home",
  },
  "through-time": {
    title: "Through Time",
    description: "Complete at least one title from four different decades",
  },
  "timeline-protector": {
    title: "Protector of the Timeline",
    description: "Complete the released MCU series and specials",
  },
  "to-me-xmen": {
    title: "To Me, My X-Men",
    description: "Complete X-Men: The Animated Series and X-Men '97",
  },
  "together-now": {
    title: "All Together Now",
    description: "Complete a created or shared marathon",
  },
  "under-spell": {
    title: "Under the Spell",
    description: "Complete five titles with protected mode enabled",
  },
  "wakanda-forever": {
    title: "Wakanda Forever",
    description: "Complete the Black Panther movies",
    quote: { speaker: "T'Challa", sourceId: "black-panther" },
  },
  "watcher-notes": { title: "The Watcher's Notes", description: "Write notes for 25 titles" },
  "watcher-saw-all": {
    title: "I Have Seen It All",
    description: "Complete every season of What If...?",
  },
  "we-are-groot": {
    title: "We Are Groot",
    description: "Complete Groot's main stories",
    quote: { speaker: "Groot", sourceId: "guardians" },
  },
  "we-are-venom": {
    title: "We Are Venom",
    description: "Complete the Venom trilogy",
    quote: { speaker: "Venom", sourceId: "venom" },
  },
  "wear-mask": {
    title: "Anyone Can Wear the Mask",
    description: "Complete the released Spider-Verse movies",
    quote: { speaker: "Miles Morales", sourceId: "spider-verse" },
  },
  "web-destiny": {
    title: "The Web of Destiny",
    description: "Complete every released animated and live-action Spider-Man title",
  },
  "what-is-grief": {
    title: "What Is Grief, If Not Love Persevering?",
    description: "Complete Wanda's essential journey",
    quote: { speaker: "Vision", sourceId: "wandavision" },
  },
  "when-night-falls": {
    title: "When Night Falls",
    description: "Complete the MCU supernatural route",
  },
  "zero-list": {
    title: "Zeroed-Out List",
    description: "Complete every title in one of your custom lists",
  },
};

export function localizeAchievements(values: Achievement[], locale: Locale): Achievement[] {
  if (locale !== "en-US") return values;
  return values.map((achievement) => {
    const copy = ENGLISH_ACHIEVEMENTS[achievement.id];
    return copy
      ? { ...achievement, title: copy.title, description: copy.description }
      : achievement;
  });
}

export function achievementCopy(id: string, locale: Locale, fallback: AchievementCopy) {
  return locale === "en-US" ? ENGLISH_ACHIEVEMENTS[id] || fallback : fallback;
}
