// ────────── code made by kasan | WM GROUP : https://chat.whatsapp.com/LknsianRgX9KVNtyTChwZc?mode=gi_t ──────────
import { rateLimit } from '../../lib/rateLimit'
import { guardRequest, getClientIP } from '../../lib/guard'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed', creator: 'kasanvx' })
  }

  const guard = guardRequest(req)
  if (guard.blocked) {
    return res.status(403).json({ status: false, message: 'Access denied', creator: 'kasanvx' })
  }

  const ip = getClientIP(req)
  const rl = rateLimit(ip, 20, 60000, 'download')
  if (!rl.allowed) {
    return res.status(429).json({ status: false, message: 'Rate limit exceeded. Limit: 20/min', creator: 'kasanvx' })
  }

  const { url } = req.query
  if (!url || url.trim().length < 5) {
    return res.status(400).json({ status: false, message: 'Parameter "url" required (Spotify track URL)', creator: 'kasanvx' })
  }

  const spotifyUrl = url.trim()
  const isTrackUrl = /open\.spotify\.com\/track\/[A-Za-z0-9]+/.test(spotifyUrl) ||
                     /^spotify:track:[A-Za-z0-9]+$/.test(spotifyUrl)

  if (!isTrackUrl) {
    return res.status(400).json({ status: false, message: 'Only Spotify track URLs supported', creator: 'kasanvx' })
  }

  const t0 = Date.now()
  try {
    const nexrayUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`
    const upstream = await fetch(nexrayUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!upstream.ok) {
      return res.status(502).json({ status: false, message: 'Upstream error', creator: 'kasanvx' })
    }

    const data = await upstream.json()
    if (!data.status || !data.result) {
      return res.status(404).json({ status: false, message: 'Track not found or not available', creator: 'kasanvx' })
    }

    const r = data.result
    const download_url = r.url || r.download_url || null
    if (!download_url) {
      return res.status(404).json({ status: false, message: 'Download URL not available', creator: 'kasanvx' })
    }

    res.setHeader('Cache-Control', 's-maxage=240, stale-while-revalidate=60')
    return res.status(200).json({
      status: true,
      creator: 'kasanvx',
      download_url,
      title: r.title || null,
      artist: r.artist || null,
      thumbnail: r.thumbnail || null,
      duration: r.duration || null,
      album: r.album || null,
      response_ms: Date.now() - t0,
    })
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ status: false, message: 'Request timeout (15s)', creator: 'kasanvx' })
    }
    return res.status(500).json({ status: false, message: 'Internal server error', creator: 'kasanvx' })
  }
}
