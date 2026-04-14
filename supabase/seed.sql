-- =====================
-- WHISPER SEED DATA
-- Run this in Supabase SQL Editor
-- =====================

-- Clean up existing seed data (safe to re-run)
DELETE FROM comment_reactions;
DELETE FROM post_reactions;
DELETE FROM comments;
DELETE FROM daily_highlights;
DELETE FROM posts WHERE is_admin = true OR user_id IS NULL;

-- =====================
-- ADMIN POSTS (Tema dana)
-- =====================
DO $$
DECLARE
  p_sve     uuid := 'a0000000-0000-0000-0000-000000000100';
  p_ljubav  uuid := 'a0000000-0000-0000-0000-000000000101';
  p_blamovi uuid := 'a0000000-0000-0000-0000-000000000102';
  p_misli   uuid := 'a0000000-0000-0000-0000-000000000103';
  p_random  uuid := 'a0000000-0000-0000-0000-000000000104';
  p_posao   uuid := 'a0000000-0000-0000-0000-000000000105';
  p_veze    uuid := 'a0000000-0000-0000-0000-000000000106';

  p1 uuid := 'b0000000-0000-0000-0000-000000000001';
  p2 uuid := 'b0000000-0000-0000-0000-000000000002';
  p3 uuid := 'b0000000-0000-0000-0000-000000000003';
  p4 uuid := 'b0000000-0000-0000-0000-000000000004';
  p5 uuid := 'b0000000-0000-0000-0000-000000000005';
  p6 uuid := 'b0000000-0000-0000-0000-000000000006';
  p7 uuid := 'b0000000-0000-0000-0000-000000000007';
BEGIN

-- ---- Admin posts ----
INSERT INTO posts (id, user_id, category, title, text, is_admin, admin_category, comment_count, created_at)
VALUES
  (p_sve,     NULL, 'Tema dana', 'Ispovesti koje se ne zaboravljaju',
   'Podeli svoju priču. Neko čeka da čuje. Ovo je mesto gde možeš biti potpuno iskren/a — bez osude, bez imenovanja, samo istina.',
   true, 'sve', 3, now() - interval '1 hour'),

  (p_ljubav,  NULL, 'Ljubav', 'Kad srce govori glasnije od razuma',
   'Ljubav koja boli, ljubav koja leči — svaka priča je vredna pažnje. Podeli šta nosiš u sebi.',
   true, 'ljubav', 2, now() - interval '1 hour'),

  (p_blamovi, NULL, 'Blamovi', 'Stidi se glasno — ovde si siguran/na',
   'Najgori blamovi postaju najbolje priče. Šta ti se desilo što još uvek ne možeš da zaboraviš?',
   true, 'blamovi', 2, now() - interval '1 hour'),

  (p_misli,   NULL, 'Misli', 'Misli koje ne smeš da kažeš naglas',
   'One čudne, tamne, tople misli koje imaš u 2 ujutru. Ovde ih možeš zapisati.',
   true, 'misli', 2, now() - interval '1 hour'),

  (p_random,  NULL, 'Random', 'Sve što ti pada na pamet',
   'Nema pravila, nema kategorija. Ako ne znaš gde da staviš priču — stavi je ovde.',
   true, 'random', 2, now() - interval '1 hour'),

  (p_posao,   NULL, 'Posao', 'Tajne koje ostaju između tebe i monitora',
   'Šef koji ne sluša, kolega koji krade ideje, otkaz koji te uhvati nespremnog. Priče sa radnog mesta koje ne možeš da ispričaš naglas.',
   true, 'posao', 2, now() - interval '1 hour'),

  (p_veze,    NULL, 'Veze', 'Priče o srcima koja su bila slomljena',
   'Raskidi, udaljavanja, neobjašnjive tišine. Gde si sada i šta nosiš sa sobom?',
   true, 'veze', 2, now() - interval '1 hour')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  text = EXCLUDED.text;

