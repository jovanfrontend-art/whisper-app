/* =====================
   THREAD — Post Detail Page
   ===================== */

let currentPost = null;
let currentUser = null;
let isOwner = false;
let commentImageData = null;

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) { window.location.href = 'index.html'; return; }

  currentPost = getPostById(id);
  if (!currentPost) { window.location.href = 'index.html'; return; }

  // Sync admin post title/text from daily highlight (admin-editable)
  if (currentPost.isAdmin) {
    const d = getDailyHighlight(currentPost.adminCategory);
    currentPost.title = d.title;
    currentPost.text  = d.subtitle;
  }

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
  document.getElementById('comment-img-btn')?.addEventListener('click', () => {
    document.getElementById('comment-img-input')?.click();
  });
  document.getElementById('comment-img-input')?.addEventListener('change', onCommentImageSelected);
});

// ---- Header ----
function renderThreadHeader() {
  const titleEl = document.getElementById('thread-title');
  const subEl   = document.getElementById('thread-subtitle');
  const catEl   = document.getElementById('thread-category');

  if (titleEl) titleEl.textContent = currentPost.isAdmin ? 'Tema dana' : 'Priča';
  if (subEl)   subEl.textContent   = `${currentPost.commentCount} komentara`;
  if (catEl) {
    if (currentPost.isAdmin) {
      catEl.textContent = '✨ Whisper';
      catEl.className   = 'cat-pill cat-temadana';
    } else {
      catEl.textContent = currentPost.category;
      catEl.className   = `cat-pill cat-${currentPost.category.toLowerCase()}`;
    }
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

  const author = getPostAuthor(currentPost);
  const authorAvatarStyle = author.avatarImage
    ? `background:${author.color};background-image:url(${author.avatarImage});background-size:cover;background-position:center`
    : `background:${author.color}`;
  const authorAvatarContent = author.avatarImage ? '' : author.initials;

  const authorBlock = currentPost.isAdmin ? `
    <div class="original-post-header">
      <div class="original-post-meta">
        <div class="avatar lg whisper-avatar">W</div>
        <div class="original-post-info">
          <span class="original-post-anon whisper-name">Whisper</span>
          <span class="original-post-time">Admin · Tema dana</span>
        </div>
      </div>
      <span class="cat-pill cat-temadana">✨ Tema dana</span>
    </div>
  ` : `
    <div class="original-post-header">
      <div class="original-post-meta">
        <div class="avatar lg" style="${authorAvatarStyle}">${authorAvatarContent}</div>
        <div class="original-post-info">
          <span class="original-post-anon">${escapeHtml(author.name)}</span>
          <span class="original-post-time">${currentPost.time}</span>
        </div>
      </div>
      <span class="cat-pill cat-${currentPost.category.toLowerCase()}">${currentPost.category}</span>
    </div>
  `;

  container.innerHTML = `
    ${ownerBanner}
    ${authorBlock}

    ${currentPost.title ? `<h2 class="original-post-title">${escapeHtml(currentPost.title)}</h2>` : ''}

    <p class="original-post-text">${escapeHtml(currentPost.text)}</p>

    ${currentPost.image ? `<img class="original-post-image" src="${currentPost.image}" alt="" loading="lazy" onerror="this.remove()">` : ''}

    <div class="thread-reactions">
      <div class="reactions-bar" id="thread-reactions-bar">
        ${renderReactionBtns(currentPost)}
      </div>
    </div>
  `;
}

function renderReactionBtns(post) {
  const pills = Object.entries(post.reactions)
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => {
      const reacted = post.userReactions.includes(emoji);
      return `<button class="reaction-pill${reacted ? ' reacted' : ''}" onclick="toggleThreadReaction('${emoji}')">${emoji} <span>${formatCount(count)}</span></button>`;
    }).join('');

  return `${pills}<button class="add-reaction-btn" onclick="openEmojiPicker(event, 'post', ${post.id}, null)" title="Dodaj reakciju"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>`;
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
          </div>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
        ${c.image ? `<img class="comment-image" src="${c.image}" alt="" loading="lazy" onerror="this.remove()">` : ''}
        ${renderCommentReactionPills(c)}
      </div>
    `;
  }).join('');
}

function renderCommentReactionPills(c) {
  const reactions = c.reactions !== undefined ? c.reactions
    : (c.likes > 0 ? { '❤️': c.likes } : {});
  const userReactions = c.userReactions !== undefined ? c.userReactions
    : (c.liked ? ['❤️'] : []);

  const pills = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .map(([emoji, count]) => {
      const reacted = userReactions.includes(emoji);
      return `<button class="reaction-pill sm${reacted ? ' reacted' : ''}" onclick="toggleCommentReaction(${currentPost.id}, ${c.id}, '${emoji}')">${emoji} <span>${formatCount(count)}</span></button>`;
    }).join('');

  const addBtn = `<button class="add-reaction-btn sm" onclick="openEmojiPicker(event, 'comment', ${currentPost.id}, ${c.id})" title="Reaguj"><svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>`;

  return `<div class="reactions-bar sm">${pills}${addBtn}</div>`;
}

function toggleCommentReaction(postId, commentId, emoji) {
  if (!currentPost) return;
  const comment = currentPost.comments.find(c => c.id === commentId);
  if (!comment) return;

  // Migrate legacy likes/liked format on first interaction
  if (comment.reactions === undefined) {
    comment.reactions = comment.likes > 0 ? { '❤️': comment.likes } : {};
    comment.userReactions = comment.liked ? ['❤️'] : [];
  }

  const idx = comment.userReactions.indexOf(emoji);
  if (idx === -1) {
    comment.userReactions.push(emoji);
    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
  } else {
    comment.userReactions.splice(idx, 1);
    comment.reactions[emoji] = Math.max(0, (comment.reactions[emoji] || 1) - 1);
  }
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
    image: commentImageData || null,
    time: 'upravo',
    reactions: {},
    userReactions: [],
    isNew: true,
  };

  currentPost.comments.push(newComment);
  currentPost.commentCount += 1;
  textarea.value = '';
  textarea.style.height = 'auto';
  commentImageData = null;
  const preview = document.getElementById('comment-img-preview');
  if (preview) preview.innerHTML = '';

  saveData();
  renderComments();

  const subEl = document.getElementById('thread-subtitle');
  if (subEl) subEl.textContent = `${currentPost.commentCount} komentara`;

  setTimeout(() => {
    document.getElementById('comments-list')?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

function onCommentImageSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    commentImageData = ev.target.result;
    const preview = document.getElementById('comment-img-preview');
    if (preview) {
      preview.innerHTML = `
        <div class="comment-img-thumb">
          <img src="${commentImageData}" alt="">
          <button class="comment-img-remove" onclick="removeCommentImage()">✕</button>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function removeCommentImage() {
  commentImageData = null;
  const preview = document.getElementById('comment-img-preview');
  if (preview) preview.innerHTML = '';
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
