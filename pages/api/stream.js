import { rateLimit } from '../../lib/rateLimit'
import { guardRequest, getClientIP } from '../../lib/guard'

export const config = {
  api: { responseLimit: false },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed' })
  }

  const guard = guardRequest(req)
  if (guard.blocked) {
    return res.status(403).json({ status: false, message: 'Access denied' })
  }

  const ip = getClientIP(req)
  const rl = rateLimit(ip, 10, 60000, 'stream')
  if (!rl.allowed) {
    return res.status(429).json({ status: false, message: 'Too many requests. Limit: 10 downloads/min' })
  }

  const { token, filename } = req.query
  if (!token) {
    return res.status(400).json({ status: false, message: 'Missing token' })
  }

  try {
    const downloadUrl = `https://rapid.spotidown.app/v2?token=${encodeURIComponent(token)}`
    const upstream = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://spotidown.app/',
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!upstream.ok) {
      return res.status(502).json({ status: false, message: 'Stream error' })
    }

    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    const safeFilename = (filename || 'audio').replace(/[^a-zA-Z0-9\s\-_]/g, '').substring(0, 100)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.mp3"`)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'no-store')

    const reader = upstream.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
    res.end()
  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ status: false, message: 'Stream timeout' })
    }
    return res.status(500).json({ status: false, message: 'Stream failed' })
  }
}
