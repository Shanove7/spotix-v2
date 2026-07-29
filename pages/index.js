// credits : kasan
import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from './_app'

const isSpotifyUrl = (s) =>
  /open\.spotify\.com\/(track|playlist|album|artist)\/[A-Za-z0-9]+/.test(s) ||
  /^spotify:(track|playlist|album|artist):[A-Za-z0-9]+$/.test(s)

const fmt = (s) => {
  if (!s || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const fmtMs = (ms) => fmt((ms || 0) / 1000)

function normalizeResponse(data) {
  const { type, via } = data

  if (via === 'track' || type === 'track') {
    const t = data.data
    return {
      mode: 'single',
      track: {
        id: t.id,
        title: t.name,
        artist: (t.artists || []).map(a => a.name).join(', '),
        album: t.album?.name || null,
        release_at: t.album?.release_year ? String(t.album.release_year) : null,
        duration: fmtMs(t.duration_ms),
        duration_ms: t.duration_ms,
        thumbnail: t.album?.images?.[0]?.url || null,
        spotify_url: t.url,
        explicit: t.explicit,
        playcount: t.playcount,
        download_url: null,
      }
    }
  }

  if (via === 'playlist' || type === 'playlist') {
    const pl = data.data
    return {
      mode: 'playlist',
      playlist: {
        id: pl.id,
        name: pl.name,
        description: pl.description,
        followers: pl.followers,
        thumbnail: pl.images?.[0]?.url || null,
        owner: pl.owner?.display_name || pl.owner?.username || null,
        spotify_url: pl.url,
        tracks: (pl.tracks || []).map(t => ({
          id: t.id,
          title: t.name,
          artist: (t.artists || []).map(a => a.name).join(', '),
          album: t.album?.name || null,
          thumbnail: t.album?.images?.[0]?.url || null,
          duration_ms: t.duration_ms,
          duration: fmtMs(t.duration_ms),
          explicit: t.explicit,
          spotify_url: t.url,
          download_url: null,
        }))
      }
    }
  }

  if (type === 'tracks') {
    const arr = Array.isArray(data.data) ? data.data : []
    if (!arr.length) return null
    return {
      mode: 'list',
      tracks: arr.map(t => ({
        id: t.id,
        title: t.name,
        artist: (t.artists || []).map(a => a.name).join(', '),
        album: t.album?.name || null,
        thumbnail: t.album?.images?.find(i => i.width === 300)?.url || t.album?.images?.[0]?.url || null,
        duration_ms: t.duration_ms,
        duration: fmtMs(t.duration_ms),
        explicit: t.explicit,
        spotify_url: t.url,
        download_url: null,
      }))
    }
  }

  if (type === 'search') {
    const raw = data.data

    const mapTrack = t => ({
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map(a => a.name).join(', '),
      album: t.album?.name || null,
      thumbnail: t.album?.images?.[0]?.url || null,
      duration_ms: t.duration_ms,
      duration: fmtMs(t.duration_ms),
      explicit: t.explicit,
      spotify_url: t.url,
      download_url: null,
    })

    let tracks = []
    if (raw.tracks && raw.tracks.length > 0) {
      tracks = raw.tracks.map(mapTrack)
    } else if (raw.top_results && raw.top_results.length > 0) {
      tracks = raw.top_results
        .filter(r => r.type === 'Track')
        .map(r => ({
          id: r.id,
          title: r.name,
          artist: (r.artists || []).map(a => a.name).join(', '),
          album: r.album?.name || null,
          thumbnail: r.images?.[0]?.url || r.album?.images?.[0]?.url || null,
          duration_ms: r.duration_ms || 0,
          duration: fmtMs(r.duration_ms || 0),
          explicit: r.explicit || false,
          spotify_url: r.url,
          download_url: null,
        }))
    }

    if (!tracks.length) return null
    return { mode: 'list', tracks }
  }

  return null
}

async function fetchDownloadUrl(spotifyUrl) {
  const res = await fetch(`/api/download?url=${encodeURIComponent(spotifyUrl)}`)
  const data = await res.json()
  if (!data.status) throw new Error(data.message || 'Download URL not found')
  return data.download_url || null
}

export default function Home() {
  const { theme, toggle } = useTheme()
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const [activeTrack, setActiveTrack] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [vol, setVol] = useState(1)
  const [muted, setMuted] = useState(false)
  const [dlBusy, setDlBusy] = useState({})
  const [dlUrl, setDlUrl] = useState({})

  const audioRef = useRef(null)
  const inputRef = useRef(null)

  const getCurrentTrackList = () => {
    if (!result) return []
    if (result.mode === 'playlist' && result.playlist) {
      return result.playlist.tracks
    }
    if (result.mode === 'list' && result.tracks) {
      return result.tracks
    }
    if (result.mode === 'single' && result.track) {
      return [result.track]
    }
    return []
  }

  const handleNextTrack = () => {
    const list = getCurrentTrackList()
    if (!list.length || !activeTrack) return
    const idx = list.findIndex(t => t.id === activeTrack.id)
    if (idx !== -1 && idx < list.length - 1) {
      playTrack(list[idx + 1])
    }
  }

  const handlePrevTrack = () => {
    const list = getCurrentTrackList()
    if (!list.length || !activeTrack) return
    const idx = list.findIndex(t => t.id === activeTrack.id)
    if (idx > 0) {
      playTrack(list[idx - 1])
    }
  }

  const doSearch = async () => {
    const query = q.trim()
    if (!query || loading) return
    setLoading(true)
    setErr('')
    setResult(null)
    setActiveTrack(null)
    setPlaying(false)
    setProgress(0)
    setCur(0)
    setDur(0)
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.src = '' }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=15&type=tracks`)
      const data = await res.json()
      if (!data.status) throw new Error(data.message || 'Not found')
      const normalized = normalizeResponse(data)
      if (!normalized) throw new Error('No results found')
      setResult(normalized)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const getDownloadUrl = async (track) => {
    if (dlUrl[track.id]) return dlUrl[track.id]
    if (!track.spotify_url) throw new Error('No Spotify URL')
    const url = await fetchDownloadUrl(track.spotify_url)
    if (!url) throw new Error('Download URL not available')
    setDlUrl(prev => ({ ...prev, [track.id]: url }))
    return url
  }

  const streamUrl = (rawUrl, title) => {
    if (!rawUrl) return ''
    try {
      const u = new URL(rawUrl)
      const token = u.searchParams.get('token')
      if (!token) return rawUrl
      const fn = (title || 'audio').replace(/[^a-zA-Z0-9 \-]/g, '').trim()
      return `/api/stream?token=${encodeURIComponent(token)}&filename=${encodeURIComponent(fn)}`
    } catch { return rawUrl }
  }

  const playTrack = async (track) => {
    const audio = audioRef.current
    if (!audio || !track.spotify_url) return

    if (activeTrack?.id === track.id && audio.src) {
      playing ? audio.pause() : audio.play().catch(() => {})
      return
    }

    setActiveTrack(track)
    setPlaying(false)
    setAudioLoading(true)
    setErr('')
    setProgress(0)
    setCur(0)
    setDur(0)
    audio.pause()
    audio.src = ''

    try {
      const url = await getDownloadUrl(track)
      audio.src = streamUrl(url, track.title)
      audio.volume = vol
      audio.play().catch(() => setAudioLoading(false))
    } catch (e) {
      setAudioLoading(false)
      setActiveTrack(null)
      setErr('Gagal load track: ' + e.message)
    }
  }

  const doDownload = async (track) => {
    if (dlBusy[track.id] || !track.spotify_url) return
    setDlBusy(prev => ({ ...prev, [track.id]: 'fetching' }))
    setErr('')
    try {
      const url = await getDownloadUrl(track)
      setDlBusy(prev => ({ ...prev, [track.id]: 'downloading' }))
      const sUrl = streamUrl(url, track.title)
      const a = document.createElement('a')
      a.href = sUrl
      a.download = (track.title || 'audio').replace(/[^a-zA-Z0-9 \-]/g, '').trim() + '.mp3'
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setDlBusy(prev => ({ ...prev, [track.id]: 'success' }))
    } catch (e) {
      setErr('Download gagal: ' + e.message)
      setDlBusy(prev => ({ ...prev, [track.id]: 'error' }))
    } finally {
      setTimeout(() => {
        setDlBusy(prev => {
          const updated = { ...prev }
          delete updated[track.id]
          return updated
        })
      }, 3000)
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !dur) return
    const r = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    audio.currentTime = ratio * dur
  }

  const handleVol = (e) => {
    const v = parseFloat(e.target.value)
    setVol(v)
    setMuted(v === 0)
    if (audioRef.current) {
      audioRef.current.volume = v
      audioRef.current.muted = v === 0
    }
  }

  const toggleMute = () => {
    const n = !muted
    setMuted(n)
    if (audioRef.current) {
      audioRef.current.muted = n
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onPlay = () => { setPlaying(true); setAudioLoading(false) }
    const onPause = () => setPlaying(false)
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
      setCur(0)
      const list = getCurrentTrackList()
      const idx = list.findIndex(t => t.id === activeTrack?.id)
      if (idx !== -1 && idx < list.length - 1) {
        playTrack(list[idx + 1])
      }
    }
    const onWait = () => setAudioLoading(true)
    const onCan = () => setAudioLoading(false)
    const onTime = () => {
      const d = audio.duration || 0, c = audio.currentTime || 0
      setCur(c)
      setDur(d)
      setProgress(d > 0 ? (c / d) * 100 : 0)
    }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('waiting', onWait)
    audio.addEventListener('canplay', onCan)
    audio.addEventListener('timeupdate', onTime)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('waiting', onWait)
      audio.removeEventListener('canplay', onCan)
      audio.removeEventListener('timeupdate', onTime)
    }
  }, [activeTrack, result])

  const features = [
    { t: 'Instant', d: 'Results in seconds', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
    { t: 'High Quality', d: 'Up to 320kbps MP3', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
    { t: 'Play First', d: 'Stream before download', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> },
    { t: 'Link Support', d: 'Paste Spotify URLs', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { t: 'Free', d: 'No account needed', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { t: 'Private', d: 'Fully proxied', ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ]

  const getDownloadText = (status) => {
    if (status === 'fetching') return 'Preparing...'
    if (status === 'downloading') return 'Downloading...'
    if (status === 'success') return 'Ready!'
    if (status === 'error') return 'Failed!'
    return 'Download'
  }

  const renderPlayer = (track, idx) => {
    const isActive = activeTrack?.id === track.id
    const isFetching = isActive && audioLoading
    const dlStatus = dlBusy[track.id]

    return (
      <div className={`trow ${isActive ? 'trow-active' : ''}`} key={track.id}>
        {typeof idx === 'number' && <span className="trow-idx">{String(idx + 1).padStart(2, '0')}</span>}
        <div className="trow-thumb" onClick={() => playTrack(track)}>
          {track.thumbnail
            ? <img src={track.thumbnail} alt={track.title} className="thumb-img" />
            : <div className="thumb-fallback">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
          }
          <div className="thumb-play-overlay">
            {isFetching
              ? <span className="spin sm" />
              : isActive && playing
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
          </div>
        </div>

        <div className="trow-info" onClick={() => playTrack(track)}>
          <div className="trow-title" title={track.title}>
            {track.explicit && <span className="ex-badge">E</span>}
            <span className="trow-text-title">{track.title}</span>
          </div>
          <div className="trow-sub">
            <span className="trow-artist">{track.artist}</span>
            {track.album && <><span className="trow-dot">·</span><span className="trow-album">{track.album}</span></>}
          </div>
        </div>

        <div className="trow-dur">{track.duration}</div>

        <div className="trow-acts">
          <button className={`trow-btn play-ic ${isActive && playing ? 'is-playing' : ''}`} onClick={() => playTrack(track)} title={isActive && playing ? 'Pause' : 'Play'}>
            {isFetching
              ? <span className="spin sm" />
              : isActive && playing
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
          </button>
          <button
            className={`trow-btn-dl ${dlStatus ? `busy ${dlStatus}` : ''}`}
            onClick={() => doDownload(track)}
            title="Download MP3"
            disabled={!!dlStatus}
          >
            {dlStatus ? (
              <>
                <span className="spin sm" />
                <span className="dl-status-text">{getDownloadText(dlStatus)}</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span className="dl-status-text">Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  const listForNav = getCurrentTrackList()
  const currentIdx = activeTrack ? listForNav.findIndex(t => t.id === activeTrack.id) : -1
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx !== -1 && currentIdx < listForNav.length - 1

  return (
    <>
      <Head>
        <title>Spotix — Download Lagu Spotify MP3 Gratis</title>
        <meta name="description" content="Download lagu Spotify jadi MP3 gratis. Ketik nama lagu atau paste link Spotify — langsung download. Cepat, mudah, tanpa daftar akun." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta name="keywords" content="download spotify mp3, spotify downloader, unduh lagu spotify, spotify ke mp3, download musik gratis, spotix, kasanvx" />
        <meta name="author" content="kasanvx" />
        <link rel="canonical" href="https://spotify.khasan.site/" />
        <meta property="og:title" content="Spotix — Download Lagu Spotify MP3 Gratis" />
        <meta property="og:description" content="Download lagu Spotify jadi MP3 gratis. Ketik nama lagu atau paste link Spotify — langsung download." />
        <meta property="og:url" content="https://spotify.khasan.site/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Spotix — Download Lagu Spotify MP3 Gratis" />
        <meta name="twitter:description" content="Download lagu Spotify jadi MP3 gratis. Ketik nama lagu atau paste link Spotify — langsung download." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Spotix",
          "url": "https://spotify.khasan.site",
          "description": "Download lagu Spotify jadi MP3 gratis.",
          "applicationCategory": "MusicApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" },
          "author": { "@type": "Person", "name": "kasanvx", "url": "https://instagram.com/kasanvx" }
        })}} />
      </Head>

      <audio ref={audioRef} preload="none" />

      <div className="root">
        <div className="bg">
          <div className="orb o1" /><div className="orb o2" /><div className="grid" />
        </div>

        <nav className="nav">
          <div className="nav-w">
            <Link href="/" className="logo">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="var(--green)" strokeWidth="1.5"/>
                <path d="M9 12.5c4-1.5 9-1 12 2" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 16c3.5-1.2 8-.8 11 1.5" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M11 19.5c3-1 6.5-.7 9 1.2" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="logo-txt">Spotix</span>
            </Link>
            <div className="nav-mid">
              <Link href="/" className="npill on">Home</Link>
              <Link href="/docs" className="npill">API Docs</Link>
            </div>
            <div className="nav-r">
              <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer" className="ig">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
                <span className="ig-txt">kasanvx</span>
              </a>
              <button className="tbtn" onClick={toggle} title="Toggle theme">
                {theme === 'dark'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                }
              </button>
            </div>
          </div>
        </nav>

        <main className={`main ${activeTrack ? 'has-player' : ''}`}>
          <div className="hero">
            <div className="badge">
              <span className="dot" />
              Free &middot; No Signup &middot; Instant
            </div>
            <h1 className="h1">
              Download<br/>
              <span className="h1-g">Spotify</span> Tracks<br/>
              as <em>MP3</em>
            </h1>
            <p className="sub">Search by song name, artist, or paste a Spotify link — stream before you download.</p>
          </div>

          <div className="sbox-wrap">
            <div className={`sbox ${loading ? 'sbox-busy' : ''}`}>
              <div className="sbox-icon">
                {loading
                  ? <span className="spin" />
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                }
              </div>
              <input
                ref={inputRef}
                className="sinput"
                type="text"
                placeholder="Song name, artist, or Spotify URL..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <button className="sbtn" onClick={doSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {q.length > 10 && isSpotifyUrl(q) && (
              <div className="url-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Spotify link detected
              </div>
            )}

            {err && (
              <div className="errtip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {err}
              </div>
            )}
          </div>

          {loading && (
            <div className="results-box">
              {[...Array(5)].map((_, i) => (
                <div className="skel-row" key={i}>
                  <div className="skel-thumb" />
                  <div className="skel-lines">
                    <div className="skel-line" style={{ width: `${55 + Math.random() * 30}%` }} />
                    <div className="skel-line" style={{ width: `${30 + Math.random() * 20}%`, height: '11px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && result && (
            <div className="results-box">
              {result.mode === 'playlist' && result.playlist && (
                <div className="pl-header">
                  {result.playlist.thumbnail && (
                    <img src={result.playlist.thumbnail} alt={result.playlist.name} className="pl-thumb" />
                  )}
                  <div className="pl-meta">
                    <span className="pl-tag">Playlist</span>
                    <div className="pl-name">{result.playlist.name}</div>
                    {result.playlist.owner && <div className="pl-owner">by {result.playlist.owner}</div>}
                    {result.playlist.followers > 0 && (
                      <div className="pl-follow">{result.playlist.followers.toLocaleString()} followers</div>
                    )}
                    {result.playlist.description && (
                      <div className="pl-desc">{result.playlist.description}</div>
                    )}
                  </div>
                </div>
              )}

              {(result.mode === 'list' || result.mode === 'playlist') && (
                <>
                  <div className="results-header">
                    <span className="results-count">
                      {result.mode === 'playlist'
                        ? `${result.playlist.tracks.length} tracks`
                        : `${result.tracks.length} results`
                      }
                    </span>
                    {activeTrack && (
                      <div className="now-playing">
                        <span className="eq-sm"><span/><span/><span/></span>
                        {activeTrack.title}
                      </div>
                    )}
                  </div>
                  <div className="track-list">
                    {(result.mode === 'playlist' ? result.playlist.tracks : result.tracks).map((t, i) => renderPlayer(t, i))}
                  </div>
                </>
              )}

              {result.mode === 'single' && result.track && (
                <div className="single-wrap">
                  {renderPlayer(result.track)}
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="feats">
              {features.map((f, i) => (
                <div className="feat" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="feat-ic">{f.ic}</span>
                  <span className="feat-t">{f.t}</span>
                  <span className="feat-d">{f.d}</span>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className={`foot ${activeTrack ? 'has-player' : ''}`}>
          <div className="foot-w">
            <span className="foot-l">
              Made with <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--green)" stroke="var(--green)" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> by <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer">@kasanvx</a>
            </span>
            <div className="foot-r">
              <Link href="/docs" className="f-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                API Docs
              </Link>
              <a href="https://instagram.com/kasanvx" target="_blank" rel="noopener noreferrer" className="f-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </footer>

        {activeTrack && (
          <div className="sticky-player">
            <div className="player-seek-bar" onClick={handleSeek}>
              <div className="player-seek-fill" style={{ width: `${progress}%` }}>
                <div className="player-seek-handle" />
              </div>
            </div>
            <div className="player-container">
              <div className="player-left">
                {activeTrack.thumbnail ? (
                  <img src={activeTrack.thumbnail} alt={activeTrack.title} className="player-thumb" />
                ) : (
                  <div className="player-thumb-fallback">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                )}
                <div className="player-meta">
                  <div className="player-title" title={activeTrack.title}>
                    {activeTrack.title}
                  </div>
                  <div className="player-artist">
                    {activeTrack.artist}
                  </div>
                </div>
                {playing && (
                  <div className="player-eq">
                    <span className="eq-bar bar1" />
                    <span className="eq-bar bar2" />
                    <span className="eq-bar bar3" />
                    <span className="eq-bar bar4" />
                  </div>
                )}
              </div>

              <div className="player-center">
                <div className="player-controls">
                  <button className="control-btn" onClick={handlePrevTrack} disabled={!hasPrev} title="Previous">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><rect x="5" y="4" width="2" height="16"/></svg>
                  </button>
                  <button className="control-btn play-main" onClick={() => playTrack(activeTrack)} title={playing ? 'Pause' : 'Play'}>
                    {audioLoading ? (
                      <span className="spin" />
                    ) : playing ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                  </button>
                  <button className="control-btn" onClick={handleNextTrack} disabled={!hasNext} title="Next">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><rect x="17" y="4" width="2" height="16"/></svg>
                  </button>
                </div>
                <div className="player-timer">
                  <span>{fmt(cur)}</span>
                  <span className="timer-divider">/</span>
                  <span>{dur ? fmt(dur) : activeTrack.duration}</span>
                </div>
              </div>

              <div className="player-right">
                <div className="player-volume">
                  <button className="vol-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
                    {muted || vol === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    )}
                  </button>
                  <input
                    className="player-volume-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : vol}
                    onChange={handleVol}
                    style={{ '--pct': `${(muted ? 0 : vol) * 100}%` }}
                  />
                </div>
                <button
                  className={`player-dl-action ${dlBusy[activeTrack.id] ? `busy ${dlBusy[activeTrack.id]}` : ''}`}
                  onClick={() => doDownload(activeTrack)}
                  disabled={!!dlBusy[activeTrack.id]}
                >
                  {dlBusy[activeTrack.id] ? (
                    <>
                      <span className="spin" />
                      <span>{getDownloadText(dlBusy[activeTrack.id])}</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Get MP3</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .root { min-height:100vh; display:flex; flex-direction:column; position:relative; overflow-x:hidden; }
        .bg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
        .orb { position:absolute; border-radius:50%; filter:blur(100px); }
        .o1 { width:500px; height:500px; top:-150px; left:-100px; background:var(--orb1); animation:da 14s ease-in-out infinite alternate; }
        .o2 { width:400px; height:400px; bottom:-100px; right:-80px; background:var(--orb2); animation:db 18s ease-in-out infinite alternate; }
        @keyframes da { to { transform:translate(40px,30px); } }
        @keyframes db { to { transform:translate(-30px,-20px); } }
        .grid { position:absolute; inset:0; background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:48px 48px; }

        .nav { position:sticky; top:0; z-index:100; background:var(--nav); backdrop-filter:blur(20px) saturate(160%); border-bottom:1px solid var(--border); }
        .nav-w { max-width:900px; margin:0 auto; padding:0 20px; height:58px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .logo { display:flex; align-items:center; gap:9px; flex-shrink:0; }
        .logo-txt { font-size:19px; font-weight:500; color:var(--t1); letter-spacing:0; }
        .nav-mid { display:flex; gap:4px; }
        .npill { padding:6px 15px; border-radius:99px; font-size:13px; font-weight:500; color:var(--t2); transition:all .2s; }
        .npill:hover { color:var(--t1); background:rgba(255,255,255,0.06); }
        .npill.on { color:var(--green); background:var(--gdim); }
        [data-theme="light"] .npill:hover { background:rgba(0,0,0,0.05); }
        .nav-r { display:flex; align-items:center; gap:8px; }
        .ig { display:flex; align-items:center; gap:7px; padding:6px 13px; border-radius:99px; font-size:13px; font-weight:500; color:var(--t2); border:1px solid var(--border); background:var(--inp); transition:all .2s; }
        .ig:hover { color:var(--green); border-color:var(--baccent); background:var(--gdim); }
        .ig-txt { display:none; }
        @media(min-width:480px){ .ig-txt { display:inline; } }
        .tbtn { width:36px; height:36px; border-radius:99px; display:flex; align-items:center; justify-content:center; color:var(--t2); border:1px solid var(--border); background:var(--inp); transition:all .2s; flex-shrink:0; cursor:pointer; }
        .tbtn:hover { color:var(--t1); border-color:var(--baccent); background:var(--gdim); }

        .main { position:relative; z-index:1; flex:1; max-width:720px; width:100%; margin:0 auto; padding:52px 20px 48px; transition:padding-bottom 0.3s ease; }
        .main.has-player { padding-bottom:140px; }
        .hero { text-align:center; margin-bottom:40px; }
        .badge { display:inline-flex; align-items:center; gap:8px; font-size:11px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:var(--green); background:var(--gdim); border:1px solid var(--baccent); padding:5px 16px; border-radius:99px; margin-bottom:24px; }
        .dot { width:6px; height:6px; border-radius:50%; background:var(--green); animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .h1 { font-size:clamp(36px,9vw,72px); font-weight:400; line-height:1.02; letter-spacing:-0.01em; color:var(--t1); margin-bottom:16px; margin-top:0; }
        .h1-g { color:var(--green); }
        .h1 em { font-style:italic; color:var(--green); }
        .sub { font-size:15px; color:var(--t2); max-width:420px; margin:0 auto; line-height:1.7; }

        .sbox-wrap { margin-bottom:28px; }
        .sbox { display:flex; align-items:center; gap:10px; background:var(--card); border:1.5px solid var(--border); border-radius:16px; padding:7px 7px 7px 16px; box-shadow:var(--sh2); transition:border-color .2s,box-shadow .2s; }
        .sbox:focus-within { border-color:var(--baccent); box-shadow:0 0 0 4px var(--gglow),var(--sh2); }
        .sbox-icon { color:var(--t3); flex-shrink:0; display:flex; align-items:center; width:20px; }
        .sinput { flex:1; background:none; border:none; outline:none; font-size:15px; color:var(--t1); min-width:0; padding:8px 0; }
        .sinput::placeholder { color:var(--t3); }
        .sbtn { flex-shrink:0; background:var(--green); color:#0a0a0b; border:none; cursor:pointer; border-radius:11px; padding:10px 22px; font-size:14px; font-weight:600; transition:all .2s; white-space:nowrap; }
        .sbtn:hover:not(:disabled) { background:var(--green2); transform:translateY(-1px); }
        .sbtn:disabled { opacity:.7; cursor:not-allowed; }
        .url-hint { display:flex; align-items:center; gap:7px; margin-top:10px; padding:9px 14px; border-radius:10px; background:var(--gdim); border:1px solid var(--baccent); color:var(--green); font-size:13px; font-weight:500; }
        .errtip { display:flex; align-items:center; gap:8px; margin-top:10px; padding:11px 14px; border-radius:10px; background:rgba(255,68,102,.10); border:1px solid rgba(255,68,102,.25); color:var(--red); font-size:13px; }
        .spin { display:inline-block; width:16px; height:16px; border-radius:50%; border:2.5px solid var(--border); border-top-color:currentColor; animation:sp .65s linear infinite; flex-shrink:0; }
        .spin.sm { width:13px; height:13px; border-width:2px; border-top-color:currentColor; border-color:rgba(199,166,98,.2); }
        @keyframes sp { to { transform:rotate(360deg); } }

        .results-box { background:var(--card); border:1.5px solid var(--border); border-radius:20px; overflow:hidden; animation:fu .35s cubic-bezier(.16,1,.3,1); }
        @keyframes fu { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .results-header { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 10px; border-bottom:1px solid var(--border); }
        .results-count { font-size:12px; font-weight:600; color:var(--t3); letter-spacing:.5px; text-transform:uppercase; }
        .now-playing { display:flex; align-items:center; gap:7px; font-size:12px; color:var(--green); font-weight:600; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .eq-sm { display:flex; align-items:flex-end; gap:2px; height:12px; flex-shrink:0; }
        .eq-sm span { width:2px; background:var(--green); border-radius:2px; animation:eq .7s ease-in-out infinite alternate; }
        .eq-sm span:nth-child(1){height:5px;animation-delay:0s}
        .eq-sm span:nth-child(2){height:10px;animation-delay:.15s}
        .eq-sm span:nth-child(3){height:7px;animation-delay:.3s}
        @keyframes eq { to { height:12px; } }

        .track-list { display:flex; flex-direction:column; }
        .trow { display:flex; align-items:center; gap:12px; padding:10px 14px; border-bottom:1px solid var(--border); transition:background .15s; position:relative; }
        .trow-idx { flex-shrink:0; width:20px; text-align:right; font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--t3); font-variant-numeric:tabular-nums; }
        .trow:last-child { border-bottom:none; }
        .trow:hover { background:var(--bg2); }
        .trow-active { background:var(--gdim) !important; }

        .trow-thumb { width:44px; height:44px; border-radius:8px; flex-shrink:0; position:relative; cursor:pointer; overflow:hidden; }
        .thumb-img { width:100%; height:100%; object-fit:cover; display:block; }
        .thumb-fallback { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--bg3); color:var(--t3); }
        .thumb-play-overlay { position:absolute; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; color:#fff; opacity:0; transition:opacity .15s; border-radius:8px; }
        .trow-thumb:hover .thumb-play-overlay { opacity:1; }
        .trow-active .thumb-play-overlay { opacity:1; background:rgba(0,0,0,.3); }

        .trow-info { flex:1; min-width:0; cursor:pointer; }
        .trow-title { font-size:14px; font-weight:600; color:var(--t1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:flex; align-items:center; gap:6px; margin-bottom:2px; }
        .trow-text-title { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .trow-artist { font-size:12px; color:var(--t2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .trow-sub { display:flex; align-items:center; gap:5px; overflow:hidden; }
        .trow-dot { font-size:11px; color:var(--t3); flex-shrink:0; }
        .trow-album { font-size:11px; color:var(--t3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ex-badge { font-size:9px; font-weight:700; padding:1px 4px; border-radius:3px; background:var(--t3); color:var(--bg); flex-shrink:0; }

        .trow-dur { font-size:12px; color:var(--t3); font-family:monospace; flex-shrink:0; min-width:36px; text-align:right; margin-right:4px; }

        .trow-acts { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .trow-btn { width:32px; height:32px; border:none; cursor:pointer; background:transparent; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:all .15s; color:var(--t2); }
        .trow-btn:hover { background:var(--bg3); color:var(--t1); }
        .trow-btn.play-ic { color:var(--green); }
        .trow-btn.play-ic:hover { background:var(--gdim); }

        .trow-btn-dl { display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:8px; background:var(--inp); border:1px solid var(--border); font-size:12px; font-weight:600; color:var(--t2); transition:all .2s ease; cursor:pointer; height:32px; }
        .trow-btn-dl:hover { color:var(--green); border-color:var(--baccent); background:var(--gdim); }
        .trow-btn-dl.busy { opacity:0.8; pointer-events:none; }
        .trow-btn-dl.fetching { color:var(--green); border-color:var(--green); background:var(--gdim); }
        .trow-btn-dl.downloading { color:#0a0a0b; background:var(--green); border-color:var(--green); }
        .trow-btn-dl.success { color:#fff; background:#22c55e; border-color:#22c55e; }
        .trow-btn-dl.error { color:#fff; background:var(--red); border-color:var(--red); }

        .pl-header { display:flex; gap:18px; padding:20px 18px; border-bottom:1px solid var(--border); align-items:flex-start; }
        .pl-thumb { width:80px; height:80px; border-radius:10px; object-fit:cover; flex-shrink:0; }
        .pl-meta { flex:1; min-width:0; }
        .pl-tag { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--green); background:var(--gdim); border:1px solid var(--baccent); padding:2px 8px; border-radius:99px; display:inline-block; margin-bottom:8px; }
        .pl-name { font-size:18px; font-weight:800; color:var(--t1); letter-spacing:-.4px; margin-bottom:4px; }
        .pl-owner { font-size:13px; color:var(--t2); margin-bottom:2px; }
        .pl-follow { font-size:12px; color:var(--t3); margin-bottom:6px; }
        .pl-desc { font-size:12px; color:var(--t3); line-height:1.5; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }

        .single-wrap { padding:4px; }

        .skel-row { display:flex; gap:12px; padding:10px 14px; border-bottom:1px solid var(--border); align-items:center; }
        .skel-row:last-child { border-bottom:none; }
        .skel-thumb { width:44px; height:44px; border-radius:8px; background:var(--skel); flex-shrink:0; animation:sk 1.5s ease-in-out infinite; }
        .skel-lines { flex:1; display:flex; flex-direction:column; gap:8px; }
        .skel-line { background:var(--skel); border-radius:5px; height:14px; animation:sk 1.5s ease-in-out infinite; }
        @keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.9} }

        .feats { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:44px; }
        .feat { background:var(--card); border:1px solid var(--border); border-radius:16px; padding:20px 16px; display:flex; flex-direction:column; gap:6px; backdrop-filter:blur(12px); transition:all .3s; animation:fu .5s ease-out backwards; }
        .feat:hover { border-color:var(--baccent); transform:translateY(-4px); box-shadow:0 8px 24px var(--gglow); }
        .feat-ic { width:24px; height:24px; color:var(--green); margin-bottom:6px; transition:transform .3s; }
        .feat:hover .feat-ic { transform:scale(1.1) rotate(-5deg); }
        .feat-t { font-size:14px; font-weight:700; color:var(--t1); }
        .feat-d { font-size:12px; color:var(--t2); line-height:1.4; }

        .foot { position:relative; z-index:1; border-top:1px solid var(--border); background:var(--bg2); padding:24px 20px; margin-top:auto; transition:padding-bottom 0.3s ease; }
        .foot.has-player { padding-bottom:140px; }
        .foot-w { max-width:900px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .foot-l { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--t3); font-weight:500; }
        .foot-l a { color:var(--t1); font-weight:600; transition:color .2s; }
        .foot-l a:hover { color:var(--green); }
        .foot-r { display:flex; gap:12px; flex-wrap:wrap; }
        .f-btn { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--t2); font-weight:600; padding:8px 16px; border-radius:10px; background:var(--card); border:1px solid var(--border); transition:all .2s; }
        .f-btn:hover { color:var(--green); border-color:var(--baccent); background:var(--gdim); transform:translateY(-2px); box-shadow:0 4px 12px var(--gglow); }

        .sticky-player { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); width:calc(100% - 40px); max-width:860px; background:rgba(18,18,18,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:16px; backdrop-filter:blur(24px) saturate(180%); box-shadow:0 12px 40px rgba(0,0,0,0.6); z-index:1000; overflow:hidden; animation:slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        [data-theme="light"] .sticky-player { background:rgba(255,255,255,0.8); border:1px solid rgba(0,0,0,0.08); box-shadow:0 12px 40px rgba(0,0,0,0.15); }
        @keyframes slideUp { from { transform:translate(-50%, 100%); opacity:0; } to { transform:translate(-50%, 0); opacity:1; } }

        .player-seek-bar { height:4px; width:100%; background:rgba(255,255,255,0.1); cursor:pointer; position:relative; }
        [data-theme="light"] .player-seek-bar { background:rgba(0,0,0,0.06); }
        .player-seek-fill { height:100%; background:var(--green); position:relative; transition:width 0.1s linear; }
        .player-seek-handle { position:absolute; right:-6px; top:50%; transform:translateY(-50%); width:12px; height:12px; background:#fff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.4); opacity:0; transition:opacity 0.15s; }
        .player-seek-bar:hover .player-seek-handle { opacity:1; }
        .player-seek-bar:hover { height:6px; }

        .player-container { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; gap:20px; }

        .player-left { display:flex; align-items:center; gap:12px; width:30%; min-width:180px; }
        .player-thumb { width:48px; height:48px; border-radius:8px; object-fit:cover; flex-shrink:0; }
        .player-thumb-fallback { width:48px; height:48px; border-radius:8px; background:var(--bg3); color:var(--t3); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .player-meta { min-width:0; }
        .player-title { font-size:14px; font-weight:700; color:var(--t1); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
        .player-artist { font-size:12px; color:var(--t2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .player-eq { display:flex; align-items:flex-end; gap:2px; height:14px; margin-left:8px; flex-shrink:0; }
        .eq-bar { width:2px; background:var(--green); border-radius:1px; }
        .bar1 { height:60%; animation:eqAnim 0.6s ease-in-out infinite alternate; }
        .bar2 { height:100%; animation:eqAnim 0.8s ease-in-out infinite alternate 0.15s; }
        .bar3 { height:40%; animation:eqAnim 0.5s ease-in-out infinite alternate 0.3s; }
        .bar4 { height:80%; animation:eqAnim 0.7s ease-in-out infinite alternate 0.05s; }
        @keyframes eqAnim { 0% { height:20%; } 100% { height:100%; } }

        .player-center { display:flex; flex-direction:column; align-items:center; gap:6px; width:40%; }
        .player-controls { display:flex; align-items:center; gap:16px; }
        .control-btn { background:none; border:none; color:var(--t2); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:8px; border-radius:50%; transition:all 0.15s; }
        .control-btn:hover:not(:disabled) { color:var(--t1); background:rgba(255,255,255,0.06); }
        [data-theme="light"] .control-btn:hover:not(:disabled) { background:rgba(0,0,0,0.05); }
        .control-btn:disabled { opacity:0.3; cursor:not-allowed; }
        .control-btn.play-main { background:var(--green); color:#0a0a0b; padding:10px; }
        .control-btn.play-main:hover { background:var(--green2); transform:scale(1.05); }

        .player-timer { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--t3); font-family:monospace; }
        .timer-divider { opacity:0.5; }

        .player-right { display:flex; align-items:center; justify-content:flex-end; gap:16px; width:30%; }
        .player-volume { display:flex; align-items:center; gap:8px; }
        .vol-btn { background:none; border:none; color:var(--t3); cursor:pointer; padding:6px; transition:color 0.15s; }
        .vol-btn:hover { color:var(--t1); }
        .player-volume-slider { width:80px; height:3px; border-radius:99px; appearance:none; outline:none; cursor:pointer; background:linear-gradient(to right, var(--green) var(--pct, 100%), var(--border) var(--pct, 100%)); }
        .player-volume-slider::-webkit-slider-thumb { appearance:none; width:10px; height:10px; border-radius:50%; background:#fff; box-shadow:0 0 4px rgba(0,0,0,0.3); cursor:pointer; }

        .player-dl-action { display:flex; align-items:center; gap:8px; padding:8px 16px; border-radius:12px; background:var(--green); color:#0a0a0b; font-size:13px; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px var(--gglow); }
        .player-dl-action:hover:not(:disabled) { background:var(--green2); transform:translateY(-1px); }
        .player-dl-action.busy { pointer-events:none; }
        .player-dl-action.fetching { background:rgba(199,166,98,0.2); color:var(--green); border:1px solid var(--green); }
        .player-dl-action.downloading { background:#fff; color:#121212; }
        .player-dl-action.success { background:#22c55e; }
        .player-dl-action.error { background:var(--red); }

        @media(max-width:580px){
          .main { padding:36px 16px 40px; }
          .main.has-player { padding-bottom:180px; }
          .nav-mid { display:none; }
          .feats { grid-template-columns:repeat(2,1fr); }
          .h1 { letter-spacing:0; }
          .sbtn { padding:10px 16px; font-size:13px; }
          .trow-dur { display:none; }
          
          .sticky-player { bottom:12px; width:calc(100% - 24px); }
          .player-container { padding:10px; gap:8px; flex-wrap:wrap; }
          .player-left { width:100%; min-width:0; }
          .player-center { width:calc(100% - 130px); flex-direction:row; justify-content:space-between; gap:10px; }
          .player-controls { gap:8px; }
          .player-right { width:120px; justify-content:flex-end; gap:4px; }
          .player-volume { display:none; }
          .player-timer { font-size:10px; }
          .player-dl-action { padding:6px 10px; font-size:11px; border-radius:8px; }
          .dl-status-text { display:none; }
        }

        @media(max-width:360px){
          .feats { grid-template-columns:1fr; }
        }
      `}</style>
    </>
  )
}