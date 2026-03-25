# Plan: Whisper App — Mobile Demo (HTML/CSS/Vanilla JS)

## Context
Building a community anonymous confession app where users post stories (love, blamovi, misli, random), others can enter a thread to comment and give advice, and react with emojis. This is the first demo iteration — mobile-first, HTML/CSS/Vanilla JS, dark mode design with orange accent. No real backend yet — mock data used for demo.

---

## File Structure

```
/whisper app/
├── index.html          # Home feed
├── thread.html         # Post detail / thread view
├── admin.html          # Admin dashboard
├── css/
│   ├── base.css        # Reset, variables, typography (dark theme)
│   ├── header.css      # Header & navigation
│   ├── feed.css        # Home feed, topics, post cards
│   ├── thread.css      # Thread / comment view
│   └── admin.css       # Admin dashboard styles
├── js/
│   ├── data.js         # Mock posts, users, comments, topics
│   ├── feed.js         # Render feed, reactions, topic tabs
│   ├── thread.js       # Render thread, comments, submit, kick
│   └── auth.js         # Login/signup modal logic
└── PLAN.md             # This file
```

---

## Design System (Dark Mode)

- **Font:** `system-ui, -apple-system, 'SF Pro Display'`
- **Colors:**
  - Background: `#0E0E0F`
  - Surface: `#1A1A1C`
  - Primary accent: `#FF9500` (orange)
  - Text: `#FFFFFF`, muted: `#ADADB8`, subtle: `#6E6E7A`
- **Radius:** `16px` cards, `12px` buttons, `24px` modals
- **Max width:** `430px` (iPhone 14 Pro)

---

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@gmail.com` | `123456` | Admin → redirects to dashboard |
| `user1@gmail.com` | `123456` | Regular user, owner of posts 1, 3, 7 |
| Bilo koji drugi email | Bilo koja lozinka | Regular user |

---

## Pages & Features

### `index.html` — Home Feed
- Sticky header: logo, login/signup (pre-login) ili avatar + notifikacije (post-login)
- Horizontal topic chips — filter feed po kategoriji
- Daily highlight baner (editable iz admin dashboarda)
- Post kartice: avatar, kategorija, tekst, slika (opcionalna), emoji reakcije, komentari
- FAB → compose modal sa image upload (samo za ulogovane)
- Bottom navigation

### `thread.html` — Thread View
- Pun tekst posta + reakcije
- Slike na postovima i komentarima (picsum.photos placeholder + base64 upload)
- Lista komentara sa like dugmetom
- **Kick funkcija**: vlasnik posta može da ukloni neprikladne komentare
- Sticky comment input sa dugmetom za upload slike

### `admin.html` — Admin Dashboard
- Sidebar navigacija
- Statistike: korisnici, aktivni, priče, uplate
- **Tema dana editor** → ažurira daily highlight baner na index.html
- Tabele: priče, korisnici, transakcije

---

## Key Interactions

| Akcija | Ponašanje |
|--------|-----------|
| Topic chip klik | Filtrira feed |
| Emoji reakcija | Slack-style pills (❤️ 12  😂 5) + picker dugme → otvara dropdown sa 5 emoji opcija |
| Post klik | `thread.html?id=X` |
| FAB | Compose modal |
| Kick dugme (owner only) | Bottom sheet potvrda → ukloni komentar |
| Admin tema dana | Čuva u localStorage → prikazuje se na feedu |

---

## localStorage Keys

| Key | Sadržaj |
|-----|---------|
| `whisper_user` | Ulogovani korisnik (JSON) |
| `whisper_posts` | Izmene na postovima (reakcije, komentari) |
| `whisper_daily` | Tema dana (title, subtitle) |
| `whisper_data_version` | Verzija podataka (trenutno "2") |

---

## Live URL
https://jovanfrontend-art.github.io/whisper-app/
