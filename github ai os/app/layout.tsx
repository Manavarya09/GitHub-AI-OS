import React from 'react'
import '../app/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-black text-white min-h-screen">{children}</body>
    </html>
  )
}
