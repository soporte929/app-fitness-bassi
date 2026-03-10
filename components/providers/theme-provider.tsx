'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { useTheme as useNextTheme } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}

export const useTheme = useNextTheme
