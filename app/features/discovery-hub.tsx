"use client";
/* eslint-disable @next/next/no-img-element -- imágenes dinámicas del catálogo local/TMDB */

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { ShowcasePoster } from "./showcase-room";

const ShowcaseRoom = dynamic(() => import("./showcase-room"), { ssr: false, loading: () => <div className="showcase-empty">Preparando la sala…</div> });

export type DiscoveryItem = {
  id: string;
  title: string;
  year: number;
  type: "movie" | "series" | "animation" | "special";
  saga: string;
  poster: string;
  backdrop: string;
};

type HubTab = "eras" | "journeys" | "cards" | "posters" | "room";
type Character = { id:string;name:string;variant:string;lore:string;rarity:"Común"|"Rara"|"Épica"|"Legendaria";heroId:string;appearances:string[];stats:[number,number,number,number] };

const CHARACTERS: Character[] = [
  { id:"iron-man",name:"Iron Man",variant:"Tierra-616",lore:"El ingeniero que convirtió una armadura en el punto de partida de la Saga del Infinito.",rarity:"Legendaria",heroId:"iron-man",appearances:["iron-man","iron-man-2","avengers","iron-man-3","age-ultron","civil-war","infinity-war","endgame"],stats:[88,98,61,100] },
  { id:"spider-raimi",name:"Spider-Man",variant:"Universo Raimi",lore:"Un Peter Parker definido por la responsabilidad, la pérdida y una segunda oportunidad multiversal.",rarity:"Legendaria",heroId:"spiderman-raimi-2",appearances:["spiderman-raimi-1","spiderman-raimi-2","spiderman-raimi-3","no-way-home"],stats:[76,75,94,93] },
  { id:"spider-mcu",name:"Spider-Man",variant:"UCM",lore:"De aprendiz de los Vengadores a héroe anónimo, su recorrido atraviesa el corazón del multiverso.",rarity:"Épica",heroId:"no-way-home",appearances:["civil-war","homecoming","infinity-war","endgame","far-from-home","no-way-home"],stats:[79,83,96,96] },
  { id:"wolverine",name:"Wolverine",variant:"Universos X-Men",lore:"Décadas de guerras y pérdidas culminan en uno de los viajes más extensos del legado mutante.",rarity:"Legendaria",heroId:"logan",appearances:["xmen-2000","x2","xmen-last-stand","wolverine-origins","the-wolverine","xmen-dofp","logan","deadpool-wolverine"],stats:[92,64,78,97] },
  { id:"wanda",name:"Scarlet Witch",variant:"UCM",lore:"Una Vengadora cuyo duelo altera la realidad y abre rutas decisivas hacia el multiverso.",rarity:"Épica",heroId:"wandavision",appearances:["age-ultron","civil-war","infinity-war","endgame","wandavision","doctor-strange-mom"],stats:[100,81,72,95] },
  { id:"loki",name:"Loki",variant:"Dios de las historias",lore:"Villano, variante y guardián del tiempo: su viaje redefine el significado de propósito.",rarity:"Legendaria",heroId:"loki-2",appearances:["thor","avengers","thor-dark-world","ragnarok","infinity-war","endgame","loki-1","loki-2"],stats:[91,92,73,98] },
  { id:"captain",name:"Captain America",variant:"Steve Rogers",lore:"El primer Vengador recorre desde la Segunda Guerra Mundial hasta la batalla definitiva contra Thanos.",rarity:"Épica",heroId:"winter-soldier",appearances:["cap-first-avenger","avengers","winter-soldier","age-ultron","civil-war","infinity-war","endgame"],stats:[83,77,89,97] },
  { id:"thor",name:"Thor",variant:"Dios del trueno",lore:"Príncipe, Vengador y superviviente; su historia conecta Asgard, la Tierra y el cosmos.",rarity:"Épica",heroId:"ragnarok",appearances:["thor","avengers","thor-dark-world","age-ultron","ragnarok","infinity-war","endgame","thor-love-thunder"],stats:[98,70,80,96] },
  { id:"deadpool",name:"Deadpool",variant:"Tierra-10005",lore:"El mercenario rompe reglas narrativas y termina cruzando la frontera hacia el UCM.",rarity:"Rara",heroId:"deadpool-wolverine",appearances:["deadpool","deadpool-2","deadpool-wolverine"],stats:[84,69,88,91] },
  { id:"strange",name:"Doctor Strange",variant:"UCM",lore:"Protector de la realidad, experto en decisiones imposibles y convergencias multiversales.",rarity:"Épica",heroId:"doctor-strange",appearances:["doctor-strange","ragnarok","infinity-war","endgame","no-way-home","doctor-strange-mom"],stats:[96,94,68,94] },
];

const RARITY_COLOR: Record<Character["rarity"],string> = { "Común":"#8b96a5","Rara":"#42a5ff","Épica":"#ac6cff","Legendaria":"#f2bd4d" };

function decadeLabel(year:number) { return year < 2000 ? "Los 90" : year < 2010 ? "Los 2000" : year < 2020 ? "Los 2010" : "Los 2020"; }

