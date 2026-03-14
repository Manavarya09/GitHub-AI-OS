import React from 'react'

type EventPoint = { time: number; count: number }

type Props = {
  events: EventPoint[]
}

export const TimeMachine: React.FC<Props> = ({ events }) => {
  // Timeline spans from -10 to +10 in X, Y=0 plane
  const minT = events.length ? Math.min(...events.map((e) => e.time)) : 0
  const maxT = events.length ? Math.max(...events.map((e) => e.time)) : 1
  const range = Math.max(1, maxT - minT)

  const mapX = (t: number) => {
    const frac = (t - minT) / range
    return -8 + frac * 16
  }

  // bars representing event intensity
  return (
    <group position={[0, -0.2, -2]}>
      {/* timeline base */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[16, 0.04, 0.6]} />
        <meshStandardMaterial color={'#1f2937'} />
      </mesh>
      {events.map((e, idx) => {
        const x = mapX(e.time)
        const h = Math.max(0.4, Math.min(6, e.count * 0.25))
        return (
          <mesh key={idx} position={[x, h / 2, 0]}>
            <boxGeometry args={[0.2, h, 0.2]} />
            <meshStandardMaterial color={'#3b82f6'} />
          </mesh>
        )
      })}
      {/* current time handle (soft indicator) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={'#e11d48'} opacity={0.6} transparent />
      </mesh>
    </group>
  )
}
