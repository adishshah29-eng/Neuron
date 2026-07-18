import React, { useRef, useMemo, useState, useEffect } from 'react';
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
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
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

// ---------------------------------------------------------------------------
// Hover shape: a small network of neurons — glowing magenta/pink soma (cell
// bodies) connected by curved blue dendrite branches, some of which reach
// toward their nearest neighboring neuron to read as a network rather than
// isolated starbursts. Returns both target positions AND target colors,
// since this shape uses its own palette instead of the default white-cyan
// hover tint.
// ---------------------------------------------------------------------------
function generateNeuronNetwork(N) {
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);

  const numNeurons = 12; // More neurons for a fuller 3D network
  const fieldRadiusXY = 11;
  
  const centers = [];
  for(let i = 0; i < numNeurons; i++) {
    centers.push({
      x: (Math.random() - 0.5) * 2 * fieldRadiusXY,
      y: (Math.random() - 0.5) * 2 * fieldRadiusXY * 0.7,
      z: (Math.random() - 0.5) * 10, // Deep 3D space
    });
  }

  const somaGlow = new THREE.Color('#ff0055');  // deep neon pink
  const somaHot = new THREE.Color('#ff5588');   // softer pink, so it doesn't blow out to pure white
  const branchBright = new THREE.Color('#0088cc'); // dimmer cyan, prevents blinding glare
  const branchDim = new THREE.Color('#001144');    // very dark blue

  const perNeuron = Math.floor(N / numNeurons);
  let idx = 0;

  for (let n = 0; n < numNeurons; n++) {
    const center = centers[n];
    const countForThis = n === numNeurons - 1 ? N - idx : perNeuron;
    const somaCount = Math.floor(countForThis * 0.10); // slightly fewer dots in the core to reduce glare
    const branchCount = countForThis - somaCount;
    
    // Sort neighbors by distance to form strong connections
    const neighbors = [...centers]
      .filter((c, i) => i !== n)
      .map(c => ({ c, d: Math.hypot(center.x - c.x, center.y - c.y, center.z - c.z) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 4); // connect to up to 4 closest

    const numBranches = 7;

    // --- Soma (glowing cell body) ---
    const somaRadius = 1.4;
    for (let s = 0; s < somaCount; s++) {
      const ix = idx * 3;
      const ct = Math.random() * Math.PI * 2;
      const cu = Math.random() * 2 - 1;
      const cs = Math.sqrt(1 - cu * cu);
      const r = somaRadius * Math.cbrt(Math.random());
      positions[ix] = center.x + cs * Math.cos(ct) * r;
      positions[ix + 1] = center.y + cu * r;
      positions[ix + 2] = center.z + cs * Math.sin(ct) * r;

      const hotness = Math.pow(1 - r / somaRadius, 2); 
      const col = somaGlow.clone().lerp(somaHot, hotness);
      colors[ix] = col.r; colors[ix + 1] = col.g; colors[ix + 2] = col.b;
      idx++;
    }

    // --- Dendrite branches ---
    for (let b = 0; b < branchCount; b++) {
      const ix = idx * 3;
      const branchIdx = b % numBranches;
      
      let target = null;
      if (branchIdx < neighbors.length) {
        target = neighbors[branchIdx].c;
      }

      let dirX, dirY, dirZ, length;
      if (target) {
        const dx = target.x - center.x, dy = target.y - center.y, dz = target.z - center.z;
        const dlen = Math.hypot(dx, dy, dz) || 1;
        dirX = dx / dlen; dirY = dy / dlen; dirZ = dz / dlen;
        // Reach all the way to the neighbor to form a solid continuous fiber!
        length = dlen; 
      } else {
        // Floating dendrites that don't connect
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2 - 1));
        dirX = Math.sin(phi) * Math.cos(theta);
        dirY = Math.sin(phi) * Math.sin(theta);
        dirZ = Math.cos(phi);
        length = 3 + Math.random() * 5;
      }

      // Arbitrary perpendicular vector for lateral wiggle
      let px_, py_, pz_;
      if (Math.abs(dirZ) < 0.9) { px_ = -dirY; py_ = dirX; pz_ = 0; } else { px_ = 1; py_ = 0; pz_ = 0; }
      const plen = Math.hypot(px_, py_, pz_) || 1;
      px_ /= plen; py_ /= plen; pz_ /= plen;

      // Pack dots tightly along the line with organic sweeping curves
      // using a subtle power function so they cluster slightly near the soma, but don't blow out
      const tRaw = Math.random();
      const t = Math.pow(tRaw, 1.15); // Reduced from 1.4 to prevent massive glare
      
      const bendFreq = 1.5;
      const bendPhase = branchIdx * 2.1 + n * 1.3;
      const bendAmp = 1.2 * Math.sin(t * Math.PI); // bows outwards organically in the middle
      const wiggle = Math.sin(t * bendFreq + bendPhase) * bendAmp;
      
      const thickness = 0.15 * (1 - t); // thinner base to reduce overlap glare
      const lateral = wiggle + (Math.random() - 0.5) * thickness;

      const r = t * length;
      positions[ix] = center.x + dirX * r + px_ * lateral;
      positions[ix + 1] = center.y + dirY * r + py_ * lateral;
      positions[ix + 2] = center.z + dirZ * r + pz_ * lateral;

      // Dim and turn blue as it goes outward
      const brightness = 1 - t;
      const col = branchDim.clone().lerp(branchBright, brightness);
      
      // If close to soma, blend to pink
      if (t < 0.18) {
        col.lerp(somaGlow, 1 - (t / 0.18));
      }
      
      colors[ix] = col.r; colors[ix + 1] = col.g; colors[ix + 2] = col.b;
      idx++;
    }
  }

  return { positions, colors };
}

