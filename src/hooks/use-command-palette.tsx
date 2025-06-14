"use client"

import * as React from "react"

interface CommandPaletteContextType {
  isOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextType | undefined>(undefined)

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const openCommandPalette = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCommandPalette = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandPaletteContext.Provider
      value={{
        isOpen,
        openCommandPalette,
        closeCommandPalette,
      }}
    >
      {children}
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext)
  if (context === undefined) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider")
  }
  return context
}
