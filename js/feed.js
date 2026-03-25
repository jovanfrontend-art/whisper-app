/* =====================
   FEED — Home Page Logic
   ===================== */

let activeCategory = 'sve';

// ---- Render Topics ----
function renderTopics() {
  const scroll = document.getElementById('topics-scroll');
  if (!scroll) return;

  scroll.innerHTML = TOPICS.map(t => `
    <button class="topic-chip ${t.id === activeCategory ? 'active' : ''}"
            data-category="${t.id}"
            onclick="setCategory('${t.id}')">
      <span class="topic-chip-emoji">${t.emoji}</span>
      ${t.label}
    </button>
  `).join('');
}

function setCategory(id) {
  activeCategory = id;
  renderTopics();
  renderDailyHighlight();
  renderFeed();
}

// ---- Render Daily Highlight ----
const CATEGORY_RGB = {
  sve:     '255, 149, 0',   // orange
  ljubav:  '255, 69, 58',   // red
  blamovi: '255, 159, 10',  // amber
  misli:   '191, 90, 242',  // purple
  random:  '50, 215, 75',   // green
  posao:   '10, 132, 255',  // blue
  veze:    '255, 55, 95',   // pink
};

function renderDailyHighlight() {
  const el = document.getElementById('daily-highlight');
  if (!el) return;

  const rgb = CATEGORY_RGB[activeCategory] || CATEGORY_RGB.sve;
  el.style.setProperty('--daily-rgb', rgb);

  const d = getDailyHighlight(activeCategory);
  const linkedId = d.postId;

  el.innerHTML = `
    <div class="daily-tag">✨ Tema dana</div>
    <div class="daily-title">${escapeHtml(d.title)}</div>
    <p class="daily-text">${escapeHtml(d.subtitle)}</p>
    <div class="reactions-bar" onclick="event.stopPropagation()">
      ${renderDailyReactions(d)}
    </div>
    <div class="post-card-footer">
      <div class="post-comments-info">
        <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${formatCount(d.commentCount)} komentara
      </div>
      <button class="btn-enter-thread" onclick="navigateToThread(${linkedId})">
        Uđi u priču
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `;
}

function renderDailyReactions(d) {
  const pills = Object.entries(d.reactions || {})
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => {
      const reacted = (d.userReactions || []).includes(emoji);
      return `<button class="reaction-pill${reacted ? ' reacted' : ''}" onclick="toggleDailyReaction('${emoji}')">${emoji} <span>${formatCount(count)}</span></button>`;
    }).join('');

  return `${pills}<button class="add-reaction-btn" onclick="openEmojiPicker(event, 'daily', null, null)" title="Dodaj reakciju"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>`;
}

function toggleDailyReaction(emoji) {
  const d = getDailyHighlight(activeCategory);
  if (!d.reactions) d.reactions = {};
  if (!d.userReactions) d.userReactions = [];

  const idx = d.userReactions.indexOf(emoji);
  if (idx === -1) {
    d.userReactions.push(emoji);
    d.reactions[emoji] = (d.reactions[emoji] || 0) + 1;
  } else {
    d.userReactions.splice(idx, 1);
    d.reactions[emoji] = Math.max(0, (d.reactions[emoji] || 1) - 1);
  }
  saveDailyHighlight(activeCategory, d);
  renderDailyHighlight();
}

// ---- Render Feed ----
function renderFeed() {
  const list = document.getElementById('posts-list');
  const countEl = document.getElementById('feed-count');
  if (!list) return;

  const posts = getPostsByCategory(activeCategory);

  if (countEl) countEl.textContent = posts.length;

  if (posts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-emoji">🌐</span>
        <h3>Nema priča ovde</h3>
        <p>Budi prvi koji će podeliti priču u ovoj kategoriji!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = posts.map((post, i) => {
    const author = getPostAuthor(post);
    const avatarStyle = author.avatarImage
      ? `background:${author.color};background-image:url(${author.avatarImage});background-size:cover;background-position:center`
      : `background:${author.color}`;
    const avatarContent = author.avatarImage ? '' : author.initials;
    return `
    <article class="post-card" style="animation-delay: ${i * 0.05}s"
             onclick="navigateToThread(${post.id})">
      <div class="post-card-header">
        <div class="post-card-meta">
          <div class="avatar" style="${avatarStyle}">${avatarContent}</div>
          <div class="post-card-info">
            <span class="post-card-anon">${escapeHtml(author.name)}</span>
            <span class="post-card-time">${post.time}</span>
          </div>
        </div>
        <span class="cat-pill cat-${post.category.toLowerCase()}">${post.category}</span>
      </div>

      <p class="post-text">${escapeHtml(post.text)}</p>

      ${post.image ? `<div class="post-image-wrap"><img class="post-image" src="${post.image}" alt="" loading="lazy" onerror="this.parentElement.remove()"></div>` : ''}

      <div class="reactions-bar" onclick="event.stopPropagation()">
        ${renderReactions(post)}
      </div>

      <div class="post-card-footer">
        <div class="post-comments-info">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          ${formatCount(post.commentCount)} komentara
        </div>
        <button class="btn-enter-thread" onclick="event.stopPropagation(); navigateToThread(${post.id})">
          Ući u priču
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </article>
  `;
  }).join('');
}

function renderReactions(post) {
  const pills = Object.entries(post.reactions)
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => {
      const reacted = post.userReactions.includes(emoji);
      return `<button class="reaction-pill${reacted ? ' reacted' : ''}" onclick="toggleReaction(${post.id}, '${emoji}')">${emoji} <span>${formatCount(count)}</span></button>`;
    }).join('');

  return `${pills}<button class="add-reaction-btn" onclick="openEmojiPicker(event, 'post', ${post.id}, null)" title="Dodaj reakciju"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>`;
}