export function DiscoveryHub({items,watched,onOpen}:{items:DiscoveryItem[];watched:Set<string>;onOpen:(id:string)=>void}) {
  const [tab,setTab]=useState<HubTab>("eras");
  const [selectedCharacter,setSelectedCharacter]=useState(CHARACTERS[0].id);
  const itemMap=useMemo(()=>new Map(items.map((item)=>[item.id,item])),[items]);
  const released=useMemo(()=>items.filter((item)=>item.year<=new Date().getFullYear()),[items]);
  const eras=useMemo(()=>["Los 90","Los 2000","Los 2010","Los 2020"].map((label)=>{const entries=released.filter((item)=>decadeLabel(item.year)===label);const completed=entries.filter((item)=>watched.has(item.id)).length;return {label,entries,completed};}),[released,watched]);
  const character=CHARACTERS.find((entry)=>entry.id===selectedCharacter)||CHARACTERS[0];
  const characterEntries=character.appearances.map((id)=>itemMap.get(id)).filter((item):item is DiscoveryItem=>Boolean(item));
  const unlockedPosters=released.filter((item)=>watched.has(item.id));
  const showcasePosters:ShowcasePoster[]=unlockedPosters.map((item)=>({id:item.id,title:item.title,image:item.poster}));

  return <section className="dashboard-workspace discovery-workspace">
    <header className="discovery-hero"><div><span>ARCHIVO NEXUS</span><h1>Explora. Completa. Colecciona.</h1><p>Recorre décadas, sigue a tus personajes y convierte cada título visto en una pieza de tu colección.</p></div><div className="collection-orbit"><i/><i/><i/><strong>{unlockedPosters.length}</strong><small>piezas</small></div></header>
    <nav className="discovery-tabs" aria-label="Secciones de colección">
      {([['eras','Eras'],['journeys','Viajes'],['cards','Cartas'],['posters','Pósteres'],['room','Sala 3D']] as Array<[HubTab,string]>).map(([id,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}
      <button onClick={()=>window.dispatchEvent(new CustomEvent("nexus:open-achievements"))}>Logros</button>
    </nav>
    <div className="discovery-scroll">
      {tab==='eras'&&<div className="era-grid">{eras.map((era,index)=><article className={`era-card era-${index}`} key={era.label}><div className="era-mosaic">{era.entries.slice(0,6).map((item)=><img key={item.id} src={item.backdrop||item.poster} alt=""/>)}</div><div><span>{era.entries[0]?.year||'—'}—{era.entries.at(-1)?.year||'—'}</span><h2>{era.label}</h2><p>{era.entries.length} títulos · {era.completed} completados</p><i><b style={{width:`${era.completed/Math.max(1,era.entries.length)*100}%`}}/></i></div><button onClick={()=>era.entries.find((item)=>!watched.has(item.id))&&onOpen(era.entries.find((item)=>!watched.has(item.id))!.id)}>Continuar era</button></article>)}</div>}
      {tab==='journeys'&&<div className="journey-layout"><aside>{CHARACTERS.map((entry)=>{const available=entry.appearances.filter((id)=>itemMap.has(id));const done=available.filter((id)=>watched.has(id)).length;return <button key={entry.id} className={entry.id===character.id?'active':''} onClick={()=>setSelectedCharacter(entry.id)}><img src={itemMap.get(entry.heroId)?.poster||''} alt=""/><span><strong>{entry.name}</strong><small>{entry.variant} · {done}/{available.length}</small></span></button>})}</aside><main><div className="journey-character-hero" style={{backgroundImage:`linear-gradient(90deg,#0d1016 5%,rgba(13,16,22,.72),rgba(13,16,22,.18)),url(${itemMap.get(character.heroId)?.backdrop||itemMap.get(character.heroId)?.poster||''})`}}><span>{character.variant}</span><h2>{character.name}</h2><p>{character.lore}</p></div><div className="journey-timeline">{characterEntries.map((item,index)=><button key={item.id} className={watched.has(item.id)?'done':''} onClick={()=>onOpen(item.id)}><i>{watched.has(item.id)?'✓':String(index+1).padStart(2,'0')}</i><img src={item.poster} alt=""/><span><small>{item.year} · {item.type}</small><strong>{item.title}</strong></span></button>)}</div></main></div>}
      {tab==='cards'&&<div className="trading-grid">{CHARACTERS.map((entry)=>{const unlocked=entry.appearances.some((id)=>watched.has(id));const hero=itemMap.get(entry.heroId);return <article className={`trading-card ${unlocked?'unlocked':'locked'}`} style={{'--rarity':RARITY_COLOR[entry.rarity]} as React.CSSProperties} key={entry.id}><div className="card-art"><img src={hero?.poster||''} alt=""/><span>{entry.rarity}</span></div><div className="card-copy"><small>{entry.variant}</small><h2>{unlocked?entry.name:'Carta bloqueada'}</h2><p>{unlocked?entry.lore:'Mira una aparición de este personaje para desbloquearla.'}</p>{unlocked&&<div className="card-stats">{['Poder','Mente','Agilidad','Impacto'].map((label,index)=><span key={label}><small>{label}</small><i><b style={{width:`${entry.stats[index]}%`}}/></i><strong>{entry.stats[index]}</strong></span>)}</div>}</div></article>})}</div>}
      {tab==='posters'&&<><div className="collection-summary"><span><strong>{unlockedPosters.length}</strong><small>desbloqueados</small></span><i><b style={{width:`${unlockedPosters.length/Math.max(1,released.length)*100}%`}}/></i><span><strong>{released.length}</strong><small>en el archivo</small></span></div><div className="poster-vault">{released.map((item)=><button className={watched.has(item.id)?'unlocked':'locked'} key={item.id} onClick={()=>onOpen(item.id)}><img src={item.poster} alt="" loading="lazy"/><span>{watched.has(item.id)?<><strong>{item.title}</strong><small>{item.year} · Coleccionado</small></>:<><strong>Por descubrir</strong><small>{item.year} · Marca como visto</small></>}</span></button>)}</div></>}
      {tab==='room'&&<><div className="room-heading"><span>SALA DE EXHIBICIÓN</span><h2>Tu multiverso, en las paredes.</h2><p>La sala se construye automáticamente con los pósteres que has desbloqueado.</p></div><ShowcaseRoom posters={showcasePosters}/></>}
    </div>
  </section>;
}
