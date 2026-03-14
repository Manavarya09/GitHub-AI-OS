import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { SceneRoot } from '@/src/three/SceneRoot'
import { LeftPanel } from '@/src/ui/Panels'
// Premium, interactive 3D command center home (simplified mode switch with local state)
export default function Home() {
  const [username, setUsername] = useState('')
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'planets'|'time'|'collab'>('planets')

  async function loadRepos() {
    if (!username) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8080/user/${username}/repos?limit=10`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const list = data?.repos ?? []
      setRepos(list)
    } catch (e) {
      console.error(e)
      setRepos([])
    } finally {
      setLoading(false)
    }
  }
  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Canvas shadows>
        <SceneRoot repos={repos as any} mode={mode as any} />
        <OrbitControls enableDamping />
      </Canvas>
      <LeftPanel repos={repos} onModeChange={setMode} />

      {/* Floating input for username to drive data load */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
        <div className="panel" style={{ padding: 12, minWidth: 320 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>GitHub Username</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. octocat"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #334155', background: '#0b1020', color: '#fff' }}
            />
            <button onClick={loadRepos} className="panel" style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
              {loading ? 'Loading...' : 'Load'}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#93a3b8' }}>
            Enter a GitHub username to visualize their repositories in 3D.
          </div>
        </div>
      </div>
    </div>
  )
}
