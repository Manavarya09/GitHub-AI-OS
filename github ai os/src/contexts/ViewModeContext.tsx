import React from 'react'

type Mode = 'planets' | 'time' | 'collab'

type Value = {
  mode: Mode
  setMode: (m: Mode) => void
}

export const ViewModeContext = React.createContext<Value | undefined>(undefined)

export const ViewModeProvider: React.FC<{ initial?: Mode, children: React.ReactNode }> = ({ initial = 'planets', children }) => {
  const [mode, setMode] = React.useState<Mode>(initial)
  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export const useViewMode = (): Value => {
  const ctx = React.useContext(ViewModeContext)
  if (!ctx) throw new Error('useViewMode must be used within ViewModeProvider')
  return ctx
}
