// ────────── code made by kasan | WM GROUP : https://chat.whatsapp.com/LknsianRgX9KVNtyTChwZc?mode=gi_t ──────────
import { rateLimit } from '../../lib/rateLimit'
import { guardRequest, getClientIP } from '../../lib/guard'
import spotify from '../../lib/spotify'

// Detect URL type and extract ID
function detectInput(q) {
  // Track URL: open.spotify.com/track/ID or spotify:track:ID
  let m = q.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/)
  if (m) return { type: 'track', id: m[1] }
  m = q.match(/^spotify:track:([A-Za-z0-9]+)$/)
  if (m) return { type: 'track', id: m[1] }

  // Playlist URL
  m = q.match(/open\.spotify\.com\/playlist\/([A-Za-z0-9]+)/)
  if (m) return { type: 'playlist', id: m[1] }
  m = q.match(/^spotify:playlist:([A-Za-z0-9]+)$/)
  if (m) return { type: 'playlist', id: m[1] }

  // Album URL
  m = q.match(/open\.spotify\.com\/album\/([A-Za-z0-9]+)/)
  if (m) return { type: 'album', id: m[1] }
  m = q.match(/^spotify:album:([A-Za-z0-9]+)$/)
  if (m) return { type: 'album', id: m[1] }

  // Artist URL
  m = q.match(/open\.spotify\.com\/artist\/([A-Za-z0-9]+)/)
  if (m) return { type: 'artist', id: m[1] }

  return { type: 'search', id: null }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed' })
  }

  const guard = guardRequest(req)
  if (guard.blocked) {
    return res.status(403).json({ status: false, message: 'Request blocked', reason: guard.reason })
  }

  const ip = getClientIP(req)
  const rl = rateLimit(ip, 30, 60000, 'search')
  if (!rl.allowed) {
    res.setHeader('X-RateLimit-Limit', '30')
    res.setHeader('X-RateLimit-Remaining', '0')
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(rl.resetIn / 1000)))
    return res.status(429).json({ status: false, message: 'Rate limit exceeded. Limit: 30/min' })
  }

  res.setHeader('X-RateLimit-Limit', '30')
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining))

  const { q, type = 'all', limit } = req.query
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ status: false, message: 'Parameter "q" required (min 2 chars)' })
  }

  const query = q.trim()
  const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50)

  // Validate type param
  const validTypes = ['all', 'tracks', 'playlists', 'albums', 'artists']
  const filterType = validTypes.includes(type) ? type : 'all'

  const detected = detectInput(query)
  const t0 = Date.now()

  try {
    let result

    if (detected.type === 'track') {
      // Direct track lookup via URL/URI
      const track = await spotify.track(detected.id)
      if (!track) return res.status(404).json({ status: false, message: 'Track not found' })
      result = { type: 'track', data: track }

    } else if (detected.type === 'playlist') {
      // Direct playlist lookup via URL/URI
      const playlist = await spotify.playlist(detected.id)
      if (!playlist) return res.status(404).json({ status: false, message: 'Playlist not found' })
      result = { type: 'playlist', data: playlist }

    } else if (detected.type === 'album') {
      // Direct album lookup via URL/URI
      const album = await spotify.album(detected.id)
      if (!album) return res.status(404).json({ status: false, message: 'Album not found' })
      result = { type: 'album', data: album }

    } else if (detected.type === 'artist') {
      // Direct artist lookup via URL/URI
      const artist = await spotify.artist(detected.id)
      if (!artist) return res.status(404).json({ status: false, message: 'Artist not found' })
      result = { type: 'artist', data: artist }

    } else {
      // Text search — return multiple results
      const raw = await spotify.search(query, parsedLimit)
      if (!raw) return res.status(404).json({ status: false, message: 'No results found' })

      if (filterType === 'all') {
        result = { type: 'search', data: raw }
      } else {
        const filtered = raw[filterType] || []
        if (!filtered.length) return res.status(404).json({ status: false, message: `No ${filterType} found for query` })
        result = { type: filterType, data: filtered }
      }
    }

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60')
    return res.status(200).json({
      creator: 'kasanvx',
      status: true,
      via: detected.type,
      ...result,
      response_ms: Date.now() - t0,
    })

  } catch (err) {
    if (err?.code === 'ECONNABORTED' || err?.name === 'TimeoutError') {
      return res.status(504).json({ status: false, message: 'Request timeout' })
    }
    console.error('[/api/search]', err?.message)
    return res.status(500).json({ status: false, message: 'Internal server error' })
  }
}
