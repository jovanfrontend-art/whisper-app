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

const ADMIN_AVATAR = { initials: 'W', color: '#FF9500' };

const POSTS = [
  {
    id: 100, isAdmin: true, adminCategory: 'sve',
    category: 'Tema dana', avatar: ADMIN_AVATAR,
    title: 'Ispovesti koje se ne zaboravljaju',
    text: 'Podeli svoju priču. Neko čeka da čuje. Ovo je mesto gde možeš biti potpuno iskren/a — bez osude, bez imenovanja, samo istina.',
    reactions: { '❤️': 142, '😢': 38, '😮': 25, '😂': 67, '🔥': 89 },
    userReactions: [], commentCount: 3, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[1], text: 'Upravo ovo mi je trebalo danas. Hvala Whisper ❤️', time: 'pre 1h', likes: 34, liked: false },
      { id: 2, avatar: AVATARS[3], text: 'Konačno mesto gde mogu biti iskren/a. Svaka čast! 🙏', time: 'pre 45min', likes: 21, liked: false },
      { id: 3, avatar: AVATARS[7], text: 'Čekam ovo svaki dan. Tema dana me uvek ubode pravo u srce 💙', time: 'pre 30min', likes: 15, liked: false },
    ],
  },
  {
    id: 101, isAdmin: true, adminCategory: 'ljubav',
    category: 'Ljubav', avatar: ADMIN_AVATAR,
    title: 'Kad srce govori glasnije od razuma',
    text: 'Ljubav koja boli, ljubav koja leči — svaka priča je vredna pažnje. Podeli šta nosiš u sebi.',
    reactions: { '❤️': 89, '😢': 54, '😮': 12, '😂': 8, '🔥': 41 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[2], text: 'Ova kategorija me uvek slomi... ali i pomogne 💙', time: 'pre 2h', likes: 18, liked: false },
      { id: 2, avatar: AVATARS[5], text: 'Ovde sam pronašla reči koje nisam mogla da nađem. Hvala ❤️', time: 'pre 1h', likes: 27, liked: false },
    ],
  },
  {
    id: 102, isAdmin: true, adminCategory: 'blamovi',
    category: 'Blamovi', avatar: ADMIN_AVATAR,
    title: 'Stidi se glasno — ovde si siguran/na',
    text: 'Najgori blamovi postaju najbolje priče. Šta ti se desilo što još uvek ne možeš da zaboraviš?',
    reactions: { '❤️': 34, '😢': 12, '😮': 28, '😂': 156, '🔥': 67 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[4], text: 'Jedva čekam da pročitam šta su drugi preživeli 😂', time: 'pre 3h', likes: 44, liked: false },
      { id: 2, avatar: AVATARS[9], text: 'Ova sekcija me spasila od depresije u ponedeljak ujutru 💀', time: 'pre 2h', likes: 89, liked: false },
    ],
  },
  {
    id: 103, isAdmin: true, adminCategory: 'misli',
    category: 'Misli', avatar: ADMIN_AVATAR,
    title: 'Misli koje ne smeš da kažeš naglas',
    text: 'One čudne, tamne, tople misli koje imaš u 2 ujutru. Ovde ih možeš zapisati.',
    reactions: { '❤️': 201, '😢': 88, '😮': 45, '😂': 23, '🔥': 112 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[0], text: 'Nekad mi treba samo da znam da nisam jedini koji ovako misli.', time: 'pre 4h', likes: 67, liked: false },
      { id: 2, avatar: AVATARS[6], text: 'Ovo je terapija bez terapeuta 💭', time: 'pre 3h', likes: 91, liked: false },
    ],
  },
  {
    id: 104, isAdmin: true, adminCategory: 'random',
    category: 'Random', avatar: ADMIN_AVATAR,
    title: 'Sve što ti pada na pamet',
    text: 'Nema pravila, nema kategorija. Ako ne znaš gde da staviš priču — stavi je ovde.',
    reactions: { '❤️': 55, '😢': 19, '😮': 38, '😂': 210, '🔥': 88 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[8], text: 'Anarhija pripovedanja. Obožavam 🎲', time: 'pre 5h', likes: 32, liked: false },
      { id: 2, avatar: AVATARS[1], text: 'Moja omiljena kategorija jer nikad ne znaš šta ćeš naći', time: 'pre 4h', likes: 47, liked: false },
    ],
  },
  {
    id: 105, isAdmin: true, adminCategory: 'posao',
    category: 'Posao', avatar: ADMIN_AVATAR,
    title: 'Tajne koje ostaju između tebe i monitora',
    text: 'Šef koji ne sluša, kolega koji krade ideje, otkaz koji te uhvati nespremnog. Priče sa radnog mesta koje ne možeš da ispričaš naglas.',
    reactions: { '❤️': 78, '😢': 134, '😮': 56, '😂': 45, '🔥': 99 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[3], text: 'Ova kategorija bi mogla biti TV serija 😅', time: 'pre 6h', likes: 56, liked: false },
      { id: 2, avatar: AVATARS[7], text: 'Solidarnost svim radnicima koji se bore 💼', time: 'pre 5h', likes: 78, liked: false },
    ],
  },
  {
    id: 106, isAdmin: true, adminCategory: 'veze',
    category: 'Veze', avatar: ADMIN_AVATAR,
    title: 'Priče o srcima koja su bila slomljena',
    text: 'Raskidi, udaljavanja, neobjašnjive tišine. Gde si sada i šta nosiš sa sobom?',
    reactions: { '❤️': 167, '😢': 234, '😮': 44, '😂': 11, '🔥': 56 },
    userReactions: [], commentCount: 2, time: 'upravo',
    comments: [
      { id: 1, avatar: AVATARS[5], text: 'Ova kategorija je moj dnevnik koji nisam pisala 💔', time: 'pre 7h', likes: 112, liked: false },
      { id: 2, avatar: AVATARS[2], text: 'Jednog dana sve ovo će biti priča koju pričaš smejući se. Drži se.', time: 'pre 6h', likes: 145, liked: false },
    ],
  },
  {
    id: 7,
    category: 'Blamovi',
    ownerId: 'user1',
    avatar: { initials: 'K1', color: '#007AFF' },
    text: 'Danas sam na poslu slučajno poslao mejl celoj firmi umesto jednoj osobi. U mejlu je pisalo koliko mrzim ponedeljke i da mi je šef dosadan. 200 ljudi. Uključujući šefa. Ja sam samo zatvorio laptop i otišao kući.',
    image: 'https://picsum.photos/seed/office42/500/280',
    reactions: { '❤️': 18, '😢': 7, '😮': 31, '😂': 94, '🔥': 22 },
    userReactions: [],
    commentCount: 7,
    time: 'pre 30min',
    comments: [
      { id: 201, avatar: AVATARS[3], text: 'BRATE 😭😭😭 ovo je najveći blam koji sam čuo ove godine, nadam se da si dobro', time: 'pre 25min', likes: 12, liked: false },
      { id: 202, avatar: AVATARS[8], text: 'Solidarnost ❤️ meni se desilo slično, preživi se. Za godinu dana će biti smešno.', image: 'https://picsum.photos/seed/friends7/400/220', time: 'pre 22min', likes: 8, liked: false },
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
    image: 'https://picsum.photos/seed/coffee99/500/280',
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

const DAILY_HIGHLIGHTS_DEFAULT = {
  sve:     { title: 'Ispovesti koje se ne zaboravljaju',        subtitle: 'Podeli svoju priču. Neko čeka da čuje. Ovo je mesto gde možeš biti potpuno iskren/a — bez osude, bez imenovanja, samo istina.',  reactions: { '❤️': 142, '😢': 38, '😮': 25, '😂': 67, '🔥': 89  }, userReactions: [], commentCount: 3,  postId: 100 },
  ljubav:  { title: 'Kad srce govori glasnije od razuma',       subtitle: 'Ljubav koja boli, ljubav koja leči — svaka priča je vredna pažnje. Podeli šta nosiš u sebi.',                                    reactions: { '❤️': 89,  '😢': 54, '😮': 12, '😂': 8,  '🔥': 41  }, userReactions: [], commentCount: 2,  postId: 101 },
  blamovi: { title: 'Stidi se glasno — ovde si siguran/na',     subtitle: 'Najgori blamovi postaju najbolje priče. Šta ti se desilo što još uvek ne možeš da zaboraviš?',                                  reactions: { '❤️': 34,  '😢': 12, '😮': 28, '😂': 156,'🔥': 67  }, userReactions: [], commentCount: 2,  postId: 102 },
  misli:   { title: 'Misli koje ne smeš da kažeš naglas',       subtitle: 'One čudne, tamne, tople misli koje imaš u 2 ujutru. Ovde ih možeš zapisati.',                                                    reactions: { '❤️': 201, '😢': 88, '😮': 45, '😂': 23, '🔥': 112 }, userReactions: [], commentCount: 2,  postId: 103 },
  random:  { title: 'Sve što ti pada na pamet',                 subtitle: 'Nema pravila, nema kategorija. Ako ne znaš gde da staviš priču — stavi je ovde.',                                                reactions: { '❤️': 55,  '😢': 19, '😮': 38, '😂': 210,'🔥': 88  }, userReactions: [], commentCount: 2,  postId: 104 },
  posao:   { title: 'Tajne koje ostaju između tebe i monitora', subtitle: 'Šef koji ne sluša, kolega koji krade ideje, otkaz koji te uhvati nespremnog. Priče sa radnog mesta koje ne možeš da ispričaš naglas.', reactions: { '❤️': 78,  '😢': 134,'😮': 56, '😂': 45, '🔥': 99  }, userReactions: [], commentCount: 2,  postId: 105 },
  veze:    { title: 'Priče o srcima koja su bila slomljena',    subtitle: 'Raskidi, udaljavanja, neobjašnjive tišine. Gde si sada i šta nosiš sa sobom?',                                                   reactions: { '❤️': 167, '😢': 234,'😮': 44, '😂': 11, '🔥': 56  }, userReactions: [], commentCount: 2,  postId: 106 },
};

function getDailyHighlight(category) {
  const cat = category || 'sve';
  const def = DAILY_HIGHLIGHTS_DEFAULT[cat] || DAILY_HIGHLIGHTS_DEFAULT.sve;
  try {
    const saved = localStorage.getItem(`whisper_daily_${cat}`);
    if (saved) return { ...def, ...JSON.parse(saved) };
  } catch(e) { /* ignore */ }
  return { ...def };
}

function saveDailyHighlight(category, data) {
  localStorage.setItem(`whisper_daily_${category || 'sve'}`, JSON.stringify(data));
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
  const regular = POSTS.filter(p => !p.isAdmin);
  if (!category || category === 'sve') return regular;
  return regular.filter(p => p.category.toLowerCase() === category.toLowerCase());
}

// Anonymous name generator
function getAnonName(avatar) {
  return `Anonimni ${avatar.initials}`;
}

// Returns display info for a post — real name/avatar if it's the current user's post
function getPostAuthor(post) {
  try {
    const user = JSON.parse(localStorage.getItem('whisper_user'));
    if (user && post.ownerId && post.ownerId === (user.userId || user.email)) {
      return {
        name: user.username || 'Ti',
        color: user.color || post.avatar.color,
        avatarImage: user.avatarImage || null,
        initials: (user.username || 'T')[0].toUpperCase(),
        isMe: true,
      };
    }
  } catch(e) {}
  return {
    name: getAnonName(post.avatar),
    color: post.avatar.color,
    avatarImage: null,
    initials: post.avatar.initials,
    isMe: false,
  };
}

// Format number
function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
  return n.toString();
}

/* ---- Emoji Picker ---- */
let _pickerTarget = null;

function initEmojiPicker() {
  if (document.getElementById('emoji-picker-popup')) return;
  const picker = document.createElement('div');
  picker.id = 'emoji-picker-popup';
  picker.className = 'emoji-picker-popup';
  ['❤️','😢','😮','😂','🔥'].forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-option';
    btn.textContent = e;
    btn.addEventListener('click', () => pickEmoji(e));
    picker.appendChild(btn);
  });
  document.body.appendChild(picker);

  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('#emoji-picker-popup') && !ev.target.closest('.add-reaction-btn')) {
      closeEmojiPicker();
    }
  });
}

