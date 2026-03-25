/* =====================
   AUTH — Login / Signup Logic
   ===================== */

const Auth = (() => {
  const AUTH_KEY = 'whisper_user';

  function getUser() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
    catch(e) { return null; }
  }

  function setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  }

  function isLoggedIn() {
    return !!getUser();
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    updateHeaderState();
  }

  function updateHeaderState() {
    const user = getUser();
    const authArea = document.getElementById('header-auth');
    const userArea = document.getElementById('header-user');
    if (!authArea || !userArea) return;

    if (user) {
      authArea.classList.add('hidden');
      userArea.classList.remove('hidden');
      const nameEl = document.getElementById('header-username');
      const avatarEl = document.getElementById('header-avatar');
      if (nameEl) nameEl.textContent = user.username || 'Ti';
      if (avatarEl) {
        if (user.avatarImage) {
          avatarEl.textContent = '';
          avatarEl.style.background = user.color || '#FF3B5C';
          avatarEl.style.backgroundImage = `url(${user.avatarImage})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
        } else {
          avatarEl.textContent = (user.username || 'A')[0].toUpperCase();
          avatarEl.style.backgroundImage = '';
          avatarEl.style.backgroundSize = '';
          avatarEl.style.backgroundPosition = '';
          avatarEl.style.background = user.color || '#FF3B5C';
        }
      }
    } else {
      authArea.classList.remove('hidden');
      userArea.classList.add('hidden');
    }
  }

  function openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) return;

    modal.classList.add('active');
    backdrop.classList.add('active');
    switchTab(tab);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) return;

    modal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.querySelectorAll('.auth-form-panel').forEach(p => {
      p.classList.toggle('hidden', p.dataset.panel !== tab);
    });
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
      showFormError('login', 'Popuni sva polja.');
      return;
    }

    // User1 check
    if (email === 'user1@gmail.com') {
      if (password !== '123456') {
        showFormError('login', 'Pogrešna lozinka.');
        return;
      }
      const user1 = {
        email,
        username: 'Korisnik1',
        userId: 'user1',
        color: '#007AFF',
        joinedAt: Date.now(),
      };
      setUser(user1);
      closeAuthModal();
      updateHeaderState();
      showToast('Zdravo, Korisnik1! 👋');
      return;
    }

    // Admin check
    if (email === 'admin@gmail.com') {
      if (password !== '123456') {
        showFormError('login', 'Pogrešna lozinka za admin nalog.');
        return;
      }
      const admin = {
        email,
        username: 'Admin',
        color: '#FF3B5C',
        isAdmin: true,
        joinedAt: Date.now(),
      };
      setUser(admin);
      window.location.href = 'admin.html';
      return;
    }

    // Regular user: accept any credentials
    const colors = ['#FF6B9D', '#5856D6', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];
    const user = {
      email,
      username: email.split('@')[0],
      color: colors[Math.floor(Math.random() * colors.length)],
      joinedAt: Date.now(),
    };
    setUser(user);
    closeAuthModal();
    updateHeaderState();
    showToast('Dobrodošao/la! 👋');
  }

  function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username')?.value?.trim();
    const email = document.getElementById('signup-email')?.value?.trim();
    const password = document.getElementById('signup-password')?.value;

    if (!username || !email || !password) {
      showFormError('signup', 'Popuni sva polja.');
      return;
    }
    if (password.length < 6) {
      showFormError('signup', 'Lozinka mora imati barem 6 karaktera.');
      return;
    }

    const colors = ['#FF6B9D', '#5856D6', '#FF9500', '#34C759', '#007AFF', '#AF52DE'];
    const user = {
      username,
      email,
      color: colors[Math.floor(Math.random() * colors.length)],
      joinedAt: Date.now(),
    };
    setUser(user);
    closeAuthModal();
    updateHeaderState();
    showToast(`Zdravo, ${username}! Dobrodošao/la u Whisper. 🎉`);
  }

  function showFormError(panel, msg) {
    const errEl = document.getElementById(`${panel}-error`);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
      setTimeout(() => errEl.classList.add('hidden'), 3000);
    }
  }

  function init() {
    updateHeaderState();

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Open modal buttons
    document.getElementById('btn-login')?.addEventListener('click', () => openAuthModal('login'));
    document.getElementById('btn-signup')?.addEventListener('click', () => openAuthModal('signup'));

    // Close on backdrop
    document.getElementById('modal-backdrop')?.addEventListener('click', closeAuthModal);

    // Forms
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('signup-form')?.addEventListener('submit', handleSignup);

    // Guest mode
    document.getElementById('btn-guest')?.addEventListener('click', () => {
      closeAuthModal();
      showToast('Preglednik si. Postovi i reakcije su privremeni. 👁️');
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      logout();
      showToast('Vidimo se! 👋');
    });
  }

  return { init, isLoggedIn, getUser, openAuthModal, updateHeaderState, logout };
})();

// Toast notification
function showToast(msg, duration = 3000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  });
}
