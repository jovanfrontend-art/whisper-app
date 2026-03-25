/* =====================
   PROFILE
   ===================== */

let profileImageData = null;

function openProfile() {
  profileImageData = null;
  document.getElementById('profile-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderProfile();
}

function closeProfile() {
  document.getElementById('profile-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
  profileImageData = null;
}

function renderProfile() {
  const body = document.getElementById('profile-body');
  if (!body) return;

  const user = Auth.getUser();

  if (!user) {
    body.innerHTML = `
      <div class="profile-guest">
        <div class="profile-guest-icon">👤</div>
        <h3>Nisi prijavljen/a</h3>
        <p>Prijavi se da bi imao/la profil i čuvao/la svoje priče.</p>
        <button class="profile-login-btn" onclick="closeProfile(); Auth.openAuthModal('login')">
          Prijavi se
        </button>
        <button class="profile-login-btn profile-login-btn--ghost" onclick="closeProfile(); Auth.openAuthModal('signup')">
          Registruj se
        </button>
      </div>
    `;
    return;
  }

  const initials = (user.username || 'A')[0].toUpperCase();
  const color    = user.color || '#FF3B5C';
  const joined   = user.joinedAt ? formatJoinDate(user.joinedAt) : 'nepoznato';

  const avatarHtml = user.avatarImage
    ? `<div class="profile-avatar-img" style="background-image:url(${user.avatarImage})"></div>`
    : `<div class="profile-avatar-initials" style="background:${color}">${initials}</div>`;

  body.innerHTML = `
    <div class="profile-avatar-wrap">
      ${avatarHtml}
      <button class="profile-avatar-edit" onclick="document.getElementById('profile-img-input').click()" title="Promeni sliku">
        <svg viewBox="0 0 24 24"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5m-7 2H3V7H1v2H3v2h2V9m7-6 2.04 2.26C13.38 3.09 12.7 3 12 3A9 9 0 0 0 3 12h2a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7c-1.68 0-3.23-.59-4.45-1.56L6 19a9 9 0 0 0 6 2.3A9 9 0 0 0 21 12 9 9 0 0 0 12 3z"/></svg>
      </button>
      <input type="file" id="profile-img-input" accept="image/*" style="display:none" onchange="onProfileImageSelected(this)">
      <div class="profile-avatar-preview-hint" id="profile-avatar-hint"></div>
    </div>

    <div class="profile-form">
      <div class="profile-field">
        <label class="profile-label">Nickname</label>
        <input class="profile-input" id="profile-name-input"
               type="text" maxlength="24"
               value="${escapeHtmlAttr(user.username || '')}"
               placeholder="Tvoje ime...">
      </div>

      <div class="profile-field">
        <label class="profile-label">Email</label>
        <div class="profile-static">${escapeHtml(user.email || '—')}</div>
      </div>

      <div class="profile-field">
        <label class="profile-label">Član od</label>
        <div class="profile-static">${joined}</div>
      </div>
    </div>

    <div class="profile-actions">
      <button class="profile-save-btn" onclick="saveProfile()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>
        Sačuvaj izmene
      </button>
      <button class="profile-logout-btn" onclick="confirmLogout()">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        Odjavi se
      </button>
    </div>
  `;
}

function onProfileImageSelected(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImageData = e.target.result;
    // Update avatar preview immediately
    const wrap = document.querySelector('.profile-avatar-wrap');
    if (wrap) {
      const existing = wrap.querySelector('.profile-avatar-img, .profile-avatar-initials');
      if (existing) {
        existing.className = 'profile-avatar-img';
        existing.textContent = '';
        existing.style.background = '';
        existing.style.backgroundImage = `url(${profileImageData})`;
        existing.style.backgroundSize = 'cover';
        existing.style.backgroundPosition = 'center';
      }
    }
    const hint = document.getElementById('profile-avatar-hint');
    if (hint) { hint.textContent = 'Nova slika odabrana'; hint.classList.add('visible'); }
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function saveProfile() {
  const user = Auth.getUser();
  if (!user) return;

  const newName = document.getElementById('profile-name-input')?.value?.trim();
  if (!newName || newName.length < 2) {
    showToast('Nickname mora imati barem 2 karaktera.');
    return;
  }

  user.username = newName;
  if (profileImageData) user.avatarImage = profileImageData;

  localStorage.setItem('whisper_user', JSON.stringify(user));
  Auth.updateHeaderState();
  closeProfile();
  showToast('Profil sačuvan! ✅');
}

function confirmLogout() {
  const body = document.getElementById('profile-body');
  if (!body) return;
  body.innerHTML = `
    <div class="profile-confirm-logout">
      <div class="profile-confirm-icon">👋</div>
      <h3>Odjavljuješ se?</h3>
      <p>Tvoje lokalne priče i reakcije ostaju sačuvane.</p>
      <button class="profile-save-btn" style="background:var(--secondary)" onclick="doLogout()">
        Da, odjavi me
      </button>
      <button class="profile-logout-btn" onclick="renderProfile()">Odustani</button>
    </div>
  `;
}

function doLogout() {
  closeProfile();
  Auth.logout ? Auth.logout() : localStorage.removeItem('whisper_user');
  showToast('Vidimo se! 👋');
  Auth.updateHeaderState();
}

function formatJoinDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('sr-Latn', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeHtmlAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('profile-close')?.addEventListener('click', closeProfile);
});
