import { MCU_ITEMS } from "./mcu-data";

export type ConnectionKind = "essential" | "recommended" | "reference" | "variant" | "shared" | "time-travel";
export type NarrativeLink = { prerequisite: string; kind: ConnectionKind; reason: string };

const link = (prerequisite: string, kind: ConnectionKind, reason: string): NarrativeLink => ({ prerequisite, kind, reason });

const CURATED_LINKS: Record<string, NarrativeLink[]> = {
  "blade-2": [link("blade-1998", "essential", "Continúa directamente la historia de Blade.")],
  "blade-trinity": [link("blade-2", "essential", "Cierra la trilogía iniciada en Blade.")],
  "x2": [link("xmen-2000", "essential", "Continúa la formación y el conflicto de los X-Men.")],
  "xmen-last-stand": [link("x2", "essential", "Resuelve los conflictos planteados en X2.")],
  "wolverine-origins": [link("xmen-2000", "recommended", "Amplía el pasado de Wolverine presentado en X-Men.")],
  "the-wolverine": [link("xmen-last-stand", "essential", "Parte de las consecuencias emocionales de The Last Stand.")],
  "days-future-past": [link("xmen-last-stand", "essential", "La línea futura nace de la trilogía original."), link("xmen-first-class", "essential", "La línea del pasado continúa el reparto de First Class."), link("the-wolverine", "recommended", "Su escena final prepara esta convergencia.")],
  "xmen-apocalypse": [link("days-future-past", "essential", "Continúa la línea temporal modificada."), link("xmen-first-class", "recommended", "Presenta la generación que protagoniza esta etapa.")],
  "dark-phoenix": [link("xmen-apocalypse", "essential", "Continúa con la misma generación de mutantes.")],
  "deadpool-2": [link("deadpool", "essential", "Secuela directa de Deadpool.")],
  "new-mutants": [link("xmen-2000", "shared", "Comparte el universo cinematográfico mutante de Fox.")],
  "silver-surfer": [link("fantastic-four-2005", "essential", "Secuela directa de Fantastic Four.")],
  "spiderman-raimi-2": [link("spiderman-raimi-1", "essential", "Continúa la vida de Peter Parker y sus relaciones.")],
  "spiderman-raimi-3": [link("spiderman-raimi-2", "essential", "Cierra la trilogía de Tobey Maguire.")],
  "amazing-spiderman-2": [link("amazing-spiderman", "essential", "Continúa la historia del Spider-Man de Andrew Garfield.")],
  "venom-carnage": [link("venom", "essential", "Continúa la relación entre Eddie Brock y Venom.")],
  "venom-last-dance": [link("venom-carnage", "essential", "Cierra la trilogía de Venom."), link("no-way-home", "reference", "Retoma la consecuencia multiversal de la escena de créditos.")],
  "morbius": [link("homecoming", "variant", "Incluye una variante desplazada de Vulture.")],
  "spider-verse": [],
  "across-spider-verse": [link("spider-verse", "essential", "Secuela directa de Into the Spider-Verse.")],
  "beyond-spider-verse": [link("across-spider-verse", "essential", "Continúa inmediatamente el final de Across the Spider-Verse.")],

  "xmen-evolution": [link("xmen-animated-series", "variant", "Reimagina a los mutantes en otro universo animado.")],
  "xmen97-1": [link("xmen-animated-series", "essential", "Es la continuación directa de la serie animada de 1992.")],
  "xmen97-2": [link("xmen97-1", "essential", "Continúa los acontecimientos de la primera temporada.")],
  "spectacular-spiderman": [link("spiderman-animated-series", "variant", "Nueva interpretación animada del mismo héroe.")],
  "ultimate-spiderman-series": [link("spectacular-spiderman", "variant", "Otra versión animada independiente de Peter Parker.")],
  "marvel-spiderman-2017": [link("ultimate-spiderman-series", "variant", "Reinicio animado posterior de Spider-Man.")],
  "friendly-spider-1": [link("civil-war", "variant", "Imagina una línea alternativa para el Spider-Man del UCM.")],
  "ultimate-avengers-2": [link("ultimate-avengers", "essential", "Secuela directa de Ultimate Avengers.")],
  "avengers-assemble-series": [link("avengers-earths-mightiest-heroes", "variant", "Otra continuidad animada centrada en los Avengers.")],
  "guardians-galaxy-animated": [link("avengers-assemble-series", "shared", "Comparte el bloque televisivo animado de Marvel.")],
  "what-if-2": [link("what-if-1", "essential", "Continúa el viaje del Vigilante por realidades alternativas.")],
  "what-if-3": [link("what-if-2", "essential", "Temporada final de las historias del Vigilante.")],
  "marvel-zombies": [link("what-if-1", "essential", "Expande la realidad zombi presentada en What If...?")],

  "daredevil-s2": [link("daredevil-s1", "essential", "Continúa la guerra de Matt Murdock por Hell's Kitchen.")],
  "luke-cage-s1": [link("jessica-jones-s1", "recommended", "Luke Cage es presentado previamente en Jessica Jones.")],
  "defenders-miniseries": [link("daredevil-s2", "essential", "La Mano y Elektra conducen directamente a The Defenders."), link("jessica-jones-s1", "essential", "Presenta a Jessica antes de la alianza."), link("luke-cage-s1", "essential", "Presenta a Luke antes de la alianza."), link("iron-fist-s1", "essential", "Explica K'un-Lun y el conflicto con La Mano.")],
  "punisher-s1": [link("daredevil-s2", "essential", "Frank Castle debuta y define su conflicto en Daredevil.")],
  "jessica-jones-s2": [link("jessica-jones-s1", "essential", "Secuela directa de la primera temporada."), link("defenders-miniseries", "recommended", "Mantiene la continuidad de los Defensores.")],
  "luke-cage-s2": [link("luke-cage-s1", "essential", "Continúa la defensa de Harlem."), link("defenders-miniseries", "recommended", "Ocurre después de la alianza de los Defensores.")],
  "iron-fist-s2": [link("iron-fist-s1", "essential", "Continúa el conflicto de Danny Rand."), link("defenders-miniseries", "essential", "Parte de las consecuencias de The Defenders.")],
  "daredevil-s3": [link("defenders-miniseries", "essential", "Explica el estado de Matt Murdock al comenzar la temporada."), link("daredevil-s2", "recommended", "Mantiene los conflictos personales de Matt y Fisk.")],
  "punisher-s2": [link("punisher-s1", "essential", "Continúa la historia independiente de Frank Castle.")],
  "jessica-jones-s3": [link("jessica-jones-s2", "essential", "Cierra la historia de Jessica Jones.")],

  "iron-man-2": [link("iron-man", "essential", "Continúa el nacimiento público de Iron Man.")],
  "avengers": [link("iron-man-2", "recommended", "Establece a Tony y la Iniciativa Avengers."), link("thor", "essential", "Presenta a Loki y el conflicto asgardiano."), link("cap-first-avenger", "essential", "Presenta a Steve Rogers y el Teseracto."), link("hulk", "recommended", "Presenta a Bruce Banner y al Hulk de este universo.")],
  "iron-man-3": [link("avengers", "essential", "Tony afronta las consecuencias de la batalla de Nueva York."), link("iron-man-2", "recommended", "Continúa su trilogía personal.")],
  "thor-dark-world": [link("thor", "essential", "Secuela directa de Thor."), link("avengers", "recommended", "Ocurre después de la batalla de Nueva York.")],
  "winter-soldier": [link("cap-first-avenger", "essential", "Continúa la historia de Steve y Bucky."), link("avengers", "recommended", "Explica la posición de Steve dentro de S.H.I.E.L.D.")],
  "ultron": [link("avengers", "essential", "Reúne nuevamente al equipo."), link("winter-soldier", "recommended", "S.H.I.E.L.D. y HYDRA cambian el contexto del equipo."), link("iron-man-3", "recommended", "Continúa la evolución de Tony Stark.")],
  "civil-war": [link("winter-soldier", "essential", "Continúa el conflicto de Steve y Bucky."), link("ultron", "essential", "Los daños de Sokovia originan los Acuerdos."), link("ant-man", "recommended", "Presenta a Scott Lang antes de unirse al conflicto.")],
  "guardians-2": [link("guardians", "essential", "Secuela directa de Guardianes de la Galaxia.")],
  "homecoming": [link("civil-war", "essential", "Presenta la entrada de Peter Parker al UCM."), link("iron-man", "recommended", "Explica la relación de Peter con Tony Stark.")],
  "ragnarok": [link("thor-dark-world", "essential", "Continúa la historia de Thor y Loki."), link("ultron", "recommended", "Explica la ausencia de Hulk y el viaje de Thor.")],
  "black-panther": [link("civil-war", "essential", "T'Challa regresa a Wakanda tras la muerte de su padre.")],
  "infinity-war": [link("civil-war", "essential", "Los Avengers siguen divididos cuando llega Thanos."), link("ragnarok", "essential", "Continúa inmediatamente el destino de los asgardianos."), link("guardians-2", "essential", "Presenta al equipo cósmico que enfrenta a Thanos."), link("doctor-strange", "recommended", "Presenta la Gema del Tiempo y a Stephen Strange."), link("black-panther", "recommended", "Establece Wakanda antes de la batalla.")],
  "antman-wasp": [link("ant-man", "essential", "Continúa la historia de Scott, Hope y el Reino Cuántico."), link("civil-war", "essential", "Explica el arresto domiciliario de Scott.")],
  "endgame": [link("infinity-war", "essential", "Continúa directamente después del chasquido de Thanos."), link("antman-wasp", "essential", "El Reino Cuántico hace posible el plan central."), link("captain-marvel", "recommended", "Presenta a Carol Danvers antes de unirse a los Avengers.")],
  "far-from-home": [link("homecoming", "essential", "Continúa la historia del Spider-Man del UCM."), link("endgame", "essential", "Peter afronta las consecuencias de Endgame.")],
  "wandavision": [link("endgame", "essential", "Parte del duelo de Wanda después de Endgame."), link("ultron", "recommended", "Presenta el origen de Wanda y Vision.")],
  "falcon-winter": [link("endgame", "essential", "Continúa el legado del escudo de Steve Rogers."), link("civil-war", "recommended", "Desarrolla la relación entre Sam y Bucky.")],
  "loki-1": [link("endgame", "time-travel", "La serie nace de la fuga temporal de Loki en Endgame."), link("avengers", "essential", "La variante protagonista procede de la batalla de Nueva York.")],
  "black-widow": [link("civil-war", "essential", "La historia comienza con Natasha fugitiva tras Civil War."), link("ultron", "recommended", "Amplía el pasado insinuado de Natasha.")],
  "hawkeye": [link("endgame", "essential", "Clint todavía carga con las pérdidas de Endgame."), link("black-widow", "essential", "La escena de créditos conduce al conflicto con Yelena.")],
  "no-way-home": [link("far-from-home", "essential", "Continúa inmediatamente la revelación de la identidad de Peter."), link("spiderman-raimi-3", "recommended", "Completa el contexto del Peter Parker de Tobey Maguire."), link("amazing-spiderman-2", "recommended", "Completa el contexto del Peter Parker de Andrew Garfield."), link("doctor-strange", "recommended", "Presenta la magia y a Stephen Strange."), link("daredevil-s3", "reference", "Explica quién es Matt Murdock y por qué sus reflejos son extraordinarios.")],
  "multiverse-madness": [link("wandavision", "essential", "Explica el duelo, los hijos y el Darkhold de Wanda."), link("no-way-home", "recommended", "Continúa los problemas causados por hechizos multiversales."), link("doctor-strange", "essential", "Continúa la historia personal de Stephen Strange."), link("what-if-1", "variant", "Aporta contexto para variantes y realidades alternativas.")],
  "love-thunder": [link("ragnarok", "essential", "Continúa la transformación de Thor."), link("endgame", "essential", "Explica por qué Thor viaja con los Guardianes."), link("guardians-2", "recommended", "Presenta al equipo que acompaña a Thor.")],
  "she-hulk": [link("hulk", "recommended", "Presenta a Bruce Banner y el origen de Hulk."), link("daredevil-s3", "reference", "Explica la identidad y habilidades de Matt Murdock."), link("shang-chi", "reference", "Retoma a Abomination después de su aparición en Shang-Chi.")],
  "wakanda-forever": [link("black-panther", "essential", "Continúa Wakanda y el legado de T'Challa."), link("endgame", "recommended", "Establece el mundo después de la batalla final.")],
  "holiday-special": [link("guardians-2", "essential", "Continúa las relaciones de los Guardianes."), link("endgame", "recommended", "Ocurre después de su aventura con Thor.")],
  "quantumania": [link("antman-wasp", "essential", "Continúa la exploración del Reino Cuántico."), link("endgame", "recommended", "Scott y Cassie han cambiado después del Blip."), link("loki-1", "variant", "Aporta contexto para Kang y sus variantes.")],
  "guardians-3": [link("guardians-2", "essential", "Continúa la familia formada por los Guardianes."), link("infinity-war", "essential", "Explica la pérdida de Gamora."), link("endgame", "essential", "Presenta a la nueva variante temporal de Gamora."), link("holiday-special", "recommended", "Actualiza Knowhere y las relaciones del equipo.")],
  "secret-invasion": [link("captain-marvel", "essential", "Presenta a los Skrulls y la promesa de encontrarles un hogar."), link("endgame", "recommended", "Establece el estado posterior del mundo y de Nick Fury.")],
  "loki-2": [link("loki-1", "essential", "Continúa inmediatamente la crisis de la AVT."), link("quantumania", "variant", "Amplía el concepto de variantes de Kang.")],
  "the-marvels": [link("captain-marvel", "essential", "Continúa la historia de Carol Danvers."), link("ms-marvel", "essential", "Presenta a Kamala, su brazalete y su admiración por Carol."), link("wandavision", "recommended", "Presenta la transformación de Monica Rambeau.")],
  "echo": [link("hawkeye", "essential", "Continúa directamente el conflicto de Maya y Kingpin."), link("daredevil-s3", "recommended", "Explica la rivalidad histórica entre Daredevil y Fisk.")],
  "deadpool-wolverine": [link("deadpool-2", "essential", "Continúa la historia y los viajes temporales de Wade."), link("logan", "recommended", "Aporta el contexto emocional de Wolverine."), link("loki-1", "recommended", "Presenta la AVT, las variantes y el Vacío."), link("days-future-past", "time-travel", "Aporta contexto para las líneas temporales mutantes.")],
  "agatha": [link("wandavision", "essential", "Continúa a Agatha y las consecuencias del hechizo de Wanda.")],
  "brave-new-world": [link("falcon-winter", "essential", "Continúa la decisión de Sam de asumir el manto de Captain America."), link("winter-soldier", "recommended", "Aporta el contexto político y el legado de Steve."), link("hulk", "recommended", "Retoma personajes y conflictos de The Incredible Hulk."), link("eternals", "reference", "El Celestial en el océano se vuelve relevante para el conflicto mundial.")],
  "daredevil-ba-1": [link("daredevil-s3", "essential", "Continúa a Matt Murdock y Wilson Fisk después de la serie original."), link("hawkeye", "essential", "Explica el regreso de Kingpin al UCM."), link("echo", "essential", "Actualiza la relación entre Maya, Fisk y Daredevil."), link("no-way-home", "reference", "Muestra la integración de Matt Murdock en la historia de Spider-Man."), link("she-hulk", "recommended", "Actualiza la vida personal y heroica de Matt.")],
  "thunderbolts": [link("black-widow", "essential", "Presenta a Yelena y Red Guardian."), link("falcon-winter", "essential", "Presenta a John Walker y Valentina."), link("hawkeye", "recommended", "Continúa el arco de Yelena después de Natasha."), link("brave-new-world", "shared", "Comparte el nuevo contexto político del UCM.")],
  "ironheart": [link("wakanda-forever", "essential", "Presenta a Riri Williams y su primera armadura.")],
  "daredevil-ba-2": [link("daredevil-ba-1", "essential", "Continúa la confrontación entre Matt Murdock y Mayor Fisk.")],
  "punisher-special": [link("punisher-s2", "essential", "Continúa la historia personal de Frank Castle."), link("daredevil-ba-1", "recommended", "Actualiza el conflicto de los vigilantes en Nueva York.")],
  "brand-new-day": [link("no-way-home", "essential", "Parte de la nueva vida de Peter después del hechizo final."), link("daredevil-ba-1", "recommended", "Aporta el contexto callejero de Nueva York y la situación de los vigilantes."), link("she-hulk", "reference", "Actualiza la faceta legal y heroica de Daredevil.")],
  "visionquest": [link("wandavision", "essential", "Continúa el destino de White Vision."), link("ultron", "recommended", "Presenta el origen de Vision.")],
  "doomsday": [link("endgame", "essential", "Continúa la historia global de los Avengers."), link("loki-2", "essential", "Establece el estado del multiverso y sus líneas temporales."), link("multiverse-madness", "recommended", "Desarrolla incursiones y colisiones entre universos."), link("fantastic-four", "essential", "Presenta a los Fantastic Four antes de su convergencia con el UCM."), link("deadpool-wolverine", "variant", "Integra universos heredados en el conflicto multiversal."), link("thunderbolts", "recommended", "Actualiza el nuevo equipo de Avengers.")],
  "secret-wars": [link("doomsday", "essential", "Continúa directamente la crisis multiversal de Doomsday."), link("loki-2", "recommended", "Explica la arquitectura actual de las líneas temporales.")],
};

