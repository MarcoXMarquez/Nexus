-- Nexus MCU 1.0 · catálogo normalizado y sincronización por entidad
-- Generado desde app/mcu-data.ts. No editar el bloque de seeds a mano.

create table if not exists public.catalog_titles (
  id text primary key,
  title text not null,
  display_date text not null,
  release_order numeric,
  lane text,
  phase text,
  saga text,
  media_type text not null check (media_type in ('movie','series','animation','special')),
  wiki_key text not null,
  upcoming boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_episodes (
  title_id text not null references public.catalog_titles(id) on delete cascade,
  season_number integer not null default 1 check (season_number > 0),
  episode_number integer not null check (episode_number > 0),
  name text not null,
  runtime_minutes integer check (runtime_minutes is null or runtime_minutes > 0),
  primary key(title_id, season_number, episode_number)
);

insert into public.catalog_titles(id,title,display_date,release_order,lane,phase,saga,media_type,wiki_key,upcoming) values
('xmen-animated-series','X-Men: The Animated Series','1992',1992.84,'animation-xmen',null,'Universo animado de X-Men','animation','X-Men: The Animated Series',false),
('spiderman-animated-series','Spider-Man: The Animated Series','1994',1994.88,'animation-spider',null,'Universos animados de Spider-Man','animation','Spider-Man (1994 TV series)',false),
('xmen-evolution','X-Men: Evolution','2000',2000.85,'animation-xmen',null,'Universos animados de X-Men','animation','X-Men: Evolution',false),
('spiderman-new-animated','Spider-Man: The New Animated Series','2003',2003.47,'animation-spider',null,'Universos animados de Spider-Man','animation','Spider-Man: The New Animated Series',false),
('ultimate-avengers','Ultimate Avengers','2006',2006.17,'animation-films',null,'Películas animadas de Marvel','animation','Ultimate Avengers (film)',false),
('ultimate-avengers-2','Ultimate Avengers 2','2006',2006.52,'animation-films',null,'Películas animadas de Marvel','animation','Ultimate Avengers 2',false),
('fantastic-four-worlds-greatest-heroes','Fantastic Four: World''s Greatest Heroes','2006',2006.64,'animation-teams',null,'Equipos Marvel animados','animation','Fantastic Four: World''s Greatest Heroes',false),
('invincible-iron-man-animated','The Invincible Iron Man','2007',2007.07,'animation-films',null,'Películas animadas de Marvel','animation','The Invincible Iron Man (film)',false),
('doctor-strange-sorcerer-supreme','Doctor Strange: The Sorcerer Supreme','2007',2007.64,'animation-films',null,'Películas animadas de Marvel','animation','Doctor Strange: The Sorcerer Supreme',false),
('spectacular-spiderman','The Spectacular Spider-Man','2008',2008.17,'animation-spider',null,'Universos animados de Spider-Man','animation','The Spectacular Spider-Man (TV series)',false),
('next-avengers','Next Avengers: Heroes of Tomorrow','2008',2008.68,'animation-films',null,'Películas animadas de Marvel','animation','Next Avengers: Heroes of Tomorrow',false),
('wolverine-and-xmen','Wolverine and the X-Men','2009',2009.06,'animation-xmen',null,'Universos animados de X-Men','animation','Wolverine and the X-Men (TV series)',false),
('hulk-vs','Hulk Vs.','2009',2009.08,'animation-films',null,'Películas animadas de Marvel','animation','Hulk Vs.',false),
('iron-man-armored-adventures','Iron Man: Armored Adventures','2009',2009.31,'animation-teams',null,'Héroes Marvel animados','animation','Iron Man: Armored Adventures',false),
('planet-hulk-animated','Planet Hulk','2010',2010.12,'animation-films',null,'Películas animadas de Marvel','animation','Planet Hulk (film)',false),
('avengers-earths-mightiest-heroes','The Avengers: Earth''s Mightiest Heroes','2010',2010.75,'animation-teams',null,'Equipos Marvel animados','animation','The Avengers: Earth''s Mightiest Heroes',false),
('thor-tales-asgard','Thor: Tales of Asgard','2011',2011.39,'animation-films',null,'Películas animadas de Marvel','animation','Thor: Tales of Asgard',false),
('ultimate-spiderman-series','Ultimate Spider-Man','2012',2012.26,'animation-spider',null,'Universos animados de Spider-Man','animation','Ultimate Spider-Man (TV series)',false),
('iron-man-rise-technovore','Iron Man: Rise of Technovore','2013',2013.28,'animation-films',null,'Películas animadas de Marvel','animation','Iron Man: Rise of Technovore',false),
('avengers-assemble-series','Avengers Assemble','2013',2013.48,'animation-teams',null,'Equipos Marvel animados','animation','Avengers Assemble (TV series)',false),
('avengers-confidential','Avengers Confidential: Black Widow & Punisher','2014',2014.22,'animation-films',null,'Películas animadas de Marvel','animation','Avengers Confidential: Black Widow & Punisher',false),
('guardians-galaxy-animated','Guardians of the Galaxy','2015',2015.73,'animation-teams',null,'Equipos Marvel animados','animation','Guardians of the Galaxy (TV series)',false),
('marvel-spiderman-2017','Marvel''s Spider-Man','2017',2017.63,'animation-spider',null,'Universos animados de Spider-Man','animation','Spider-Man (2017 TV series)',false),
('marvel-rising-secret-warriors','Marvel Rising: Secret Warriors','2018',2018.64,'animation-films',null,'Películas animadas de Marvel','animation','Marvel Rising: Secret Warriors',false),
('modok-series','M.O.D.O.K.','2021',2021.38,'animation-teams',null,'Marvel Animation para adultos','animation','M.O.D.O.K. (TV series)',false),
('hit-monkey-series','Hit-Monkey','2021',2021.88,'animation-teams',null,'Marvel Animation para adultos','animation','Hit-Monkey (TV series)',false),
('moon-girl-devil-dinosaur','Moon Girl and Devil Dinosaur','2023',2023.09,'animation-teams',null,'Héroes Marvel animados','animation','Moon Girl and Devil Dinosaur',false),
('daredevil-s1','Daredevil · T1','abr 2015',2015.28,'defenders',null,'Saga de los Defensores','series','Daredevil season 1',false),
('jessica-jones-s1','Jessica Jones · T1','nov 2015',2015.88,'defenders',null,'Saga de los Defensores','series','Jessica Jones season 1',false),
('daredevil-s2','Daredevil · T2','mar 2016',2016.22,'defenders',null,'Saga de los Defensores','series','Daredevil season 2',false),
('luke-cage-s1','Luke Cage · T1','sep 2016',2016.74,'defenders',null,'Saga de los Defensores','series','Luke Cage season 1',false),
('iron-fist-s1','Iron Fist · T1','mar 2017',2017.21,'defenders',null,'Saga de los Defensores','series','Iron Fist season 1',false),
('defenders-miniseries','The Defenders','ago 2017',2017.63,'defenders',null,'Saga de los Defensores','series','The Defenders (miniseries)',false),
('punisher-s1','The Punisher · T1','nov 2017',2017.88,'defenders',null,'Saga de los Defensores','series','The Punisher season 1',false),
('jessica-jones-s2','Jessica Jones · T2','mar 2018',2018.18,'defenders',null,'Saga de los Defensores','series','Jessica Jones season 2',false),
('luke-cage-s2','Luke Cage · T2','jun 2018',2018.47,'defenders',null,'Saga de los Defensores','series','Luke Cage season 2',false),
('iron-fist-s2','Iron Fist · T2','sep 2018',2018.68,'defenders',null,'Saga de los Defensores','series','Iron Fist season 2',false),
('daredevil-s3','Daredevil · T3','oct 2018',2018.8,'defenders',null,'Saga de los Defensores','series','Daredevil season 3',false),
('punisher-s2','The Punisher · T2','ene 2019',2019.04,'defenders',null,'Saga de los Defensores','series','The Punisher season 2',false),
('jessica-jones-s3','Jessica Jones · T3','jun 2019',2019.45,'defenders',null,'Saga de los Defensores','series','Jessica Jones season 3',false),
('blade-1998','Blade','1998',1998.64,'other',null,null,'movie','Blade (1998 film)',false),
('xmen-2000','X-Men','2000',2000.54,'xmen',null,null,'movie','X-Men (film)',false),
('blade-2','Blade II','2002',2002.23,'other',null,null,'movie','Blade II',false),
('spiderman-raimi-1','Spider-Man','2002',2002.34,'spider',null,null,'movie','Spider-Man (2002 film)',false),
('daredevil-2003','Daredevil','2003',2003.12,'other',null,null,'movie','Daredevil (film)',false),
('x2','X2: X-Men United','2003',2003.34,'xmen',null,null,'movie','X2 (film)',false),
('hulk-2003','Hulk','2003',2003.47,'other',null,null,'movie','Hulk (film)',false),
('punisher-2004','The Punisher','2004',2004.29,'other',null,null,'movie','The Punisher (2004 film)',false),
('spiderman-raimi-2','Spider-Man 2','2004',2004.49,'spider',null,null,'movie','Spider-Man 2',false),
('blade-trinity','Blade: Trinity','2004',2004.94,'other',null,null,'movie','Blade: Trinity',false),
('elektra-2005','Elektra','2005',2005.04,'other',null,null,'movie','Elektra (2005 film)',false),
('fantastic-four-2005','Fantastic Four','2005',2005.52,'fantastic',null,null,'movie','Fantastic Four (2005 film)',false),
('xmen-last-stand','X-Men: The Last Stand','2006',2006.4,'xmen',null,null,'movie','X-Men: The Last Stand',false),
('ghost-rider','Ghost Rider','2007',2007.12,'other',null,null,'movie','Ghost Rider (2007 film)',false),
('spiderman-raimi-3','Spider-Man 3','2007',2007.34,'spider',null,null,'movie','Spider-Man 3',false),
('silver-surfer','Fantastic Four: Rise of the Silver Surfer','2007',2007.46,'fantastic',null,null,'movie','Fantastic Four: Rise of the Silver Surfer',false),
('punisher-war-zone','Punisher: War Zone','2008',2008.93,'other',null,null,'movie','Punisher: War Zone',false),
('wolverine-origins','X-Men Origins: Wolverine','2009',2009.34,'xmen',null,null,'movie','X-Men Origins: Wolverine',false),
('xmen-first-class','X-Men: First Class','2011',2011.42,'xmen',null,null,'movie','X-Men: First Class',false),
('ghost-rider-2','Ghost Rider: Spirit of Vengeance','2012',2012.12,'other',null,null,'movie','Ghost Rider: Spirit of Vengeance',false),
('amazing-spiderman','The Amazing Spider-Man','2012',2012.5,'spider',null,null,'movie','The Amazing Spider-Man (film)',false),
('the-wolverine','The Wolverine','2013',2013.56,'xmen',null,null,'movie','The Wolverine (film)',false),
('amazing-spiderman-2','The Amazing Spider-Man 2','2014',2014.34,'spider',null,null,'movie','The Amazing Spider-Man 2',false),
('days-future-past','X-Men: Days of Future Past','2014',2014.39,'xmen',null,null,'movie','X-Men: Days of Future Past',false),
('fantastic-four-2015','Fantastic Four','2015',2015.6,'fantastic',null,null,'movie','Fantastic Four (2015 film)',false),
('deadpool','Deadpool','2016',2016.12,'xmen',null,null,'movie','Deadpool (film)',false),
('xmen-apocalypse','X-Men: Apocalypse','2016',2016.4,'xmen',null,null,'movie','X-Men: Apocalypse',false),
('logan','Logan','2017',2017.17,'xmen',null,null,'movie','Logan (film)',false),
('deadpool-2','Deadpool 2','2018',2018.37,'xmen',null,null,'movie','Deadpool 2',false),
('venom','Venom','2018',2018.76,'sony',null,null,'movie','Venom (2018 film)',false),
('spider-verse','Spider-Man: Into the Spider-Verse','2018',2018.95,'animation-spider',null,null,'animation','Spider-Man: Into the Spider-Verse',false),
('dark-phoenix','Dark Phoenix','2019',2019.43,'xmen',null,null,'movie','Dark Phoenix (film)',false),
('new-mutants','The New Mutants','2020',2020.66,'xmen',null,null,'movie','The New Mutants (film)',false),
('venom-carnage','Venom: Let There Be Carnage','2021',2021.75,'sony',null,null,'movie','Venom: Let There Be Carnage',false),
('morbius','Morbius','2022',2022.25,'sony',null,null,'movie','Morbius (film)',false),
('across-spider-verse','Spider-Man: Across the Spider-Verse','2023',2023.42,'animation-spider',null,null,'animation','Spider-Man: Across the Spider-Verse',false),
('madame-web','Madame Web','2024',2024.12,'sony',null,null,'movie','Madame Web (film)',false),
('venom-last-dance','Venom: The Last Dance','2024',2024.82,'sony',null,null,'movie','Venom: The Last Dance',false),
('kraven','Kraven the Hunter','2024',2024.95,'sony',null,null,'movie','Kraven the Hunter (film)',false),
('beyond-spider-verse','Spider-Man: Beyond the Spider-Verse','2027',2027.46,'animation-spider',null,null,'animation','Spider-Man: Beyond the Spider-Verse',true),
('iron-man','Iron Man','2008',null,null,'Fase 1','Saga del Infinito','movie','Iron Man (2008 film)',false),
('hulk','El increíble Hulk','2008',null,null,'Fase 1','Saga del Infinito','movie','The Incredible Hulk (film)',false),
('iron-man-2','Iron Man 2','2010',null,null,'Fase 1','Saga del Infinito','movie','Iron Man 2',false),
('thor','Thor','2011',null,null,'Fase 1','Saga del Infinito','movie','Thor (film)',false),
('cap-first-avenger','Capitán América: El primer vengador','2011',null,null,'Fase 1','Saga del Infinito','movie','Captain America: The First Avenger',false),
('avengers','The Avengers','2012',null,null,'Fase 1','Saga del Infinito','movie','The Avengers (2012 film)',false),
('iron-man-3','Iron Man 3','2013',null,null,'Fase 2','Saga del Infinito','movie','Iron Man 3',false),
('thor-dark-world','Thor: Un mundo oscuro','2013',null,null,'Fase 2','Saga del Infinito','movie','Thor: The Dark World',false),
('winter-soldier','Capitán América: El Soldado del Invierno','2014',null,null,'Fase 2','Saga del Infinito','movie','Captain America: The Winter Soldier',false),
('guardians','Guardianes de la Galaxia','2014',null,null,'Fase 2','Saga del Infinito','movie','Guardians of the Galaxy (film)',false),
('ultron','Avengers: Era de Ultrón','2015',null,null,'Fase 2','Saga del Infinito','movie','Avengers: Age of Ultron',false),
('ant-man','Ant-Man','2015',null,null,'Fase 2','Saga del Infinito','movie','Ant-Man (film)',false),
('civil-war','Capitán América: Civil War','2016',null,null,'Fase 3','Saga del Infinito','movie','Captain America: Civil War',false),
('doctor-strange','Doctor Strange','2016',null,null,'Fase 3','Saga del Infinito','movie','Doctor Strange (2016 film)',false),
('guardians-2','Guardianes de la Galaxia Vol. 2','2017',null,null,'Fase 3','Saga del Infinito','movie','Guardians of the Galaxy Vol. 2',false),
('homecoming','Spider-Man: Homecoming','2017',null,null,'Fase 3','Saga del Infinito','movie','Spider-Man: Homecoming',false),
('ragnarok','Thor: Ragnarok','2017',null,null,'Fase 3','Saga del Infinito','movie','Thor: Ragnarok',false),
('black-panther','Black Panther','2018',null,null,'Fase 3','Saga del Infinito','movie','Black Panther (film)',false),
('infinity-war','Avengers: Infinity War','2018',null,null,'Fase 3','Saga del Infinito','movie','Avengers: Infinity War',false),
('antman-wasp','Ant-Man and the Wasp','2018',null,null,'Fase 3','Saga del Infinito','movie','Ant-Man and the Wasp',false),
('captain-marvel','Capitana Marvel','2019',null,null,'Fase 3','Saga del Infinito','movie','Captain Marvel (film)',false),
('endgame','Avengers: Endgame','2019',null,null,'Fase 3','Saga del Infinito','movie','Avengers: Endgame',false),
('far-from-home','Spider-Man: Lejos de casa','2019',null,null,'Fase 3','Saga del Infinito','movie','Spider-Man: Far From Home',false),
('wandavision','WandaVision','ene 2021',null,null,'Fase 4','Saga del Multiverso','series','WandaVision',false),
('falcon-winter','Falcon y el Soldado del Invierno','mar 2021',null,null,'Fase 4','Saga del Multiverso','series','The Falcon and the Winter Soldier',false),
('loki-1','Loki · T1','jun 2021',null,null,'Fase 4','Saga del Multiverso','series','Loki season 1',false),
('black-widow','Black Widow','jul 2021',null,null,'Fase 4','Saga del Multiverso','movie','Black Widow (2021 film)',false),
('what-if-1','What If...? · T1','ago 2021',null,null,'Fase 4','Saga del Multiverso','animation','What If...? (TV series)',false),
('shang-chi','Shang-Chi y la leyenda de los Diez Anillos','sep 2021',null,null,'Fase 4','Saga del Multiverso','movie','Shang-Chi and the Legend of the Ten Rings',false),
('eternals','Eternals','nov 2021',null,null,'Fase 4','Saga del Multiverso','movie','Eternals (film)',false),
('hawkeye','Hawkeye','nov 2021',null,null,'Fase 4','Saga del Multiverso','series','Hawkeye (2021 TV series)',false),
('no-way-home','Spider-Man: No Way Home','dic 2021',null,null,'Fase 4','Saga del Multiverso','movie','Spider-Man: No Way Home',false),
('moon-knight','Moon Knight','mar 2022',null,null,'Fase 4','Saga del Multiverso','series','Moon Knight (miniseries)',false),
('multiverse-madness','Doctor Strange en el multiverso de la locura','may 2022',null,null,'Fase 4','Saga del Multiverso','movie','Doctor Strange in the Multiverse of Madness',false),
('ms-marvel','Ms. Marvel','jun 2022',null,null,'Fase 4','Saga del Multiverso','series','Ms. Marvel (miniseries)',false),
('love-thunder','Thor: Love and Thunder','jul 2022',null,null,'Fase 4','Saga del Multiverso','movie','Thor: Love and Thunder',false),
('she-hulk','She-Hulk: Defensora de héroes','ago 2022',null,null,'Fase 4','Saga del Multiverso','series','She-Hulk: Attorney at Law',false),
('werewolf','Werewolf by Night','oct 2022',null,null,'Fase 4','Saga del Multiverso','special','Werewolf by Night (TV special)',false),
('wakanda-forever','Black Panther: Wakanda Forever','nov 2022',null,null,'Fase 4','Saga del Multiverso','movie','Black Panther: Wakanda Forever',false),
('holiday-special','Especial navideño de Guardianes','nov 2022',null,null,'Fase 4','Saga del Multiverso','special','The Guardians of the Galaxy Holiday Special',false),
('quantumania','Ant-Man and the Wasp: Quantumania','feb 2023',null,null,'Fase 5','Saga del Multiverso','movie','Ant-Man and the Wasp: Quantumania',false),
('guardians-3','Guardianes de la Galaxia Vol. 3','may 2023',null,null,'Fase 5','Saga del Multiverso','movie','Guardians of the Galaxy Vol. 3',false),
('secret-invasion','Secret Invasion','jun 2023',null,null,'Fase 5','Saga del Multiverso','series','Secret Invasion (miniseries)',false),
('groot-2','I Am Groot · T2','sep 2023',null,null,'Fase 5','Saga del Multiverso','animation','I Am Groot',false),
('loki-2','Loki · T2','oct 2023',null,null,'Fase 5','Saga del Multiverso','series','Loki season 2',false),
('the-marvels','The Marvels','nov 2023',null,null,'Fase 5','Saga del Multiverso','movie','The Marvels',false),
('what-if-2','What If...? · T2','dic 2023',null,null,'Fase 5','Saga del Multiverso','animation','What If...? (TV series)',false),
('echo','Echo','ene 2024',null,null,'Fase 5','Saga del Multiverso','series','Echo (miniseries)',false),
('xmen97-1','X-Men ''97 · T1','mar 2024',null,'animation-xmen','Fase 5','Saga del Multiverso','animation','X-Men ''97 season 1',false),
('deadpool-wolverine','Deadpool & Wolverine','jul 2024',null,null,'Fase 5','Saga del Multiverso','movie','Deadpool & Wolverine',false),
('agatha','Agatha All Along','sep 2024',null,null,'Fase 5','Saga del Multiverso','series','Agatha All Along (miniseries)',false),
('what-if-3','What If...? · T3','dic 2024',null,null,'Fase 5','Saga del Multiverso','animation','What If...? (TV series)',false),
('friendly-spider-1','Tu amigo y vecino Spider-Man · T1','ene 2025',null,'animation-spider','Fase 5','Saga del Multiverso','animation','Your Friendly Neighborhood Spider-Man season 1',false),
('brave-new-world','Capitán América: Un nuevo mundo','feb 2025',null,null,'Fase 5','Saga del Multiverso','movie','Captain America: Brave New World',false),
('daredevil-ba-1','Daredevil: Born Again · T1','mar 2025',null,null,'Fase 5','Saga del Multiverso','series','Daredevil: Born Again season 1',false),
('thunderbolts','Thunderbolts*','may 2025',null,null,'Fase 5','Saga del Multiverso','movie','Thunderbolts*',false),
('ironheart','Ironheart','jun 2025',null,null,'Fase 5','Saga del Multiverso','series','Ironheart (miniseries)',false),
('fantastic-four','Los 4 Fantásticos: Primeros pasos','jul 2025',null,null,'Fase 6','Saga del Multiverso','movie','The Fantastic Four: First Steps',false),
('eyes-wakanda','Eyes of Wakanda','ago 2025',null,null,'Fase 6','Saga del Multiverso','animation','Eyes of Wakanda',false),
('marvel-zombies','Marvel Zombies','sep 2025',null,null,'Fase 6','Saga del Multiverso','animation','Marvel Zombies (miniseries)',false),
('wonder-man-1','Wonder Man · T1','ene 2026',null,null,'Fase 6','Saga del Multiverso','series','Wonder Man (TV series)',false),
('daredevil-ba-2','Daredevil: Born Again · T2','mar 2026',null,null,'Fase 6','Saga del Multiverso','series','Daredevil: Born Again season 2',false),
('punisher-special','The Punisher: One Last Kill','may 2026',null,null,'Fase 6','Saga del Multiverso','special','The Punisher: One Last Kill',false),
('xmen97-2','X-Men ''97 · T2','jul 2026',null,'animation-xmen','Fase 6','Saga del Multiverso','animation','X-Men ''97 season 2',false),
('brand-new-day','Spider-Man: Brand New Day','jul 2026',null,null,'Fase 6','Saga del Multiverso','movie','Spider-Man: Brand New Day',false),
('friendly-spider-2','Tu amigo y vecino Spider-Man · T2','otoño 2026',null,null,'Próximamente','Saga del Multiverso','animation','Your Friendly Neighborhood Spider-Man season 1',true),
('visionquest','VisionQuest','14 oct 2026',null,null,'Próximamente','Saga del Multiverso','series','VisionQuest',true),
('doomsday','Avengers: Doomsday','18 dic 2026',null,null,'Próximamente','Saga del Multiverso','movie','Avengers: Doomsday',true),
('daredevil-ba-3','Daredevil: Born Again · T3','Sin fecha',null,null,'Próximamente','Saga del Multiverso','series','Daredevil: Born Again season 2',true),
('wonder-man-2','Wonder Man · T2','Sin fecha',null,null,'Próximamente','Saga del Multiverso','series','Wonder Man (TV series)',true),
('secret-wars','Avengers: Secret Wars','17 dic 2027',null,null,'Próximamente','Saga del Multiverso','movie','Avengers: Secret Wars',true),
('blade','Blade','Sin fecha',null,null,'Próximamente','Saga del Multiverso','movie','Blade (upcoming film)',true)
on conflict(id) do update set title=excluded.title,display_date=excluded.display_date,release_order=excluded.release_order,lane=excluded.lane,phase=excluded.phase,saga=excluded.saga,media_type=excluded.media_type,wiki_key=excluded.wiki_key,upcoming=excluded.upcoming,updated_at=timezone('utc',now());

insert into public.catalog_episodes(title_id,season_number,episode_number,name)
select 'daredevil-s1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'jessica-jones-s1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'daredevil-s2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'luke-cage-s1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'iron-fist-s1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'defenders-miniseries', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 8) episode_number
union all
select 'punisher-s1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'jessica-jones-s2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'luke-cage-s2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'iron-fist-s2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 10) episode_number
union all
select 'daredevil-s3', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'punisher-s2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'jessica-jones-s3', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'xmen-animated-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 76) episode_number
union all
select 'spiderman-animated-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 65) episode_number
union all
select 'xmen-evolution', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 52) episode_number
union all
select 'spiderman-new-animated', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 13) episode_number
union all
select 'fantastic-four-worlds-greatest-heroes', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 26) episode_number
union all
select 'spectacular-spiderman', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 26) episode_number
union all
select 'wolverine-and-xmen', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 26) episode_number
union all
select 'iron-man-armored-adventures', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 52) episode_number
union all
select 'avengers-earths-mightiest-heroes', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 52) episode_number
union all
select 'ultimate-spiderman-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 104) episode_number
union all
select 'avengers-assemble-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 126) episode_number
union all
select 'guardians-galaxy-animated', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 77) episode_number
union all
select 'marvel-spiderman-2017', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 58) episode_number
union all
select 'modok-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 10) episode_number
union all
select 'hit-monkey-series', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 20) episode_number
union all
select 'moon-girl-devil-dinosaur', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 30) episode_number
union all
select 'wandavision', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'falcon-winter', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'loki-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'what-if-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'hawkeye', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'moon-knight', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'ms-marvel', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'she-hulk', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'secret-invasion', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'groot-2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 5) episode_number
union all
select 'loki-2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'what-if-2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'echo', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 5) episode_number
union all
select 'xmen97-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 10) episode_number
union all
select 'agatha', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'what-if-3', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 8) episode_number
union all
select 'friendly-spider-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 10) episode_number
union all
select 'daredevil-ba-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
union all
select 'ironheart', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 6) episode_number
union all
select 'eyes-wakanda', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 4) episode_number
union all
select 'marvel-zombies', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 4) episode_number
union all
select 'wonder-man-1', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 8) episode_number
union all
select 'daredevil-ba-2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 8) episode_number
union all
select 'xmen97-2', 1, episode_number, 'Capítulo ' || episode_number from generate_series(1, 9) episode_number
on conflict(title_id,season_number,episode_number) do update set name=excluded.name;

