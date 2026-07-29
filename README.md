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

**Spotify Scraper API — Search tracks, playlists, albums, artists. Stream & download MP3.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Made by](https://img.shields.io/badge/Made_by-@kasanvx-C7A662?style=for-the-badge&logo=instagram&logoColor=black)](https://instagram.com/kasanvx)

</div>

---

## ✨ Apa itu Spotix?

**Spotix** adalah full-stack web app + REST API untuk search Spotify, ambil detail track / playlist / album / artist, dan download lagu dalam format MP3 — langsung dari browser atau via API.

Dibangun di atas **Next.js 14**, scrape langsung Spotify internal GraphQL API (tanpa Spotify developer key), dengan rate limiting dan security guard bawaan. Tampilan pakai tema **hitam/putih/emas** dengan toggle **dark ⇄ light**, lengkap dengan player MP3 built-in dan halaman dokumentasi API sendiri di `/docs`.

**Fitur utama:**
- 🔍 Search by keyword **atau** paste link Spotify langsung (track/playlist/album/artist — auto-detect)
- ▶️ Preview/stream lagu sebelum download, lewat player bar persist di bawah
- ⬇️ Download MP3 satu klik, dengan nama file otomatis dari judul lagu
- 🌗 Toggle tema dark/light, tersimpan di `localStorage`
- 📖 Dokumentasi API interaktif di `/docs` — contoh request, response, dan error code
- 🛡 Rate limiting per-IP per-endpoint + UA/IP guard bawaan, tanpa perlu API key eksternal

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 14** (Pages Router) |
| Spotify Client | Custom `lib/spotify.js` — TOTP auth + GraphQL, tanpa developer key |
| Rate Limiting | In-memory, per IP + per namespace (`lib/rateLimit.js`) |
| Security | UA guard (block attack tools), IP range block (`lib/guard.js`) |
| Styling | CSS variables (`styles/globals.css`) + `styled-jsx`, tema dark/light |
| Hosting | **Vercel** (recommended) / Railway / VPS apa saja yang support Next.js |

---

## 📡 API Endpoints

Semua endpoint return JSON dengan bentuk `{ status: boolean, ... }`. Kalau `status: false`, cek field `message` buat detail error-nya.

### `GET /api/search`

Multi-purpose search. Input keyword biasa atau Spotify URL — auto-detect.

| Param | Required | Deskripsi |
|-------|----------|-----------|
| `q` | ✅ | Keyword atau Spotify URL (track/playlist/album/artist) |
| `type` | ❌ | Filter saat `q` berupa keyword: `all` `tracks` `playlists` `albums` `artists`. Default: `all` |
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

# Langsung dari Spotify artist URL
curl "https://spotify.khasan.site/api/search?q=https%3A%2F%2Fopen.spotify.com%2Fartist%2F1Xyo4u8uXC1ZmMpatF05PJ"
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

### `GET /api/download`

Resolve satu Spotify **track URL** jadi link MP3 siap pakai. Ini langkah pertama sebelum streaming/download — dipanggil dulu buat dapetin `download_url`, baru link itu dilempar ke `/api/stream` (lihat di bawah).

| Param | Required | Deskripsi |
|-------|----------|-----------|
| `url` | ✅ | Spotify track URL (`open.spotify.com/track/...` atau `spotify:track:...`) — playlist/album belum didukung di endpoint ini |

```bash
curl "https://spotify.khasan.site/api/download?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"
```

Response berisi `download_url`, `title`, `artist`, `thumbnail`, `duration`, `album`.

---

### `GET /api/stream`

Proxy audio MP3 — nge-stream file dengan header `Content-Disposition` yang benar biar browser langsung download dengan nama file yang rapi, bukan link mentah. `token` didapat dari `download_url` yang dikembalikan `/api/download`.

| Param | Required | Deskripsi |
|-------|----------|-----------|
| `token` | ✅ | Token dari `download_url` di response `/api/download` |
| `filename` | ❌ | Nama file hasil download (tanpa `.mp3`). Default: `audio` |

```bash
# 1) Resolve dulu buat dapetin download_url/token
curl "https://spotify.khasan.site/api/download?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"

# 2) Ambil token dari download_url, lalu stream/download
curl -o lagu.mp3 "https://spotify.khasan.site/api/stream?token=TOKEN&filename=lagu"
```

---

## ⚡ Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/search` | 30 req/min/IP |
| `/api/track` | 30 req/min/IP |
| `/api/playlist` | 20 req/min/IP |
| `/api/download` | 20 req/min/IP |
| `/api/stream` | 10 req/min/IP |

Header `X-RateLimit-Remaining` ada di setiap response. Lewat limit → HTTP 429.

---

## 🛡 Security

- **UA Guard** — Block attack tools (sqlmap, nuclei, masscan, dll). curl/axios/python **tidak** diblock karena ini public API
- **IP Range Block** — Block known Tor exit nodes dan abusive ASN
- **Backend Proxy** — Upstream Spotify API 100% tersembunyi dari client, nggak perlu developer key
- **Rate Limit per namespace** — Tiap endpoint punya counter terpisah, satu endpoint kena limit nggak ganggu yang lain
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` dipasang di semua response (lihat `next.config.js` & `vercel.json`)

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

Nggak perlu setup `.env` — semua kredensial scraper sudah built-in di `lib/spotify.js`.

---

## 📁 Struktur Project

```
spotix/
├── pages/
│   ├── index.js            # UI utama — search, player, download
│   ├── docs.js              # Dokumentasi API interaktif (/docs)
│   ├── 404.js                # Halaman not-found custom
│   ├── _app.js                # Provider tema dark/light (shared di semua halaman)
│   ├── _document.js           # Font, favicon, meta global
│   ├── sitemap.xml.js         # Sitemap dinamis
│   └── api/
│       ├── search.js          # Search + URL auto-detect (track/playlist/album/artist)
│       ├── track.js           # Detail track
│       ├── playlist.js        # Detail playlist
│       ├── download.js        # Resolve track URL → download_url
│       └── stream.js          # Proxy stream/download MP3
│
├── lib/
│   ├── spotify.js          # Spotify scraper (TOTP auth + GraphQL) + parser response
│   ├── rateLimit.js        # Per-IP per-namespace rate limiter
│   └── guard.js            # UA + IP security guard
│
├── styles/globals.css      # CSS variables tema dark/light + base reset
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

# Test search artist
curl -A "Mozilla/5.0" "http://localhost:3000/api/search?q=the+weeknd&type=artists"

# Test track by URL
curl -A "Mozilla/5.0" "http://localhost:3000/api/track?id=4k3xDpAdBuM17mNNHhOZkK"

# Test playlist by URL
curl -A "Mozilla/5.0" "http://localhost:3000/api/playlist?id=4IfUIdWEonPys9mYs7zXna"

# Test resolve download
curl -A "Mozilla/5.0" "http://localhost:3000/api/download?url=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"

# Test langsung dari Spotify playlist link
curl -A "Mozilla/5.0" "http://localhost:3000/api/search?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('https://open.spotify.com/playlist/4IfUIdWEonPys9mYs7zXna'))")"
```

> **Note:** `-A "Mozilla/5.0"` wajib disertakan saat test local karena guard nge-block empty UA. Di production, browser sudah otomatis punya UA.

---

## ⚠️ Known Limitations

- `/api/download` cuma support **track URL** — playlist/album harus di-resolve per-track satu-satu lewat frontend.
- Endpoint upstream (`nexray`, `spotidown`) di luar kendali project ini — kalau salah satu down, `/api/download` atau `/api/stream` bisa ikut gagal sementara.
- Parsing hasil `artist` (via `/api/search?type=artists` atau link artist) dibuat defensif terhadap perubahan struktur response Spotify, jadi field tertentu bisa kosong (`null`) kalau Spotify mengubah skema internalnya.

---

## 📬 Kontak

- Instagram: [@kasanvx](https://instagram.com/kasanvx)
- Website: [khasan.site](https://khasan.site)

---

<div align="center">

Made with 🎵 by **[@kasanvx](https://instagram.com/kasanvx)**

</div>