export const NARRATIVE_LINKS: Record<string, NarrativeLink[]> = Object.fromEntries(MCU_ITEMS.map((item) => [item.id, CURATED_LINKS[item.id] || []]));

export const SEASON_EPISODES: Record<string, number[]> = {
  "xmen-animated-series": [13, 13, 19, 17, 14],
  "spiderman-animated-series": [13, 14, 14, 11, 13],
  "xmen-evolution": [13, 17, 13, 9],
  "spiderman-new-animated": [13],
  "fantastic-four-worlds-greatest-heroes": [26],
  "spectacular-spiderman": [13, 13],
  "wolverine-and-xmen": [26],
  "iron-man-armored-adventures": [26, 26],
  "avengers-earths-mightiest-heroes": [26, 26],
  "ultimate-spiderman-series": [26, 26, 26, 26],
  "avengers-assemble-series": [26, 26, 25, 25, 24],
  "guardians-galaxy-animated": [26, 25, 26],
  "marvel-spiderman-2017": [26, 26, 6],
  "modok-series": [10],
  "hit-monkey-series": [10, 10],
  "moon-girl-devil-dinosaur": [16, 14],
};

export const INTERNAL_ORDER_IDS = [
  "eyes-wakanda", "cap-first-avenger", "captain-marvel", "iron-man", "iron-man-2", "hulk", "thor", "avengers", "thor-dark-world", "iron-man-3", "winter-soldier", "guardians", "guardians-2", "ultron", "ant-man", "civil-war", "black-widow", "black-panther", "homecoming", "doctor-strange", "ragnarok", "infinity-war", "antman-wasp", "endgame", "loki-1", "what-if-1", "wandavision", "shang-chi", "falcon-winter", "far-from-home", "no-way-home", "eternals", "multiverse-madness", "hawkeye", "moon-knight", "wakanda-forever", "echo", "she-hulk", "ms-marvel", "love-thunder", "werewolf", "holiday-special", "quantumania", "guardians-3", "secret-invasion", "loki-2", "the-marvels", "what-if-2", "agatha", "what-if-3", "deadpool-wolverine", "brave-new-world", "daredevil-ba-1", "thunderbolts", "ironheart", "fantastic-four", "marvel-zombies", "wonder-man-1", "daredevil-ba-2", "brand-new-day", "visionquest", "doomsday", "secret-wars"
];

