/* =====================
   THREAD — Post Detail Page
   ===================== */

let currentPost = null;
let currentUser = null;
let isOwner = false;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) { window.location.href = 'index.html'; return; }

  currentPost = getPostById(id);
  if (!currentPost) { window.location.href = 'index.html'; return; }

  // Get current logged-in user
  try { currentUser = JSON.parse(localStorage.getItem('whisper_user')); } catch(e) {}
  isOwner = !!(currentUser?.userId && currentPost.ownerId && currentUser.userId === currentPost.ownerId);

  renderThreadHeader();
  renderOriginalPost();
  renderComments();

  document.getElementById('btn-back')?.addEventListener('click', () => window.history.back());
  document.getElementById('comment-send-btn')?.addEventListener('click', submitComment);
  document.getElementById('comment-textarea')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
  });
  document.getElementById('comment-textarea')?.addEventListener('input', autoResizeTextarea);
});

// ---- Header ----
function renderThreadHeader() {
  const titleEl = document.getElementById('thread-title');
  const subEl   = document.getElementById('thread-subtitle');
  const catEl   = document.getElementById('thread-category');

  if (titleEl) titleEl.textContent = 'Priča';
  if (subEl)   subEl.textContent   = `${currentPost.commentCount} komentara`;
  if (catEl) {
    catEl.textContent = currentPost.category;
    catEl.className   = `cat-pill cat-${currentPost.category.toLowerCase()}`;
  }
}

// ---- Original Post ----
function renderOriginalPost() {
  const container = document.getElementById('original-post');
  if (!container) return;

  const ownerBanner = isOwner ? `
    <div class="owner-banner">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
      Ovo je tvoja priča · možeš uklanjati neprikladne komentare
    </div>
  ` : '';

  container.innerHTML = `
    ${ownerBanner}
    <div class="original-post-header">
      <div class="original-post-meta">
        <div class="avatar lg" style="background: ${currentPost.avatar.color}">${currentPost.avatar.initials}</div>
        <div class="original-post-info">
          <span class="original-post-anon">${getAnonName(currentPost.avatar)}</span>
          <span class="original-post-time">${currentPost.time}</span>
        </div>
      </div>
      <span class="cat-pill cat-${currentPost.category.toLowerCase()}">${currentPost.category}</span>
    </div>

    <p class="original-post-text">${escapeHtml(currentPost.text)}</p>

    <div class="thread-reactions">
      <div class="reactions-bar" id="thread-reactions-bar">
        ${renderReactionBtns(currentPost)}
      </div>
    </div>
  `;
}

function renderReactionBtns(post) {
  return Object.entries(post.reactions).map(([emoji, count]) => {
    const reacted = post.userReactions.includes(emoji);
    return `
      <button class="reaction-btn ${reacted ? 'reacted' : ''}"
              onclick="toggleThreadReaction('${emoji}')">
        <span class="reaction-emoji">${emoji}</span>
        <span class="reaction-count">${formatCount(count)}</span>
      </button>
    `;
  }).join('');
}

function toggleThreadReaction(emoji) {
  if (!currentPost) return;
  const idx = currentPost.userReactions.indexOf(emoji);
  if (idx === -1) {
    currentPost.userReactions.push(emoji);
    currentPost.reactions[emoji] = (currentPost.reactions[emoji] || 0) + 1;
  } else {
    currentPost.userReactions.splice(idx, 1);
    currentPost.reactions[emoji] = Math.max(0, (currentPost.reactions[emoji] || 1) - 1);
  }
  saveData();
  const bar = document.getElementById('thread-reactions-bar');
  if (bar) bar.innerHTML = renderReactionBtns(currentPost);
}

