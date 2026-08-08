// Datos públicos recopilados de Wikipedia y TVmaze.
// Las plataformas son orientativas para Perú y deben revisarse si cambia el catálogo.
export type TitleMetadata = {
  synopsis: string;
  runtimeMinutes?: number;
  episodeRuntimeMinutes?: number;
  episodeDurations?: Array<number | null>;
  mainCharacters: string[];
  trailerUrl: string;
  platforms: string[];
  postCredits: number | null;
  contentWarnings: string[];
  sourceUrl: string;
  sourceLabel: string;
};

export const TITLE_METADATA: Record<string, TitleMetadata> = {
  "xmen-animated-series": {
    "synopsis": "X-Men (también conocida como X-Men: The Animated Series, X Men en Latinoamérica y Patrulla X en España) es una serie animada televisiva canadiense-estadounidense que se emitió en Estados Unidos desde el 31 de octubre de 1992 hasta el 20 de septiembre de 1997, en el bloque de programación Fox Kids de Fox. ​ Producida por Saban Entertainment, el estudio detrás de Mighty Morphin Power Rangers, X-Men fue el segundo intento de Marvel Comics por realizar una…",
    "episodeRuntimeMinutes": 22,
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20The%20Animated%20Series%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://es.wikipedia.org/wiki/X-Men_(serie_de_televisi%C3%B3n)",
    "sourceLabel": "Wikipedia en español"
  },
  "spiderman-animated-series": {
    "synopsis": "Spider-Man: The Animated Series forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20The%20Animated%20Series%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "FOX",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_The_Animated_Series",
    "sourceLabel": "Wikipedia"
  },
  "xmen-evolution": {
    "synopsis": "X-Men: Evolution forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20Evolution%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "The WB",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men:_Evolution",
    "sourceLabel": "Wikipedia"
  },
  "spiderman-new-animated": {
    "synopsis": "Spider-Man: The New Animated Series, or simply Spider-Man, is an animated superhero television series based on the Marvel Comics character Spider-Man and produced by Mainframe Entertainment, Marvel Enterprises, Adelaide Productions and Sony Pictures Television.  Initially intended to serve as a continuation of Sam Raimi's film Spider-Man (2002), the show was made using computer-generated imagery (CGI) rendered in cel shading.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20The%20New%20Animated%20Series%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "MTV",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_The_New_Animated_Series",
    "sourceLabel": "Wikipedia"
  },
  "ultimate-avengers": {
    "synopsis": "Ultimate Avengers forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ultimate%20Avengers%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "ultimate-avengers-2": {
    "synopsis": "Ultimate Avengers 2 forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ultimate%20Avengers%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "fantastic-four-worlds-greatest-heroes": {
    "synopsis": "Fantastic Four: World's Greatest Heroes is a superhero animated television series based on the Marvel Comics superhero team of the same name.  The series was co-produced by Marvel Studios and MoonScoop, with the participation of M6 and Cartoon Network Europe, and distributed by Taffy Entertainment.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Fantastic%20Four%3A%20World's%20Greatest%20Heroes%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Cartoon Network",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Fantastic_Four:_World%27s_Greatest_Heroes",
    "sourceLabel": "Wikipedia"
  },
  "invincible-iron-man-animated": {
    "synopsis": "The Invincible Iron Man forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Invincible%20Iron%20Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "doctor-strange-sorcerer-supreme": {
    "synopsis": "Doctor Strange: The Sorcerer Supreme forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Doctor%20Strange%3A%20The%20Sorcerer%20Supreme%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "spectacular-spiderman": {
    "synopsis": "The Spectacular Spider-Man is an American animated superhero television series developed by Victor Cook and Greg Weisman, based on the Marvel Comics character Spider-Man.  In terms of overall tone and style, the series is based primarily on the Stan Lee, Steve Ditko and John Romita Sr.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Spectacular%20Spider-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "The CW",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Spectacular_Spider-Man_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "next-avengers": {
    "synopsis": "Next Avengers: Heroes of Tomorrow (or simply known as Next Avengers) is a 2008 American animated superhero film directed by Jay Oliva and Gary Hartle and starring the voices of Noah Crawford, Aidan Drummond, Brenna O'Brien, Dempsey M.  Pappion, Adrian Petriw, Tom Kane and Fred Tatasciore.",
    "runtimeMinutes": 78,
    "episodeRuntimeMinutes": 78,
    "mainCharacters": [
      "Noah Crawford",
      "Brenna O'Brien",
      "Adrian Petriw",
      "Tom Kane",
      "Fred Tatasciore"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Next%20Avengers%3A%20Heroes%20of%20Tomorrow%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Next_Avengers:_Heroes_of_Tomorrow",
    "sourceLabel": "Wikipedia"
  },
  "wolverine-and-xmen": {
    "synopsis": "Wolverine and the X-Men forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Wolverine%20and%20the%20X-Men%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Nicktoons",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Wolverine_and_the_X-Men_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "hulk-vs": {
    "synopsis": "Hulk Vs. forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Hulk%20Vs.%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "iron-man-armored-adventures": {
    "synopsis": "Iron Man: Armored Adventures (also known in early promotional materials as Iron Man: The Animated Series) is a French-Luxembourgish-British-American 3D CGI-animated series based on the Marvel Comics superhero Iron Man.  It debuted in the United States on Nicktoons on April 24, 2009, and it aired on Teletoon in Canada.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Man%3A%20Armored%20Adventures%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Nicktoons",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Man:_Armored_Adventures",
    "sourceLabel": "Wikipedia"
  },
  "planet-hulk-animated": {
    "synopsis": "Planet Hulk forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Planet%20Hulk%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "avengers-earths-mightiest-heroes": {
    "synopsis": "The Avengers: Earth's Mightiest Heroes is an American superhero animated series produced by Marvel Animation in cooperation with Film Roman based on the Marvel Comics superhero team.  The first season debuted on Disney XD on September 22, 2010.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Avengers%3A%20Earth's%20Mightiest%20Heroes%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney XD",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Avengers:_Earth%27s_Mightiest_Heroes",
    "sourceLabel": "Wikipedia"
  },
  "thor-tales-asgard": {
    "synopsis": "Thor: Tales of Asgard forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thor%3A%20Tales%20of%20Asgard%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Animated_Features",
    "sourceLabel": "Wikipedia"
  },
  "ultimate-spiderman-series": {
    "synopsis": "Ultimate Spider-Man forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      30,
      25,
      30,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      25,
      30,
      30,
      30,
      30,
      30,
      30,
      25,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ultimate%20Spider-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "DisneyNOW",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ultimate_Spider-Man_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "iron-man-rise-technovore": {
    "synopsis": "Iron Man: Rise of Technovore (Japanese: アイアンマン：ライズ・オブ・テクノヴォア, Hepburn: Aian Man: Raizu Obu Tekunovoa) is a 2013 Japanese superhero anime film by Madhouse that follows up on the Marvel Anime series.  It is directed by Hiroshi Hamasaki, an anime director who is known for his works including Shigurui: Death Frenzy and Texhnolyze, and based on a story written by Brandon Auman.",
    "runtimeMinutes": 88,
    "episodeRuntimeMinutes": 88,
    "mainCharacters": [
      "Keiji Fujiwara",
      "Tesshô Genda",
      "Miyu Irino"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Man%3A%20Rise%20of%20Technovore%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Man:_Rise_of_Technovore",
    "sourceLabel": "Wikipedia"
  },
  "avengers-assemble-series": {
    "synopsis": "Avengers Assemble is an American superhero animated series based on the Marvel Comics superhero team known as the Avengers.  Designed to capitalize on the success of the 2012 film The Avengers, the series premiered on Disney XD on May 26, 2013, as the successor to The Avengers: Earth's Mightiest Heroes.",
    "episodeDurations": [
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5,
      5
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%20Assemble%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "YouTube",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers_Assemble_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "avengers-confidential": {
    "synopsis": "Avengers Confidential: Black Widow & Punisher (アベンジャーズ コンフィデンシャル: ブラック・ウィドウ & パニッシャー, Abenjāzu Konfidensharu: Burakku Widō & Panisshā) is a 2014 Japanese superhero anime film by Madhouse.  The film is produced by SH DTV AC BW&P Partners, the final partnering of Marvel Entertainment with Sony Pictures Entertainment Japan and Madhouse, following up on the Marvel Anime series.",
    "runtimeMinutes": 83,
    "episodeRuntimeMinutes": 83,
    "mainCharacters": [
      "Miyuki Sawashiro",
      "Tesshō Genda",
      "Hideaki Tezuka",
      "Hiroki Tōchi",
      "Masashi Sugawara"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%20Confidential%3A%20Black%20Widow%20%26%20Punisher%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers_Confidential:_Black_Widow_%26_Punisher",
    "sourceLabel": "Wikipedia"
  },
  "guardians-galaxy-animated": {
    "synopsis": "Marvel's Guardians of the Galaxy, known as Marvel's Guardians of the Galaxy: Mission Breakout for the final season, is an American animated television series based on the Marvel Comics superhero team of the same name.  It is produced by Marvel Animation.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      28,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      28,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      28,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [
      "Will Friedle",
      "Trevor Devall",
      "Vanessa Marshall",
      "Kevin Michael Richardson",
      "David Sobolov"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Guardians%20of%20the%20Galaxy%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "DisneyNOW",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Guardians_of_the_Galaxy_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "marvel-spiderman-2017": {
    "synopsis": "Marvel's Spider-Man is an American animated television series, based on the Marvel Comics character of the same name.  A replacement for the previous series Ultimate Spider-Man, the first season premiered on August 19, 2017, on Disney XD.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Marvel's%20Spider-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "FOX",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man_(2017_TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "marvel-rising-secret-warriors": {
    "synopsis": "Marvel Rising: Secret Warriors is a 2018 American made-for-television animated superhero film produced by Marvel Animation.  It is the first full-length film of the Marvel Rising franchise.",
    "runtimeMinutes": 80,
    "episodeRuntimeMinutes": 80,
    "mainCharacters": [
      "Dee Bradley Baker",
      "Chloe Bennet",
      "Kathreen Khavari",
      "Tyler Posey",
      "Cierra Ramirez",
      "Kim Raver"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Marvel%20Rising%3A%20Secret%20Warriors%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Rising:_Secret_Warriors",
    "sourceLabel": "Wikipedia"
  },
  "modok-series": {
    "synopsis": "Marvel's M. O.",
    "episodeDurations": [
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30,
      30
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=M.O.D.O.K.%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Hulu",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/M.O.D.O.K._(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "hit-monkey-series": {
    "synopsis": "Marvel's Hit-Monkey is an American adult animated television series created by Will Speck and Josh Gordon for Hulu, based on the character from Marvel Comics.  The series was produced by Marvel Television for its first season and by 20th Television Animation for its second season, with Gordon and Speck serving as showrunners.",
    "episodeDurations": [
      31,
      30,
      24,
      23,
      21,
      22,
      28,
      22,
      22,
      24,
      28,
      23,
      24,
      24,
      24,
      25,
      25,
      25,
      24,
      24
    ],
    "mainCharacters": [
      "Ally Maki",
      "Olivia Munn",
      "Fred Tatasciore",
      "George Takei",
      "Jason Sudeikis",
      "Leslie Jones"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Hit-Monkey%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Hulu",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Hit-Monkey_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "moon-girl-devil-dinosaur": {
    "synopsis": "Marvel's Moon Girl and Devil Dinosaur (or simply Moon Girl and Devil Dinosaur) is an American animated superhero comedy television series developed by Steve Loter, Jeffrey M.  Howard and Kate Kondell for Disney Channel and Disney+ based on Moon Girl And Devil Dinosaur by Marvel Comics.",
    "episodeDurations": [
      46,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      24,
      23,
      23,
      23,
      24,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23,
      23
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Moon%20Girl%20and%20Devil%20Dinosaur%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "DisneyNOW",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Moon_Girl_and_Devil_Dinosaur",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-s1": {
    "synopsis": "The first season of the American streaming television series Daredevil, which is based on the Marvel Comics character of the same name, follows the early days of Matt Murdock / Daredevil, a lawyer-by-day who fights crime at night, juxtaposed with the rise of crime lord Wilson Fisk.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Deborah Ann Woll",
      "Elden Henson",
      "Toby Leonard Moore",
      "Vondie Curtis-Hall",
      "Bob Gunton"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil_season_1",
    "sourceLabel": "Wikipedia"
  },
  "jessica-jones-s1": {
    "synopsis": "The first season of the American television series Jessica Jones, which is based on the Marvel Comics character of the same name, follows Jessica Jones, a former superhero who opens her own detective agency after her superhero career comes to an end at the hands of Kilgrave.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      52,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60
    ],
    "mainCharacters": [
      "Krysten Ritter",
      "Mike Colter",
      "Rachael Taylor",
      "Wil Traval",
      "Erin Moriarty",
      "Eka Darville"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Jessica%20Jones%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Jessica_Jones_season_1",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-s2": {
    "synopsis": "The second season of the American streaming television series Daredevil, which is based on the Marvel Comics character of the same name, follows Matt Murdock / Daredevil, a blind lawyer-by-day who fights crime at night, crossing paths with the deadly Frank Castle / Punisher along with the return of an old girlfriend—Elektra Natchios.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the f…",
    "episodeDurations": [
      48,
      50,
      48,
      60,
      56,
      56,
      56,
      54,
      59,
      60,
      55,
      52,
      57
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Deborah Ann Woll",
      "Elden Henson",
      "Jon Bernthal",
      "Élodie Yung",
      "Stephen Rider"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil_season_2",
    "sourceLabel": "Wikipedia"
  },
  "luke-cage-s1": {
    "synopsis": "The first season of the American streaming television series Luke Cage, which is based on the Marvel Comics character of the same name, follows Luke Cage, a former convict with superhuman strength and unbreakable skin who fights crime in Harlem, New York.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      54,
      60,
      56,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      61,
      45
    ],
    "mainCharacters": [
      "Mike Colter",
      "Mahershala Ali",
      "Simone Missick",
      "Theo Rossi",
      "Erik LaRay Harvey",
      "Rosario Dawson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Luke%20Cage%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Luke_Cage_season_1",
    "sourceLabel": "Wikipedia"
  },
  "iron-fist-s1": {
    "synopsis": "The first season of the American streaming television series Iron Fist, which is based on the Marvel Comics character of the same name, follows Danny Rand as he returns to New York City after being presumed dead for 15 years and must choose between his family's legacy and his duties as the Iron Fist.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      57,
      61,
      59,
      54,
      56,
      53,
      58,
      55,
      54,
      56,
      52,
      50,
      53
    ],
    "mainCharacters": [
      "Finn Jones",
      "Jessica Henwick",
      "Tom Pelphrey",
      "Jessica Stroup",
      "Ramón Rodríguez",
      "Sacha Dhawan"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Fist%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Fist_season_1",
    "sourceLabel": "Wikipedia"
  },
  "defenders-miniseries": {
    "synopsis": "The Defenders forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      60,
      60,
      60,
      60,
      60,
      60,
      60,
      60
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Krysten Ritter",
      "Mike Colter",
      "Finn Jones",
      "Eka Darville",
      "Elden Henson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Defenders%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "CBS",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Defenders_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "punisher-s1": {
    "synopsis": "The Punisher · T1 forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      60,
      60,
      60,
      60,
      60,
      60,
      49,
      53,
      54,
      49,
      52,
      51,
      55
    ],
    "mainCharacters": [
      "Jon Bernthal",
      "Ebon Moss-Bachrach",
      "Amber Rose Revah",
      "Daniel Webber",
      "Jason R. Moore",
      "Michael Nathanson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Punisher%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Punisher_season_1",
    "sourceLabel": "Wikipedia"
  },
  "jessica-jones-s2": {
    "synopsis": "The second season of the American television series Jessica Jones, which is based on the Marvel Comics character of the same name, follows Jones as she takes on a new case after the events surrounding her encounter with Kilgrave.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      54,
      56,
      54,
      50,
      52,
      49,
      54,
      50,
      50,
      55,
      49,
      47,
      53
    ],
    "mainCharacters": [
      "Krysten Ritter",
      "Rachael Taylor",
      "Eka Darville",
      "J. R. Ramirez",
      "Terry Chen",
      "Leah Gibson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Jessica%20Jones%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Jessica_Jones_season_2",
    "sourceLabel": "Wikipedia"
  },
  "luke-cage-s2": {
    "synopsis": "The second and final season of the American streaming television series Luke Cage, which is based on the Marvel Comics character of the same name, sees Luke Cage become a hero and celebrity in Harlem after clearing his name, only to face a new threat.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      56,
      55,
      60,
      55,
      58,
      64,
      56,
      55,
      59,
      59,
      56,
      62,
      69
    ],
    "mainCharacters": [
      "Mike Colter",
      "Simone Missick",
      "Theo Rossi",
      "Gabrielle Dennis",
      "Mustafa Shakir",
      "Jessica Henwick"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Luke%20Cage%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Luke_Cage_season_2",
    "sourceLabel": "Wikipedia"
  },
  "iron-fist-s2": {
    "synopsis": "The second and final season of the American streaming television series Iron Fist, which is based on the Marvel Comics character of the same name, follows Danny Rand / Iron Fist, a martial arts expert with the ability to call upon the power of the Iron Fist.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of the franchise.",
    "episodeDurations": [
      57,
      53,
      52,
      53,
      55,
      51,
      54,
      49,
      50,
      52
    ],
    "mainCharacters": [
      "Finn Jones",
      "Jessica Henwick",
      "Tom Pelphrey",
      "Jessica Stroup",
      "Sacha Dhawan",
      "Simone Missick"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Fist%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Fist_season_2",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-s3": {
    "synopsis": "The third and final season of the American streaming television series Daredevil, which is based on the Marvel Comics character of the same name, follows Matt Murdock / Daredevil, a blind lawyer-by-day who fights crime at night.  When Wilson Fisk is released from prison, Murdock must decide between hiding from the world or embracing his life as a hero vigilante.",
    "episodeDurations": [
      53,
      50,
      50,
      54,
      49,
      54,
      50,
      50,
      54,
      46,
      50,
      55,
      54
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Deborah Ann Woll",
      "Elden Henson",
      "Joanne Whalley",
      "Wilson Bethel",
      "Stephen Rider"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%20%C2%B7%20T3%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil_season_3",
    "sourceLabel": "Wikipedia"
  },
  "punisher-s2": {
    "synopsis": "The Punisher · T2 forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      53,
      55,
      51,
      57,
      51,
      56,
      52,
      48,
      58,
      47,
      55,
      50,
      57
    ],
    "mainCharacters": [
      "Jon Bernthal",
      "Ben Barnes",
      "Amber Rose Revah",
      "Josh Stewart",
      "Giorgia Whigham",
      "Floriana Lima"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Punisher%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Punisher_season_2",
    "sourceLabel": "Wikipedia"
  },
  "jessica-jones-s3": {
    "synopsis": "The third and final season of the American television series Jessica Jones, which is based on the Marvel Comics character of the same name, follows Jones as she teams up with her mother's killer, Trish Walker, to take down a highly intelligent psychopath until a devastating loss reveals conflicting ideals that pits them against each other.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and other television series of…",
    "episodeDurations": [
      52,
      55,
      56,
      46,
      53,
      53,
      51,
      44,
      52,
      50,
      48,
      49,
      51
    ],
    "mainCharacters": [
      "Krysten Ritter",
      "Rachael Taylor",
      "Eka Darville",
      "Benjamin Walker",
      "Sarita Choudhury",
      "Jeremy Bobb"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Jessica%20Jones%20%C2%B7%20T3%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Netflix",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Jessica_Jones_season_3",
    "sourceLabel": "Wikipedia"
  },
  "blade-1998": {
    "synopsis": "Blade is a 1998 American superhero film based on the Marvel Comics character.  The first installment in the Blade franchise, it was directed by Stephen Norrington and written by David S.",
    "runtimeMinutes": 120,
    "episodeRuntimeMinutes": 120,
    "mainCharacters": [
      "Stephen Dorff",
      "Kris Kristofferson",
      "N'Bushe Wright",
      "Donal Logue"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Blade%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Blade_(1998_film)",
    "sourceLabel": "Wikipedia"
  },
  "xmen-2000": {
    "synopsis": "X-Men forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 104,
    "episodeRuntimeMinutes": 104,
    "mainCharacters": [
      "Patrick Stewart",
      "Hugh Jackman",
      "Ian McKellen",
      "Halle Berry",
      "Famke Janssen",
      "James Marsden"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men_(film)",
    "sourceLabel": "Wikipedia"
  },
  "blade-2": {
    "synopsis": "Blade II is a 2002 American superhero film based on the Marvel Comics character Blade.  It is the second installment in the Blade franchise, and sequel to Blade (1998).",
    "runtimeMinutes": 117,
    "episodeRuntimeMinutes": 117,
    "mainCharacters": [
      "Kris Kristofferson",
      "Ron Perlman",
      "Leonor Varela",
      "Norman Reedus",
      "Luke Goss"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Blade%20II%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Blade_II",
    "sourceLabel": "Wikipedia"
  },
  "spiderman-raimi-1": {
    "synopsis": "Spider-Man (conocida como El Hombre Araña en Hispanoamérica) es una película de superhéroes estadounidense de 2002 basada en el personaje homónimo de Marvel Comics.  Dirigida por Sam Raimi a partir de un guion de David Koepp, es la primera entrega de la trilogía de Spider-Man de Raimi (2002-2007).",
    "runtimeMinutes": 121,
    "episodeRuntimeMinutes": 121,
    "mainCharacters": [
      "Tobey Maguire",
      "Willem Dafoe",
      "Kirsten Dunst",
      "James Franco",
      "Cliff Robertson",
      "Rosemary Harris"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://es.wikipedia.org/wiki/Spider-Man_(pel%C3%ADcula)",
    "sourceLabel": "Wikipedia en español"
  },
  "daredevil-2003": {
    "synopsis": "Daredevil is a 2003 American superhero film written and directed by Mark Steven Johnson, based on the Marvel Comics character of the same name created by Stan Lee and Bill Everett.  The film stars Ben Affleck as Matt Murdock, a blind lawyer who fights for justice in the courtroom and on the streets of New York as the masked vigilante Daredevil.",
    "runtimeMinutes": 103,
    "episodeRuntimeMinutes": 103,
    "mainCharacters": [
      "Ben Affleck",
      "Jennifer Garner",
      "Michael Clarke Duncan",
      "Colin Farrell",
      "Joe Pantoliano",
      "Jon Favreau"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil_(film)",
    "sourceLabel": "Wikipedia"
  },
  "x2": {
    "synopsis": "X2: X-Men United forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 133,
    "episodeRuntimeMinutes": 133,
    "mainCharacters": [
      "Patrick Stewart",
      "Hugh Jackman",
      "Ian McKellen",
      "Halle Berry",
      "Famke Janssen",
      "James Marsden"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X2%3A%20X-Men%20United%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X2_(film)",
    "sourceLabel": "Wikipedia"
  },
  "hulk-2003": {
    "synopsis": "Hulk (also known as The Hulk) is a 2003 American superhero film based on the Marvel Comics character created by Stan Lee and Jack Kirby.  The film was directed by Ang Lee and written by John Turman, James Schamus, and Michael France.",
    "runtimeMinutes": 138,
    "episodeRuntimeMinutes": 138,
    "mainCharacters": [
      "Eric Bana",
      "Jennifer Connelly",
      "Sam Elliott",
      "Josh Lucas",
      "Nick Nolte"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Hulk%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Hulk_(film)",
    "sourceLabel": "Wikipedia"
  },
  "punisher-2004": {
    "synopsis": "The Punisher forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 123,
    "episodeRuntimeMinutes": 123,
    "mainCharacters": [
      "Thomas Jane",
      "John Travolta",
      "Will Patton",
      "Roy Scheider",
      "Laura Harring",
      "Ben Foster"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Punisher%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Punisher_(2004_film)",
    "sourceLabel": "Wikipedia"
  },
  "spiderman-raimi-2": {
    "synopsis": "Spider-Man 2 is a 2004 American superhero film based on the Marvel Comics character Spider-Man.  Directed by Sam Raimi and written by Alvin Sargent from a story conceived by Michael Chabon and the writing team of Alfred Gough and Miles Millar, it is the second film in Raimi's Spider-Man trilogy, following Spider-Man (2002).",
    "runtimeMinutes": 127,
    "episodeRuntimeMinutes": 127,
    "mainCharacters": [
      "Tobey Maguire",
      "Kirsten Dunst",
      "James Franco",
      "Alfred Molina",
      "Rosemary Harris",
      "Donna Murphy"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man_2",
    "sourceLabel": "Wikipedia"
  },
  "blade-trinity": {
    "synopsis": "Blade: Trinity is a 2004 American superhero film based on the Marvel Comics character Blade.  It is the sequel to Blade II (2002) and the third installment in the Blade franchise.",
    "runtimeMinutes": 113,
    "episodeRuntimeMinutes": 113,
    "mainCharacters": [
      "Kris Kristofferson",
      "Jessica Biel",
      "Ryan Reynolds",
      "Parker Posey",
      "Natasha Lyonne",
      "Dominic Purcell"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Blade%3A%20Trinity%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Blade:_Trinity",
    "sourceLabel": "Wikipedia"
  },
  "elektra-2005": {
    "synopsis": "Elektra is a 2005 superhero film based on the Marvel Comics character Elektra Natchios and directed by Rob Bowman.  It is a spin-off from the film Daredevil (2003), with Jennifer Garner reprising her role as the titular character.",
    "runtimeMinutes": 97,
    "episodeRuntimeMinutes": 97,
    "mainCharacters": [
      "Jennifer Garner",
      "Goran Višnjić",
      "Will Yun Lee",
      "Cary-Hiroyuki Tagawa",
      "Terence Stamp"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Elektra%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Elektra_(2005_film)",
    "sourceLabel": "Wikipedia"
  },
  "fantastic-four-2005": {
    "synopsis": "Fantastic Four (sometimes stylized as Fantastic 4) is a 2005 superhero film based on the Marvel Comics superhero team created by Stan Lee and Jack Kirby.  It was directed by Tim Story and written by Mark Frost and Michael France.",
    "runtimeMinutes": 106,
    "episodeRuntimeMinutes": 106,
    "mainCharacters": [
      "Ioan Gruffudd",
      "Jessica Alba",
      "Chris Evans",
      "Michael Chiklis",
      "Julian McMahon",
      "Kerry Washington"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Fantastic%20Four%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Fantastic_Four_(2005_film)",
    "sourceLabel": "Wikipedia"
  },
  "xmen-last-stand": {
    "synopsis": "X-Men: The Last Stand forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 104,
    "episodeRuntimeMinutes": 104,
    "mainCharacters": [
      "Hugh Jackman",
      "Halle Berry",
      "Ian McKellen",
      "Famke Janssen",
      "Anna Paquin",
      "Kelsey Grammer"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20The%20Last%20Stand%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men:_The_Last_Stand",
    "sourceLabel": "Wikipedia"
  },
  "ghost-rider": {
    "synopsis": "Ghost Rider is a 2007 American superhero film written and directed by Mark Steven Johnson.  Based on the Marvel Comics character of the same name, it was produced by Columbia Pictures in association with Marvel Entertainment, Crystal Sky Pictures, and Relativity Media, and distributed by Sony Pictures Releasing.",
    "runtimeMinutes": 110,
    "episodeRuntimeMinutes": 110,
    "mainCharacters": [
      "Nicolas Cage",
      "Eva Mendes",
      "Wes Bentley",
      "Sam Elliott",
      "Donal Logue",
      "Peter Fonda"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ghost%20Rider%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ghost_Rider_(2007_film)",
    "sourceLabel": "Wikipedia"
  },
  "spiderman-raimi-3": {
    "synopsis": "Spider-Man 3 is a 2007 American superhero film based on the Marvel Comics character Spider-Man.  Produced by Columbia Pictures, Marvel Entertainment, and Laura Ziskin Productions, and distributed by Sony Pictures Releasing, it was directed by Sam Raimi from a screenplay he co-wrote with his brother Ivan and Alvin Sargent.",
    "runtimeMinutes": 139,
    "episodeRuntimeMinutes": 139,
    "mainCharacters": [
      "Tobey Maguire",
      "Kirsten Dunst",
      "James Franco",
      "Thomas Haden Church",
      "Topher Grace",
      "Bryce Dallas Howard"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%203%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man_3",
    "sourceLabel": "Wikipedia"
  },
  "silver-surfer": {
    "synopsis": "Fantastic Four: Rise of the Silver Surfer is a 2007 superhero film based on the Marvel Comics superhero team the Fantastic Four.  The sequel to Fantastic Four (2005), it was directed by Tim Story, from a screenplay by Don Payne and Mark Frost.",
    "runtimeMinutes": 92,
    "episodeRuntimeMinutes": 92,
    "mainCharacters": [
      "Ioan Gruffudd",
      "Jessica Alba",
      "Chris Evans",
      "Michael Chiklis",
      "Julian McMahon",
      "Kerry Washington"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Fantastic%20Four%3A%20Rise%20of%20the%20Silver%20Surfer%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Fantastic_Four:_Rise_of_the_Silver_Surfer",
    "sourceLabel": "Wikipedia"
  },
  "punisher-war-zone": {
    "synopsis": "Punisher: War Zone (stylized as War Zone: Punisher) is a 2008 vigilante action film based on the Marvel Comics character the Punisher.  Rather than a sequel to 2004's The Punisher, the film is a reboot that follows the war waged by vigilante Frank Castle / Punisher (played by Ray Stevenson) on crime and corruption, in particular on the disfigured mob boss known as Billy \"Jigsaw\" Russoti (Dominic West).",
    "runtimeMinutes": 103,
    "episodeRuntimeMinutes": 103,
    "mainCharacters": [
      "Ray Stevenson",
      "Dominic West",
      "Julie Benz",
      "Colin Salmon",
      "Doug Hutchison",
      "Dash Mihok"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Punisher%3A%20War%20Zone%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Punisher:_War_Zone",
    "sourceLabel": "Wikipedia"
  },
  "wolverine-origins": {
    "synopsis": "X-Men Origins: Wolverine forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 107,
    "episodeRuntimeMinutes": 107,
    "mainCharacters": [
      "Liev Schreiber",
      "Danny Huston",
      "Dominic Monaghan",
      "Ryan Reynolds"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%20Origins%3A%20Wolverine%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men_Origins:_Wolverine",
    "sourceLabel": "Wikipedia"
  },
  "xmen-first-class": {
    "synopsis": "X-Men: First Class forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 132,
    "episodeRuntimeMinutes": 132,
    "mainCharacters": [
      "James McAvoy",
      "Michael Fassbender",
      "Rose Byrne",
      "January Jones",
      "Oliver Platt",
      "Kevin Bacon"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20First%20Class%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men:_First_Class",
    "sourceLabel": "Wikipedia"
  },
  "ghost-rider-2": {
    "synopsis": "Ghost Rider: Spirit of Vengeance is a 2011 American superhero film based on the Marvel Comics antihero Ghost Rider.  It is a reboot to the 2007 film Ghost Rider and features Nicolas Cage reprising his role as Johnny Blaze / Ghost Rider with supporting roles portrayed by Ciarán Hinds, Violante Placido, Johnny Whitworth, Christopher Lambert, and Idris Elba.",
    "runtimeMinutes": 95,
    "episodeRuntimeMinutes": 95,
    "mainCharacters": [
      "Nicolas Cage",
      "Ciarán Hinds",
      "Violante Placido",
      "Johnny Whitworth",
      "Christopher Lambert",
      "Idris Elba"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ghost%20Rider%3A%20Spirit%20of%20Vengeance%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ghost_Rider:_Spirit_of_Vengeance",
    "sourceLabel": "Wikipedia"
  },
  "amazing-spiderman": {
    "synopsis": "The Amazing Spider-Man is a 2012 American superhero film based on the Marvel Comics character Spider-Man.  Directed by Marc Webb and written by James Vanderbilt, Alvin Sargent, and Steve Kloves from a story by Vanderbilt, it is a reboot of the Spider-Man film series.",
    "runtimeMinutes": 136,
    "episodeRuntimeMinutes": 136,
    "mainCharacters": [
      "Andrew Garfield",
      "Emma Stone",
      "Rhys Ifans",
      "Denis Leary",
      "Campbell Scott",
      "Irrfan Khan"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Amazing%20Spider-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Amazing_Spider-Man_(film)",
    "sourceLabel": "Wikipedia"
  },
  "the-wolverine": {
    "synopsis": "The Wolverine forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 126,
    "episodeRuntimeMinutes": 126,
    "mainCharacters": [
      "Hugh Jackman",
      "Hiroyuki Sanada",
      "Famke Janssen"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Wolverine%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Wolverine_(film)",
    "sourceLabel": "Wikipedia"
  },
  "amazing-spiderman-2": {
    "synopsis": "The Amazing Spider-Man 2 forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 142,
    "episodeRuntimeMinutes": 142,
    "mainCharacters": [
      "Andrew Garfield",
      "Emma Stone",
      "Jamie Foxx",
      "Dane DeHaan",
      "Campbell Scott",
      "Embeth Davidtz"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Amazing%20Spider-Man%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Amazing_Spider-Man_2",
    "sourceLabel": "Wikipedia"
  },
  "days-future-past": {
    "synopsis": "X-Men: Days of Future Past forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 131,
    "episodeRuntimeMinutes": 131,
    "mainCharacters": [
      "Hugh Jackman",
      "James McAvoy",
      "Michael Fassbender",
      "Jennifer Lawrence",
      "Halle Berry",
      "Anna Paquin"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20Days%20of%20Future%20Past%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men:_Days_of_Future_Past",
    "sourceLabel": "Wikipedia"
  },
  "fantastic-four-2015": {
    "synopsis": "Fantastic Four (stylized as FANT4STIC) is a 2015 superhero film based on the Marvel Comics superhero team and the first reboot of the Fantastic Four film series.  Directed by Josh Trank and written by Trank, Jeremy Slater, and Simon Kinberg, it stars Miles Teller, Michael B.",
    "runtimeMinutes": 100,
    "episodeRuntimeMinutes": 100,
    "mainCharacters": [
      "Miles Teller",
      "Michael B. Jordan",
      "Kate Mara",
      "Jamie Bell",
      "Toby Kebbell",
      "Reg E. Cathey"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Fantastic%20Four%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Fantastic_Four_(2015_film)",
    "sourceLabel": "Wikipedia"
  },
  "deadpool": {
    "synopsis": "Deadpool is a 2016 American superhero film based on the Marvel Comics character Wade Wilson / Deadpool.  Directed by Tim Miller, in his feature directorial debut, and written by Rhett Reese and Paul Wernick, it is a spin-off of the X-Men film series and its overall eighth installment.",
    "runtimeMinutes": 108,
    "episodeRuntimeMinutes": 108,
    "mainCharacters": [
      "Morena Baccarin",
      "Ed Skrein",
      "T.J. Miller",
      "Gina Carano",
      "Brianna Hildebrand"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Deadpool%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia gráfica",
      "Lenguaje fuerte",
      "Contenido para adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Deadpool_(film)",
    "sourceLabel": "Wikipedia"
  },
  "xmen-apocalypse": {
    "synopsis": "X-Men: Apocalypse forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 144,
    "episodeRuntimeMinutes": 144,
    "mainCharacters": [
      "James McAvoy",
      "Michael Fassbender",
      "Jennifer Lawrence",
      "Oscar Isaac",
      "Nicholas Hoult",
      "Rose Byrne"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%3A%20Apocalypse%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men:_Apocalypse",
    "sourceLabel": "Wikipedia"
  },
  "logan": {
    "synopsis": "Logan is a 2017 American superhero film starring Hugh Jackman as the titular character.  Based on the Marvel Comics character Wolverine, the film was directed by James Mangold, who co-wrote the screenplay with Michael Green and Scott Frank from a story by Mangold.",
    "runtimeMinutes": 137,
    "episodeRuntimeMinutes": 137,
    "mainCharacters": [
      "Hugh Jackman",
      "Patrick Stewart",
      "Richard E. Grant",
      "Boyd Holbrook",
      "Stephen Merchant",
      "Dafne Keen"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Logan%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia gráfica",
      "Lenguaje fuerte",
      "Contenido para adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Logan_(film)",
    "sourceLabel": "Wikipedia"
  },
  "deadpool-2": {
    "synopsis": "Deadpool 2 is a 2018 American superhero film based on the Marvel Comics character Deadpool.  It is the sequel to Deadpool (2016) and the eleventh installment in the X-Men film series.",
    "runtimeMinutes": 119,
    "episodeRuntimeMinutes": 119,
    "mainCharacters": [
      "Ryan Reynolds",
      "Josh Brolin",
      "Morena Baccarin",
      "Julian Dennison",
      "Zazie Beetz",
      "T.J. Miller"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Deadpool%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia gráfica",
      "Lenguaje fuerte",
      "Contenido para adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Deadpool_2",
    "sourceLabel": "Wikipedia"
  },
  "venom": {
    "synopsis": "Venom forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 112,
    "episodeRuntimeMinutes": 112,
    "mainCharacters": [
      "Tom Hardy",
      "Michelle Williams",
      "Riz Ahmed",
      "Scott Haze",
      "Reid Scott"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Venom%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Venom_(2018_film)",
    "sourceLabel": "Wikipedia"
  },
  "spider-verse": {
    "synopsis": "Spider-Man: Into the Spider-Verse forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 117,
    "episodeRuntimeMinutes": 117,
    "mainCharacters": [
      "Shameik Moore",
      "Jake Johnson",
      "Hailee Steinfeld",
      "Mahershala Ali",
      "Brian Tyree Henry",
      "Lily Tomlin"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Into%20the%20Spider-Verse%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Into_the_Spider-Verse",
    "sourceLabel": "Wikipedia"
  },
  "dark-phoenix": {
    "synopsis": "Dark Phoenix (marketed internationally and released on home media as X-Men: Dark Phoenix) is a 2019 American superhero film based on Marvel Comics featuring the superhero team the X-Men.  It is a sequel to X-Men: Apocalypse (2016), the twelfth installment in the X-Men film series, and the fourth and final installment of the prequel films.",
    "runtimeMinutes": 114,
    "episodeRuntimeMinutes": 114,
    "mainCharacters": [
      "James McAvoy",
      "Michael Fassbender",
      "Jennifer Lawrence",
      "Nicholas Hoult",
      "Sophie Turner",
      "Tye Sheridan"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Dark%20Phoenix%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Dark_Phoenix_(film)",
    "sourceLabel": "Wikipedia"
  },
  "new-mutants": {
    "synopsis": "The New Mutants forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 94,
    "episodeRuntimeMinutes": 94,
    "mainCharacters": [
      "Maisie Williams",
      "Anya Taylor-Joy",
      "Charlie Heaton",
      "Alice Braga"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20New%20Mutants%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_New_Mutants_(film)",
    "sourceLabel": "Wikipedia"
  },
  "venom-carnage": {
    "synopsis": "Venom: Let There Be Carnage forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 97,
    "episodeRuntimeMinutes": 97,
    "mainCharacters": [
      "Michelle Williams",
      "Naomie Harris",
      "Reid Scott",
      "Stephen Graham",
      "Woody Harrelson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Venom%3A%20Let%20There%20Be%20Carnage%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Venom:_Let_There_Be_Carnage",
    "sourceLabel": "Wikipedia"
  },
  "morbius": {
    "synopsis": "Morbius is a 2022 American superhero film based on the Marvel Comics character.  Produced by Columbia Pictures in association with Marvel Entertainment, Arad Productions, and Matt Tolmach Productions, and distributed by Sony Pictures Releasing, it is the third film in Sony's Spider-Man Universe (SSU).",
    "runtimeMinutes": 104,
    "episodeRuntimeMinutes": 104,
    "mainCharacters": [
      "Jared Leto",
      "Matt Smith",
      "Adria Arjona",
      "Jared Harris",
      "Al Madrigal",
      "Tyrese Gibson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Morbius%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Morbius_(film)",
    "sourceLabel": "Wikipedia"
  },
  "across-spider-verse": {
    "synopsis": "Spider-Man: Across the Spider-Verse is a 2023 American animated superhero film based on Marvel Comics featuring the character Miles Morales / Spider-Man.  Directed by Joaquim Dos Santos, Kemp Powers and Justin K.",
    "runtimeMinutes": 140,
    "episodeRuntimeMinutes": 140,
    "mainCharacters": [
      "Shameik Moore",
      "Hailee Steinfeld",
      "Brian Tyree Henry",
      "Luna Lauren Velez",
      "Jake Johnson",
      "Jason Schwartzman"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Across%20the%20Spider-Verse%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Across_the_Spider-Verse",
    "sourceLabel": "Wikipedia"
  },
  "madame-web": {
    "synopsis": "Madame Web is a 2024 American superhero film based on the Marvel Comics character.  It is the fourth film in Sony's Spider-Man Universe (SSU).",
    "runtimeMinutes": 116,
    "episodeRuntimeMinutes": 116,
    "mainCharacters": [
      "Dakota Johnson",
      "Sydney Sweeney",
      "Isabela Merced",
      "Celeste O'Connor",
      "Tahar Rahim",
      "Mike Epps"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Madame%20Web%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Madame_Web_(film)",
    "sourceLabel": "Wikipedia"
  },
  "venom-last-dance": {
    "synopsis": "Venom: The Last Dance forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 109,
    "episodeRuntimeMinutes": 109,
    "mainCharacters": [
      "Chiwetel Ejiofor",
      "Juno Temple",
      "Rhys Ifans",
      "Stephen Graham",
      "Peggy Lu",
      "Alanna Ubach"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Venom%3A%20The%20Last%20Dance%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Venom:_The_Last_Dance",
    "sourceLabel": "Wikipedia"
  },
  "kraven": {
    "synopsis": "Kraven the Hunter is a 2024 American superhero film based on the Marvel Comics character.  It is the sixth film in Sony's Spider-Man Universe (SSU).",
    "runtimeMinutes": 127,
    "episodeRuntimeMinutes": 127,
    "mainCharacters": [
      "Aaron Taylor-Johnson",
      "Ariana DeBose",
      "Fred Hechinger",
      "Alessandro Nivola",
      "Christopher Abbott",
      "Russell Crowe"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Kraven%20the%20Hunter%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Kraven_the_Hunter_(film)",
    "sourceLabel": "Wikipedia"
  },
  "beyond-spider-verse": {
    "synopsis": "Spider-Man: Beyond the Spider-Verse forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "mainCharacters": [
      "Shameik Moore",
      "Hailee Steinfeld",
      "Brian Tyree Henry",
      "Lauren Vélez",
      "Jake Johnson",
      "Jason Schwartzman"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Beyond%20the%20Spider-Verse%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Beyond_the_Spider-Verse",
    "sourceLabel": "Wikipedia"
  },
  "iron-man": {
    "synopsis": "Iron Man is a 2008 American superhero film based on the Marvel Comics character Iron Man.  Produced by Marvel Studios and distributed by Paramount Pictures, it is the first film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 126,
    "episodeRuntimeMinutes": 126,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Terrence Howard",
      "Jeff Bridges",
      "Gwyneth Paltrow",
      "Leslie Bibb",
      "Shaun Toub"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Man_(2008_film)",
    "sourceLabel": "Wikipedia"
  },
  "hulk": {
    "synopsis": "The Incredible Hulk (titulada El increíble Hulk en España y Hulk: El hombre increíble en Hispanoamérica) es una película de superhéroes estadounidense de 2008 basada en el personaje Hulk, de Marvel Comics, producida por Marvel Studios y distribuida por Universal Pictures.  Es la segunda entrega del Universo cinematográfico de Marvel.",
    "runtimeMinutes": 112,
    "episodeRuntimeMinutes": 112,
    "mainCharacters": [
      "Edward Norton",
      "Liv Tyler",
      "Tim Roth",
      "William Hurt",
      "Tim Blake Nelson",
      "Ty Burrell"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=El%20incre%C3%ADble%20Hulk%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://es.wikipedia.org/wiki/The_Incredible_Hulk_(pel%C3%ADcula)",
    "sourceLabel": "Wikipedia en español"
  },
  "iron-man-2": {
    "synopsis": "Iron Man 2 is a 2010 American superhero film based on the Marvel Comics character Iron Man.  Produced by Marvel Studios and distributed by Paramount Pictures, it is the sequel to Iron Man (2008) and the third film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 125,
    "episodeRuntimeMinutes": 125,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Gwyneth Paltrow",
      "Don Cheadle",
      "Scarlett Johansson",
      "Sam Rockwell",
      "Mickey Rourke"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Man%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Man_2",
    "sourceLabel": "Wikipedia"
  },
  "thor": {
    "synopsis": "Thor forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 114,
    "episodeRuntimeMinutes": 114,
    "mainCharacters": [
      "Chris Hemsworth",
      "Natalie Portman",
      "Tom Hiddleston",
      "Stellan Skarsgård",
      "Kat Dennings",
      "Clark Gregg"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thor%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Thor_(film)",
    "sourceLabel": "Wikipedia"
  },
  "cap-first-avenger": {
    "synopsis": "Captain America: The First Avenger is a 2011 American superhero film based on the Marvel Comics character Captain America.  Produced by Marvel Studios and distributed by Paramount Pictures, it is the fifth film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 124,
    "episodeRuntimeMinutes": 124,
    "mainCharacters": [
      "Chris Evans",
      "Tommy Lee Jones",
      "Hugo Weaving",
      "Hayley Atwell",
      "Sebastian Stan",
      "Dominic Cooper"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Capit%C3%A1n%20Am%C3%A9rica%3A%20El%20primer%20vengador%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Captain_America:_The_First_Avenger",
    "sourceLabel": "Wikipedia"
  },
  "avengers": {
    "synopsis": "The Avengers forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 143,
    "episodeRuntimeMinutes": 143,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Chris Evans",
      "Mark Ruffalo",
      "Chris Hemsworth",
      "Scarlett Johansson",
      "Jeremy Renner"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Avengers%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Avengers_(2012_film)",
    "sourceLabel": "Wikipedia"
  },
  "iron-man-3": {
    "synopsis": "Iron Man 3 is a 2013 American superhero film based on the Marvel Comics character Iron Man, produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures.  It is the sequel to Iron Man (2008) and Iron Man 2 (2010), and the seventh film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 130,
    "episodeRuntimeMinutes": 130,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Gwyneth Paltrow",
      "Don Cheadle",
      "Guy Pearce",
      "Rebecca Hall",
      "Stéphanie Szostak"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Iron%20Man%203%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Iron_Man_3",
    "sourceLabel": "Wikipedia"
  },
  "thor-dark-world": {
    "synopsis": "Thor: Un mundo oscuro forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 112,
    "episodeRuntimeMinutes": 112,
    "mainCharacters": [
      "Chris Hemsworth",
      "Natalie Portman",
      "Tom Hiddleston",
      "Stellan Skarsgård",
      "Idris Elba",
      "Christopher Eccleston"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thor%3A%20Un%20mundo%20oscuro%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Thor:_The_Dark_World",
    "sourceLabel": "Wikipedia"
  },
  "winter-soldier": {
    "synopsis": "Captain America: The Winter Soldier is a 2014 American superhero film based on the Marvel Comics character Captain America, produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures.  It is the sequel to Captain America: The First Avenger (2011) and the ninth film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 136,
    "episodeRuntimeMinutes": 136,
    "mainCharacters": [
      "Chris Evans",
      "Scarlett Johansson",
      "Sebastian Stan",
      "Anthony Mackie",
      "Cobie Smulders",
      "Frank Grillo"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Capit%C3%A1n%20Am%C3%A9rica%3A%20El%20Soldado%20del%20Invierno%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Captain_America:_The_Winter_Soldier",
    "sourceLabel": "Wikipedia"
  },
  "guardians": {
    "synopsis": "Guardians of the Galaxy (retroactively referred to as Guardians of the Galaxy Vol.  1) is a 2014 American superhero film based on the Marvel Comics superhero team the Guardians of the Galaxy.",
    "runtimeMinutes": 122,
    "episodeRuntimeMinutes": 122,
    "mainCharacters": [
      "Chris Pratt",
      "Zoe Saldaña",
      "Dave Bautista",
      "Vin Diesel",
      "Bradley Cooper",
      "Lee Pace"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Guardianes%20de%20la%20Galaxia%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Guardians_of_the_Galaxy_(film)",
    "sourceLabel": "Wikipedia"
  },
  "ultron": {
    "synopsis": "Avengers: Age of Ultron is a 2015 American superhero film based on the Marvel Comics superhero team the Avengers.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to The Avengers (2012) and the 11th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 141,
    "episodeRuntimeMinutes": 141,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Chris Hemsworth",
      "Mark Ruffalo",
      "Chris Evans",
      "Scarlett Johansson",
      "Jeremy Renner"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%3A%20Era%20de%20Ultr%C3%B3n%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers:_Age_of_Ultron",
    "sourceLabel": "Wikipedia"
  },
  "ant-man": {
    "synopsis": "Ant-Man is a 2015 American superhero film based on the Marvel Comics Ant-Man characters Scott Lang and Hank Pym.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 12th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 117,
    "episodeRuntimeMinutes": 117,
    "mainCharacters": [
      "Evangeline Lilly",
      "Corey Stoll",
      "Bobby Cannavale",
      "Michael Peña",
      "Tip \"T.I.\" Harris",
      "Anthony Mackie"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ant-Man%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ant-Man_(film)",
    "sourceLabel": "Wikipedia"
  },
  "civil-war": {
    "synopsis": "Captain America: Civil War is a 2016 American superhero film based on the Marvel Comics character Captain America, produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures.  It is the sequel to Captain America: The First Avenger (2011) and Captain America: The Winter Soldier (2014), and the 13th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 147,
    "episodeRuntimeMinutes": 147,
    "mainCharacters": [
      "Chris Evans",
      "Robert Downey Jr.",
      "Scarlett Johansson",
      "Sebastian Stan",
      "Anthony Mackie",
      "Don Cheadle"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Capit%C3%A1n%20Am%C3%A9rica%3A%20Civil%20War%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Captain_America:_Civil_War",
    "sourceLabel": "Wikipedia"
  },
  "doctor-strange": {
    "synopsis": "Doctor Strange is a 2016 American superhero film based on the Marvel Comics character of the same name.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 14th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 115,
    "episodeRuntimeMinutes": 115,
    "mainCharacters": [
      "Benedict Cumberbatch",
      "Chiwetel Ejiofor",
      "Rachel McAdams",
      "Benedict Wong",
      "Michael Stuhlbarg",
      "Benjamin Bratt"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Doctor%20Strange%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Doctor_Strange_(2016_film)",
    "sourceLabel": "Wikipedia"
  },
  "guardians-2": {
    "synopsis": "Guardians of the Galaxy Vol.  2 is a 2017 American superhero film based on the Marvel Comics superhero team Guardians of the Galaxy, produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures.",
    "runtimeMinutes": 136,
    "episodeRuntimeMinutes": 136,
    "mainCharacters": [
      "Chris Pratt",
      "Zoe Saldaña",
      "Dave Bautista",
      "Vin Diesel",
      "Bradley Cooper",
      "Michael Rooker"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Guardianes%20de%20la%20Galaxia%20Vol.%202%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Guardians_of_the_Galaxy_Vol._2",
    "sourceLabel": "Wikipedia"
  },
  "homecoming": {
    "synopsis": "Spider-Man: Homecoming forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 133,
    "episodeRuntimeMinutes": 133,
    "mainCharacters": [
      "Tom Holland",
      "Michael Keaton",
      "Jon Favreau",
      "Gwyneth Paltrow",
      "Zendaya",
      "Donald Glover"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Homecoming%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Homecoming",
    "sourceLabel": "Wikipedia"
  },
  "ragnarok": {
    "synopsis": "Thor: Ragnarok forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 130,
    "episodeRuntimeMinutes": 130,
    "mainCharacters": [
      "Chris Hemsworth",
      "Tom Hiddleston",
      "Cate Blanchett",
      "Idris Elba",
      "Jeff Goldblum",
      "Tessa Thompson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thor%3A%20Ragnarok%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Thor:_Ragnarok",
    "sourceLabel": "Wikipedia"
  },
  "black-panther": {
    "synopsis": "Black Panther is a 2018 American superhero film based on the Marvel Comics character of the same name.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 18th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 134,
    "episodeRuntimeMinutes": 134,
    "mainCharacters": [
      "Chadwick Boseman",
      "Michael B. Jordan",
      "Lupita Nyong'o",
      "Danai Gurira",
      "Martin Freeman",
      "Daniel Kaluuya"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Black%20Panther%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Black_Panther_(film)",
    "sourceLabel": "Wikipedia"
  },
  "infinity-war": {
    "synopsis": "Avengers: Infinity War is a 2018 American superhero film based on the Marvel Comics superhero team the Avengers.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to The Avengers (2012) and Avengers: Age of Ultron (2015), and the 19th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 149,
    "episodeRuntimeMinutes": 149,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Chris Hemsworth",
      "Mark Ruffalo",
      "Chris Evans",
      "Scarlett Johansson",
      "Benedict Cumberbatch"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%3A%20Infinity%20War%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers:_Infinity_War",
    "sourceLabel": "Wikipedia"
  },
  "antman-wasp": {
    "synopsis": "Ant-Man and the Wasp is a 2018 American superhero film based on Marvel Comics featuring the characters Scott Lang / Ant-Man and Hope Pym / Wasp.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to Ant-Man (2015) and the 20th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 118,
    "episodeRuntimeMinutes": 118,
    "mainCharacters": [
      "Evangeline Lilly",
      "Michael Peña",
      "Walton Goggins",
      "Hannah John-Kamen",
      "David Dastmalchian",
      "Tip \"T.I.\" Harris"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ant-Man%20and%20the%20Wasp%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ant-Man_and_the_Wasp",
    "sourceLabel": "Wikipedia"
  },
  "captain-marvel": {
    "synopsis": "Captain Marvel is a 2019 American superhero film based on Marvel Comics featuring the character Carol Danvers / Captain Marvel.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 21st film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 124,
    "episodeRuntimeMinutes": 124,
    "mainCharacters": [
      "Brie Larson",
      "Samuel L. Jackson",
      "Ben Mendelsohn",
      "Djimon Hounsou",
      "Lee Pace",
      "Lashana Lynch"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Capitana%20Marvel%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Captain_Marvel_(film)",
    "sourceLabel": "Wikipedia"
  },
  "endgame": {
    "synopsis": "Avengers: Endgame is a 2019 American superhero film based on the Marvel Comics superhero team the Avengers.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the direct sequel to Avengers: Infinity War (2018) and the 22nd film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 181,
    "episodeRuntimeMinutes": 181,
    "mainCharacters": [
      "Robert Downey Jr.",
      "Chris Evans",
      "Mark Ruffalo",
      "Chris Hemsworth",
      "Scarlett Johansson",
      "Jeremy Renner"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%3A%20Endgame%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers:_Endgame",
    "sourceLabel": "Wikipedia"
  },
  "far-from-home": {
    "synopsis": "Spider-Man: Lejos de casa forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 129,
    "episodeRuntimeMinutes": 129,
    "mainCharacters": [
      "Tom Holland",
      "Samuel L. Jackson",
      "Zendaya",
      "Cobie Smulders",
      "Jon Favreau",
      "J. B. Smoove"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Lejos%20de%20casa%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Far_From_Home",
    "sourceLabel": "Wikipedia"
  },
  "wandavision": {
    "synopsis": "WandaVision forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      27,
      34,
      30,
      33,
      38,
      35,
      34,
      43,
      47
    ],
    "mainCharacters": [
      "Elizabeth Olsen",
      "Paul Bettany",
      "Debra Jo Rupp",
      "Fred Melamed",
      "Kathryn Hahn",
      "Teyonah Parris"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=WandaVision%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/WandaVision",
    "sourceLabel": "Wikipedia"
  },
  "falcon-winter": {
    "synopsis": "Falcon y el Soldado del Invierno forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      47,
      47,
      51,
      51,
      57,
      49
    ],
    "mainCharacters": [
      "Sebastian Stan",
      "Anthony Mackie",
      "Wyatt Russell",
      "Erin Kellyman",
      "Danny Ramirez",
      "Georges St-Pierre"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Falcon%20y%20el%20Soldado%20del%20Invierno%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Falcon_and_the_Winter_Soldier",
    "sourceLabel": "Wikipedia"
  },
  "loki-1": {
    "synopsis": "The first season of the American television series Loki, based on Marvel Comics featuring the character of the same name, sees Loki brought to the mysterious Time Variance Authority (TVA) after stealing the Tesseract during the events of Avengers: Endgame (2019), and is forced to help catch a dangerous variant version of himself.  It is set in the Marvel Cinematic Universe (MCU), sharing continuity with the films and television series of the franchise.",
    "episodeDurations": [
      50,
      53,
      41,
      48,
      48,
      45
    ],
    "mainCharacters": [
      "Tom Hiddleston",
      "Gugu Mbatha-Raw",
      "Wunmi Mosaku",
      "Eugene Cordero",
      "Tara Strong",
      "Owen Wilson"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Loki%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Loki_season_1",
    "sourceLabel": "Wikipedia"
  },
  "black-widow": {
    "synopsis": "Black Widow (Viuda Negra en España) es una película de superhéroes estadounidense de 2021 basada en el personaje de Marvel Comics del mismo nombre.  Producida por Marvel Studios y distribuida por Walt Disney Studios Motion Pictures, es la vigésimo cuarta película en el Universo cinematográfico de Marvel (MCU, por sus siglas en inglés).",
    "runtimeMinutes": 134,
    "episodeRuntimeMinutes": 134,
    "mainCharacters": [
      "Scarlett Johansson",
      "Florence Pugh",
      "David Harbour",
      "O-T Fagbenle",
      "Olga Kurylenko",
      "William Hurt"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Black%20Widow%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://es.wikipedia.org/wiki/Black_Widow_(pel%C3%ADcula)",
    "sourceLabel": "Wikipedia en español"
  },
  "what-if-1": {
    "synopsis": "What If...?  is an American animated anthology television series created by A.",
    "episodeDurations": [
      33,
      32,
      32,
      36,
      30,
      33,
      33,
      30,
      35
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=What%20If...%3F%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/What_If...%3F_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "shang-chi": {
    "synopsis": "Shang-Chi and the Legend of the Ten Rings is a 2021 American superhero film based on Marvel Comics featuring the character Shang-Chi.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 25th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 132,
    "episodeRuntimeMinutes": 132,
    "mainCharacters": [
      "Simu Liu",
      "Awkwafina",
      "Meng'er Zhang",
      "Fala Chen",
      "Florian Munteanu",
      "Benedict Wong"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Shang-Chi%20y%20la%20leyenda%20de%20los%20Diez%20Anillos%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Shang-Chi_and_the_Legend_of_the_Ten_Rings",
    "sourceLabel": "Wikipedia"
  },
  "eternals": {
    "synopsis": "Eternals is a 2021 American superhero film based on the Marvel Comics race the Eternals.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 26th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 156,
    "episodeRuntimeMinutes": 156,
    "mainCharacters": [
      "Gemma Chan",
      "Richard Madden",
      "Kumail Nanjiani",
      "Lia McHugh",
      "Brian Tyree Henry",
      "Lauren Ridloff"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Eternals%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Eternals_(film)",
    "sourceLabel": "Wikipedia"
  },
  "hawkeye": {
    "synopsis": "Hawkeye forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      47,
      49,
      44,
      41,
      45,
      62
    ],
    "mainCharacters": [
      "Jeremy Renner",
      "Hailee Steinfeld",
      "Tony Dalton",
      "Fra Fee",
      "Brian d'Arcy James",
      "Aleks Paunovic"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Hawkeye%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Hawkeye_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "no-way-home": {
    "synopsis": "Spider-Man: No Way Home forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 148,
    "episodeRuntimeMinutes": 148,
    "mainCharacters": [
      "Tom Holland",
      "Zendaya",
      "Benedict Cumberbatch",
      "Jacob Batalon",
      "Jon Favreau",
      "Jamie Foxx"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20No%20Way%20Home%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_No_Way_Home",
    "sourceLabel": "Wikipedia"
  },
  "moon-knight": {
    "synopsis": "Moon Knight is an American television miniseries created by Jeremy Slater for the streaming service Disney+, based on Marvel Comics featuring the character of the same name.  It is the sixth television series in the Marvel Cinematic Universe (MCU) to be produced by Marvel Studios, sharing continuity with the films of the franchise.",
    "episodeDurations": [
      47,
      52,
      53,
      53,
      50,
      43
    ],
    "mainCharacters": [
      "Oscar Isaac",
      "May Calamawy",
      "F. Murray Abraham",
      "Ethan Hawke",
      "Ann Akinjirin",
      "Khalid Abdalla"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Moon%20Knight%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Moon_Knight_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "multiverse-madness": {
    "synopsis": "Doctor Strange in the Multiverse of Madness is a 2022 American superhero film based on Marvel Comics featuring the character Doctor Strange.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to Doctor Strange (2016) and the 28th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 126,
    "episodeRuntimeMinutes": 126,
    "mainCharacters": [
      "Benedict Cumberbatch",
      "Elizabeth Olsen",
      "Chiwetel Ejiofor",
      "Benedict Wong",
      "Xochitl Gomez",
      "Michael Stuhlbarg"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Doctor%20Strange%20en%20el%20multiverso%20de%20la%20locura%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Doctor_Strange_in_the_Multiverse_of_Madness",
    "sourceLabel": "Wikipedia"
  },
  "ms-marvel": {
    "synopsis": "Ms.  Marvel is an American television miniseries created by Bisha K.",
    "episodeDurations": [
      47,
      49,
      45,
      45,
      40,
      49
    ],
    "mainCharacters": [
      "Iman Vellani",
      "Matt Lintz",
      "Yasmeen Fletcher",
      "Zenobia Shroff",
      "Mohan Kapur",
      "Saagar Shaikh"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ms.%20Marvel%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ms._Marvel_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "love-thunder": {
    "synopsis": "Thor: Love and Thunder forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 119,
    "episodeRuntimeMinutes": 119,
    "mainCharacters": [
      "Chris Hemsworth",
      "Christian Bale",
      "Tessa Thompson",
      "Jaimie Alexander",
      "Russell Crowe",
      "Natalie Portman"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thor%3A%20Love%20and%20Thunder%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Thor:_Love_and_Thunder",
    "sourceLabel": "Wikipedia"
  },
  "she-hulk": {
    "synopsis": "She-Hulk: Attorney at Law is an American television miniseries created by Jessica Gao for the streaming service Disney+, based on Marvel Comics featuring the character She-Hulk.  It is the eighth television series in the Marvel Cinematic Universe (MCU) produced by Marvel Studios, sharing continuity with the films of the franchise.",
    "episodeDurations": [
      38,
      28,
      35,
      34,
      31,
      29,
      32,
      34,
      35
    ],
    "mainCharacters": [
      "Tatiana Maslany",
      "Jameela Jamil",
      "Ginger Gonzaga",
      "Mark Ruffalo",
      "Josh Segarra",
      "Mark Linn-Baker"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=She-Hulk%3A%20Defensora%20de%20h%C3%A9roes%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/She-Hulk:_Attorney_at_Law",
    "sourceLabel": "Wikipedia"
  },
  "werewolf": {
    "synopsis": "Werewolf by Night forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 53,
    "episodeRuntimeMinutes": 53,
    "mainCharacters": [
      "Gael García Bernal",
      "Laura Donnelly",
      "Harriet Sansom Harris"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Werewolf%20by%20Night%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Werewolf_by_Night_(TV_special)",
    "sourceLabel": "Wikipedia"
  },
  "wakanda-forever": {
    "synopsis": "Black Panther: Wakanda Forever is a 2022 American superhero film based on Marvel Comics featuring the character Shuri / Black Panther.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to Black Panther (2018) and the 30th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 161,
    "episodeRuntimeMinutes": 161,
    "mainCharacters": [
      "Letitia Wright",
      "Lupita Nyong'o",
      "Danai Gurira",
      "Winston Duke",
      "Florence Kasumba",
      "Dominique Thorne"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Black%20Panther%3A%20Wakanda%20Forever%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Black_Panther:_Wakanda_Forever",
    "sourceLabel": "Wikipedia"
  },
  "holiday-special": {
    "synopsis": "Especial navideño de Guardianes forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 42,
    "episodeRuntimeMinutes": 42,
    "mainCharacters": [
      "Chris Pratt",
      "Dave Bautista",
      "Karen Gillan",
      "Pom Klementieff",
      "Vin Diesel",
      "Bradley Cooper"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Especial%20navide%C3%B1o%20de%20Guardianes%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Guardians_of_the_Galaxy_Holiday_Special",
    "sourceLabel": "Wikipedia"
  },
  "quantumania": {
    "synopsis": "Ant-Man and the Wasp: Quantumania is a 2023 American superhero film based on Marvel Comics featuring the characters Scott Lang / Ant-Man and Hope Pym / Wasp.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the sequel to Ant-Man (2015) and Ant-Man and the Wasp (2018), and the 31st film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 124,
    "episodeRuntimeMinutes": 124,
    "mainCharacters": [
      "Paul Rudd",
      "Evangeline Lilly",
      "Jonathan Majors",
      "Kathryn Newton",
      "David Dastmalchian",
      "Katy O'Brian"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ant-Man%20and%20the%20Wasp%3A%20Quantumania%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ant-Man_and_the_Wasp:_Quantumania",
    "sourceLabel": "Wikipedia"
  },
  "guardians-3": {
    "synopsis": "Guardians of the Galaxy Vol.  3 (marketed as Guardians of the Galaxy Volume 3) is a 2023 American superhero film based on Marvel Comics featuring the superhero team Guardians of the Galaxy.",
    "runtimeMinutes": 150,
    "episodeRuntimeMinutes": 150,
    "mainCharacters": [
      "Chris Pratt",
      "Zoe Saldaña",
      "Dave Bautista",
      "Karen Gillan",
      "Pom Klementieff",
      "Vin Diesel"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Guardianes%20de%20la%20Galaxia%20Vol.%203%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Guardians_of_the_Galaxy_Vol._3",
    "sourceLabel": "Wikipedia"
  },
  "secret-invasion": {
    "synopsis": "Secret Invasion is an American television miniseries created by Kyle Bradstreet for the streaming service Disney+, based on the 2008 Marvel Comics storyline \"Secret Invasion\".  It is the ninth television series in the Marvel Cinematic Universe (MCU) produced by Marvel Studios, sharing continuity with the films of the franchise.",
    "episodeDurations": [
      55,
      58,
      42,
      36,
      37,
      36
    ],
    "mainCharacters": [
      "Samuel L. Jackson",
      "Ben Mendelsohn",
      "Kingsley Ben-Adir",
      "Killian Scott",
      "Samuel Adewunmi",
      "Dermot Mulroney"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Secret%20Invasion%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Secret_Invasion_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "groot-2": {
    "synopsis": "I Am Groot is an American series of animated shorts created by Kirsten Lepore for the streaming service Disney+, based on the Marvel Comics featuring the character Groot.  Featuring characters from the Marvel Cinematic Universe (MCU) and sharing continuity with the films of the franchise, the series follows Baby Groot on various adventures that get him into trouble between the events of Guardians of the Galaxy (2014) and one of Guardians of the Galaxy Vol.",
    "episodeDurations": [
      4,
      4,
      5,
      4,
      6
    ],
    "mainCharacters": [
      "Vin Diesel",
      "Bradley Cooper",
      "Jeffrey Wright"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=I%20Am%20Groot%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/I_Am_Groot",
    "sourceLabel": "Wikipedia"
  },
  "loki-2": {
    "synopsis": "The second season of the American television series Loki, based on Marvel Comics featuring the character of the same name, sees Loki working with Mobius M.  Mobius, Hunter B-15, and other members of the Time Variance Authority (TVA) to navigate the multiverse to find Sylvie, Ravonna Renslayer, and Miss Minutes.",
    "episodeDurations": [
      48,
      52,
      54,
      51,
      45,
      59
    ],
    "mainCharacters": [
      "Tom Hiddleston",
      "Sophia Di Martino",
      "Wunmi Mosaku",
      "Eugene Cordero",
      "Rafael Casal",
      "Kate Dickie"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Loki%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Loki_season_2",
    "sourceLabel": "Wikipedia"
  },
  "the-marvels": {
    "synopsis": "The Marvels forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "runtimeMinutes": 105,
    "episodeRuntimeMinutes": 105,
    "mainCharacters": [
      "Brie Larson",
      "Teyonah Parris",
      "Iman Vellani",
      "Zawe Ashton",
      "Gary Lewis",
      "Park Seo-joon"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Marvels%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Marvels",
    "sourceLabel": "Wikipedia"
  },
  "what-if-2": {
    "synopsis": "What If...?  is an American animated anthology television series created by A.",
    "episodeDurations": [
      29,
      30,
      27,
      32,
      31,
      32,
      29,
      30,
      31
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=What%20If...%3F%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/What_If...%3F_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "echo": {
    "synopsis": "Echo is an American television miniseries created for the streaming service Disney+, based on Marvel Comics featuring the character of the same name.  A spin-off from the series Hawkeye (2021), it is the 10th television series in the Marvel Cinematic Universe (MCU) produced by Marvel Studios, sharing continuity with the films of the franchise.",
    "episodeDurations": [
      49,
      39,
      42,
      38,
      35
    ],
    "mainCharacters": [
      "Alaqua Cox",
      "Chaske Spencer",
      "Tantoo Cardinal",
      "Charlie Cox",
      "Devery Jacobs",
      "Zahn McClarnon"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Echo%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Echo_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "xmen97-1": {
    "synopsis": "The first season of the American animated television series X-Men '97 is based on the Marvel Comics superhero team X-Men.  The series is a revival of X-Men: The Animated Series (1992–1997), continuing the story of the X-Men following the loss of their leader, Professor X.",
    "episodeDurations": [
      32,
      32,
      32,
      29,
      36,
      33,
      34,
      34,
      31,
      42
    ],
    "mainCharacters": [
      "Ray Chase",
      "Jennifer Hale",
      "Alison Sealy-Smith",
      "Cal Dodd",
      "J. P. Karliak",
      "Lenore Zann"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%20'97%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men_%2797_season_1",
    "sourceLabel": "Wikipedia"
  },
  "deadpool-wolverine": {
    "synopsis": "Deadpool & Wolverine (Deadpool y Lobezno en España) es una película de superhéroes estadounidense basada en Marvel Comics, con los personajes Deadpool y Wolverine, producida por Marvel Studios, Maximum Effort, y 21 Laps Entertainment, y distribuida por Walt Disney Studios Motion Pictures​.  Es la película número 34 del Universo cinematográfico de Marvel (UCM) y una secuela de Deadpool (2016) y Deadpool 2 (2018).",
    "runtimeMinutes": 128,
    "episodeRuntimeMinutes": 128,
    "mainCharacters": [
      "Hugh Jackman",
      "Emma Corrin",
      "Morena Baccarin",
      "Rob Delaney",
      "Leslie Uggams",
      "Aaron Stanford"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Deadpool%20%26%20Wolverine%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia gráfica",
      "Lenguaje fuerte",
      "Contenido para adultos"
    ],
    "sourceUrl": "https://es.wikipedia.org/wiki/Deadpool_%26_Wolverine",
    "sourceLabel": "Wikipedia en español"
  },
  "agatha": {
    "synopsis": "Agatha All Along is an American television miniseries created by Jac Schaeffer for the streaming service Disney+, based on Marvel Comics featuring the character Agatha Harkness.  A spin-off from the miniseries WandaVision (2021), it is the 11th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and the first to be produced under its Marvel Television label.",
    "episodeDurations": [
      42,
      42,
      36,
      41,
      30,
      47,
      35,
      49,
      42
    ],
    "mainCharacters": [
      "Kathryn Hahn",
      "Joe Locke",
      "Debra Jo Rupp",
      "Aubrey Plaza",
      "Sasheer Zamata",
      "Ali Ahn"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Agatha%20All%20Along%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Agatha_All_Along",
    "sourceLabel": "Wikipedia"
  },
  "what-if-3": {
    "synopsis": "What If...?  is an American animated anthology television series created by A.",
    "episodeDurations": [
      29,
      28,
      30,
      30,
      31,
      30,
      25,
      32
    ],
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=What%20If...%3F%20%C2%B7%20T3%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/What_If...%3F_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "friendly-spider-1": {
    "synopsis": "The first season of the American animated television series Your Friendly Neighborhood Spider-Man, based on Marvel Comics featuring the character Spider-Man, explores Peter Parker's early days as Spider-Man.  It is set in an alternate timeline from the main films and television series of the Marvel Cinematic Universe (MCU) where Norman Osborn becomes Peter's mentor instead of Tony Stark.",
    "episodeDurations": [
      30,
      29,
      32,
      33,
      31,
      29,
      29,
      30,
      31,
      33
    ],
    "mainCharacters": [
      "Hudson Thames",
      "Kari Wahlgren",
      "Eugene Byrd",
      "Zeno Robinson",
      "Colman Domingo",
      "Hugh Dancy"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Tu%20amigo%20y%20vecino%20Spider-Man%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Your_Friendly_Neighborhood_Spider-Man_season_1",
    "sourceLabel": "Wikipedia"
  },
  "brave-new-world": {
    "synopsis": "Captain America: Brave New World is a 2025 American superhero film based on Marvel Comics featuring the character Sam Wilson / Captain America.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the fourth installment in the Captain America film series, a continuation of the television miniseries The Falcon and the Winter Soldier (2021), and the 35th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 118,
    "episodeRuntimeMinutes": 118,
    "mainCharacters": [
      "Anthony Mackie",
      "Danny Ramirez",
      "Shira Haas",
      "Carl Lumbly",
      "Xosha Roquemore",
      "Giancarlo Esposito"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Capit%C3%A1n%20Am%C3%A9rica%3A%20Un%20nuevo%20mundo%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Captain_America:_Brave_New_World",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-ba-1": {
    "synopsis": "The first season of the American television series Daredevil: Born Again is based on Marvel Comics featuring the character Daredevil.  It sees blind lawyer and former vigilante Matt Murdock's fight for justice put him on a collision course with former mob boss Wilson Fisk, who is elected mayor of New York City.",
    "episodeDurations": [
      58,
      47,
      44,
      52,
      40,
      42,
      40,
      49,
      57
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Vincent D'Onofrio",
      "Margarita Levieva",
      "Deborah Ann Woll",
      "Elden Henson",
      "Wilson Bethel"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%3A%20Born%20Again%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil:_Born_Again_season_1",
    "sourceLabel": "Wikipedia"
  },
  "thunderbolts": {
    "synopsis": "Thunderbolts* is a 2025 American superhero film based on Marvel Comics featuring the team Thunderbolts.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 36th film in the Marvel Cinematic Universe (MCU).",
    "runtimeMinutes": 127,
    "episodeRuntimeMinutes": 127,
    "mainCharacters": [
      "Florence Pugh",
      "Sebastian Stan",
      "Wyatt Russell",
      "Olga Kurylenko",
      "Lewis Pullman",
      "Geraldine Viswanathan"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Thunderbolts*%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Thunderbolts*",
    "sourceLabel": "Wikipedia"
  },
  "ironheart": {
    "synopsis": "Ironheart is an American television miniseries created by Chinaka Hodge for the streaming service Disney+, based on Marvel Comics featuring the character of the same name.  It is the 14th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and was produced under its Marvel Television label.",
    "episodeDurations": [
      41,
      50,
      56,
      53,
      60,
      42
    ],
    "mainCharacters": [
      "Dominique Thorne",
      "Lyric Ross",
      "Manny Montana",
      "Jim Rash",
      "Eric André",
      "Cree Summer"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Ironheart%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Ironheart_(miniseries)",
    "sourceLabel": "Wikipedia"
  },
  "fantastic-four": {
    "synopsis": "The Fantastic Four: First Steps is a 2025 American superhero film based on the Marvel Comics superhero team the Fantastic Four.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is the 37th film in the Marvel Cinematic Universe (MCU) and the second reboot of the Fantastic Four film series.",
    "runtimeMinutes": 114,
    "episodeRuntimeMinutes": 114,
    "mainCharacters": [
      "Pedro Pascal",
      "Vanessa Kirby",
      "Ebon Moss-Bachrach",
      "Joseph Quinn",
      "Julia Garner",
      "Sarah Niles"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Los%204%20Fant%C3%A1sticos%3A%20Primeros%20pasos%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Fantastic_Four:_First_Steps",
    "sourceLabel": "Wikipedia"
  },
  "eyes-wakanda": {
    "synopsis": "Eyes of Wakanda is an American animated anthology television miniseries created by Todd Harris for the streaming service Disney+, based on the Marvel Comics country Wakanda.  It is the 15th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and is produced by Marvel Studios Animation with Proximity Media, sharing continuity with the films of the franchise.",
    "episodeDurations": [
      31,
      31,
      30,
      29
    ],
    "mainCharacters": [
      "Winnie Harlow",
      "Cress Williams",
      "Jacques Colimon",
      "Jona Xiao",
      "Steve Toussaint"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Eyes%20of%20Wakanda%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Eyes_of_Wakanda",
    "sourceLabel": "Wikipedia"
  },
  "marvel-zombies": {
    "synopsis": "Marvel Zombies forma parte del catálogo audiovisual de Marvel. Abre sus conexiones para descubrir dónde encaja sin revelar acontecimientos posteriores.",
    "episodeDurations": [
      37,
      33,
      32,
      31
    ],
    "mainCharacters": [
      "Iman Vellani",
      "Dominique Thorne",
      "Hailee Steinfeld",
      "Kerry Condon",
      "Todd Williams",
      "Kari Wahlgren"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Marvel%20Zombies%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Zombies_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "wonder-man-1": {
    "synopsis": "Wonder Man is an American television series created by Destin Daniel Cretton and Andrew Guest for the streaming service Disney+, based on the Marvel Comics character Simon Williams / Wonder Man.  It is the 17th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and was produced under its Marvel Television label.",
    "episodeDurations": [
      35,
      34,
      34,
      32,
      25,
      36,
      35,
      34
    ],
    "mainCharacters": [
      "Yahya Abdul-Mateen II",
      "X Mayo",
      "Zlatko Burić",
      "Ben Kingsley",
      "Arian Moayed",
      "Joe Pantoliano"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Wonder%20Man%20%C2%B7%20T1%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Wonder_Man_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-ba-2": {
    "synopsis": "The second season of the American television series Daredevil: Born Again is based on Marvel Comics featuring the character Daredevil.  It sees blind vigilante Matt Murdock / Daredevil gathering allies to resist Wilson Fisk, who is the mayor of New York City, and his Anti-Vigilante Task Force (AVTF).",
    "episodeDurations": [
      51,
      46,
      47,
      51,
      50,
      49,
      44,
      51
    ],
    "mainCharacters": [
      "Charlie Cox",
      "Vincent D'Onofrio",
      "Deborah Ann Woll",
      "Margarita Levieva",
      "Matthew Lillard",
      "Tony Dalton"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%3A%20Born%20Again%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil:_Born_Again_season_2",
    "sourceLabel": "Wikipedia"
  },
  "punisher-special": {
    "synopsis": "The Punisher: One Last Kill is an American television special directed by Reinaldo Marcus Green and written by Jon Bernthal and Green for the streaming service Disney+, based on Marvel Comics featuring the character Punisher.  It is the third Special Presentation in the Marvel Cinematic Universe (MCU), sharing continuity with the films and television series of the franchise.",
    "runtimeMinutes": 51,
    "episodeRuntimeMinutes": 51,
    "mainCharacters": [
      "Deborah Ann Woll",
      "Jason R. Moore",
      "Judith Light"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=The%20Punisher%3A%20One%20Last%20Kill%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Lenguaje fuerte",
      "Temas adultos"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/The_Punisher:_One_Last_Kill",
    "sourceLabel": "Wikipedia"
  },
  "xmen97-2": {
    "synopsis": "The second season of the American animated television series X-Men '97 is based on the Marvel Comics superhero team X-Men.  The series is a revival of X-Men: The Animated Series (1992–1997), continuing the story of the X-Men.",
    "episodeDurations": [
      33,
      29,
      29,
      35,
      31,
      33,
      30,
      34,
      null
    ],
    "mainCharacters": [
      "Ray Chase",
      "Jennifer Hale",
      "Alison Sealy-Smith",
      "Cal Dodd",
      "J. P. Karliak",
      "Chris Potter"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=X-Men%20'97%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disney+",
      "Disponibilidad sujeta a la región de Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/X-Men_%2797_season_2",
    "sourceLabel": "Wikipedia"
  },
  "brand-new-day": {
    "synopsis": "Spider-Man: Brand New Day is a 2026 American superhero film based on the Marvel Comics character Spider-Man.  Produced by Columbia Pictures, Marvel Studios, and Pascal Pictures, and distributed by Sony Pictures Releasing, it is the 38th film in the Marvel Cinematic Universe (MCU) and the fourth film in the MCU Spider-Man film series following Spider-Man: No Way Home (2021).",
    "runtimeMinutes": 145,
    "episodeRuntimeMinutes": 145,
    "mainCharacters": [
      "Tom Holland",
      "Zendaya",
      "Sadie Sink",
      "Jacob Batalon",
      "Jon Bernthal",
      "Florence Pugh"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Spider-Man%3A%20Brand%20New%20Day%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Disponibilidad variable en Perú"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Spider-Man:_Brand_New_Day",
    "sourceLabel": "Wikipedia"
  },
  "friendly-spider-2": {
    "synopsis": "The first season of the American animated television series Your Friendly Neighborhood Spider-Man, based on Marvel Comics featuring the character Spider-Man, explores Peter Parker's early days as Spider-Man.  It is set in an alternate timeline from the main films and television series of the Marvel Cinematic Universe (MCU) where Norman Osborn becomes Peter's mentor instead of Tony Stark.",
    "mainCharacters": [
      "Hudson Thames",
      "Kari Wahlgren",
      "Eugene Byrd",
      "Zeno Robinson",
      "Colman Domingo",
      "Hugh Dancy"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Tu%20amigo%20y%20vecino%20Spider-Man%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción y violencia animada"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Your_Friendly_Neighborhood_Spider-Man_season_1",
    "sourceLabel": "Wikipedia"
  },
  "visionquest": {
    "synopsis": "VisionQuest is an upcoming American television miniseries created by Terry Matalas for the streaming service Disney+, based on the Marvel Comics character Vision.  A spin-off from the miniseries WandaVision (2021), it is intended to be the 18th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and is produced under its Marvel Television label.",
    "mainCharacters": [
      "Paul Bettany",
      "James Spader",
      "Todd Stashwick",
      "Ruaridh Mollica",
      "T'Nia Miller",
      "Emily Hampshire"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=VisionQuest%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/VisionQuest",
    "sourceLabel": "Wikipedia"
  },
  "doomsday": {
    "synopsis": "Avengers: Doomsday is an upcoming American superhero film based on the Marvel Comics superhero team the Avengers.  Produced by Marvel Studios and distributed by Walt Disney Studios Motion Pictures, it is intended to be the sequel to Avengers: Endgame (2019) and the 39th film in the Marvel Cinematic Universe (MCU).",
    "mainCharacters": [
      "Robert Downey Jr.",
      "Chris Evans",
      "Chris Hemsworth",
      "Pedro Pascal",
      "Paul Rudd",
      "Anthony Mackie"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%3A%20Doomsday%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Avengers:_Doomsday",
    "sourceLabel": "Wikipedia"
  },
  "daredevil-ba-3": {
    "synopsis": "The second season of the American television series Daredevil: Born Again is based on Marvel Comics featuring the character Daredevil.  It sees blind vigilante Matt Murdock / Daredevil gathering allies to resist Wilson Fisk, who is the mayor of New York City, and his Anti-Vigilante Task Force (AVTF).",
    "mainCharacters": [
      "Charlie Cox",
      "Vincent D'Onofrio",
      "Deborah Ann Woll",
      "Margarita Levieva",
      "Matthew Lillard",
      "Tony Dalton"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Daredevil%3A%20Born%20Again%20%C2%B7%20T3%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Daredevil:_Born_Again_season_2",
    "sourceLabel": "Wikipedia"
  },
  "wonder-man-2": {
    "synopsis": "Wonder Man is an American television series created by Destin Daniel Cretton and Andrew Guest for the streaming service Disney+, based on the Marvel Comics character Simon Williams / Wonder Man.  It is the 17th television series in the Marvel Cinematic Universe (MCU) from Marvel Studios and was produced under its Marvel Television label.",
    "runtimeMinutes": 36,
    "episodeRuntimeMinutes": 36,
    "mainCharacters": [
      "Yahya Abdul-Mateen II",
      "X Mayo",
      "Zlatko Burić",
      "Ben Kingsley",
      "Arian Moayed",
      "Joe Pantoliano"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Wonder%20Man%20%C2%B7%20T2%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Wonder_Man_(TV_series)",
    "sourceLabel": "Wikipedia"
  },
  "secret-wars": {
    "synopsis": "Phase Six of the Marvel Cinematic Universe (MCU) is a group of American superhero films and television series produced by Marvel Studios based on characters that appear in publications by Marvel Comics.  The MCU is the shared universe in which all of the films and series are set.",
    "mainCharacters": [
      "See below"
    ],
    "trailerUrl": "https://www.youtube.com/results?search_query=Avengers%3A%20Secret%20Wars%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Acción",
      "Violencia de superhéroes"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Marvel_Cinematic_Universe:_Phase_Six",
    "sourceLabel": "Wikipedia"
  },
  "blade": {
    "synopsis": "Blade is a planned American superhero film based on the Marvel Comics character Blade in development at Marvel Studios and to be distributed by Walt Disney Studios Motion Pictures.  The film is intended to be an installment in the Marvel Cinematic Universe (MCU) franchise and a reboot of the Blade film series.",
    "mainCharacters": [],
    "trailerUrl": "https://www.youtube.com/results?search_query=Blade%20tr%C3%A1iler%20oficial%20Marvel",
    "platforms": [
      "Próximamente"
    ],
    "postCredits": null,
    "contentWarnings": [
      "Violencia intensa",
      "Terror",
      "Imágenes perturbadoras"
    ],
    "sourceUrl": "https://en.wikipedia.org/wiki/Development_of_Blade_(Marvel_Studios_film)",
    "sourceLabel": "Wikipedia"
  }
};