-- ---- Daily highlights ----
INSERT INTO daily_highlights (category, title, subtitle, post_id, updated_at)
VALUES
  ('sve',     'Ispovesti koje se ne zaboravljaju',        'Podeli svoju priču. Neko čeka da čuje. Ovo je mesto gde možeš biti potpuno iskren/a — bez osude, bez imenovanja, samo istina.',         p_sve,     now()),
  ('ljubav',  'Kad srce govori glasnije od razuma',       'Ljubav koja boli, ljubav koja leči — svaka priča je vredna pažnje. Podeli šta nosiš u sebi.',                                           p_ljubav,  now()),
  ('blamovi', 'Stidi se glasno — ovde si siguran/na',     'Najgori blamovi postaju najbolje priče. Šta ti se desilo što još uvek ne možeš da zaboraviš?',                                         p_blamovi, now()),
  ('misli',   'Misli koje ne smeš da kažeš naglas',       'One čudne, tamne, tople misli koje imaš u 2 ujutru. Ovde ih možeš zapisati.',                                                          p_misli,   now()),
  ('random',  'Sve što ti pada na pamet',                 'Nema pravila, nema kategorija. Ako ne znaš gde da staviš priču — stavi je ovde.',                                                      p_random,  now()),
  ('posao',   'Tajne koje ostaju između tebe i monitora', 'Šef koji ne sluša, kolega koji krade ideje, otkaz koji te uhvati nespremnog.',                                                         p_posao,   now()),
  ('veze',    'Priče o srcima koja su bila slomljena',    'Raskidi, udaljavanja, neobjašnjive tišine. Gde si sada i šta nosiš sa sobom?',                                                        p_veze,    now())
ON CONFLICT (category) DO UPDATE SET
  title    = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  post_id  = EXCLUDED.post_id,
  updated_at = now();

