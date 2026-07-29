const SITE = 'https://spotify.khasan.site'

function Sitemap() {}

export async function getServerSideProps({ res }) {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/docs', priority: '0.8', changefreq: 'monthly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default Sitemap
