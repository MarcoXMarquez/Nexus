import type { MCUItem } from "../mcu-data";
import type { Locale } from "./locale";

export const ENGLISH_TITLE_BY_ID: Record<string, string> = {
  hulk: "The Incredible Hulk",
  "cap-first-avenger": "Captain America: The First Avenger",
  "thor-dark-world": "Thor: The Dark World",
  "winter-soldier": "Captain America: The Winter Soldier",
  guardians: "Guardians of the Galaxy",
  ultron: "Avengers: Age of Ultron",
  "civil-war": "Captain America: Civil War",
  "guardians-2": "Guardians of the Galaxy Vol. 2",
  "captain-marvel": "Captain Marvel",
  "far-from-home": "Spider-Man: Far From Home",
  "falcon-winter": "The Falcon and the Winter Soldier",
  "shang-chi": "Shang-Chi and the Legend of the Ten Rings",
  "multiverse-madness": "Doctor Strange in the Multiverse of Madness",
  "she-hulk": "She-Hulk: Attorney at Law",
  "holiday-special": "The Guardians of the Galaxy Holiday Special",
  "guardians-3": "Guardians of the Galaxy Vol. 3",
  "friendly-spider-1": "Your Friendly Neighborhood Spider-Man · S1",
  "brave-new-world": "Captain America: Brave New World",
  "fantastic-four": "The Fantastic Four: First Steps",
  "friendly-spider-2": "Your Friendly Neighborhood Spider-Man · S2",
};

export function titleForLocale(item: Pick<MCUItem, "id" | "title">, locale: Locale) {
  if (locale === "en-US") {
    const mapped = ENGLISH_TITLE_BY_ID[item.id];
    if (mapped) return mapped;
    return item.title.replace(/ · T(\d+)$/, " · S$1");
  }
  return item.title;
}

export function titleSearchText(item: Pick<MCUItem, "id" | "title">) {
  return `${item.title} ${ENGLISH_TITLE_BY_ID[item.id] || ""}`;
}