alter table public.marathons add column if not exists source_local_id text;
create unique index if not exists idx_marathons_owner_source on public.marathons(owner_profile_id,source_local_id);

do $$ begin
  if not exists(select 1 from pg_constraint where conname='title_progress_catalog_fk') then
    alter table public.title_progress add constraint title_progress_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='episode_progress_catalog_fk') then
    alter table public.episode_progress add constraint episode_progress_catalog_fk foreign key(title_id,season_number,episode_number) references public.catalog_episodes(title_id,season_number,episode_number) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='custom_list_items_catalog_fk') then
    alter table public.custom_list_items add constraint custom_list_items_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
  if not exists(select 1 from pg_constraint where conname='marathon_items_catalog_fk') then
    alter table public.marathon_items add constraint marathon_items_catalog_fk foreign key(title_id) references public.catalog_titles(id) not valid;
  end if;
end $$;

alter table public.catalog_titles enable row level security;
alter table public.catalog_episodes enable row level security;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_titles' and policyname='catalog_titles_read') then
    create policy catalog_titles_read on public.catalog_titles for select using (true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='catalog_episodes' and policyname='catalog_episodes_read') then
    create policy catalog_episodes_read on public.catalog_episodes for select using (true);
  end if;
end $$;

grant select on public.catalog_titles, public.catalog_episodes to anon, authenticated;
revoke insert, update, delete on public.catalog_titles, public.catalog_episodes from anon, authenticated;