-- ---- Regular posts ----
INSERT INTO posts (id, user_id, category, text, image_url, comment_count, is_admin, created_at)
VALUES
  (p1, NULL, 'ljubav',
   'Volela sam ga 3 godine i nikad mu nisam rekla. Juče me je pozvao na kafu da mi kaže da se ženi sa mojom najboljom drugaricom. Smejala sam se i čestitala im, a iznutra sam se raspadala na komade.',
   NULL, 4, false, now() - interval '2 hours'),

  (p2, NULL, 'blamovi',
   'Rekao sam šefu "volim te" umesto "hvala ti". Bila je to online konferencija sa 40 ljudi. Sve je ućutalo. Ja sam ućutao. Šef je ućutao. A onda sam ugasio kameru i otišao po hleb u 11 uveče.',
   NULL, 3, false, now() - interval '4 hours'),

  (p3, NULL, 'misli',
   'Nekad me uhvati čudno osećanje da svi oko mene tačno znaju šta rade sa životom, a ja samo... improvizujem. Kao da su svi dobili neko uputstvo za odrasle, a meni su ga zaboravili poslati.',
   NULL, 3, false, now() - interval '6 hours'),

  (p4, NULL, 'veze',
   'Godinu dana nakon raskida, pronašla sam njegovo džemper ispod kreveta. Sat vremena sam ga samo držala i plakala. A onda sam ga obukla i otišla na kafu. Živo je u meni svašta.',
   NULL, 2, false, now() - interval '8 hours'),

  (p5, NULL, 'random',
   'Imam 28 godina i još uvek ne znam kako se pravilno pravi kafa. Svaki put je ili previše jaka ili previše slaba. Živim sam 4 godine. Svaki dan je eksperiment.',
   'https://picsum.photos/seed/coffee99/500/280', 2, false, now() - interval '10 hours'),

  (p6, NULL, 'posao',
   'Dobila sam otkaz danas. Poslali mi mejl u 17:01. Bila sam na putu kući. Plakala sam u tramvaju, a žena pored mene mi je dala maramicu bez reči. Ni ime mi nije pitala.',
   NULL, 3, false, now() - interval '12 hours'),

  (p7, NULL, 'blamovi',
   'Danas sam na poslu slučajno poslao mejl celoj firmi umesto jednoj osobi. U mejlu je pisalo koliko mrzim ponedeljke i da mi je šef dosadan. 200 ljudi. Uključujući šefa. Ja sam samo zatvorio laptop i otišao kući.',
   'https://picsum.photos/seed/office42/500/280', 5, false, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ---- Comments ----
INSERT INTO comments (post_id, user_id, text, created_at) VALUES
  -- Post p1 (ljubav)
  (p1, NULL, 'Ovo me slomilo... drži se ❤️ Ono što si uradila je zaista jaka stvar.',              now() - interval '115 minutes'),
  (p1, NULL, 'Prolazila sam kroz isto. Jednog dana ćeš biti zahvalna što nije rekao.',               now() - interval '100 minutes'),
  (p1, NULL, 'Isplači se, to ti je puno potrebno. Ne mora sve da bude "okej" odjednom. 💙',          now() - interval '90 minutes'),
  (p1, NULL, 'Jaki su oni koji se smeju kad bole. Ti si jaka.',                                      now() - interval '75 minutes'),

  -- Post p2 (blamovi)
  (p2, NULL, 'Brate ovo je 10/10 blamaza godine 💀💀💀',                                             now() - interval '230 minutes'),
  (p2, NULL, 'A hleb si kupio barem?? 😭',                                                           now() - interval '200 minutes'),
  (p2, NULL, 'Isto mi se desilo ali sam rekao "čao mama" šefu. Solidarnost. ✊',                      now() - interval '180 minutes'),

  -- Post p3 (misli)
  (p3, NULL, 'Niko ne zna. Baš niko. Svi improvizujemo samo se pretvaramo da ne. To uputstvo ne postoji. 😅', now() - interval '340 minutes'),
  (p3, NULL, 'Upravo ovo mi je trebalo da pročitam. Hvala što si napisao.',                          now() - interval '290 minutes'),
  (p3, NULL, 'Impostor syndrome. Svi imaju, niko ne priča. Ti nisi sam. ❤️',                         now() - interval '250 minutes'),

  -- Post p4 (veze)
  (p4, NULL, 'Tuga nema rok trajanja. Plači koliko ti treba. 💙',                                    now() - interval '450 minutes'),
  (p4, NULL, 'A džemper je ostao? 😭 Volim te anonimno.',                                            now() - interval '420 minutes'),

  -- Post p5 (random)
  (p5, NULL, 'Ovo ja sa kuvanjem. 4 god, a jedva skuvam jaje. Solidarnost! 😂',                      now() - interval '570 minutes'),
  (p5, NULL, 'Kafa je umetnost brate, ne sramoti se. Gordon Ramsay bi razumeo.',                     now() - interval '540 minutes'),

  -- Post p6 (posao)
  (p6, NULL, 'Ta žena je heroj. I ti ćeš naći nešto bolje, veruj. 🤍',                               now() - interval '680 minutes'),
  (p6, NULL, 'Nekad otkaz je vrata ka nečem što nismo znali da tražimo. Drži se.',                   now() - interval '650 minutes'),
  (p6, NULL, '17:01. Klasično. Manje nego da sačekaju još minut. Sramota.',                          now() - interval '620 minutes'),

  -- Post p7 (blamovi - mejl)
  (p7, NULL, 'BRATE 😭😭😭 ovo je najveći blam koji sam čuo ove godine, nadam se da si dobro',      now() - interval '27 minutes'),
  (p7, NULL, 'Solidarnost ❤️ meni se desilo slično, preživi se. Za godinu dana će biti smešno.',    now() - interval '24 minutes'),
  (p7, NULL, 'Drži se, sigurno nisi jedini koji misli to za svog šefa hahah 😅',                     now() - interval '20 minutes'),
  (p7, NULL, 'A šef je odgovorio?? 👀 molim te reci nam',                                            now() - interval '15 minutes'),
  (p7, NULL, 'Ovo je priča za unuke 😂 budi jak/a!',                                                  now() - interval '10 minutes');

-- ---- Reactions on posts (anonymous via session_id) ----
-- ljubav post: ❤️x142, 😢x89, 😮x34, 😂x12, 🔥x67
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p1, 'seed_' || gs, '❤️' FROM generate_series(1, 142) gs
UNION ALL
SELECT p1, 'seed_s' || gs, '😢' FROM generate_series(1, 89) gs
UNION ALL
SELECT p1, 'seed_o' || gs, '😮' FROM generate_series(1, 34) gs
UNION ALL
SELECT p1, 'seed_l' || gs, '😂' FROM generate_series(1, 12) gs
UNION ALL
SELECT p1, 'seed_f' || gs, '🔥' FROM generate_series(1, 67) gs

ON CONFLICT DO NOTHING;

-- blamovi post p2: 😂x312
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p2, 'seed2_' || gs, '😂' FROM generate_series(1, 312) gs
UNION ALL
SELECT p2, 'seed2_h' || gs, '❤️' FROM generate_series(1, 28) gs
UNION ALL
SELECT p2, 'seed2_o' || gs, '😮' FROM generate_series(1, 44) gs
UNION ALL
SELECT p2, 'seed2_f' || gs, '🔥' FROM generate_series(1, 89) gs
ON CONFLICT DO NOTHING;

-- misli post p3: ❤️x567
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p3, 'seed3_' || gs, '❤️' FROM generate_series(1, 567) gs
UNION ALL
SELECT p3, 'seed3_s' || gs, '😢' FROM generate_series(1, 123) gs
UNION ALL
SELECT p3, 'seed3_f' || gs, '🔥' FROM generate_series(1, 201) gs
ON CONFLICT DO NOTHING;

-- veze post p4
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p4, 'seed4_' || gs, '❤️' FROM generate_series(1, 89) gs
UNION ALL
SELECT p4, 'seed4_s' || gs, '😢' FROM generate_series(1, 234) gs
ON CONFLICT DO NOTHING;

-- random post p5
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p5, 'seed5_' || gs, '😂' FROM generate_series(1, 289) gs
UNION ALL
SELECT p5, 'seed5_h' || gs, '❤️' FROM generate_series(1, 145) gs
ON CONFLICT DO NOTHING;

-- posao post p6
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p6, 'seed6_' || gs, '❤️' FROM generate_series(1, 423) gs
UNION ALL
SELECT p6, 'seed6_s' || gs, '😢' FROM generate_series(1, 312) gs
UNION ALL
SELECT p6, 'seed6_o' || gs, '😮' FROM generate_series(1, 145) gs
ON CONFLICT DO NOTHING;

-- blamovi mejl p7
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p7, 'seed7_' || gs, '😂' FROM generate_series(1, 94) gs
UNION ALL
SELECT p7, 'seed7_h' || gs, '❤️' FROM generate_series(1, 18) gs
UNION ALL
SELECT p7, 'seed7_o' || gs, '😮' FROM generate_series(1, 31) gs
UNION ALL
SELECT p7, 'seed7_f' || gs, '🔥' FROM generate_series(1, 22) gs
ON CONFLICT DO NOTHING;

-- Admin post reactions
INSERT INTO post_reactions (post_id, session_id, emoji)
SELECT p_sve, 'adm_' || gs, '❤️' FROM generate_series(1, 142) gs
UNION ALL
SELECT p_sve, 'adm_s' || gs, '😢' FROM generate_series(1, 38) gs
UNION ALL
SELECT p_sve, 'adm_f' || gs, '🔥' FROM generate_series(1, 89) gs
ON CONFLICT DO NOTHING;

END $$;
