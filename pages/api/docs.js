// credits : kasan
import React, { useState } from 'react'
import Link from 'next/link'
import { useTheme } from './_app'

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setOk(true)
    setTimeout(() => setOk(false), 2000)
  }

  return (
    <button className={`cpbtn ${ok ? 'ok' : ''}`} onClick={handleCopy}>
      {ok ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Copied</>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy</>
      )}
    </button>
  )
}

function Code({ label, code, success, error: isError }) {
  return (
    <div className={`cb ${success ? 'cb-ok' : ''} ${isError ? 'cb-err' : ''}`}>
      <div className="cb-top">
        <div className="cb-dots">
          <span className="dot dot-r"></span>
          <span className="dot dot-y"></span>
          <span className="dot dot-g"></span>
        </div>
        <span className="cb-lbl">{label}</span>
        <CopyBtn text={code} />
      </div>
      <div className="cb-scroll">
        <pre className="cb-pre"><code>{code}</code></pre>
      </div>
    </div>
  )
}

function Badge({ method }) {
  return (
    <span className={`badge badge-${method.toLowerCase()}`}>
      {method}
    </span>
  )
}

const BASE = 'https://spotify.khasan.site'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <>
      <div className="root">
        <div className="bg">
          <div className="orb o1" /><div className="orb o2" /><div className="grid" />
        </div>

        <nav className="nav">
          <div className="nav-w">
            <Link href="/" className="logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="var(--green)" strokeWidth="1.5" />
                <path d="M9 12.5c4-1.5 9-1 12 2" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 16c3.5-1.2 8-.8 11 1.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="logo-txt">Spotix API</span>
            </Link>
            <div className="nav-mid">
              <Link href="/" className="npill">Home</Link>
              <Link href="/docs" className="npill on">Docs</Link>
            </div>
            <div className="nav-r">
              <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer" className="ig">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
                <span className="ig-txt">kasanvx</span>
              </a>
              <button className="tbtn" onClick={toggle} aria-label="Toggle theme">
                {theme === 'dark'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                }
              </button>
            </div>
          </div>
        </nav>

        <div className="docs-lay">
          <aside className="sidebar">
            <div className="sb-sticky">
              <div className="sb-sec">
                <p className="sb-lbl">Getting Started</p>
                <a href="#intro" className="sb-a">Introduction</a>
                <a href="#auth" className="sb-a">Authentication</a>
                <a href="#limits" className="sb-a">Rate Limits</a>
                <a href="#errors" className="sb-a">Error Codes</a>
              </div>
              <div className="sb-sec">
                <p className="sb-lbl">API Reference</p>
                <a href="#search" className="sb-a"><span className="mb get">GET</span>/api/search</a>
                <a href="#track" className="sb-a"><span className="mb get">GET</span>/api/track</a>
                <a href="#playlist" className="sb-a"><span className="mb get">GET</span>/api/playlist</a>
                <a href="#stream" className="sb-a"><span className="mb get">GET</span>/api/stream</a>
              </div>
            </div>
          </aside>

          <main className="dcontent">
            <section id="intro" className="ds">
              <div className="dtag">REST API · v2</div>
              <h1 className="dh1">Spotix API</h1>
              <p className="dlead">
                Public REST API buat search Spotify, ambil detail track/playlist, dan download MP3.
                Langsung scrape Spotify internal API tanpa perlu integrasi key apapun.
                Built by <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer">@kasanvx</a>.
              </p>
              
              <div className="burl-container">
                <div className="burl">
                  <span className="burl-lbl">Production Base URL</span>
                  <div className="burl-code">
                    <code>{BASE}</code>
                    <CopyBtn text={BASE} />
                  </div>
                </div>
              </div>
            </section>

            <div className="div" />

            <section id="auth" className="ds">
              <h2 className="dh2">Authentication</h2>
              <div className="icard">
                <div className="ic-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><circle cx="12" cy="10" r="3" /></svg>
                </div>
                <div className="ic-text">
                  <h3 className="ic-t">Zero Configuration Required</h3>
                  <p className="ic-d">Semua endpoint public dan bisa langsung dipanggil. Rate limit berlaku per IP. curl, axios, python semua jalan lancar, yang diblock otomatis cuma attack tools.</p>
                </div>
              </div>
            </section>

            <div className="div" />

            <section id="limits" className="ds">
              <h2 className="dh2">Rate Limits</h2>
              <p className="dp">Proteksi per IP dengan sliding window 60 detik. Header <code className="inline-code">X-RateLimit-Remaining</code> otomatis tersedia di setiap response. Sistem return status <code className="inline-code">429</code> kalau limit habis.</p>
              <div className="lim-grid">
                <div className="lim-card">
                  <div className="lim-top">
                    <span className="lim-n">30</span>
                    <span className="lim-u">req / min</span>
                  </div>
                  <code className="lim-r">/api/search</code>
                </div>
                <div className="lim-card">
                  <div className="lim-top">
                    <span className="lim-n">30</span>
                    <span className="lim-u">req / min</span>
                  </div>
                  <code className="lim-r">/api/track</code>
                </div>
                <div className="lim-card">
                  <div className="lim-top">
                    <span className="lim-n">20</span>
                    <span className="lim-u">req / min</span>
                  </div>
                  <code className="lim-r">/api/playlist</code>
                </div>
                <div className="lim-card">
                  <div className="lim-top">
                    <span className="lim-n">10</span>
                    <span className="lim-u">req / min</span>
                  </div>
                  <code className="lim-r">/api/stream</code>
                </div>
              </div>
            </section>

            <div className="div" />

            <section id="search" className="ds">
              <div className="ep-h">
                <Badge method="GET" />
                <h2 className="dh2 nm">/api/search</h2>
              </div>
              <p className="dp">
                Endpoint serbaguna. Support search text keyword buat dapetin array hasil, atau input raw Spotify URL buat dapetin direct object data.
              </p>

              <h3 className="dh3">Request Parameters</h3>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><code className="pc">q</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="req">required</span></td>
                      <td className="td">Keyword pencarian atau valid Spotify URL</td>
                    </tr>
                    <tr>
                      <td><code className="pc">type</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="opt">optional</span></td>
                      <td className="td">Filter: <code className="pc">all</code>, <code className="pc">tracks</code>, <code className="pc">playlists</code>, <code className="pc">albums</code>, <code className="pc">artists</code>. (Default: <code className="pc">all</code>)</td>
                    </tr>
                    <tr>
                      <td><code className="pc">limit</code></td>
                      <td><span className="ty">number</span></td>
                      <td><span className="opt">optional</span></td>
                      <td className="td">Limit data (1-50). (Default: 10)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="dh3">Examples</h3>
              <Code label="Search keyword type all" code={`curl "${BASE}/api/search?q=dj+snake+taki+taki"`} />
              <Code label="Search filter tracks" code={`curl "${BASE}/api/search?q=chill+lofi&type=tracks&limit=20"`} />
              <Code label="Search from URL" code={`curl "${BASE}/api/search?q=https%3A%2F%2Fopen.spotify.com%2Ftrack%2F4k3xDpAdBuM17mNNHhOZkK"`} />
              <Code label="JavaScript Integration" code={`const res = await fetch('/api/search?q=tame+impala&type=tracks&limit=15')
const { status, type, data } = await res.json()

const res2 = await fetch('/api/search?q=' + encodeURIComponent('https://open.spotify.com/playlist/xyz'))
const data2 = await res2.json()`} />

              <h3 className="dh3">Responses</h3>
              <Code label="200 OK — Keyword Data" success code={`{
  "status": true,
  "via": "search",
  "type": "search",
  "data": {
    "top_results": [ { "type": "Track", "id": "...", "name": "Taki Taki" } ],
    "tracks": [ { "id": "...", "name": "Taki Taki", "duration_ms": 216040 } ],
    "playlists": [],
    "albums": [],
    "artists": []
  },
  "response_ms": 843
}`} />
              <Code label="200 OK — URL Data" success code={`{
  "status": true,
  "via": "playlist",
  "type": "playlist",
  "data": {
    "id": "4IfUIdWEonPys9mYs7zXna",
    "name": "Nama Playlist",
    "description": "Deskripsi playlist",
    "followers": 12400,
    "tracks": [ { "id": "...", "name": "..." } ]
  },
  "response_ms": 1201
}`} />
            </section>

            <div className="div" />

            <section id="track" className="ds">
              <div className="ep-h">
                <Badge method="GET" />
                <h2 className="dh2 nm">/api/track</h2>
              </div>
              <p className="dp">Extract metadata komplit single track menggunakan Spotify ID atau URI.</p>

              <h3 className="dh3">Request Parameters</h3>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><code className="pc">id</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="req">required</span></td>
                      <td className="td">Track ID, URL, atau URI format</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="dh3">Example</h3>
              <Code label="Track Request" code={`curl "${BASE}/api/track?id=4k3xDpAdBuM17mNNHhOZkK"`} />

              <h3 className="dh3">Response</h3>
              <Code label="200 OK" success code={`{
  "status": true,
  "data": {
    "id": "4k3xDpAdBuM17mNNHhOZkK",
    "uri": "spotify:track:4k3xDpAdBuM17mNNHhOZkK",
    "url": "https://open.spotify.com/track/4k3xDpAdBuM17mNNHhOZkK",
    "name": "Blinding Lights",
    "duration_ms": 200040,
    "playcount": 3800000000,
    "explicit": false,
    "track_number": 1,
    "album": {
      "id": "...",
      "name": "After Hours",
      "release_year": 2020,
      "images": [{ "url": "https://i.scdn.co/...", "width": 640, "height": 640 }]
    },
    "artists": [{ "id": "...", "name": "The Weeknd" }]
  },
  "response_ms": 712
}`} />
            </section>

            <div className="div" />

            <section id="playlist" className="ds">
              <div className="ep-h">
                <Badge method="GET" />
                <h2 className="dh2 nm">/api/playlist</h2>
              </div>
              <p className="dp">Fetch informasi detail playlist beserta susunan lengkap tracks di dalamnya.</p>

              <h3 className="dh3">Request Parameters</h3>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><code className="pc">id</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="req">required</span></td>
                      <td className="td">Playlist ID atau URL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="dh3">Response</h3>
              <Code label="200 OK" success code={`{
  "status": true,
  "data": {
    "id": "4IfUIdWEonPys9mYs7zXna",
    "name": "Playlist Name",
    "followers": 4820,
    "images": [{ "url": "https://...", "width": 640, "height": 640 }],
    "owner": {
      "display_name": "Spotify", "username": "spotify"
    },
    "tracks": [
      {
        "id": "...", "name": "Track Name", "duration_ms": 210000, "explicit": false,
        "album": { "id": "...", "name": "Album", "images": [] },
        "artists": [{ "id": "...", "name": "Artist" }]
      }
    ]
  },
  "response_ms": 1340
}`} />
            </section>

            <div className="div" />

            <section id="stream" className="ds">
              <div className="ep-h">
                <Badge method="GET" />
                <h2 className="dh2 nm">/api/stream</h2>
              </div>
              <p className="dp">
                Audio proxy streaming. Parameter <code className="inline-code">token</code> didapat otomatis dari property <code className="inline-code">download_url</code> pada endpoint search.
              </p>

              <h3 className="dh3">Request Parameters</h3>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><code className="pc">token</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="req">required</span></td>
                      <td className="td">Token streaming dari response API sebelumnya</td>
                    </tr>
                    <tr>
                      <td><code className="pc">filename</code></td>
                      <td><span className="ty">string</span></td>
                      <td><span className="opt">optional</span></td>
                      <td className="td">Modifikasi nama file download header</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="dh3">Implementation Example</h3>
              <Code label="Stream or Download Audio" code={`const { data: { result } } = await (await fetch('/api/search?q=blinding+lights')).json()

const audio = new Audio(result.download_url)
audio.play()

const a = document.createElement('a')
a.href = result.download_url
a.download = result.title + '.mp3'
a.click()`} />
            </section>

            <div className="div" />

            <section id="errors" className="ds">
              <h2 className="dh2">Error Handling</h2>
              <p className="dp">Standard error response structure: <code className="inline-code">{`{ "status": false, "message": "..." }`}</code></p>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th style={{ width: '80px' }}>Code</th><th>Description</th></tr></thead>
                  <tbody>
                    {[
                      ['400', 'Bad Request: Parameter tidak lengkap atau format salah'],
                      ['403', 'Forbidden: Deteksi malicious User-Agent atau Tor nodes'],
                      ['404', 'Not Found: Data track/playlist tidak eksis di Spotify'],
                      ['405', 'Method Not Allowed: Harap gunakan HTTP GET'],
                      ['429', 'Too Many Requests: Rate limit cooldown period'],
                      ['502', 'Bad Gateway: Koneksi ke upstream audio gagal'],
                      ['504', 'Gateway Timeout: Proses ekstraksi melebihi batas waktu'],
                      ['500', 'Internal Server Error: Kegagalan sistem tidak terduga'],
                    ].map(([c, m]) => (
                      <tr key={c}>
                        <td><code className="ec">{c}</code></td>
                        <td className="td">{m}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="div" />

            <div className="dfooter">
              <p>Built with precision by <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer">@kasanvx</a></p>
              <Link href="/" className="back">← Explore App</Link>
            </div>

          </main>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { margin: 0; padding: 0; background-color: var(--bg); color: var(--t1); transition: background-color 0.3s ease; }
        a { text-decoration: none; color: inherit; }

        .cpbtn { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:600; color:var(--t2); padding:5px 12px; border-radius:8px; background:var(--bg3); border:1px solid var(--border); cursor:pointer; font-family:inherit; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .cpbtn:hover { color:var(--t1); border-color:var(--t3); background:var(--bg2); transform:translateY(-1px); }
        .cpbtn.ok { color:var(--green); border-color:var(--green); background:var(--gdim); transform:scale(0.95); }

        .cb { border-radius:12px; overflow:hidden; border:1px solid var(--border); margin-bottom:16px; background:var(--bg2); box-shadow:0 4px 20px rgba(0,0,0,0.1); transition:border-color 0.3s ease; }
        .cb:hover { border-color:var(--t3); }
        .cb-ok { border-color:rgba(199,166,98,0.4); }
        .cb-ok:hover { border-color:var(--green); }
        .cb-err { border-color:rgba(255,68,102,0.4); }
        .cb-err:hover { border-color:var(--red); }
        .cb-top { display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(0,0,0,0.2); border-bottom:1px solid var(--border); backdrop-filter:blur(10px); }
        .cb-dots { display:flex; gap:6px; align-items:center; width:60px; }
        .dot { width:10px; height:10px; border-radius:50%; }
        .dot-r { background:#ff5f56; }
        .dot-y { background:#ffbd2e; }
        .dot-g { background:#27c93f; }
        .cb-lbl { font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:600; color:var(--t2); letter-spacing:0.5px; flex:1; text-align:center; }
        .cb-ok .cb-lbl { color:var(--green); }
        .cb-err .cb-lbl { color:var(--red); }
        .cb-scroll { overflow-x:auto; }
        .cb-scroll::-webkit-scrollbar { height:8px; }
        .cb-scroll::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
        .cb-pre { padding:16px 20px; margin:0; min-width:max-content; }
        .cb-pre code { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--t1); line-height:1.6; display:block; }

        .badge { padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
        .badge-get { background:var(--gdim); color:var(--green); border:1px solid var(--baccent); }

        .root { min-height:100vh; display:flex; flex-direction:column; position:relative; overflow-x:hidden; background-color:var(--bg); color:var(--t1); transition:background-color 0.3s ease; }
        .bg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
        .orb { position:absolute; border-radius:50%; filter:blur(120px); }
        .o1 { width:60vw; height:60vw; max-width:600px; max-height:600px; top:-20%; right:-10%; background:var(--orb1); opacity:0.6; animation:da 20s ease-in-out infinite alternate; }
        .o2 { width:50vw; height:50vw; max-width:500px; max-height:500px; bottom:-10%; left:-10%; background:var(--orb2); opacity:0.5; animation:db 25s ease-in-out infinite alternate; }
        @keyframes da { to { transform:translate(-50px,50px); } }
        @keyframes db { to { transform:translate(50px,-50px); } }
        .grid { position:absolute; inset:0; background-image:radial-gradient(var(--border) 1px,transparent 1px); background-size:32px 32px; opacity:0.5; }

        .nav { position:sticky; top:0; z-index:100; background:var(--nav); backdrop-filter:blur(24px) saturate(180%); border-bottom:1px solid var(--border); transition:all 0.3s ease; }
        .nav-w { max-width:1200px; margin:0 auto; padding:0 24px; height:64px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .logo { display:flex; align-items:center; gap:10px; }
        .logo-txt { font-size:18px; font-weight:500; color:var(--t1); letter-spacing:0; }
        .nav-mid { display:flex; gap:6px; }
        .npill { padding:8px 16px; border-radius:99px; font-size:13px; font-weight:600; color:var(--t2); transition:all 0.2s; }
        .npill:hover { color:var(--t1); background:var(--bg2); }
        .npill.on { color:var(--green); background:var(--gdim); box-shadow:inset 0 0 0 1px var(--baccent); }
        .nav-r { display:flex; align-items:center; gap:10px; }
        .ig { display:flex; align-items:center; gap:8px; padding:8px 16px; border-radius:99px; font-size:13px; font-weight:600; color:var(--t2); border:1px solid var(--border); background:var(--card); transition:all 0.2s cubic-bezier(0.16,1,0.3,1); box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .ig:hover { color:var(--green); border-color:var(--green); background:var(--gdim); transform:translateY(-1px); box-shadow:0 4px 15px rgba(199,166,98,0.15); }
        .ig-txt { display:none; }
        @media(min-width:480px){ .ig-txt { display:inline; } }
        .tbtn { width:40px; height:40px; border-radius:99px; display:flex; align-items:center; justify-content:center; color:var(--t2); border:1px solid var(--border); background:var(--card); transition:all 0.2s cubic-bezier(0.16,1,0.3,1); cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .tbtn:hover { color:var(--t1); border-color:var(--t3); background:var(--bg2); transform:translateY(-1px); }

        .docs-lay { display:flex; max-width:1200px; margin:0 auto; width:100%; position:relative; z-index:1; flex:1; align-items:flex-start; }
        .sidebar { width:260px; flex-shrink:0; padding:32px 24px 32px 0; }
        .sb-sticky { position:sticky; top:96px; max-height:calc(100vh - 120px); overflow-y:auto; padding-right:12px; }
        .sb-sticky::-webkit-scrollbar { width:4px; }
        .sb-sticky::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
        .sb-sec { margin-bottom:32px; }
        .sb-lbl { font-size:11px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:var(--t3); margin-bottom:12px; padding-left:12px; }
        .sb-a { display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; font-size:14px; font-weight:500; color:var(--t2); transition:all 0.2s; margin-bottom:2px; text-decoration:none; }
        .sb-a:hover { color:var(--t1); background:var(--bg2); transform:translateX(4px); }
        .mb { padding:3px 8px; border-radius:5px; font-size:10px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase; flex-shrink:0; }
        .mb.get { background:var(--gdim); color:var(--green); border:1px solid var(--baccent); }

        .dcontent { flex:1; min-width:0; padding:48px 32px 80px 48px; border-left:1px solid var(--border); background:linear-gradient(to right, var(--bg) 0%, transparent 100%); }
        .ds { margin-bottom:16px; scroll-margin-top:100px; }
        .dtag { display:inline-block; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:var(--green); background:var(--gdim); box-shadow:inset 0 0 0 1px var(--baccent); padding:6px 16px; border-radius:99px; margin-bottom:20px; }
        .dh1 { font-size:clamp(32px, 5vw, 48px); font-weight:400; color:var(--t1); letter-spacing:-0.01em; line-height:1.08; margin-bottom:16px; margin-top:0; }
        .dh2 { font-size:24px; font-weight:400; color:var(--t1); letter-spacing:0; margin-bottom:16px; margin-top:0; }
        .dh2.nm { margin-bottom:0; }
        .dh3 { font-size:12px; font-weight:700; color:var(--t3); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; margin-top:32px; border-bottom:1px solid var(--border); padding-bottom:8px; }
        .dlead { font-size:16px; color:var(--t2); line-height:1.8; max-width:640px; margin-bottom:32px; margin-top:0; }
        .dlead a { color:var(--green); font-weight:600; text-decoration:none; }
        .dlead a:hover { text-decoration:underline; }
        
        .dp { font-size:15px; color:var(--t2); line-height:1.7; margin-bottom:20px; margin-top:0; max-width:760px; }
        .inline-code { font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--green); background:var(--gdim); padding:2px 6px; border-radius:6px; border:1px solid var(--baccent); }
        .div { height:1px; background:linear-gradient(90deg, var(--border) 0%, transparent 100%); margin:48px 0; border:none; }

        .burl-container { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px 20px; box-shadow:0 8px 30px rgba(0,0,0,0.04); display:inline-block; }
        .burl { display:flex; flex-direction:column; gap:8px; }
        .burl-lbl { font-size:11px; color:var(--t3); font-weight:700; letter-spacing:1px; text-transform:uppercase; }
        .burl-code { display:flex; align-items:center; gap:16px; }
        .burl-code code { font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:600; color:var(--t1); }

        .icard { display:flex; gap:20px; padding:24px; border-radius:16px; background:linear-gradient(145deg, var(--gdim) 0%, transparent 100%); border:1px solid var(--baccent); box-shadow:0 8px 32px rgba(199,166,98,0.05); }
        .ic-ico { width:44px; height:44px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--green); border-radius:12px; color:#0a0a0b; box-shadow:0 4px 15px rgba(199,166,98,0.3); }
        .ic-text { flex:1; }
        .ic-t { font-size:16px; font-weight:700; color:var(--t1); margin-bottom:6px; margin-top:0; }
        .ic-d { font-size:14px; color:var(--t2); line-height:1.6; margin:0; }

        .lim-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-top:20px; }
        .lim-card { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:12px; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); box-shadow:0 4px 20px rgba(0,0,0,0.03); }
        .lim-card:hover { transform:translateY(-4px); border-color:var(--baccent); box-shadow:0 12px 30px rgba(199,166,98,0.08); }
        .lim-top { display:flex; align-items:baseline; gap:6px; }
        .lim-n { font-size:42px; font-weight:800; color:var(--t1); line-height:1; letter-spacing:-1px; }
        .lim-card:hover .lim-n { color:var(--green); }
        .lim-u { font-size:13px; font-weight:600; color:var(--t3); text-transform:uppercase; letter-spacing:0.5px; }
        .lim-r { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; color:var(--green); background:var(--gdim); padding:6px 12px; border-radius:8px; align-self:flex-start; }

        .ep-h { display:flex; align-items:center; gap:14px; margin-bottom:12px; }

        .tbl-wrap { overflow-x:auto; border-radius:12px; border:1px solid var(--border); margin-bottom:24px; background:var(--card); box-shadow:0 4px 20px rgba(0,0,0,0.02); }
        .tbl { width:100%; border-collapse:collapse; font-size:14px; text-align:left; }
        .tbl th { padding:14px 20px; background:var(--bg2); border-bottom:1px solid var(--border); color:var(--t3); font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; white-space:nowrap; }
        .tbl td { padding:16px 20px; border-bottom:1px solid var(--border); vertical-align:middle; }
        .tbl tr:last-child td { border-bottom:none; }
        .tbl tr:hover td { background:var(--bg2); }
        
        .pc { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:600; color:var(--t1); background:var(--bg3); padding:4px 8px; border-radius:6px; border:1px solid var(--border); }
        .ec { font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--red); background:rgba(255,68,102,0.1); padding:4px 10px; border-radius:6px; border:1px solid rgba(255,68,102,0.2); }
        .ty { font-size:12px; color:var(--t2); background:var(--bg2); padding:4px 10px; border-radius:6px; font-family:'JetBrains Mono',monospace; border:1px solid var(--border); }
        .req { font-size:11px; padding:4px 10px; border-radius:99px; font-weight:700; background:rgba(255,68,102,0.1); color:var(--red); border:1px solid rgba(255,68,102,0.2); display:inline-block; }
        .opt { font-size:11px; padding:4px 10px; border-radius:99px; font-weight:600; background:var(--bg3); color:var(--t3); border:1px solid var(--border); display:inline-block; }
        .td { color:var(--t2); line-height:1.5; }

        .dfooter { display:flex; justify-content:space-between; align-items:center; padding-top:32px; flex-wrap:wrap; gap:16px; border-top:1px solid var(--border); }
        .dfooter p { font-size:14px; font-weight:500; color:var(--t3); margin:0; }
        .dfooter a { color:var(--green); font-weight:600; text-decoration:none; }
        .back { font-size:14px; font-weight:600; color:var(--t2); background:var(--card); border:1px solid var(--border); padding:10px 20px; border-radius:99px; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); text-decoration:none; box-shadow:0 2px 10px rgba(0,0,0,0.05); }
        .back:hover { color:var(--t1); border-color:var(--t3); background:var(--bg2); transform:translateY(-1px); box-shadow:0 4px 15px rgba(0,0,0,0.1); }

        @media(max-width:900px){
          .sidebar { display:none; }
          .dcontent { padding:32px 24px 64px; border-left:none; background:transparent; }
          .nav-mid { display:none; }
          .nav-w { padding:0 20px; }
          .lim-grid { grid-template-columns:1fr 1fr; }
        }
        
        @media(max-width:580px){
          .dcontent { padding:24px 16px 48px; }
          .dh1 { font-size:28px; }
          .dh2 { font-size:22px; }
          .lim-grid { grid-template-columns:1fr; }
          .icard { flex-direction:column; gap:16px; padding:20px; }
          .tbl th, .tbl td { padding:12px 16px; }
        }
      `}</style>
    </>
  )
}