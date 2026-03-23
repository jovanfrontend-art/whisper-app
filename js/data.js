/* =====================
   MOCK DATA
   ===================== */

const TOPICS = [
  { id: 'sve',     label: 'Sve',     emoji: '✨' },
  { id: 'ljubav',  label: 'Ljubav',  emoji: '❤️' },
  { id: 'blamovi', label: 'Blamovi', emoji: '😳' },
  { id: 'misli',   label: 'Misli',   emoji: '💭' },
  { id: 'random',  label: 'Random',  emoji: '🎲' },
  { id: 'posao',   label: 'Posao',   emoji: '💼' },
  { id: 'veze',    label: 'Veze',    emoji: '💔' },
];

const AVATARS = [
  { initials: 'A7', color: '#FF6B9D' },
  { initials: 'K3', color: '#5856D6' },
  { initials: 'M9', color: '#FF9500' },
  { initials: 'J5', color: '#34C759' },
  { initials: 'S2', color: '#007AFF' },
  { initials: 'T8', color: '#AF52DE' },
  { initials: 'N4', color: '#FF3B5C' },
  { initials: 'L6', color: '#30B0C7' },
  { initials: 'D1', color: '#FF2D92' },
  { initials: 'P0', color: '#4CD964' },
];

const POSTS = [
  {
    id: 7,
    category: 'Blamovi',
    ownerId: 'user1',
    avatar: { initials: 'K1', color: '#007AFF' },
    text: 'Danas sam na poslu slučajno poslao mejl celoj firmi umesto jednoj osobi. U mejlu je pisalo koliko mrzim ponedeljke i da mi je šef dosadan. 200 ljudi. Uključujući šefa. Ja sam samo zatvorio laptop i otišao kući.',
    reactions: { '❤️': 18, '😢': 7, '😮': 31, '😂': 94, '🔥': 22 },
    userReactions: [],
    commentCount: 7,
    time: 'pre 30min',
    comments: [
      { id: 201, avatar: AVATARS[3], text: 'BRATE 😭😭😭 ovo je najveći blam koji sam čuo ove godine, nadam se da si dobro', time: 'pre 25min', likes: 12, liked: false },
      { id: 202, avatar: AVATARS[8], text: 'Solidarnost ❤️ meni se desilo slično, preživi se. Za godinu dana će biti smešno.', time: 'pre 22min', likes: 8, liked: false },
      { id: 203, avatar: AVATARS[5], text: 'lol pa ko ti je kriv što si glup 😂 osnovna stvar je da proveriš kome šalješ', time: 'pre 18min', likes: 0, liked: false, flagged: true },
      { id: 204, avatar: AVATARS[9], text: 'Drži se, sigurno nisi jedini koji misli to za svog šefa hahah 😅', time: 'pre 15min', likes: 19, liked: false },
      { id: 205, avatar: AVATARS[2], text: 'A šef je odgovorio?? 👀 molim te reci nam', time: 'pre 12min', likes: 34, liked: false },
      { id: 206, avatar: AVATARS[7], text: 'kakav pičković lol zar ne znaš koristiti mejl u 2024?? sramota', time: 'pre 8min', likes: 0, liked: false, flagged: true },
      { id: 207, avatar: AVATARS[4], text: 'Ovo je priča za unuke 😂 budi jak/a!', time: 'pre 5min', likes: 6, liked: false },
    ]
  },
  {
    id: 1,
    category: 'Ljubav',
    ownerId: 'user1',
    avatar: AVATARS[0],
    text: 'Volela sam ga 3 godine i nikad mu nisam rekla. Juče me je pozvao na kafu da mi kaže da se ženi sa mojom najboljom drugaricom. Smejala sam se i čestitala im, a iznutra sam se raspadala na komade.',
    reactions: { '❤️': 142, '😢': 89, '😮': 34, '😂': 12, '🔥': 67 },
    userReactions: [],
    commentCount: 47,
    time: 'pre 2h',
    comments: [
      { id: 1, avatar: AVATARS[1], text: 'Ovo me slomilo... drži se ❤️ Ono što si uradila je zaista jaka stvar.', time: 'pre 1h', likes: 23, liked: false },
      { id: 2, avatar: AVATARS[2], text: 'Prolazila sam kroz isto. Jednog dana ćeš biti zahvalna što nije rekao. Pravi čovek će te videti.', time: 'pre 58min', likes: 41, liked: false },
      { id: 101, avatar: AVATARS[6], text: 'Haha pa ko bi te i voleo 😂 normalno da te ignorisao 3 godine lmao', time: 'pre 40min', likes: 0, liked: false, flagged: true },
      { id: 3, avatar: AVATARS[3], text: 'Isplači se, to ti je puno potrebno. Ne mora sve da bude "okej" odjednom. 💙', time: 'pre 45min', likes: 18, liked: false },
      { id: 102, avatar: AVATARS[7], text: 'Ovo je tako dramatično 🙄 idi dalje već jednom, nije kraj sveta', time: 'pre 25min', likes: 0, liked: false, flagged: true },
      { id: 4, avatar: AVATARS[4], text: 'Jaki su oni koji se smeju kad bole. Ti si jaka.', time: 'pre 30min', likes: 35, liked: false },
    ]
  },
  {
    id: 2,
    category: 'Blamovi',
    avatar: AVATARS[2],
    text: 'Rekao sam šefu "volim te" umesto "hvala ti". Bila je to online konferencija sa 40 ljudi. Sve je ućutalo. Ja sam ućutao. Šef je ućutao. A onda sam ugasio kameru i otišao po hleb u 11 uveče.',
    reactions: { '❤️': 28, '😢': 15, '😮': 44, '😂': 312, '🔥': 89 },
    userReactions: [],
    commentCount: 92,
    time: 'pre 4h',
    comments: [
      { id: 1, avatar: AVATARS[5], text: 'Brate ovo je 10/10 blamaza godine 💀💀💀', time: 'pre 3h', likes: 87, liked: false },
      { id: 2, avatar: AVATARS[6], text: 'A hleb si kupio barem?? 😭', time: 'pre 2h', likes: 134, liked: false },
      { id: 3, avatar: AVATARS[7], text: 'Isto mi se desilo ali sam rekao "čao mama" šefu. Solidarnost. ✊', time: 'pre 1h', likes: 61, liked: false },
    ]
  },
  {
    id: 3,
    category: 'Misli',
    ownerId: 'user1',
    avatar: AVATARS[1],
    text: 'Nekad me uhvati čudno osećanje da svi oko mene tačno znaju šta rade sa životom, a ja samo... improvizujem. Kao da svi dobili neko uputstvo za odrasle, a meni su ga zaboravili poslati.',
    reactions: { '❤️': 567, '😢': 123, '😮': 89, '😂': 45, '🔥': 201 },
    userReactions: [],
    commentCount: 134,
    time: 'pre 6h',
    comments: [
      { id: 1, avatar: AVATARS[8], text: 'Niko ne zna. Baš niko. Svi improvizujemo samo se pretvaramo da ne. To uputstvo ne postoji. 😅', time: 'pre 5h', likes: 203, liked: false },
      { id: 2, avatar: AVATARS[9], text: 'Upravo ovo mi je trebalo da pročitam. Hvala što si napisao.', time: 'pre 4h', likes: 89, liked: false },
      { id: 101, avatar: AVATARS[5], text: 'Brate molim?? Svi znaju šta rade osim tebe očigledno 😂 može i to', time: 'pre 3h', likes: 0, liked: false, flagged: true },
      { id: 3, avatar: AVATARS[0], text: 'Impostor syndrome. Svi imaju, niko ne priča. Ti nisi sam. ❤️', time: 'pre 3h', likes: 156, liked: false },
    ]
  },
  {
    id: 4,
    category: 'Veze',
    avatar: AVATARS[3],
    text: 'Godinu dana nakon raskida, pronašla sam njegovo džemper ispod kreveta. Sat vremena sam ga samo držala i plakala. A onda sam ga obukla i otišla na kafu. Živo je u meni svašta.',
    reactions: { '❤️': 89, '😢': 234, '😮': 56, '😂': 23, '🔥': 44 },
    userReactions: [],
    commentCount: 61,
    time: 'pre 8h',
    comments: [
      { id: 1, avatar: AVATARS[4], text: 'Tuga nema rok trajanja. Plači koliko ti treba. 💙', time: 'pre 7h', likes: 45, liked: false },
      { id: 2, avatar: AVATARS[5], text: 'A džemper je ostao? 😭 Volim te anonimno.', time: 'pre 6h', likes: 78, liked: false },
    ]
  },
  {
    id: 5,
    category: 'Random',
    avatar: AVATARS[4],
    text: 'Imam 28 godina i još uvek ne znam kako se pravilno pravi kafа. Svaki put je ili previše jaka ili previše slaba. Živim sam 4 godine. Svaki dan je eksperiment.',
    reactions: { '❤️': 145, '😢': 12, '😮': 33, '😂': 289, '🔥': 67 },
    userReactions: [],
    commentCount: 38,
    time: 'pre 10h',
    comments: [
      { id: 1, avatar: AVATARS[6], text: 'Ovo ja sa kuvanjem. 4 god, a jedva skuvam jaje. Solidarnost! 😂', time: 'pre 9h', likes: 34, liked: false },
      { id: 2, avatar: AVATARS[7], text: 'Kafa je umetnost brate, ne sramoti se. Gordon Ramsay bi razumeo.', time: 'pre 8h', likes: 56, liked: false },
    ]
  },
  {
    id: 6,
    category: 'Posao',
    avatar: AVATARS[5],
    text: 'Dobila sam otkaz danas. Poslali mi mejl u 17:01. Bila sam na putu kući. Plakala sam u tramvaju, a žena pored mene mi je dala maramicu bez reči. Ni ime mi nije pitala.',
    reactions: { '❤️': 423, '😢': 312, '😮': 145, '😂': 8, '🔥': 89 },
    userReactions: [],
    commentCount: 89,
    time: 'pre 12h',
    comments: [
      { id: 1, avatar: AVATARS[8], text: 'Ta žena je heroj. I ti ćeš naći nešto bolje, veruj. 🤍', time: 'pre 11h', likes: 167, liked: false },
      { id: 2, avatar: AVATARS[9], text: 'Nekad otkaz je vrata ka nečem što nismo znali da tražimo. Drži se.', time: 'pre 10h', likes: 89, liked: false },
      { id: 3, avatar: AVATARS[0], text: '17:01. Klasično. Manje nego da sačekaju još minut. Sramota.', time: 'pre 9h', likes: 245, liked: false },
    ]
  },
];