function openEmojiPicker(event, type, postId, commentId) {
  event.stopPropagation();
  const picker = document.getElementById('emoji-picker-popup');
  if (!picker) return;

  const isSame = _pickerTarget &&
    _pickerTarget.type === type &&
    _pickerTarget.postId === postId &&
    _pickerTarget.commentId === commentId;

  if (isSame) { closeEmojiPicker(); return; }

  _pickerTarget = { type, postId, commentId };
  picker.style.display = 'flex';

  const btn = event.currentTarget;
  requestAnimationFrame(() => {
    const btnRect = btn.getBoundingClientRect();
    const bar = btn.closest('.reactions-bar') || btn.closest('.thread-reactions') || btn;
    const barRect = bar.getBoundingClientRect();
    const ph = picker.offsetHeight || 52;
    const pw = picker.offsetWidth || 230;
    // Center over the reactions bar, position above/below the button
    let left = barRect.left + barRect.width / 2 - pw / 2;
    let top = btnRect.top - ph - 8;
    if (top < 8) top = btnRect.bottom + 8;
    if (left < 8) left = 8;
    if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    picker.style.top = top + 'px';
    picker.style.left = left + 'px';
  });
}

function closeEmojiPicker() {
  const picker = document.getElementById('emoji-picker-popup');
  if (picker) picker.style.display = 'none';
  _pickerTarget = null;
}

function pickEmoji(emoji) {
  if (!_pickerTarget) return;
  const { type, postId, commentId } = _pickerTarget;
  if (type === 'post') {
    if (typeof toggleReaction === 'function') toggleReaction(postId, emoji);
    else if (typeof toggleThreadReaction === 'function') toggleThreadReaction(emoji);
  } else if (type === 'comment') {
    if (typeof toggleCommentReaction === 'function') toggleCommentReaction(postId, commentId, emoji);
  } else if (type === 'daily') {
    if (typeof toggleDailyReaction === 'function') toggleDailyReaction(emoji);
  }
  closeEmojiPicker();
}

document.addEventListener('DOMContentLoaded', initEmojiPicker);

loadData();
