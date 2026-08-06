export type MCUItem = {
  id: string;
  title: string;
  date: string;
  release?: number;
  lane?: string;
  phase?: string;
  saga?: string;
  type: "movie" | "series" | "animation" | "special";
  wiki: string;
  upcoming?: boolean;
};

export const MCU_ITEMS: MCUItem[] = [
  {
    "id": "blade-1998",
    "title": "Blade",
    "date": "1998",
    "release": 1998.64,
    "lane": "other",
    "type": "movie",
    "wiki": "Blade (1998 film)"
  },
  {
    "id": "xmen-2000",
    "title": "X-Men",
    "date": "2000",
    "release": 2000.54,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men (film)"
  },
  {
    "id": "blade-2",
    "title": "Blade II",
    "date": "2002",
    "release": 2002.23,
    "lane": "other",
    "type": "movie",
    "wiki": "Blade II"
  },
  {
    "id": "spiderman-raimi-1",
    "title": "Spider-Man",
    "date": "2002",
    "release": 2002.34,
    "lane": "spider",
    "type": "movie",
    "wiki": "Spider-Man (2002 film)"
  },
  {
    "id": "daredevil-2003",
    "title": "Daredevil",
    "date": "2003",
    "release": 2003.12,
    "lane": "other",
    "type": "movie",
    "wiki": "Daredevil (film)"
  },
  {
    "id": "x2",
    "title": "X2: X-Men United",
    "date": "2003",
    "release": 2003.34,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X2 (film)"
  },
  {
    "id": "hulk-2003",
    "title": "Hulk",
    "date": "2003",
    "release": 2003.47,
    "lane": "other",
    "type": "movie",
    "wiki": "Hulk (film)"
  },
  {
    "id": "punisher-2004",
    "title": "The Punisher",
    "date": "2004",
    "release": 2004.29,
    "lane": "other",
    "type": "movie",
    "wiki": "The Punisher (2004 film)"
  },
  {
    "id": "spiderman-raimi-2",
    "title": "Spider-Man 2",
    "date": "2004",
    "release": 2004.49,
    "lane": "spider",
    "type": "movie",
    "wiki": "Spider-Man 2"
  },
  {
    "id": "blade-trinity",
    "title": "Blade: Trinity",
    "date": "2004",
    "release": 2004.94,
    "lane": "other",
    "type": "movie",
    "wiki": "Blade: Trinity"
  },
  {
    "id": "elektra-2005",
    "title": "Elektra",
    "date": "2005",
    "release": 2005.04,
    "lane": "other",
    "type": "movie",
    "wiki": "Elektra (2005 film)"
  },
  {
    "id": "fantastic-four-2005",
    "title": "Fantastic Four",
    "date": "2005",
    "release": 2005.52,
    "lane": "fantastic",
    "type": "movie",
    "wiki": "Fantastic Four (2005 film)"
  },
  {
    "id": "xmen-last-stand",
    "title": "X-Men: The Last Stand",
    "date": "2006",
    "release": 2006.4,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men: The Last Stand"
  },
  {
    "id": "ghost-rider",
    "title": "Ghost Rider",
    "date": "2007",
    "release": 2007.12,
    "lane": "other",
    "type": "movie",
    "wiki": "Ghost Rider (2007 film)"
  },
  {
    "id": "spiderman-raimi-3",
    "title": "Spider-Man 3",
    "date": "2007",
    "release": 2007.34,
    "lane": "spider",
    "type": "movie",
    "wiki": "Spider-Man 3"
  },
  {
    "id": "silver-surfer",
    "title": "Fantastic Four: Rise of the Silver Surfer",
    "date": "2007",
    "release": 2007.46,
    "lane": "fantastic",
    "type": "movie",
    "wiki": "Fantastic Four: Rise of the Silver Surfer"
  },
  {
    "id": "punisher-war-zone",
    "title": "Punisher: War Zone",
    "date": "2008",
    "release": 2008.93,
    "lane": "other",
    "type": "movie",
    "wiki": "Punisher: War Zone"
  },
  {
    "id": "wolverine-origins",
    "title": "X-Men Origins: Wolverine",
    "date": "2009",
    "release": 2009.34,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men Origins: Wolverine"
  },
  {
    "id": "xmen-first-class",
    "title": "X-Men: First Class",
    "date": "2011",
    "release": 2011.42,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men: First Class"
  },
  {
    "id": "ghost-rider-2",
    "title": "Ghost Rider: Spirit of Vengeance",
    "date": "2012",
    "release": 2012.12,
    "lane": "other",
    "type": "movie",
    "wiki": "Ghost Rider: Spirit of Vengeance"
  },
  {
    "id": "amazing-spiderman",
    "title": "The Amazing Spider-Man",
    "date": "2012",
    "release": 2012.5,
    "lane": "spider",
    "type": "movie",
    "wiki": "The Amazing Spider-Man (film)"
  },
  {
    "id": "the-wolverine",
    "title": "The Wolverine",
    "date": "2013",
    "release": 2013.56,
    "lane": "xmen",
    "type": "movie",
    "wiki": "The Wolverine (film)"
  },
  {
    "id": "amazing-spiderman-2",
    "title": "The Amazing Spider-Man 2",
    "date": "2014",
    "release": 2014.34,
    "lane": "spider",
    "type": "movie",
    "wiki": "The Amazing Spider-Man 2"
  },
  {
    "id": "days-future-past",
    "title": "X-Men: Days of Future Past",
    "date": "2014",
    "release": 2014.39,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men: Days of Future Past"
  },
  {
    "id": "fantastic-four-2015",
    "title": "Fantastic Four",
    "date": "2015",
    "release": 2015.6,
    "lane": "fantastic",
    "type": "movie",
    "wiki": "Fantastic Four (2015 film)"
  },
  {
    "id": "deadpool",
    "title": "Deadpool",
    "date": "2016",
    "release": 2016.12,
    "lane": "xmen",
    "type": "movie",
    "wiki": "Deadpool (film)"
  },
  {
    "id": "xmen-apocalypse",
    "title": "X-Men: Apocalypse",
    "date": "2016",
    "release": 2016.4,
    "lane": "xmen",
    "type": "movie",
    "wiki": "X-Men: Apocalypse"
  },
  {
    "id": "logan",
    "title": "Logan",
    "date": "2017",
    "release": 2017.17,
    "lane": "xmen",
    "type": "movie",
    "wiki": "Logan (film)"
  },
  {
    "id": "deadpool-2",
    "title": "Deadpool 2",
    "date": "2018",
    "release": 2018.37,
    "lane": "xmen",
    "type": "movie",
    "wiki": "Deadpool 2"
  },
  {
    "id": "venom",
    "title": "Venom",
    "date": "2018",
    "release": 2018.76,
    "lane": "sony",
    "type": "movie",
    "wiki": "Venom (2018 film)"
  },
  {
    "id": "spider-verse",
    "title": "Spider-Man: Into the Spider-Verse",
    "date": "2018",
    "release": 2018.95,
    "lane": "animation",
    "type": "animation",
    "wiki": "Spider-Man: Into the Spider-Verse"
  },
  {
    "id": "dark-phoenix",
    "title": "Dark Phoenix",
    "date": "2019",
    "release": 2019.43,
    "lane": "xmen",
    "type": "movie",
    "wiki": "Dark Phoenix (film)"
  },
  {
    "id": "new-mutants",
    "title": "The New Mutants",
    "date": "2020",
    "release": 2020.66,
    "lane": "xmen",
    "type": "movie",
    "wiki": "The New Mutants (film)"
  },
  {
    "id": "venom-carnage",
    "title": "Venom: Let There Be Carnage",
    "date": "2021",
    "release": 2021.75,
    "lane": "sony",
    "type": "movie",
    "wiki": "Venom: Let There Be Carnage"
  },
  {
    "id": "morbius",
    "title": "Morbius",
    "date": "2022",
    "release": 2022.25,
    "lane": "sony",
    "type": "movie",
    "wiki": "Morbius (film)"
  },
  {
    "id": "across-spider-verse",
    "title": "Spider-Man: Across the Spider-Verse",
    "date": "2023",
    "release": 2023.42,
    "lane": "animation",
    "type": "animation",
    "wiki": "Spider-Man: Across the Spider-Verse"
  },
  {
    "id": "madame-web",
    "title": "Madame Web",
    "date": "2024",
    "release": 2024.12,
    "lane": "sony",
    "type": "movie",
    "wiki": "Madame Web (film)"
  },
  {
    "id": "venom-last-dance",
    "title": "Venom: The Last Dance",
    "date": "2024",
    "release": 2024.82,
    "lane": "sony",
    "type": "movie",
    "wiki": "Venom: The Last Dance"
  },
  {
    "id": "kraven",
    "title": "Kraven the Hunter",
    "date": "2024",
    "release": 2024.95,
    "lane": "sony",
    "type": "movie",
    "wiki": "Kraven the Hunter (film)"
  },
  {
    "id": "beyond-spider-verse",
    "title": "Spider-Man: Beyond the Spider-Verse",
    "date": "2027",
    "release": 2027.46,
    "lane": "animation",
    "type": "animation",
    "wiki": "Spider-Man: Beyond the Spider-Verse",
    "upcoming": true
  },
  {
    "id": "iron-man",
    "title": "Iron Man",
    "date": "2008",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Iron Man (2008 film)"
  },
  {
    "id": "hulk",
    "title": "El increíble Hulk",
    "date": "2008",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "The Incredible Hulk (film)"
  },
  {
    "id": "iron-man-2",
    "title": "Iron Man 2",
    "date": "2010",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Iron Man 2"
  },
  {
    "id": "thor",
    "title": "Thor",
    "date": "2011",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Thor (film)"
  },
  {
    "id": "cap-first-avenger",
    "title": "Capitán América: El primer vengador",
    "date": "2011",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Captain America: The First Avenger"
  },
  {
    "id": "avengers",
    "title": "The Avengers",
    "date": "2012",
    "phase": "Fase 1",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "The Avengers (2012 film)"
  },
  {
    "id": "iron-man-3",
    "title": "Iron Man 3",
    "date": "2013",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Iron Man 3"
  },
  {
    "id": "thor-dark-world",
    "title": "Thor: Un mundo oscuro",
    "date": "2013",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Thor: The Dark World"
  },
  {
    "id": "winter-soldier",
    "title": "Capitán América: El Soldado del Invierno",
    "date": "2014",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Captain America: The Winter Soldier"
  },
  {
    "id": "guardians",
    "title": "Guardianes de la Galaxia",
    "date": "2014",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Guardians of the Galaxy (film)"
  },
  {
    "id": "ultron",
    "title": "Avengers: Era de Ultrón",
    "date": "2015",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Avengers: Age of Ultron"
  },
  {
    "id": "ant-man",
    "title": "Ant-Man",
    "date": "2015",
    "phase": "Fase 2",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Ant-Man (film)"
  },
  {
    "id": "civil-war",
    "title": "Capitán América: Civil War",
    "date": "2016",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Captain America: Civil War"
  },
  {
    "id": "doctor-strange",
    "title": "Doctor Strange",
    "date": "2016",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Doctor Strange (2016 film)"
  },
  {
    "id": "guardians-2",
    "title": "Guardianes de la Galaxia Vol. 2",
    "date": "2017",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Guardians of the Galaxy Vol. 2"
  },
  {
    "id": "homecoming",
    "title": "Spider-Man: Homecoming",
    "date": "2017",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Spider-Man: Homecoming"
  },
  {
    "id": "ragnarok",
    "title": "Thor: Ragnarok",
    "date": "2017",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Thor: Ragnarok"
  },
  {
    "id": "black-panther",
    "title": "Black Panther",
    "date": "2018",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Black Panther (film)"
  },
  {
    "id": "infinity-war",
    "title": "Avengers: Infinity War",
    "date": "2018",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Avengers: Infinity War"
  },
  {
    "id": "antman-wasp",
    "title": "Ant-Man and the Wasp",
    "date": "2018",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Ant-Man and the Wasp"
  },
  {
    "id": "captain-marvel",
    "title": "Capitana Marvel",
    "date": "2019",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Captain Marvel (film)"
  },
  {
    "id": "endgame",
    "title": "Avengers: Endgame",
    "date": "2019",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Avengers: Endgame"
  },
  {
    "id": "far-from-home",
    "title": "Spider-Man: Lejos de casa",
    "date": "2019",
    "phase": "Fase 3",
    "saga": "Saga del Infinito",
    "type": "movie",
    "wiki": "Spider-Man: Far From Home"
  },
  {
    "id": "wandavision",
    "title": "WandaVision",
    "date": "ene 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "WandaVision"
  },
  {
    "id": "falcon-winter",
    "title": "Falcon y el Soldado del Invierno",
    "date": "mar 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "The Falcon and the Winter Soldier"
  },
  {
    "id": "loki-1",
    "title": "Loki · T1",
    "date": "jun 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Loki season 1"
  },
  {
    "id": "black-widow",
    "title": "Black Widow",
    "date": "jul 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Black Widow (2021 film)"
  },
  {
    "id": "what-if-1",
    "title": "What If...? · T1",
    "date": "ago 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "What If...? (TV series)"
  },
  {
    "id": "shang-chi",
    "title": "Shang-Chi y la leyenda de los Diez Anillos",
    "date": "sep 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Shang-Chi and the Legend of the Ten Rings"
  },
  {
    "id": "eternals",
    "title": "Eternals",
    "date": "nov 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Eternals (film)"
  },
  {
    "id": "hawkeye",
    "title": "Hawkeye",
    "date": "nov 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Hawkeye (2021 TV series)"
  },
  {
    "id": "no-way-home",
    "title": "Spider-Man: No Way Home",
    "date": "dic 2021",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Spider-Man: No Way Home"
  },
  {
    "id": "moon-knight",
    "title": "Moon Knight",
    "date": "mar 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Moon Knight (miniseries)"
  },
  {
    "id": "multiverse-madness",
    "title": "Doctor Strange en el multiverso de la locura",
    "date": "may 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Doctor Strange in the Multiverse of Madness"
  },
  {
    "id": "ms-marvel",
    "title": "Ms. Marvel",
    "date": "jun 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Ms. Marvel (miniseries)"
  },
  {
    "id": "love-thunder",
    "title": "Thor: Love and Thunder",
    "date": "jul 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Thor: Love and Thunder"
  },
  {
    "id": "she-hulk",
    "title": "She-Hulk: Defensora de héroes",
    "date": "ago 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "She-Hulk: Attorney at Law"
  },
  {
    "id": "werewolf",
    "title": "Werewolf by Night",
    "date": "oct 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "special",
    "wiki": "Werewolf by Night (TV special)"
  },
  {
    "id": "wakanda-forever",
    "title": "Black Panther: Wakanda Forever",
    "date": "nov 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Black Panther: Wakanda Forever"
  },
  {
    "id": "holiday-special",
    "title": "Especial navideño de Guardianes",
    "date": "nov 2022",
    "phase": "Fase 4",
    "saga": "Saga del Multiverso",
    "type": "special",
    "wiki": "The Guardians of the Galaxy Holiday Special"
  },
  {
    "id": "quantumania",
    "title": "Ant-Man and the Wasp: Quantumania",
    "date": "feb 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Ant-Man and the Wasp: Quantumania"
  },
  {
    "id": "guardians-3",
    "title": "Guardianes de la Galaxia Vol. 3",
    "date": "may 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Guardians of the Galaxy Vol. 3"
  },
  {
    "id": "secret-invasion",
    "title": "Secret Invasion",
    "date": "jun 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Secret Invasion (miniseries)"
  },
  {
    "id": "groot-2",
    "title": "I Am Groot · T2",
    "date": "sep 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "I Am Groot"
  },
  {
    "id": "loki-2",
    "title": "Loki · T2",
    "date": "oct 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Loki season 2"
  },
  {
    "id": "the-marvels",
    "title": "The Marvels",
    "date": "nov 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "The Marvels"
  },
  {
    "id": "what-if-2",
    "title": "What If...? · T2",
    "date": "dic 2023",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "What If...? (TV series)"
  },
  {
    "id": "echo",
    "title": "Echo",
    "date": "ene 2024",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Echo (miniseries)"
  },
  {
    "id": "xmen97-1",
    "title": "X-Men '97 · T1",
    "date": "mar 2024",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "X-Men '97 season 1"
  },
  {
    "id": "deadpool-wolverine",
    "title": "Deadpool & Wolverine",
    "date": "jul 2024",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Deadpool & Wolverine"
  },
  {
    "id": "agatha",
    "title": "Agatha All Along",
    "date": "sep 2024",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Agatha All Along (miniseries)"
  },
  {
    "id": "what-if-3",
    "title": "What If...? · T3",
    "date": "dic 2024",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "What If...? (TV series)"
  },
  {
    "id": "friendly-spider-1",
    "title": "Tu amigo y vecino Spider-Man · T1",
    "date": "ene 2025",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "Your Friendly Neighborhood Spider-Man season 1"
  },
  {
    "id": "brave-new-world",
    "title": "Capitán América: Un nuevo mundo",
    "date": "feb 2025",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Captain America: Brave New World"
  },
  {
    "id": "daredevil-ba-1",
    "title": "Daredevil: Born Again · T1",
    "date": "mar 2025",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Daredevil: Born Again season 1"
  },
  {
    "id": "thunderbolts",
    "title": "Thunderbolts*",
    "date": "may 2025",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Thunderbolts*"
  },
  {
    "id": "ironheart",
    "title": "Ironheart",
    "date": "jun 2025",
    "phase": "Fase 5",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Ironheart (miniseries)"
  },
  {
    "id": "fantastic-four",
    "title": "Los 4 Fantásticos: Primeros pasos",
    "date": "jul 2025",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "The Fantastic Four: First Steps"
  },
  {
    "id": "eyes-wakanda",
    "title": "Eyes of Wakanda",
    "date": "ago 2025",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "Eyes of Wakanda"
  },
  {
    "id": "marvel-zombies",
    "title": "Marvel Zombies",
    "date": "sep 2025",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "Marvel Zombies (miniseries)"
  },
  {
    "id": "wonder-man-1",
    "title": "Wonder Man · T1",
    "date": "ene 2026",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Wonder Man (TV series)"
  },
  {
    "id": "daredevil-ba-2",
    "title": "Daredevil: Born Again · T2",
    "date": "mar 2026",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Daredevil: Born Again season 2"
  },
  {
    "id": "punisher-special",
    "title": "The Punisher: One Last Kill",
    "date": "may 2026",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "special",
    "wiki": "The Punisher: One Last Kill"
  },
  {
    "id": "xmen97-2",
    "title": "X-Men '97 · T2",
    "date": "jul 2026",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "X-Men '97 season 2"
  },
  {
    "id": "brand-new-day",
    "title": "Spider-Man: Brand New Day",
    "date": "jul 2026",
    "phase": "Fase 6",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Spider-Man: Brand New Day"
  },
  {
    "id": "friendly-spider-2",
    "title": "Tu amigo y vecino Spider-Man · T2",
    "date": "otoño 2026",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "animation",
    "wiki": "Your Friendly Neighborhood Spider-Man season 1",
    "upcoming": true
  },
  {
    "id": "visionquest",
    "title": "VisionQuest",
    "date": "14 oct 2026",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "VisionQuest",
    "upcoming": true
  },
  {
    "id": "doomsday",
    "title": "Avengers: Doomsday",
    "date": "18 dic 2026",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Avengers: Doomsday",
    "upcoming": true
  },
  {
    "id": "daredevil-ba-3",
    "title": "Daredevil: Born Again · T3",
    "date": "Sin fecha",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Daredevil: Born Again season 2",
    "upcoming": true
  },
  {
    "id": "wonder-man-2",
    "title": "Wonder Man · T2",
    "date": "Sin fecha",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "series",
    "wiki": "Wonder Man (TV series)",
    "upcoming": true
  },
  {
    "id": "secret-wars",
    "title": "Avengers: Secret Wars",
    "date": "17 dic 2027",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Avengers: Secret Wars",
    "upcoming": true
  },
  {
    "id": "blade",
    "title": "Blade",
    "date": "Sin fecha",
    "phase": "Próximamente",
    "saga": "Saga del Multiverso",
    "type": "movie",
    "wiki": "Blade (upcoming film)",
    "upcoming": true
  }
];

