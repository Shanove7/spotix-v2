import { Html, Head, Main, NextScript } from 'next/document'

const SITE_URL = 'https://spotify.khasan.site'

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

        {/* Favicon SVG */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='15' fill='%230a0a0b' stroke='%23c7a662' stroke-width='1.5'/><path d='M9 12.5c4-1.5 9-1 12 2M10 16c3.5-1.2 8-.8 11 1.5M11 19.5c3-1 6.5-.7 9 1.2' stroke='%23c7a662' stroke-width='2' stroke-linecap='round' fill='none'/></svg>" />

        {/* Global SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="kasanvx" />
        <meta name="theme-color" content="#0a0a0b" />

        {/* Open Graph default (override per-page) */}
        <meta property="og:site_name" content="Spotix" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card default */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@kasanvx" />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />

        {/* Theme init script (prevent flash) */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('sx-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();` }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