// ---- Comments ----
function renderComments() {
  const list    = document.getElementById('comments-list');
  const countEl = document.getElementById('comments-count-badge');
  if (!list) return;

  if (countEl) countEl.textContent = currentPost.comments.length;

  if (currentPost.comments.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-emoji">💬</span>
        <h3>Nema komentara još</h3>
        <p>Budi prvi koji će dati podršku ili savet!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = currentPost.comments.map((c, i) => {
    const kickBtn = isOwner ? `
      <button class="btn-kick" onclick="confirmKick(${c.id})" title="Ukloni korisnika iz priče">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
        Izbaci
      </button>
    ` : '';

    return `
      <div class="comment-card ${c.isNew ? 'new' : ''} ${c.flagged ? 'flagged-comment' : ''}"
           id="comment-${c.id}"
           style="animation-delay: ${i * 0.04}s">
        <div class="comment-header">
          <div class="comment-meta">
            <div class="avatar sm" style="background: ${c.avatar.color}">${c.avatar.initials}</div>
            <div class="comment-info">
              <span class="comment-anon">${getAnonName(c.avatar)}</span>
              <span class="comment-time">${c.time}</span>
            </div>
          </div>
          <div class="comment-actions">
            ${kickBtn}
            <button class="comment-like-btn ${c.liked ? 'liked' : ''}" onclick="toggleCommentLike(${c.id})">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${c.likes}
            </button>
          </div>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </div>
    `;
  }).join('');
}

function toggleCommentLike(commentId) {
  if (!currentPost) return;
  const comment = currentPost.comments.find(c => c.id === commentId);
  if (!comment) return;
  comment.liked  = !comment.liked;
  comment.likes += comment.liked ? 1 : -1;
  saveData();
  renderComments();
}

// ---- Kick ----
let kickTargetId = null;

function confirmKick(commentId) {
  kickTargetId = commentId;

  document.querySelectorAll('.comment-card').forEach(el => el.classList.remove('kick-target'));
  document.getElementById(`comment-${commentId}`)?.classList.add('kick-target');

  document.getElementById('kick-dialog')?.classList.add('active');
  document.getElementById('kick-backdrop')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cancelKick() {
  kickTargetId = null;
  document.querySelectorAll('.comment-card').forEach(el => el.classList.remove('kick-target'));
  document.getElementById('kick-dialog')?.classList.remove('active');
  document.getElementById('kick-backdrop')?.classList.remove('active');
  document.body.style.overflow = '';
}

function executeKick() {
  if (!kickTargetId || !currentPost) return;

  const card = document.getElementById(`comment-${kickTargetId}`);

  // Animate out
  if (card) {
    card.classList.add('kick-removing');
    setTimeout(() => {
      currentPost.comments = currentPost.comments.filter(c => c.id !== kickTargetId);
      currentPost.commentCount = Math.max(0, currentPost.commentCount - 1);
      kickTargetId = null;
      document.getElementById('kick-dialog')?.classList.remove('active');
      document.getElementById('kick-backdrop')?.classList.remove('active');
      document.body.style.overflow = '';
      saveData();
      renderComments();

      const subEl = document.getElementById('thread-subtitle');
      if (subEl) subEl.textContent = `${currentPost.commentCount} komentara`;

      showThreadToast('Komentar je uklonjen iz tvoje priče. 🚫');
    }, 350);
  } else {
    currentPost.comments = currentPost.comments.filter(c => c.id !== kickTargetId);
    currentPost.commentCount = Math.max(0, currentPost.commentCount - 1);
    kickTargetId = null;
    document.getElementById('kick-dialog')?.classList.remove('active');
    document.getElementById('kick-backdrop')?.classList.remove('active');
    document.body.style.overflow = '';
    saveData();
    renderComments();
    showThreadToast('Komentar je uklonjen iz tvoje priče. 🚫');
  }
}

// ---- Submit Comment ----
function submitComment() {
  const textarea = document.getElementById('comment-textarea');
  const text = textarea?.value?.trim();
  if (!text) return;

  const avatarColors = ['#FF6B9D', '#5856D6', '#FF9500', '#34C759', '#007AFF', '#AF52DE', '#FF3B5C', '#30B0C7'];
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  const newComment = {
    id: Date.now(),
    avatar: {
      initials: letters[Math.floor(Math.random() * letters.length)] + Math.floor(Math.random() * 9),
      color: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    },
    text,
    time: 'upravo',
    likes: 0,
    liked: false,
    isNew: true,
  };

  currentPost.comments.push(newComment);
  currentPost.commentCount += 1;
  textarea.value = '';
  textarea.style.height = 'auto';

  saveData();
  renderComments();

  const subEl = document.getElementById('thread-subtitle');
  if (subEl) subEl.textContent = `${currentPost.commentCount} komentara`;

  setTimeout(() => {
    document.getElementById('comments-list')?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

// ---- Helpers ----
function autoResizeTextarea() {
  const el = document.getElementById('comment-textarea');
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  document.getElementById('comment-send-btn').disabled = !el.value.trim();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showThreadToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
  });
}
