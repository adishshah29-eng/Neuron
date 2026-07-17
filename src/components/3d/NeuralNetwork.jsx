import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const CONFIG = {
  particleCount: 2600,
  brainRadius: 8, // Scaled down for R3F world space
  connectionMaxDist: 1.5,
  maxConnectionsPerNode: 3,
  pulseCount: 36,
  repulseRadius: 5,
  repulseStrength: 3,
  wobbleAmplitude: 0.2,
  autoRotateSpeed: 0.0011,
  scatterEase: 0.055,
  scatterDistanceMin: 15,
  scatterDistanceMax: 30,
};

// Generates the soft circle sprite
const getSprite = () => {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
};

function brainPoint() {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const x = s * Math.cos(theta);
  const y = u;
  const z = s * Math.sin(theta);

  let r = 1;
  r += 0.09 * Math.sin(6 * theta + 2 * y * Math.PI);
  r += 0.06 * Math.sin(11 * theta - 4 * y);
  r += 0.05 * Math.cos(8 * y * Math.PI + 3 * theta);
  r += 0.03 * Math.sin(17 * theta * y + 5);
  r = Math.max(0.78, Math.min(1.22, r));

  if (y < -0.3) {
    const t = (y + 0.3) / -0.7;
    r *= 1 - 0.5 * t * t;
  }

  const fissureStrength = Math.max(0, y) * 0.9;
  const fissure = Math.exp(-(x * x) / 0.02);
  r *= 1 - fissureStrength * fissure * 0.35;

  const R = CONFIG.brainRadius;
  return {
    x: x * r * R * 0.95,
    y: y * r * R * 0.85,
    z: z * r * R * 1.05,
    side: x,
    top: y,
  };
}