export const CORE_STORY_IDS = new Set([
  "iron-man", "thor", "cap-first-avenger", "avengers", "winter-soldier", "guardians", "ultron", "civil-war", "doctor-strange", "ragnarok", "black-panther", "infinity-war", "antman-wasp", "captain-marvel", "endgame", "wandavision", "loki-1", "far-from-home", "no-way-home", "multiverse-madness", "loki-2", "deadpool-wolverine", "fantastic-four", "doomsday", "secret-wars"
]);

export const POST_CREDIT_COUNTS: Record<string, number> = {
  "iron-man": 1, "hulk": 0, "iron-man-2": 1, "thor": 1, "cap-first-avenger": 1, "avengers": 2,
  "iron-man-3": 1, "thor-dark-world": 2, "winter-soldier": 2, "guardians": 2, "ultron": 1, "ant-man": 2,
  "civil-war": 2, "doctor-strange": 2, "guardians-2": 5, "homecoming": 2, "ragnarok": 2, "black-panther": 2,
  "infinity-war": 1, "antman-wasp": 2, "captain-marvel": 2, "endgame": 0, "far-from-home": 2, "black-widow": 1,
  "shang-chi": 2, "eternals": 2, "no-way-home": 2, "multiverse-madness": 2, "love-thunder": 2, "wakanda-forever": 1,
  "quantumania": 2, "guardians-3": 2, "the-marvels": 2, "deadpool-wolverine": 1, "brave-new-world": 1,
  "thunderbolts": 1, "fantastic-four": 2, "venom": 2, "venom-carnage": 2, "morbius": 2, "venom-last-dance": 1
};

