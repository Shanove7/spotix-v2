// ────────── code made by kasan | WM GROUP : https://chat.whatsapp.com/LknsianRgX9KVNtyTChwZc?mode=gi_t ──────────
import { rateLimit } from '../../lib/rateLimit'
import { guardRequest, getClientIP } from '../../lib/guard'
import spotify from '../../lib/spotify'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed' })
  }

  const guard = guardRequest(req)
  if (guard.blocked) {
    return res.status(403).json({ status: false, message: 'Request blocked', reason: guard.reason })
  }

  const ip = getClientIP(req)
  const rl = rateLimit(ip, 30, 60000, 'track')
  if (!rl.allowed) {
    res.setHeader('X-RateLimit-Remaining', '0')
    return res.status(429).json({ status: false, message: 'Rate limit exceeded. Limit: 30/min' })
  }

  const { id } = req.query
  if (!id || id.trim().length < 2) {
    return res.status(400).json({ status: false, message: 'Parameter "id" required (Spotify track ID or URL)' })
  }

  const t0 = Date.now()
  try {
    const track = await spotify.track(id.trim())
    if (!track) return res.status(404).json({ status: false, message: 'Track not found' })

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120')
    return res.status(200).json({
      creator: 'kasanvx',
      status: true,
      data: track,
      response_ms: Date.now() - t0,
    })
  } catch (err) {
    if (err?.code === 'ECONNABORTED' || err?.name === 'TimeoutError') {
      return res.status(504).json({ status: false, message: 'Request timeout' })
    }
    console.error('[/api/track]', err?.message)
    return res.status(500).json({ status: false, message: 'Internal server error' })
  }
}