const ParticleBrain = () => {
  const groupRef = useRef();
  const pointsRef = useRef();
  const linesRef = useRef();
  const pulseRef = useRef();
  const { camera } = useThree();

  const [hovered, setHovered] = useState(false);
  const scrollProgress = useRef(0);
  const hoverProgress = useRef(0);
  const targetScatter = useRef(0);
  const mouseNDC = useRef(new THREE.Vector2(0, 0));
  const mouseLocal = useRef(new THREE.Vector3());
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight * 1.2;
      targetScatter.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

      // Random Scatter calculation
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

    // The single hover shape: a small glowing neuron network
    const neuron = generateNeuronNetwork(N);

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

    return {
      home, positions, scatterTo,
      neuronPositions: neuron.positions,
      neuronColors: neuron.colors,
      wobDir, wobPhase, wobSpeed, colors,
      edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors,
    };
  }, []);

  const spriteTexture = useMemo(() => getSprite(), []);

  useFrame((state) => {
    if (!groupRef.current || !pointsRef.current || !linesRef.current || !pulseRef.current) return;

    const t = state.clock.getElapsedTime();
    const dt = state.clock.getDelta();

    // Manage internal rotation separate from the actual group rotation
    if (groupRef.current.userData.ry === undefined) groupRef.current.userData.ry = 0;
    if (groupRef.current.userData.rx === undefined) groupRef.current.userData.rx = 0;

    // Auto rotation for the brain
    groupRef.current.userData.ry += CONFIG.autoRotateSpeed;
    let targetRx = groupRef.current.userData.rx;
    let targetRy = groupRef.current.userData.ry;

    scrollProgress.current += (targetScatter.current - scrollProgress.current) * CONFIG.scatterEase;
    const sProg = scrollProgress.current;

    // Only allow the neuron network to form if we are at the top (sProg near 0)
    hoverProgress.current += ((hovered && targetScatter.current < 0.05 ? 1 : 0) - hoverProgress.current) * 0.1;
    const hProg = hoverProgress.current;

    // Calculate the perfect "face the screen" rotation to stop it from drifting
    let faceScreenRx = -mouseNDC.current.y * 0.15;
    let faceScreenRy = mouseNDC.current.x * 0.25;

    // Ensure we take the shortest rotational path to face the screen
    while (faceScreenRy < targetRy - Math.PI) faceScreenRy += Math.PI * 2;
    while (faceScreenRy > targetRy + Math.PI) faceScreenRy -= Math.PI * 2;
    while (faceScreenRx < targetRx - Math.PI) faceScreenRx += Math.PI * 2;
    while (faceScreenRx > targetRx + Math.PI) faceScreenRx -= Math.PI * 2;

    // Blend between auto-spin (drifting brain) and face-screen (locked hover shape)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(targetRy, faceScreenRy, hProg);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(targetRx, faceScreenRx, hProg);
    groupRef.current.updateMatrixWorld();

    const posArr = pointsRef.current.geometry.attributes.position.array;
    const colorArr = pointsRef.current.geometry.attributes.color.array;
    const {
      wobDir, wobPhase, wobSpeed, scatterTo, home,
      neuronPositions, neuronColors,
      edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors, colors: baseColors,
    } = geometryData;

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const ix = i * 3;
      // Wobble scales down if either hover-shape or scatter is active
      const wob = Math.sin(t * wobSpeed[i] + wobPhase[i]) * CONFIG.wobbleAmplitude * (1 - Math.max(sProg, hProg));

      let px = home[ix] + wobDir[ix] * wob;
      let py = home[ix + 1] + wobDir[ix + 1] * wob;
      let pz = home[ix + 2] + wobDir[ix + 2] * wob;

      // 1. Hover -> Form the neuron network
      if (hProg > 0.001) {
        const easeProg = hProg < 0.5 ? 2 * hProg * hProg : 1 - Math.pow(-2 * hProg + 2, 2) / 2;
        px += (neuronPositions[ix] - px) * easeProg;
        py += (neuronPositions[ix + 1] - py) * easeProg;
        pz += (neuronPositions[ix + 2] - pz) * easeProg;
      }

      // 2. Scroll -> Scatter randomly
      if (sProg > 0.001) {
        px += (scatterTo[ix] - px) * sProg;
        py += (scatterTo[ix + 1] - py) * sProg;
        pz += (scatterTo[ix + 2] - pz) * sProg;
      }

      // This shape uses its own pink/blue palette instead of the default white-cyan fade
      let colorR = baseColors[ix];
      let colorG = baseColors[ix + 1];
      let colorB = baseColors[ix + 2];

      if (hProg > 0.001) {
        colorR += (neuronColors[ix] - colorR) * hProg;
        colorG += (neuronColors[ix + 1] - colorG) * hProg;
        colorB += (neuronColors[ix + 2] - colorB) * hProg;
      }

      posArr[ix] = px; posArr[ix + 1] = py; posArr[ix + 2] = pz;
      colorArr[ix] = colorR; colorArr[ix + 1] = colorG; colorArr[ix + 2] = colorB;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;

    // Update lines
    for (let e = 0; e < edgeCount; e++) {
      const i = edges[e * 2], j = edges[e * 2 + 1];
      const li = e * 6;
      linePositions[li] = posArr[i * 3]; linePositions[li + 1] = posArr[i * 3 + 1]; linePositions[li + 2] = posArr[i * 3 + 2];
      linePositions[li + 3] = posArr[j * 3]; linePositions[li + 4] = posArr[j * 3 + 1]; linePositions[li + 5] = posArr[j * 3 + 2];
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    // Leave a faint holographic web (fades further as the network forms)
    linesRef.current.material.opacity = 0.22 * (1 - sProg) * (1 - hProg * 0.85);

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
      pulsePositions[px] = posArr[ix] + (posArr[jx] - posArr[ix]) * pulse.t;
      pulsePositions[px + 1] = posArr[ix + 1] + (posArr[jx + 1] - posArr[ix + 1]) * pulse.t;
      pulsePositions[px + 2] = posArr[ix + 2] + (posArr[jx + 2] - posArr[ix + 2]) * pulse.t;
      tmpColor.set(pulse.color);
      pulseColors[px] = tmpColor.r; pulseColors[px + 1] = tmpColor.g; pulseColors[px + 2] = tmpColor.b;
    }
    pulseRef.current.geometry.attributes.position.needsUpdate = true;
    pulseRef.current.geometry.attributes.color.needsUpdate = true;
    pulseRef.current.material.opacity = 1 - Math.max(sProg, hProg);
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.particleCount} array={geometryData.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.particleCount} array={geometryData.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.3} map={spriteTexture} vertexColors transparent alphaTest={0.01} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      <lineSegments ref={linesRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={geometryData.edgeCount * 2} array={geometryData.linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#14b8a6" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      <points ref={pulseRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.pulseCount} array={geometryData.pulsePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.pulseCount} array={geometryData.pulseColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.6} map={spriteTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Invisible sphere to accurately catch hover events only on the brain */}
      <mesh 
        visible={false} 
        onPointerMove={(e) => {
          mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
          if (e.pointerType === 'mouse') setHovered(true);
        }}
        onPointerDown={(e) => {
          mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
          setHovered(true);
        }}
        onPointerUp={() => setHovered(false)}
        onPointerLeave={(e) => setHovered(false)}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setHovered(true);
        }}
        onPointerCancel={() => setHovered(false)}
      >
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
};

const NeuralNetwork = () => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, backgroundColor: 'transparent', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 22], fov: 60 }} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
        <ParticleBrain />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.0) 20%, rgba(0,0,0,0.9) 100%)',
        pointerEvents: 'none',
        zIndex: 3
      }} />
    </div>
  );
};

export default NeuralNetwork;