const ParticleBrain = () => {
  const groupRef = useRef();
  const pointsRef = useRef();
  const linesRef = useRef();
  const pulseRef = useRef();
  const { camera } = useThree();

  const [hovered, setHovered] = useState(false);
  const scatterProgress = useRef(0);
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const mouseLocal = useRef(new THREE.Vector3());
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Pre-calculate all geometric data once
  const geometryData = useMemo(() => {
    const N = CONFIG.particleCount;
    const home = new Float32Array(N * 3);
    const scatterTo = new Float32Array(N * 3);
    const wobDir = new Float32Array(N * 3);
    const wobPhase = new Float32Array(N);
    const wobSpeed = new Float32Array(N);
    const colors = new Float32Array(N * 3);

    const colorLeft = new THREE.Color('#3b82f6'); // Blue
    const colorRight = new THREE.Color('#14b8a6'); // Teal

    for (let i = 0; i < N; i++) {
      const p = brainPoint();
      const ix = i * 3;
      home[ix] = p.x; home[ix + 1] = p.y; home[ix + 2] = p.z;

      const len = Math.hypot(p.x, p.y, p.z) || 1;
      const dist = CONFIG.scatterDistanceMin + Math.random() * (CONFIG.scatterDistanceMax - CONFIG.scatterDistanceMin);
      scatterTo[ix] = (p.x / len) * dist + (Math.random() - 0.5) * 5;
      scatterTo[ix + 1] = (p.y / len) * dist + (Math.random() - 0.5) * 5;
      scatterTo[ix + 2] = (p.z / len) * dist + (Math.random() - 0.5) * 5;

      const jt = Math.random() * Math.PI * 2, ju = Math.random() * 2 - 1, js = Math.sqrt(1 - ju * ju);
      wobDir[ix] = js * Math.cos(jt); wobDir[ix + 1] = ju; wobDir[ix + 2] = js * Math.sin(jt);
      wobPhase[i] = Math.random() * Math.PI * 2;
      wobSpeed[i] = 0.6 + Math.random() * 0.8;

      const mix = (p.side + 1) / 2;
      const c = colorLeft.clone().lerp(colorRight, mix);
      const brightness = 0.55 + 0.45 * ((p.top + 1) / 2);
      colors[ix] = c.r * brightness;
      colors[ix + 1] = c.g * brightness;
      colors[ix + 2] = c.b * brightness;
    }

    const positions = Float32Array.from(home);

    // Build connections
    const cellSize = CONFIG.connectionMaxDist;
    const grid = new Map();
    const cellOf = (i) => [
      Math.floor(home[i * 3] / cellSize),
      Math.floor(home[i * 3 + 1] / cellSize),
      Math.floor(home[i * 3 + 2] / cellSize),
    ];
    for (let i = 0; i < N; i++) {
      const [cx, cy, cz] = cellOf(i);
      const k = cx + ',' + cy + ',' + cz;
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(i);
    }
    const edges = [];
    const seen = new Set();
    const maxDistSq = CONFIG.connectionMaxDist * CONFIG.connectionMaxDist;
    
    for (let i = 0; i < N; i++) {
      const [cx, cy, cz] = cellOf(i);
      const xi = home[i * 3], yi = home[i * 3 + 1], zi = home[i * 3 + 2];
      const candidates = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const k = (cx + dx) + ',' + (cy + dy) + ',' + (cz + dz);
            if (grid.has(k)) candidates.push(...grid.get(k));
          }
        }
      }
      const dists = [];
      for (const j of candidates) {
        if (j === i) continue;
        const dx = home[j * 3] - xi, dy = home[j * 3 + 1] - yi, dz = home[j * 3 + 2] - zi;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < maxDistSq) dists.push([j, d2]);
      }
      dists.sort((a, b) => a[1] - b[1]);
      let added = 0;
      for (const [j] of dists) {
        if (added >= CONFIG.maxConnectionsPerNode) break;
        const key = i < j ? i + '_' + j : j + '_' + i;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push(i, j);
        added++;
      }
    }

    const edgeCount = edges.length / 2;
    const linePositions = new Float32Array(edgeCount * 2 * 3);

    // Signal Pulses
    const pulses = [];
    for (let i = 0; i < CONFIG.pulseCount; i++) {
      pulses.push({
        edge: Math.floor(Math.random() * edgeCount),
        t: Math.random(),
        speed: 0.6 + Math.random() * 0.9,
        color: Math.random() > 0.5 ? '#ffffff' : '#14b8a6', // White or Teal pulses
      });
    }
    const pulsePositions = new Float32Array(CONFIG.pulseCount * 3);
    const pulseColors = new Float32Array(CONFIG.pulseCount * 3);

    return { home, positions, scatterTo, wobDir, wobPhase, wobSpeed, colors, edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors };
  }, []);

  const spriteTexture = useMemo(() => getSprite(), []);

  useFrame((state) => {
    if (!groupRef.current || !pointsRef.current || !linesRef.current || !pulseRef.current) return;

    const t = state.clock.getElapsedTime();
    const dt = state.clock.getDelta();
    
    // Rotation & Parallax
    groupRef.current.rotation.y += CONFIG.autoRotateSpeed;
    if (hovered) {
      groupRef.current.rotation.y += (mouseNDC.current.x * 0.25 - groupRef.current.rotation.y * 0.02) * 0.02;
      groupRef.current.rotation.x += (-mouseNDC.current.y * 0.15 - groupRef.current.rotation.x) * 0.03;
    }
    groupRef.current.updateMatrixWorld();

    if (hovered) {
      raycaster.setFromCamera(mouseNDC.current, camera);
      if (raycaster.ray.intersectPlane(groundPlane, mouseLocal.current)) {
        groupRef.current.worldToLocal(mouseLocal.current);
      }
    }

    scatterProgress.current += ((hovered ? 1 : 0) - scatterProgress.current) * CONFIG.scatterEase;
    const progress = scatterProgress.current;
    
    const posArr = pointsRef.current.geometry.attributes.position.array;
    const repulseActive = hovered && progress < 0.95;
    const rR = CONFIG.repulseRadius, rRSq = rR * rR;
    const { N, home, wobDir, wobPhase, wobSpeed, scatterTo, edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors } = geometryData;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const ix = i * 3;
      const wob = Math.sin(t * wobSpeed[i] + wobPhase[i]) * CONFIG.wobbleAmplitude;

      let px = home[ix] + wobDir[ix] * wob;
      let py = home[ix + 1] + wobDir[ix + 1] * wob;
      let pz = home[ix + 2] + wobDir[ix + 2] * wob;

      if (progress > 0.001) {
        px += (scatterTo[ix] - px) * progress;
        py += (scatterTo[ix + 1] - py) * progress;
        pz += (scatterTo[ix + 2] - pz) * progress;
      }

      if (repulseActive) {
        const dx = px - mouseLocal.current.x;
        const dy = py - mouseLocal.current.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < rRSq) {
          const d = Math.sqrt(dSq) || 0.001;
          const force = (1 - d / rR) * CONFIG.repulseStrength * (1 - progress);
          px += (dx / d) * force;
          py += (dy / d) * force;
        }
      }

      posArr[ix] = px; posArr[ix + 1] = py; posArr[ix + 2] = pz;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Update lines
    for (let e = 0; e < edgeCount; e++) {
      const i = edges[e * 2], j = edges[e * 2 + 1];
      const li = e * 6;
      linePositions[li] = posArr[i * 3]; linePositions[li + 1] = posArr[i * 3 + 1]; linePositions[li + 2] = posArr[i * 3 + 2];
      linePositions[li + 3] = posArr[j * 3]; linePositions[li + 4] = posArr[j * 3 + 1]; linePositions[li + 5] = posArr[j * 3 + 2];
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.material.opacity = 0.22 * (1 - progress);

    // Update pulses
    const tmpColor = new THREE.Color();
    for (let p = 0; p < pulses.length; p++) {
      const pulse = pulses[p];
      pulse.t += pulse.speed * (dt || 0.016) * 0.6;
      if (pulse.t > 1) {
        pulse.t = 0;
        pulse.edge = Math.floor(Math.random() * edgeCount);
      }
      const i = edges[pulse.edge * 2], j = edges[pulse.edge * 2 + 1];
      const ix = i * 3, jx = j * 3;
      const px = p * 3;
      pulsePositions[px]     = posArr[ix]     + (posArr[jx]     - posArr[ix])     * pulse.t;
      pulsePositions[px + 1] = posArr[ix + 1] + (posArr[jx + 1] - posArr[ix + 1]) * pulse.t;
      pulsePositions[px + 2] = posArr[ix + 2] + (posArr[jx + 2] - posArr[ix + 2]) * pulse.t;
      tmpColor.set(pulse.color);
      pulseColors[px] = tmpColor.r; pulseColors[px + 1] = tmpColor.g; pulseColors[px + 2] = tmpColor.b;
    }
    pulseRef.current.geometry.attributes.position.needsUpdate = true;
    pulseRef.current.geometry.attributes.color.needsUpdate = true;
    pulseRef.current.material.opacity = 1 - progress;
  });

  return (
    <group 
      ref={groupRef}
      onPointerMove={(e) => {
        mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
    >
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.particleCount} array={geometryData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.particleCount} array={geometryData.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.3} map={spriteTexture} vertexColors transparent alphaTest={0.01} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={geometryData.edgeCount * 2} array={geometryData.linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#14b8a6" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      <points ref={pulseRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.pulseCount} array={geometryData.pulsePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.pulseCount} array={geometryData.pulseColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.6} map={spriteTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* Invisible plane to catch raycaster for hover events across the whole screen */}
      <mesh visible={false} scale={100}>
        <planeGeometry />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
};

const NeuralNetwork = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, backgroundColor: 'transparent', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 22], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
        <ParticleBrain />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(2,4,10,0.0) 20%, rgba(2,4,10,0.9) 100%)',
        pointerEvents: 'none',
        zIndex: 3
      }} />
    </div>
  );
};

export default NeuralNetwork;
