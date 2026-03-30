"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Line, Float, Trail } from "@react-three/drei"
import * as THREE from "three"

/* ── Custom shader for the atmosphere glow ── */
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), power);
    gl_FragColor = vec4(glowColor, fresnel * intensity);
  }
`

/* ── Orbiting data packet (light traveling along arc) ── */
function DataPacket({ curve, speed, color, size }: {
  curve: THREE.QuadraticBezierCurve3
  speed: number
  color: string
  size: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const progress = useRef(Math.random())

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1
    const point = curve.getPoint(progress.current)
    if (ref.current) {
      ref.current.position.copy(point)
    }
  })

  return (
    <Trail
      width={0.8}
      length={6}
      color={color}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
    </Trail>
  )
}

/* ── Pulsing hotspot node on globe surface ── */
function HotspotNode({ position, color, delay }: {
  position: THREE.Vector3
  color: string
  delay: number
}) {
  const ref = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)
  const elapsed = useRef(delay)

  useFrame((_, delta) => {
    elapsed.current += delta
    if (ref.current) {
      const pulse = 1 + Math.sin(elapsed.current * 3) * 0.3
      ref.current.scale.setScalar(pulse)
    }
    if (ringRef.current) {
      const ringPulse = 1 + Math.sin(elapsed.current * 2) * 0.5
      ringRef.current.scale.setScalar(ringPulse)
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 - Math.sin(elapsed.current * 2) * 0.15
    }
  })

  return (
    <group position={position}>
      {/* Core dot */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.07, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* ── Main globe with all effects ── */
function GlobeInner() {
  const globeGroupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireRef = useRef<THREE.Mesh>(null!)
  const pointsRef = useRef<THREE.Points>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)

  // Surface particles — 1500 dots
  const particlesGeometry = useMemo(() => {
    const count = 1500
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi
      const radius = 2.0
      positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      sizes[i] = Math.random() * 0.02 + 0.005
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  // Arc curves + data for animated packets
  const { arcPoints, curves } = useMemo(() => {
    const arcCount = 18
    const arcs: [number, number, number][][] = []
    const curvesArr: THREE.QuadraticBezierCurve3[] = []
    const r = 2.0
    for (let a = 0; a < arcCount; a++) {
      const segments = 60
      const phi1 = Math.random() * Math.PI
      const theta1 = Math.random() * Math.PI * 2
      const phi2 = Math.random() * Math.PI
      const theta2 = Math.random() * Math.PI * 2
      const start = new THREE.Vector3(
        r * Math.cos(theta1) * Math.sin(phi1),
        r * Math.sin(theta1) * Math.sin(phi1),
        r * Math.cos(phi1)
      )
      const end = new THREE.Vector3(
        r * Math.cos(theta2) * Math.sin(phi2),
        r * Math.sin(theta2) * Math.sin(phi2),
        r * Math.cos(phi2)
      )
      const height = 1.2 + Math.random() * 0.5
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(r * height)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      curvesArr.push(curve)
      const pts = curve.getPoints(segments - 1)
      arcs.push(pts.map((p) => [p.x, p.y, p.z] as [number, number, number]))
    }
    return { arcPoints: arcs, curves: curvesArr }
  }, [])

  // Hotspot nodes — key locations
  const hotspots = useMemo(() => {
    const spots: { position: THREE.Vector3; color: string; delay: number }[] = []
    const colors = ["#818cf8", "#a78bfa", "#6366f1", "#c084fc", "#38bdf8", "#34d399"]
    const r = 2.01
    for (let i = 0; i < 12; i++) {
      const phi = Math.random() * Math.PI
      const theta = Math.random() * Math.PI * 2
      spots.push({
        position: new THREE.Vector3(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        ),
        color: colors[i % colors.length],
        delay: Math.random() * 5,
      })
    }
    return spots
  }, [])

  // Atmosphere shader uniforms
  const atmosphereUniforms = useMemo(
    () => ({
      glowColor: { value: new THREE.Color("#6366f1") },
      intensity: { value: 0.6 },
      power: { value: 3.5 },
    }),
    []
  )

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.06
      // Gentle wobble
      globeGroupRef.current.rotation.x = Math.sin(t * 0.3) * 0.05
      globeGroupRef.current.rotation.z = Math.cos(t * 0.2) * 0.03
    }
  })

  return (
    <>
      <Float speed={0.4} rotationIntensity={0.1} floatIntensity={0.3}>
        <group ref={globeGroupRef}>
          {/* ── Core solid sphere with gradient ── */}
          <Sphere args={[1.95, 64, 64]}>
            <meshBasicMaterial
              color="#1e1b4b"
              transparent
              opacity={0.6}
            />
          </Sphere>

          {/* ── Primary wireframe globe ── */}
          <Sphere ref={meshRef} args={[2.0, 48, 48]}>
            <MeshDistortMaterial
              color="#6366f1"
              transparent
              opacity={0.15}
              wireframe
              distort={0.08}
              speed={2}
            />
          </Sphere>

          {/* ── Secondary wireframe (offset rotation for depth) ── */}
          <Sphere ref={wireRef} args={[2.02, 32, 32]} rotation={[0.4, 0.8, 0]}>
            <meshBasicMaterial
              color="#8b5cf6"
              transparent
              opacity={0.05}
              wireframe
            />
          </Sphere>

          {/* ── Surface particles ── */}
          <points ref={pointsRef} geometry={particlesGeometry}>
            <pointsMaterial
              size={0.02}
              color="#a5b4fc"
              transparent
              opacity={0.7}
              sizeAttenuation
            />
          </points>

          {/* ── Arc connection lines ── */}
          {arcPoints.map((pts, i) => (
            <Line
              key={i}
              points={pts}
              color={i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#a78bfa" : "#38bdf8"}
              lineWidth={i % 4 === 0 ? 1.2 : 0.6}
              transparent
              opacity={i % 4 === 0 ? 0.4 : 0.15}
            />
          ))}

          {/* ── Animated data packets traveling along arcs ── */}
          {curves.slice(0, 8).map((curve, i) => (
            <DataPacket
              key={`packet-${i}`}
              curve={curve}
              speed={0.15 + Math.random() * 0.15}
              color={i % 3 === 0 ? "#818cf8" : i % 3 === 1 ? "#c084fc" : "#38bdf8"}
              size={0.025}
            />
          ))}

          {/* ── Pulsing hotspot nodes ── */}
          {hotspots.map((spot, i) => (
            <HotspotNode key={`hotspot-${i}`} {...spot} />
          ))}
        </group>
      </Float>

      {/* ── Atmosphere glow (outside group so it doesn't rotate) ── */}
      <Sphere ref={atmosphereRef} args={[2.4, 64, 64]}>
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={atmosphereUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>

      {/* ── Outer particle ring ── */}
      <OrbitalRing radius={3.0} count={200} color="#6366f1" speed={0.02} />
      <OrbitalRing radius={3.5} count={150} color="#8b5cf6" speed={-0.015} tilt={0.6} />
    </>
  )
}

/* ── Orbital particle ring ── */
function OrbitalRing({ radius, count, color, speed, tilt = 0 }: {
  radius: number
  count: number
  color: string
  speed: number
  tilt?: number
}) {
  const ref = useRef<THREE.Points>(null!)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const spread = (Math.random() - 0.5) * 0.15
      positions[i * 3] = (radius + spread) * Math.cos(angle)
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      positions[i * 3 + 2] = (radius + spread) * Math.sin(angle)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [radius, count])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })

  return (
    <points ref={ref} geometry={geometry} rotation={[tilt, 0, 0]}>
      <pointsMaterial
        size={0.008}
        color={color}
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  )
}

/* ── Scene wrapper with camera + lighting ── */
export function GlobeScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[8, 8, 8]} intensity={1} color="#818cf8" />
        <pointLight position={[-8, -5, -8]} intensity={0.5} color="#c084fc" />
        <pointLight position={[0, 10, 0]} intensity={0.3} color="#38bdf8" />

        <GlobeInner />
      </Canvas>
    </div>
  )
}