// Datos generados: revisar o editar manualmente si cambia el número de capítulos.
export const EPISODE_COUNTS: Record<string, number> = {
  "wandavision": 9,
  "falcon-winter": 6,
  "loki-1": 6,
  "what-if-1": 9,
  "hawkeye": 6,
  "moon-knight": 6,
  "ms-marvel": 6,
  "she-hulk": 9,
  "secret-invasion": 6,
  "groot-2": 5,
  "loki-2": 6,
  "what-if-2": 9,
  "echo": 5,
  "xmen97-1": 10,
  "agatha": 9,
  "what-if-3": 8,
  "friendly-spider-1": 10,
  "daredevil-ba-1": 9,
  "ironheart": 6,
  "eyes-wakanda": 4,
  "marvel-zombies": 4,
  "wonder-man-1": 8,
  "daredevil-ba-2": 8,
  "xmen97-2": 9
};

export const POSTER_BY_WIKI: Record<string, string> = {
  "Blade (1998 film)": "/posters/66b794a711d5.webp",
  "X-Men (film)": "/posters/097f9759f261.webp",
  "Blade II": "/posters/ed3685288f49.webp",
  "Spider-Man (2002 film)": "/posters/b9f7badc56c0.webp",
  "Daredevil (film)": "/posters/4f3052f2ba1f.webp",
  "X2 (film)": "/posters/a5f58bef6df7.webp",
  "Hulk (film)": "/posters/1a5150a80f99.webp",
  "The Punisher (2004 film)": "/posters/cecb15e8e214.webp",
  "Spider-Man 2": "/posters/be2856caf955.webp",
  "Blade: Trinity": "/posters/ef9f08594c47.webp",
  "Elektra (2005 film)": "/posters/e9862110a853.webp",
  "Fantastic Four (2005 film)": "/posters/ceddc19edbfc.webp",
  "X-Men: The Last Stand": "/posters/4f487fe7ae4b.webp",
  "Ghost Rider (2007 film)": "/posters/d210c9f3980e.webp",
  "Spider-Man 3": "/posters/970d5a434821.webp",
  "Fantastic Four: Rise of the Silver Surfer": "/posters/7868b1d8585e.webp",
  "Punisher: War Zone": "/posters/3cfad7d5a7b7.webp",
  "X-Men Origins: Wolverine": "/posters/de7d99ac0bd5.webp",
  "X-Men: First Class": "/posters/3aa4e093a294.webp",
  "Ghost Rider: Spirit of Vengeance": "/posters/18c05c2cd622.webp",
  "The Amazing Spider-Man (film)": "/posters/99aa16de8515.webp",
  "The Wolverine (film)": "/posters/6497ad59feba.webp",
  "The Amazing Spider-Man 2": "/posters/18a7e8222f09.webp",
  "X-Men: Days of Future Past": "/posters/399a6cf924d9.webp",
  "Fantastic Four (2015 film)": "/posters/e6da91db6898.webp",
  "Deadpool (film)": "/posters/2d36211caec8.webp",
  "X-Men: Apocalypse": "/posters/6d9ff02fb007.webp",
  "Logan (film)": "/posters/0a29b47d99c3.webp",
  "Deadpool 2": "/posters/e87d3d19f20a.webp",
  "Venom (2018 film)": "/posters/004a796b3221.webp",
  "Spider-Man: Into the Spider-Verse": "/posters/8d9a0ae87a1f.webp",
  "Dark Phoenix (film)": "/posters/8dbe512cf6a4.webp",
  "The New Mutants (film)": "/posters/c2844f5ed1fc.webp",
  "Venom: Let There Be Carnage": "/posters/3bbe6f68f34a.webp",
  "Morbius (film)": "/posters/8a479d252d44.webp",
  "Spider-Man: Across the Spider-Verse": "/posters/7f3deaf1142e.webp",
  "Madame Web (film)": "/posters/153f5b7ad98d.webp",
  "Venom: The Last Dance": "/posters/abb56d2b33ec.webp",
  "Kraven the Hunter (film)": "/posters/ecd31830c5db.webp",
  "Spider-Man: Beyond the Spider-Verse": "/posters/b8b8ac9e1fd1.webp",
  "Iron Man (2008 film)": "/posters/f4f1b3f69b44.webp",
  "The Incredible Hulk (film)": "/posters/cc83da40a5cd.webp",
  "Iron Man 2": "/posters/dac93f9e1356.webp",
  "Thor (film)": "/posters/cb48ea102124.webp",
  "Captain America: The First Avenger": "/posters/0668915f7595.webp",
  "The Avengers (2012 film)": "/posters/9930bf411506.webp",
  "Iron Man 3": "/posters/657b12d86b83.webp",
  "Thor: The Dark World": "/posters/738bb985574f.webp",
  "Captain America: The Winter Soldier": "/posters/69938f424eeb.webp",
  "Guardians of the Galaxy (film)": "/posters/d4d7fc8a8a68.webp",
  "Avengers: Age of Ultron": "/posters/4d17ff42b0df.webp",
  "Ant-Man (film)": "/posters/165da31a6076.webp",
  "Captain America: Civil War": "/posters/01c72904bb91.webp",
  "Doctor Strange (2016 film)": "/posters/eea9c43c7b5b.webp",
  "Guardians of the Galaxy Vol. 2": "/posters/867f90b7c372.webp",
  "Spider-Man: Homecoming": "/posters/3191514214e8.webp",
  "Thor: Ragnarok": "/posters/f87ed80efdb9.webp",
  "Black Panther (film)": "/posters/96e0bf8d8d89.webp",
  "Avengers: Infinity War": "/posters/4486202dbaa5.webp",
  "Ant-Man and the Wasp": "/posters/0413e2b157bc.webp",
  "Captain Marvel (film)": "/posters/7c07ef4b491c.webp",
  "Avengers: Endgame": "/posters/71076eb1305a.webp",
  "Spider-Man: Far From Home": "/posters/fc2a1a4d5140.webp",
  "WandaVision": "/posters/2512e3fc5d1e.webp",
  "The Falcon and the Winter Soldier": "/posters/904e1ad54de5.webp",
  "Loki season 1": "/posters/4dd754bfa81b.webp",
  "Black Widow (2021 film)": "/posters/b9bcb86bd9dd.webp",
  "Shang-Chi and the Legend of the Ten Rings": "/posters/aac5a926058e.webp",
  "Eternals (film)": "/posters/ad176f87537e.webp",
  "Hawkeye (2021 TV series)": "/posters/946835e86e4c.webp",
  "Spider-Man: No Way Home": "/posters/aa22b7c4bb44.webp",
  "Moon Knight (miniseries)": "/posters/53d7a403b196.webp",
  "Doctor Strange in the Multiverse of Madness": "/posters/4c85163abf8c.webp",
  "Ms. Marvel (miniseries)": "/posters/e54e1f447741.webp",
  "Thor: Love and Thunder": "/posters/846816f1ef3d.webp",
  "She-Hulk: Attorney at Law": "/posters/514270cfca4c.webp",
  "Werewolf by Night (TV special)": "/posters/4e9fd0f0be00.webp",
  "Black Panther: Wakanda Forever": "/posters/45360f6a62be.webp",
  "The Guardians of the Galaxy Holiday Special": "/posters/7159e8d5d4a8.webp",
  "Ant-Man and the Wasp: Quantumania": "/posters/1a07e32badae.webp",
  "Guardians of the Galaxy Vol. 3": "/posters/801f557f6e6c.webp",
  "Secret Invasion (miniseries)": "/posters/344a8b9d2530.webp",
  "I Am Groot": "/posters/5cfc364d06c4.webp",
  "Loki season 2": "/posters/2c31c5ed5fc0.webp",
  "The Marvels": "/posters/477f98d2743c.webp",
  "Echo (miniseries)": "/posters/93e2fa4889de.webp",
  "X-Men '97 season 1": "/posters/0a2fe02d5768.webp",
  "Deadpool & Wolverine": "/posters/e507f4a5f43b.webp",
  "Agatha All Along (miniseries)": "/posters/624c1432c62c.webp",
  "Your Friendly Neighborhood Spider-Man season 1": "/posters/fe70c1b453e9.webp",
  "Captain America: Brave New World": "/posters/3fd85b4519ec.webp",
  "Daredevil: Born Again season 1": "/posters/f162d09623a6.webp",
  "Thunderbolts*": "/posters/cb32fd55df6e.webp",
  "Ironheart (miniseries)": "/posters/e97d5daa2c36.webp",
  "The Fantastic Four: First Steps": "/posters/b62185674033.webp",
  "Eyes of Wakanda": "/posters/f322663021f5.webp",
  "Marvel Zombies (miniseries)": "/posters/4255abd82802.webp",
  "Daredevil: Born Again season 2": "/posters/a65010856db7.webp",
  "The Punisher: One Last Kill": "/posters/fb82c928c9b1.webp",
  "X-Men '97 season 2": "/posters/a95efe1992d9.webp",
  "Spider-Man: Brand New Day": "/posters/d7eeddc59bd4.webp",
  "VisionQuest": "/posters/718ed81d36d5.webp",
  "Avengers: Doomsday": "/posters/c1c3678ffbc2.webp"
};
