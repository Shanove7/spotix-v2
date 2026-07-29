import Head from 'next/head'
import Link from 'next/link'
import { useTheme } from './_app'

export default function NotFound() {
  const { theme, toggle } = useTheme()
  return (
    <>
      <Head><title>404 — Spotix</title><meta name="viewport" content="width=device-width, initial-scale=1.0" /></Head>
      <div className="root">
        <div className="bg"><div className="orb"/><div className="grid"/></div>
        <nav className="nav">
          <div className="nav-w">
            <Link href="/" className="logo">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="var(--green)" strokeWidth="1.5"/><path d="M9 12.5c4-1.5 9-1 12 2" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="logo-txt">Spotix</span>
            </Link>
            <button className="tbtn" onClick={toggle}>
              {theme==='dark'?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
            </button>
          </div>
        </nav>
        <main className="main">
          <div className="box">
            <div className="big">404</div>
            <h1 className="title">Page not found</h1>
            <p className="sub">This page doesn't exist or was moved.</p>
            <div className="acts">
              <Link href="/" className="btn-p">← Go Home</Link>
              <Link href="/docs" className="btn-s">API Docs</Link>
            </div>
          </div>
        </main>
      </div>
      <style jsx>{`
        .root { min-height:100vh; display:flex; flex-direction:column; position:relative; overflow:hidden; }
        .bg { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .orb { position:absolute; width:500px; height:500px; top:-100px; left:50%; transform:translateX(-50%); border-radius:50%; filter:blur(100px); background:var(--orb1); }
        .grid { position:absolute; inset:0; background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:48px 48px; }
        .nav { position:relative; z-index:10; background:var(--nav); backdrop-filter:blur(20px); border-bottom:1px solid var(--border); }
        .nav-w { max-width:900px; margin:0 auto; padding:0 20px; height:58px; display:flex; align-items:center; justify-content:space-between; }
        .logo { display:flex; align-items:center; gap:9px; }
        .logo-txt { font-family:'Fraunces',serif; font-size:17px; font-weight:500; color:var(--t1); }
        .tbtn { width:36px; height:36px; border-radius:99px; display:flex; align-items:center; justify-content:center; color:var(--t2); border:1px solid var(--border); background:var(--inp); transition:all .2s; }
        .tbtn:hover { color:var(--t1); border-color:var(--baccent); }
        .main { flex:1; display:flex; align-items:center; justify-content:center; position:relative; z-index:1; padding:40px 20px; }
        .box { text-align:center; animation:fu .5s cubic-bezier(.16,1,.3,1); }
        .big { font-family:'Fraunces',serif; font-size:clamp(90px,20vw,160px); font-weight:400; font-style:italic; line-height:1; letter-spacing:-0.02em; color:transparent; background:linear-gradient(135deg,var(--baccent) 0%,transparent 70%); -webkit-background-clip:text; background-clip:text; margin-bottom:8px; }
        .title { font-family:'Fraunces',serif; font-size:28px; font-weight:400; color:var(--t1); margin-bottom:10px; }
        .sub { font-size:15px; color:var(--t2); margin-bottom:28px; }
        .acts { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .btn-p { display:flex; align-items:center; background:var(--green); color:#0a0a0b; padding:11px 22px; border-radius:12px; font-size:14px; font-weight:600; transition:all .2s; }
        .btn-p:hover { background:var(--green2); transform:translateY(-2px); }
        .btn-s { display:flex; align-items:center; background:var(--inp); color:var(--t1); border:1.5px solid var(--border); padding:11px 22px; border-radius:12px; font-size:14px; font-weight:600; transition:all .2s; }
        .btn-s:hover { border-color:var(--baccent); color:var(--green); background:var(--gdim); transform:translateY(-2px); }
        @keyframes fu { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}