// ---- Reactions ----
function toggleReaction(postId, emoji) {
  const post = POSTS.find(p => p.id === postId);
  if (!post) return;

  const idx = post.userReactions.indexOf(emoji);
  if (idx === -1) {
    post.userReactions.push(emoji);
    post.reactions[emoji] = (post.reactions[emoji] || 0) + 1;
  } else {
    post.userReactions.splice(idx, 1);
    post.reactions[emoji] = Math.max(0, (post.reactions[emoji] || 1) - 1);
  }

  saveData();

  // Re-render just the reactions for this post
  const cards = document.querySelectorAll('.post-card');
  const posts = getPostsByCategory(activeCategory);
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1 && cards[postIndex]) {
    const reactionsBar = cards[postIndex].querySelector('.reactions-bar');
    if (reactionsBar) reactionsBar.innerHTML = renderReactions(post);
  }
}

// ---- Navigation ----
function navigateToThread(id) {
  window.location.href = `thread.html?id=${id}`;
}

// ---- Compose Modal ----
let selectedCategory = 'Ljubav';
let composeImageData = null;

function openCompose() {
  if (!Auth.isLoggedIn()) {
    Auth.openAuthModal('login');
    showToast('Uloguj se da bi podelio/la priču 🔐');
    return;
  }

  const modal = document.getElementById('compose-modal');
  const backdrop = document.getElementById('compose-backdrop');
  const fab = document.getElementById('fab');

  modal?.classList.add('active');
  backdrop?.classList.add('active');
  fab?.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('compose-textarea')?.focus();
}

function closeCompose() {
  const modal = document.getElementById('compose-modal');
  const backdrop = document.getElementById('compose-backdrop');
  const fab = document.getElementById('fab');

  modal?.classList.remove('active');
  backdrop?.classList.remove('active');
  fab?.classList.remove('open');
  document.body.style.overflow = '';
  composeImageData = null;
  const preview = document.getElementById('compose-img-preview');
  if (preview) preview.innerHTML = '';
}

function openImagePicker() {
  document.getElementById('compose-img-input')?.click();
}

function onComposeImageSelected(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    composeImageData = e.target.result;
    const preview = document.getElementById('compose-img-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="compose-img-preview">
          <img src="${composeImageData}" alt="">
          <div class="compose-img-remove" onclick="removeComposeImage()">✕</div>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeComposeImage() {
  composeImageData = null;
  const preview = document.getElementById('compose-img-preview');
  if (preview) preview.innerHTML = '';
}

function selectComposeCategory(cat) {
  selectedCategory = cat;
  document.querySelectorAll('.cat-select-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.cat === cat);
  });
}

function submitPost() {
  const textarea = document.getElementById('compose-textarea');
  const text = textarea?.value?.trim();

  if (!text || text.length < 10) {
    showToast('Napiši barem 10 karaktera. ✍️');
    return;
  }

  const user = Auth.getUser();
  const avatarColors = ['#FF6B9D', '#5856D6', '#FF9500', '#34C759', '#007AFF', '#AF52DE', '#FF3B5C', '#30B0C7'];
  const newPost = {
    id: Date.now(),
    category: selectedCategory,
    ownerId: user ? (user.userId || user.email) : null,
    avatar: {
      initials: (user?.username?.[0] || 'A').toUpperCase() + Math.floor(Math.random() * 9),
      color: user?.color || avatarColors[Math.floor(Math.random() * avatarColors.length)],
    },
    text,
    image: composeImageData || null,
    reactions: { '❤️': 0, '😢': 0, '😮': 0, '😂': 0, '🔥': 0 },
    userReactions: [],
    commentCount: 0,
    time: 'upravo',
    comments: [],
  };

  POSTS.unshift(newPost);
  textarea.value = '';
  updateCharCount();
  closeCompose();
  renderFeed();
  saveData();
  showToast('Priča podeljena! 🎉 Hvala ti što si to uradio/la.');
}

function updateCharCount() {
  const textarea = document.getElementById('compose-textarea');
  const counter = document.getElementById('char-count');
  if (!textarea || !counter) return;
  const len = textarea.value.length;
  const max = 500;
  counter.textContent = `${len} / ${max}`;
  counter.classList.toggle('warning', len > max * 0.8);
}

// ---- Notifications ----
function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  dropdown?.classList.toggle('open');
}

function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  list.innerHTML = NOTIFICATIONS.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      ${n.unread ? '<div class="notif-dot"></div>' : '<div style="width:8px;flex-shrink:0"></div>'}
      <div class="notif-content">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');

  const badge = document.getElementById('notif-badge');
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.classList.toggle('hidden', unreadCount === 0);
  }
}

// ---- Utility ----
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  renderDailyHighlight();
  renderTopics();
  renderFeed();
  renderNotifications();

  // FAB
  document.getElementById('fab')?.addEventListener('click', openCompose);

  // Compose backdrop
  document.getElementById('compose-backdrop')?.addEventListener('click', closeCompose);

  // Compose textarea
  document.getElementById('compose-textarea')?.addEventListener('input', updateCharCount);

  // Compose submit
  document.getElementById('compose-submit')?.addEventListener('click', submitPost);

  // Category buttons
  document.querySelectorAll('.cat-select-btn').forEach(btn => {
    btn.addEventListener('click', () => selectComposeCategory(btn.dataset.cat));
  });

  // Notification button
  document.getElementById('notif-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNotifications();
  });

  // Close notifications on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notif-dropdown') && !e.target.closest('#notif-btn')) {
      document.getElementById('notif-dropdown')?.classList.remove('open');
    }
  });

  // Textarea keyboard submit (Ctrl+Enter)
  document.getElementById('compose-textarea')?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submitPost();
  });
});
