// ────────── code made by kasan | WM GROUP : https://chat.whatsapp.com/LknsianRgX9KVNtyTChwZc?mode=gi_t ──────────

// Map: "ip:endpoint" -> { count, start }
const store = new Map()

const CLEANUP_THRESHOLD = 5000
const CLEANUP_BATCH = 2000

function cleanup() {
  if (store.size < CLEANUP_THRESHOLD) return
  const now = Date.now()
  let deleted = 0
  for (const [key, val] of store.entries()) {
    // Remove entries older than 2 minutes
    if (now - val.start > 120000) {
      store.delete(key)
      deleted++
      if (deleted >= CLEANUP_BATCH) break
    }
  }
}

/**
 * @param {string} ip
 * @param {number} limit  — max requests per window
 * @param {number} windowMs — window duration in ms
 * @param {string} [ns]  — optional namespace/endpoint key
 * @returns {{ allowed: boolean, remaining: number, resetIn: number }}
 */
export function rateLimit(ip, limit = 20, windowMs = 60000, ns = 'default') {
  cleanup()
  const key = `${ip}:${ns}`
  const now = Date.now()
  const entry = store.get(key) || { count: 0, start: now }

  if (now - entry.start > windowMs) {
    entry.count = 1
    entry.start = now
  } else {
    entry.count++
  }

  store.set(key, entry)

  const allowed = entry.count <= limit
  const remaining = Math.max(0, limit - entry.count)
  const resetIn = Math.max(0, windowMs - (now - entry.start))

  return { allowed, remaining, resetIn }
}

export function getIP(req) {
  const xfwd = req.headers['x-forwarded-for']
  if (xfwd) {
    const first = xfwd.split(',')[0].trim()
    if (/^[\d.]+$/.test(first) || /^[a-f0-9:]+$/i.test(first)) return first
  }
  return (
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  )
}