const NOTIFICATIONS = [
  { id: 1, text: 'Neko je komentarisao tvoju priču ❤️', time: 'pre 5min', unread: true },
  { id: 2, text: 'Tvoja priča dobila 50+ reakcija! 🔥', time: 'pre 20min', unread: true },
  { id: 3, text: 'Neko je odgovorio na tvoj komentar', time: 'pre 1h', unread: false },
];

const DAILY_HIGHLIGHT_DEFAULT = {
  title: 'Ispovesti koje\nse ne zaboravljaju',
  subtitle: 'Podeli svoju priču. Neko čeka da čuje.',
  postsCount: 847,
  reactionsCount: '12.4k',
};

function getDailyHighlight() {
  try {
    const saved = localStorage.getItem('whisper_daily');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DAILY_HIGHLIGHT_DEFAULT, ...parsed };
    }
  } catch(e) { /* ignore */ }
  return { ...DAILY_HIGHLIGHT_DEFAULT };
}

function saveDailyHighlight(data) {
  localStorage.setItem('whisper_daily', JSON.stringify(data));
}

// Persist data in localStorage
const DATA_VERSION = '2';

function loadData() {
  // Clear stale data from old versions (index-based saves)
  if (localStorage.getItem('whisper_data_version') !== DATA_VERSION) {
    localStorage.removeItem('whisper_posts');
    localStorage.setItem('whisper_data_version', DATA_VERSION);
    return;
  }
  const saved = localStorage.getItem('whisper_posts');
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    // Merge by ID, not by index
    parsed.forEach(p => {
      const post = POSTS.find(post => post.id === p.id);
      if (!post) return;
      post.reactions     = p.reactions     || post.reactions;
      post.userReactions = p.userReactions || [];
      post.commentCount  = p.commentCount  != null ? p.commentCount : post.commentCount;
      if (Array.isArray(p.comments) && p.comments.length > 0) {
        post.comments = p.comments;
      }
    });
  } catch(e) { /* ignore */ }
}

function saveData() {
  const toSave = POSTS.map(p => ({
    id: p.id,
    reactions: p.reactions,
    userReactions: p.userReactions,
    commentCount: p.commentCount,
    comments: p.comments,
  }));
  localStorage.setItem('whisper_posts', JSON.stringify(toSave));
}

function getPostById(id) {
  return POSTS.find(p => p.id === parseInt(id));
}

function getPostsByCategory(category) {
  if (!category || category === 'sve') return POSTS;
  return POSTS.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

// Anonymous name generator
function getAnonName(avatar) {
  return `Anonimni ${avatar.initials}`;
}

// Format number
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return n.toString();
}

loadData();
