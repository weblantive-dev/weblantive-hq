import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const PRESET_THEMES = {
  'Ocean Blue': { primary: '#38BDF8', accent: '#818CF8' },
  'Rose Gold': { primary: '#FB7185', accent: '#F9A8D4' },
  'Midnight': { primary: '#6366F1', accent: '#8B5CF6' },
  'Coral Sunrise': { primary: '#FB923C', accent: '#FBBF24' },
  'Arctic': { primary: '#67E8F9', accent: '#A5F3FC' },
  'Neon Lime': { primary: '#A3E635', accent: '#4ADE80' },
  'Weblantive': { primary: '#38BDF8', accent: '#F472B6' }
}

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('wl_darkMode') !== 'false'
  })
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('wl_primary') || '#38BDF8'
  })
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('wl_accent') || '#F472B6'
  })
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('wl_theme') || 'Weblantive'
  })

  useEffect(() => {
    localStorage.setItem('wl_darkMode', darkMode)
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('wl_primary', primaryColor)
    document.documentElement.style.setProperty('--color-primary', primaryColor)
    document.documentElement.style.setProperty('--color-primary-20', primaryColor + '33')
  }, [primaryColor])

  useEffect(() => {
    localStorage.setItem('wl_accent', accentColor)
    document.documentElement.style.setProperty('--color-accent', accentColor)
  }, [accentColor])

  const applyTheme = (themeName) => {
    const theme = PRESET_THEMES[themeName]
    if (theme) {
      setPrimaryColor(theme.primary)
      setAccentColor(theme.accent)
      setActiveTheme(themeName)
      localStorage.setItem('wl_theme', themeName)
    }
  }

  return (
    <ThemeContext.Provider value={{
      darkMode, setDarkMode,
      primaryColor, setPrimaryColor,
      accentColor, setAccentColor,
      activeTheme, applyTheme,
      PRESET_THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
