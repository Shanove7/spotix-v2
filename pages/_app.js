import { createContext, useContext, useState, useEffect } from 'react'
import '../styles/globals.css'

export const ThemeCtx = createContext({ theme: 'dark', toggle: () => {} })
export const useTheme = () => useContext(ThemeCtx)

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('sx-theme') || 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const toggle = () => {
    const n = theme === 'dark' ? 'light' : 'dark'
    setTheme(n)
    localStorage.setItem('sx-theme', n)
    document.documentElement.setAttribute('data-theme', n)
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <Component {...pageProps} />
    </ThemeCtx.Provider>
  )
}