export const RUNTIME_OVERRIDES: Record<string, number> = {
  "ultimate-avengers": 72,
  "ultimate-avengers-2": 73,
  "invincible-iron-man-animated": 83,
  "doctor-strange-sorcerer-supreme": 76,
  "hulk-vs": 78,
  "planet-hulk-animated": 81,
  "thor-tales-asgard": 77,
};

export const EPISODE_RUNTIME_OVERRIDES: Record<string, number> = {
  "xmen-animated-series": 22,
  "avengers-assemble-series": 22,
};

export const CHARACTER_OVERRIDES: Record<string, string[]> = {
  "xmen-animated-series": ["Wolverine", "Cyclops", "Jean Grey", "Storm", "Rogue", "Beast"],
  "spiderman-animated-series": ["Peter Parker", "Mary Jane Watson", "Kingpin", "Felicia Hardy", "J. Jonah Jameson"],
  "xmen-evolution": ["Wolverine", "Cyclops", "Jean Grey", "Rogue", "Nightcrawler", "Kitty Pryde"],
  "spiderman-new-animated": ["Peter Parker", "Mary Jane Watson", "Harry Osborn", "Indira Daimonji"],
  "ultimate-avengers": ["Captain America", "Iron Man", "Thor", "Hulk", "Black Widow", "Giant-Man"],
  "ultimate-avengers-2": ["Captain America", "Black Panther", "Iron Man", "Thor", "Hulk", "Black Widow"],
  "fantastic-four-worlds-greatest-heroes": ["Mr. Fantastic", "Invisible Woman", "Human Torch", "The Thing", "Doctor Doom"],
  "invincible-iron-man-animated": ["Tony Stark", "James Rhodes", "Li Mei", "The Mandarin"],
  "doctor-strange-sorcerer-supreme": ["Stephen Strange", "Ancient One", "Wong", "Mordo", "Dormammu"],
  "spectacular-spiderman": ["Peter Parker", "Gwen Stacy", "Harry Osborn", "Mary Jane Watson", "Norman Osborn"],
  "wolverine-and-xmen": ["Wolverine", "Cyclops", "Emma Frost", "Beast", "Nightcrawler", "Professor X"],
  "hulk-vs": ["Hulk", "Wolverine", "Thor", "Loki", "Deadpool"],
  "iron-man-armored-adventures": ["Tony Stark", "James Rhodes", "Pepper Potts", "Gene Khan", "Obadiah Stane"],
  "planet-hulk-animated": ["Hulk", "Caiera", "Korg", "Miek", "Red King"],
  "avengers-earths-mightiest-heroes": ["Iron Man", "Captain America", "Thor", "Hulk", "Wasp", "Hawkeye"],
  "thor-tales-asgard": ["Thor", "Loki", "Sif", "Algrim", "Odin"],
  "ultimate-spiderman-series": ["Peter Parker", "Nick Fury", "Nova", "White Tiger", "Iron Fist", "Power Man"],
  "avengers-assemble-series": ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye"],
  "marvel-spiderman-2017": ["Peter Parker", "Miles Morales", "Gwen Stacy", "Anya Corazon", "Harry Osborn"],
  "modok-series": ["M.O.D.O.K.", "Jodie Tarleton", "Melissa Tarleton", "Lou Tarleton", "Monica Rappaccini"],
  "moon-girl-devil-dinosaur": ["Lunella Lafayette", "Devil Dinosaur", "Casey Calderon", "The Beyonder"],
  "what-if-1": ["The Watcher", "Captain Carter", "Doctor Strange Supreme", "Star-Lord T'Challa"],
  "what-if-2": ["The Watcher", "Captain Carter", "Kahhori", "Doctor Strange Supreme"],
  "what-if-3": ["The Watcher", "Captain Carter", "Storm", "Kahhori"],
};
