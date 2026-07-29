<div align="center">

<br/>

```
███████╗██████╗  ██████╗ ████████╗██╗██╗  ██╗
██╔════╝██╔══██╗██╔═══██╗╚══██╔══╝██║╚██╗██╔╝
███████╗██████╔╝██║   ██║   ██║   ██║ ╚███╔╝ 
╚════██║██╔═══╝ ██║   ██║   ██║   ██║ ██╔██╗ 
███████║██║     ╚██████╔╝   ██║   ██║██╔╝ ██╗
╚══════╝╚═╝      ╚═════╝    ╚═╝   ╚═╝╚═╝  ╚═╝
```

**Spotify Scraper API — Search tracks, playlists, albums. Stream & download MP3.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Made by](https://img.shields.io/badge/Made_by-@kasanvx-1DB954?style=for-the-badge&logo=instagram)](https://instagram.com/kasanvx)

</div>

---

## ✨ Apa itu Spotix?

**Spotix** adalah full-stack web app + REST API untuk search Spotify, ambil detail track/playlist/album, dan download lagu dalam format MP3 — langsung dari browser atau via API.

Dibangun di atas **Next.js 14**, scrape langsung Spotify internal GraphQL API (tanpa Spotify developer key), dengan rate limiting dan security guard bawaan.

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 14** |
| Spotify Client | Custom `lib/spotify.js` — TOTP auth + GraphQL |
| Rate Limiting | In-memory per IP + namespace |
| Security | UA guard (block attack tools), IP range block |
| Hosting | **Vercel** (recommended) / Railway / VPS |

---

## 📡 API Endpoints

### `GET /api/search`

Multi-purpose search. Input keyword biasa atau Spotify URL — auto-detect.

| Param | Required | Deskripsi |
|-------|----------|-----------|
| `q` | ✅ | Keyword atau Spotify URL (track/playlist/album/artist) |
| `type` | ❌ | Filter: `all` `tracks` `playlists` `albums` `artists`. Default: `all` |
| `limit` | ❌ | Jumlah hasil 1–50. Default: 10 |

```bash
# Search keyword — semua type
curl "https://spotify.khasan.site/api/search?q=dj+snake"

# Filter hanya tracks, 20 hasil
curl "https://spotify.khasan.site/api/search?q=lofi+chill&type=tracks&limit=20"

# Search playlist by keyword
curl "https://spotify.khasan.site/api/search?q=workout+playlist&type=playlists"

# Langsung dari Spotify track URL
curl "https://spotify.khasan.site/api/search?q=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"

# Langsung dari Spotify playlist URL
curl "https://spotify.khasan.site/api/search?q=https%3A%2F%2Fopen.spotify.com%2Fplaylist%2F4IfUIdWEonPys9mYs7zXna"
```

---

### `GET /api/track`

Ambil detail track by Spotify track ID atau URL.

```bash
# by ID
curl "https://spotify.khasan.site/api/track?id=4k3xDpAdBuM17mNNHhOZkK"

# by URL
curl "https://spotify.khasan.site/api/track?id=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"
```

---

### `GET /api/playlist`

Ambil info + semua tracks dari Spotify playlist.

```bash
# by ID
curl "https://spotify.khasan.site/api/playlist?id=4IfUIdWEonPys9mYs7zXna"

# by URL
curl "https://spotify.khasan.site/api/playlist?id=https%3A%2F%2Fopen.spotify.com%2Fplaylist%2F4IfUIdWEonPys9mYs7zXna"
```

---

### `GET /api/stream`

Proxy audio MP3. `download_url` dari `/api/search` sudah siap pakai.

```bash
# Gunakan download_url dari /api/search response langsung
curl -o lagu.mp3 "https://spotify.khasan.site/api/stream?token=TOKEN&filename=lagu"
```

---

## ⚡ Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/search` | 30 req/min/IP |
| `/api/track` | 30 req/min/IP |
| `/api/playlist` | 20 req/min/IP |
| `/api/stream` | 10 req/min/IP |

Header `X-RateLimit-Remaining` ada di setiap response.

---

## 🛡 Security

- **UA Guard** — Block attack tools (sqlmap, nuclei, masscan, dll). curl/axios/python **tidak** diblock karena ini public API
- **IP Range Block** — Block known Tor exit nodes dan abusive ASN
- **Backend Proxy** — Upstream Spotify API 100% tersembunyi dari client
- **Rate Limit per namespace** — Tiap endpoint punya counter terpisah

---

## 🚀 Deploy

### Vercel (Recommended)

```bash
npm i -g vercel
cd spotix
vercel
```

Atau push ke GitHub → [vercel.com](https://vercel.com) → Import repo → Deploy.

### Local Dev

```bash
git clone https://github.com/kasanvx/spotix.git
cd spotix
npm install
npm run dev
# → http://localhost:3000
```

---

## 📁 Struktur Project

```
spotix/
├── pages/
│   ├── index.js          # UI utama
│   ├── docs.js           # Dokumentasi API
│   └── api/
│       ├── search.js     # Search + URL auto-detect
│       ├── track.js      # Detail track
│       ├── playlist.js   # Detail playlist
│       └── stream.js     # Audio stream proxy
│
├── lib/
│   ├── spotify.js        # Spotify scraper (TOTP auth + GraphQL)
│   ├── rateLimit.js      # Per-IP per-namespace rate limiter
│   └── guard.js          # UA + IP security guard
│
├── styles/globals.css
├── next.config.js
├── vercel.json
└── package.json
```

---

## 🧪 Test cURL

```bash
# Test search keyword
curl -A "Mozilla/5.0" "http://localhost:3000/api/search?q=the+weeknd&type=tracks&limit=5"

# Test search playlist
curl -A "Mozilla/5.0" "http://localhost:3000/api/search?q=chill+vibes&type=playlists"

# Test track by URL
curl -A "Mozilla/5.0" "http://localhost:3000/api/track?id=4k3xDpAdBuM17mNNHhOZkK"

# Test playlist by URL
curl -A "Mozilla/5.0" "http://localhost:3000/api/playlist?id=4IfUIdWEonPys9mYs7zXna"

# Test langsung dari Spotify playlist link
curl -A "Mozilla/5.0" "http://localhost:3000/api/search?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('https://open.spotify.com/playlist/4IfUIdWEonPys9mYs7zXna'))")"
```

> Note: `-A "Mozilla/5.0"` wajib disertakan saat test local karena guard nge-block empty UA. Di production browser sudah auto punya UA.

---

## 📬 Kontak

- Instagram: [@kasanvx](https://instagram.com/kasanvx)
- Website: [khasan.site](https://khasan.site)

---

<div align="center">

Made with 🎵 by **[@kasanvx](https://instagram.com/kasanvx)**

</div>
