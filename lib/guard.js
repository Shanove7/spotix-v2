// ────────── code made by kasan | WM GROUP : https://chat.whatsapp.com/LknsianRgX9KVNtyTChwZc?mode=gi_t ──────────

// Known malicious/attack tool UAs — curl, axios, python dll TIDAK diblock karena ini public API
const BLOCKED_UA = [
  /masscan/i, /zgrab/i, /nuclei/i, /sqlmap/i, /nikto/i,
  /nmap/i, /metasploit/i, /dirsearch/i, /gobuster/i,
  /scrapy/i, /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
  /petalbot/i, /dotbot/i,
]

// Known abusive IP prefixes (Tor exit nodes, known abuse ASNs)
const BLOCKED_IP_PREFIX = [
  '185.220.', '185.107.', '194.165.', '45.142.',
]

// Bad referers
const BLOCKED_REFERER = [/\.onion/i]

export function guardRequest(req) {
  const ua = (req.headers['user-agent'] || '').trim()
  const ip = getClientIP(req)
  const referer = req.headers['referer'] || ''

  // Block completely empty UA
  if (!ua || ua.length < 4) {
    return { blocked: true, reason: 'empty_ua' }
  }

  // Block known malicious scanner/attack UAs
  if (BLOCKED_UA.some(p => p.test(ua))) {
    return { blocked: true, reason: 'blocked_ua' }
  }

  // Block bad referers
  if (referer && BLOCKED_REFERER.some(p => p.test(referer))) {
    return { blocked: true, reason: 'blocked_referer' }
  }

  // Block known abusive IP ranges
  if (BLOCKED_IP_PREFIX.some(prefix => ip.startsWith(prefix))) {
    return { blocked: true, reason: 'blocked_ip_range' }
  }

  return { blocked: false }
}

export function getClientIP(req) {
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
