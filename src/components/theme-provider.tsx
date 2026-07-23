'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.removeItem('theme')
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

  return <>{children}</>
}
