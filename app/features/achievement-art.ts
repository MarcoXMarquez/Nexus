import { BACKDROP_BY_ID } from "../backdrop-data";

/**
 * Catálogo visual independiente de los pósteres. Solo usa arte panorámico
 * promocional ya revisado y almacenado localmente; nunca hace hotlinking.
 * `source` conserva la procedencia para auditoría y atribución.
 */
export type AchievementArt = { thumb:string; hero:string; source:string; focalPoint:string; sfwReviewed:true };

const ART_BY_ACHIEVEMENT:Record<string,string>={
  "iron-trilogy":"iron-man-3","legacy-iron":"endgame","on-your-left":"winter-soldier","still-worthy":"ragnarok","always-angry":"avengers",
  "avengers-idea":"avengers","new-avengers":"thunderbolts","avengers-all-worlds":"endgame","wakanda-forever":"wakanda-forever","we-are-groot":"guardians-3",
  "galaxy-misfits":"guardians","glorious-purpose":"loki-2","what-is-grief":"wandavision","bargain":"doctor-strange","under-spell":"no-way-home",
  "great-power":"spiderman-raimi-2","bad-lizard":"amazing-spiderman-1","back-home":"homecoming","three-spiders":"no-way-home","always-spectacular":"spectacular-spiderman",
  "web-destiny":"spider-verse","to-me-xmen":"xmen-2000","future-reunited":"xmen-dofp","best-at-what-i-do":"logan","mutant-proud":"xmen97-1",
  "storm-goddess":"xmen97-1","fire-life-incarnate":"xmen-last-stand","clobbering-time":"fantastic-four-2005","first-family":"fantastic-four-2005",
  "hells-kitchen-devil":"daredevil-ba-1","street-heroes":"defenders","we-are-venom":"venom","watcher-saw-all":"what-if-3","animated-mightiest":"earths-mightiest-heroes",
  "portals-open":"endgame","multiverse-visitors":"no-way-home","timeline-protector":"loki-2","ready-doomsday":"doomsday","battleworld-destiny":"secret-wars",
  "phase-traveler":"avengers","one-reality":"multiverse-madness","half-multiverse":"loki-2","everything-connected":"endgame","multiverse-museum":"deadpool-wolverine",
  "architect":"loki-2","code-between-worlds":"no-way-home","together-now":"avengers","reality-curator":"loki-2","sorcerer-oath":"doctor-strange",
};

const GROUP_ART:Record<string,string[]>={
  "Spider-Man":["no-way-home","spider-verse","spiderman-raimi-2","amazing-spiderman-1"],
  "Mutantes y legados":["xmen97-1","xmen-dofp","logan","fantastic-four-2005"],
  "Personajes y equipos":["avengers","guardians-3","thunderbolts","wakanda-forever"],
  "UCM y personajes":["endgame","ragnarok","wandavision","doctor-strange"],
  "Legados y animación":["earths-mightiest-heroes","what-if-3","spectacular-spiderman","xmen-animated-series"],
  "Convergencias":["no-way-home","deadpool-wolverine","doomsday","secret-wars"],
  "Sagas y universos":["endgame","loki-2","multiverse-madness","infinity-war"],
  "Actividad personal":["loki-2","avengers","guardians","spider-verse"],
  "Eras y décadas":["xmen-2000","iron-man","avengers","no-way-home"],
};

function hash(value:string){let result=0;for(let index=0;index<value.length;index+=1)result=(result*31+value.charCodeAt(index))>>>0;return result;}

export function achievementArtFor(id:string,group:string,coverId?:string):AchievementArt {
  const choices=GROUP_ART[group]||GROUP_ART["UCM y personajes"];
  const preferred=ART_BY_ACHIEVEMENT[id]||choices[hash(id)%choices.length]||coverId;
  const fallback=coverId&&BACKDROP_BY_ID[coverId]?coverId:choices.find((entry)=>BACKDROP_BY_ID[entry]);
  const selected=(preferred&&BACKDROP_BY_ID[preferred]?preferred:fallback)||"";
  const art=BACKDROP_BY_ID[selected];
  if(!art)return {thumb:"./artwork/multiverse-hero-v1.webp",hero:"./artwork/multiverse-hero-v1.webp",source:"Arte temático local de Nexus",focalPoint:"center",sfwReviewed:true};
  return {thumb:`.${art.card}`,hero:`.${art.hero}`,source:art.source,focalPoint:"center",sfwReviewed:true};
}
