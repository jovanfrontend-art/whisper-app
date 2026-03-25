/* =====================
   SEARCH
   ===================== */

let searchTags = [];

const TAG_COLORS = {
  'ljubav':  '255, 69, 58',
  'blamovi': '255, 159, 10',
  'misli':   '191, 90, 242',
  'random':  '50, 215, 75',
  'posao':   '10, 132, 255',
  'veze':    '255, 55, 95',
};

const TAG_EMOJIS = {
  'ljubav': '❤️', 'blamovi': '😳', 'misli': '💭',
  'random': '🎲', 'posao': '💼', 'veze': '💔',
};

function openSearch() {
  searchTags = [];
  document.getElementById('search-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderSearchTags();
  renderSearchResults();
  setTimeout(() => document.getElementById('search-input')?.focus(), 350);
}

function closeSearch() {
  document.getElementById('search-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

function addTag(word) {
  const tag = word.trim().toLowerCase().replace(/[,\s]+$/, '');
  if (!tag || searchTags.includes(tag)) return;
  searchTags.push(tag);
  renderSearchTags();
  renderSearchResults();
}

function removeTag(tag) {
  searchTags = searchTags.filter(t => t !== tag);
  renderSearchTags();
  renderSearchResults();
  document.getElementById('search-input')?.focus();
}

function renderSearchTags() {
  const container = document.getElementById('search-tags');
  if (!container) return;

  container.innerHTML = searchTags.map(tag => {
    const rgb   = TAG_COLORS[tag] || '173, 173, 184';
    const emoji = TAG_EMOJIS[tag] ? TAG_EMOJIS[tag] + ' ' : '';
    return `<span class="search-tag" style="--tag-rgb:${rgb}">
      ${emoji}${tag}
      <button class="search-tag-remove" onclick="removeTag('${tag}')">×</button>
    </span>`;
  }).join('');

  // Update placeholder visibility
  const input = document.getElementById('search-input');
  if (input) input.placeholder = searchTags.length ? 'Dodaj još...' : 'Dodaj tag i pritisni Enter...';
}

function renderSearchResults() {
  const results = document.getElementById('search-results');
  const countEl = document.getElementById('search-count');
  if (!results) return;

  if (searchTags.length === 0) {
    if (countEl) countEl.textContent = '';
    results.innerHTML = `
      <div class="search-empty-state">
        <span class="search-empty-emoji">🔍</span>
        <p>Dodaj tag da pretražiš priče</p>
      </div>`;
    return;
  }

  const posts = POSTS.filter(p => {
    if (p.isAdmin) return false;
    const haystack = (p.text + ' ' + p.category).toLowerCase();
    return searchTags.some(tag => haystack.includes(tag));
  });

  if (countEl) {
    const n = posts.length;
    countEl.textContent = n === 0 ? 'Nema rezultata' : `${n} ${n === 1 ? 'rezultat' : 'rezultata'}`;
  }

  if (posts.length === 0) {
    results.innerHTML = `
      <div class="search-empty-state">
        <span class="search-empty-emoji">😶</span>
        <p>Nema priča za ove tagove</p>
      </div>`;
    return;
  }

  results.innerHTML = posts.map((post, i) => `
    <article class="search-result-card" style="animation-delay:${i * 0.04}s"
             onclick="closeSearch(); navigateToThread(${post.id})">
      <div class="search-result-meta">
        <div class="avatar sm" style="background:${post.avatar.color}">${post.avatar.initials}</div>
        <span class="cat-pill cat-${post.category.toLowerCase()}">${post.category}</span>
        <span class="search-result-time">${post.time}</span>
      </div>
      <p class="search-result-text">${highlightTags(escapeHtml(post.text), searchTags)}</p>
      <div class="search-result-footer">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--text-3)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${formatCount(post.commentCount)} komentara
      </div>
    </article>
  `).join('');
}

function highlightTags(text, tags) {
  let result = text;
  tags.forEach(tag => {
    const safe  = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safe})`, 'gi');
    result = result.replace(regex, '<mark class="search-highlight">$1</mark>');
  });
  return result;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, '');
      if (val) { addTag(val); input.value = ''; }
    } else if (e.key === 'Backspace' && !input.value && searchTags.length > 0) {
      removeTag(searchTags[searchTags.length - 1]);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  document.getElementById('search-close')?.addEventListener('click', closeSearch);
});
