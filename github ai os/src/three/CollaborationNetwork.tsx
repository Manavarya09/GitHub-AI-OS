import React from 'react'

type NodeSpec = { id: string; name: string }
type EdgeSpec = { a: string; b: string; weight: number }

type Props = {
  nodes: NodeSpec[]
  edges: EdgeSpec[]
}

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export const CollaborationNetwork: React.FC<Props> = ({ nodes, edges }) => {
  // layout nodes roughly on a sphere; map node id to position
  const positions: Record<string, [number, number, number]> = {}
  const count = Math.max(1, nodes.length)
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2
    const phi = 0.9 * Math.acos(2 * (Math.random()) - 1)
    const r = 6
    const x = Math.cos(theta) * Math.sin(phi) * r
    const y = Math.cos(phi) * r
    const z = Math.sin(theta) * Math.sin(phi) * r
    positions[nodes[i]?.id ?? `n${i}`] = [x, y, z]
  }

  return (
    <group position={[0, 0, 0]}>
      {/* edges */}
      {edges.map((e, idx) => {
        const pa = positions[e.a]
        const pb = positions[e.b]
        if (!pa || !pb) return null
        const [ax, ay, az] = pa
        const [bx, by, bz] = pb
        const geom = new Float32Array([
          ax, ay, az,
          bx, by, bz
        ])
        return (
          <line key={idx}>
            <bufferGeometry attach="geometry">
              <bufferAttribute attachments="attributes-position" count={2} itemSize={3} array={geom} />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color={0x8b5cf6} linewidth={1.5 * e.weight} />
          </line>
        )
      })}
      {/* nodes */}
      {nodes.map((n, idx) => {
        const p = positions[n.id]
        if (!p) return null
        const [x, y, z] = p
        return (
          <mesh key={n.id} position={[x, y, z]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={'#3b82f6'} />
          </mesh>
        )
      })}
    </group>
  )
}
