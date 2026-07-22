import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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

  // --- Neuron network (hover shape) ---
  numNeurons: 12,
  fieldRadiusXY: 11,
  secondaryAxonChance: 0.45,
  axonParticlesPerEdge: 46,
  axonLineSteps: 20,
  dendriteBranchesPerNeuron: 5,
  dendriteForkPoint: 0.55,

  // --- Firing / signal propagation ---
  fireIntervalMin: 1.4,
  fireIntervalMax: 3.2,
  fireSpeed: 0.55, // fraction of edge traversed per second
  cascadeProbability: 0.35,
  flashDecayRate: 3.2,
  firingCapacity: 28,
  breathSpeed: 1.3,
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

// Orthonormal basis perpendicular to a (non-zero) direction vector, used to
// scatter particles laterally around a curve/branch axis.
function perpBasis(nx, ny, nz) {
  const ax = Math.abs(nz) < 0.9 ? 0 : 1;
  const ay = Math.abs(nz) < 0.9 ? 0 : 0;
  const az = Math.abs(nz) < 0.9 ? 1 : 0;
  let ux = ay * nz - az * ny;
  let uy = az * nx - ax * nz;
  let uz = ax * ny - ay * nx;
  const ulen = Math.hypot(ux, uy, uz) || 1;
  ux /= ulen; uy /= ulen; uz /= ulen;
  const vx = ny * uz - nz * uy;
  const vy = nz * ux - nx * uz;
  const vz = nx * uy - ny * ux;
  return [ux, uy, uz, vx, vy, vz];
}

// ---------------------------------------------------------------------------
// Hover shape: a real little network of biological neurons. Each neuron has
// a glowing soma (cell body), a cluster of short forking dendrites, and one
// (sometimes two) longer axons that reach all the way to a neighboring
// neuron and terminate in a bright synaptic bouton. The axon paths double
// as the skeleton for both the crisp glowing "wire" line geometry and the
// signal-pulse propagation, so what you see traveling is what you see wired.
// ---------------------------------------------------------------------------
function buildNeuronNetworkData(N) {
  const numNeurons = CONFIG.numNeurons;
  const fieldRadiusXY = CONFIG.fieldRadiusXY;

  const somaGlow = new THREE.Color('#ff0055');
  const somaHot = new THREE.Color('#ff6fa0');
  const axonColor = new THREE.Color('#12a8d8');
  const axonDim = new THREE.Color('#001830');
  const synapseColor = new THREE.Color('#baf3ff');
  const dendriteTip = new THREE.Color('#3a0a2a');

  // 1. Neuron centers, each with its own size/hue so they don't read as clones.
  const centers = [];
  for (let i = 0; i < numNeurons; i++) {
    centers.push({
      x: (Math.random() - 0.5) * 2 * fieldRadiusXY,
      y: (Math.random() - 0.5) * 2 * fieldRadiusXY * 0.7,
      z: (Math.random() - 0.5) * 10,
      radius: 1.1 + Math.random() * 0.6,
      hueShift: (Math.random() - 0.5) * 0.12,
    });
  }

  // 2. One axon per neuron to its nearest neighbor, plus an occasional
  // collateral to the second-nearest, so the graph has some real branching
  // rather than a single spanning chain.
  const edges = [];
  for (let n = 0; n < numNeurons; n++) {
    const center = centers[n];
    const neighbors = centers
      .map((c, i) => ({ i, d: i === n ? Infinity : Math.hypot(center.x - c.x, center.y - c.y, center.z - c.z) }))
      .sort((a, b) => a.d - b.d);
    edges.push({ a: n, b: neighbors[0].i });
    if (Math.random() < CONFIG.secondaryAxonChance && neighbors.length > 1) {
      edges.push({ a: n, b: neighbors[1].i });
    }
  }

  // 3. Sample a gentle bezier curve from soma to soma for each edge — this
  // curve is reused for particle placement, the glowing line geometry, and
  // pulse travel, so all three always agree with each other.
  const steps = CONFIG.axonLineSteps;
  edges.forEach((edge) => {
    const A = centers[edge.a];
    const B = centers[edge.b];
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, mz = (A.z + B.z) / 2;
    const dx = B.x - A.x, dy = B.y - A.y, dz = B.z - A.z;
    const dlen = Math.hypot(dx, dy, dz) || 1;
    let px = -dy, py = dx, pz = 0;
    const plen = Math.hypot(px, py, pz) || 1;
    px /= plen; py /= plen; pz /= plen;
    const bow = (Math.random() - 0.5) * dlen * 0.35;
    const cx = mx + px * bow, cy = my + py * bow, cz = mz + (Math.random() - 0.5) * 1.5;

    const points = new Float32Array((steps + 1) * 3);
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const it = 1 - t;
      points[s * 3] = it * it * A.x + 2 * it * t * cx + t * t * B.x;
      points[s * 3 + 1] = it * it * A.y + 2 * it * t * cy + t * t * B.y;
      points[s * 3 + 2] = it * it * A.z + 2 * it * t * cz + t * t * B.z;
    }
    edge.points = points;
    edge.length = dlen;
  });

  const outgoingByNeuron = Array.from({ length: numNeurons }, () => []);
  edges.forEach((e, i) => outgoingByNeuron[e.a].push(i));

  // 4. Fill particle budget per neuron: soma core, dense axon filament(s),
  // and short forking dendrites for everything left over.
  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const ownerNeuron = new Int16Array(N);
  const flashWeight = new Float32Array(N);

  const perNeuronBudget = Math.floor(N / numNeurons);
  let idx = 0;

  for (let n = 0; n < numNeurons; n++) {
    const center = centers[n];
    const countForThis = n === numNeurons - 1 ? N - idx : perNeuronBudget;
    const somaCount = Math.max(8, Math.floor(countForThis * 0.11));
    const outgoing = outgoingByNeuron[n];
    const axonBudget = Math.min(outgoing.length * CONFIG.axonParticlesPerEdge, Math.floor(countForThis * 0.55));
    const axonPerEdge = outgoing.length > 0 ? Math.floor(axonBudget / outgoing.length) : 0;
    const dendriteCount = Math.max(0, countForThis - somaCount - axonPerEdge * outgoing.length);

    // --- Soma: glowing cell body ---
    for (let s = 0; s < somaCount; s++) {
      const ix = idx * 3;
      const ct = Math.random() * Math.PI * 2;
      const cu = Math.random() * 2 - 1;
      const cs = Math.sqrt(1 - cu * cu);
      const r = center.radius * Math.cbrt(Math.random());
      positions[ix] = center.x + cs * Math.cos(ct) * r;
      positions[ix + 1] = center.y + cu * r;
      positions[ix + 2] = center.z + cs * Math.sin(ct) * r;

      const hotness = Math.pow(1 - r / center.radius, 2);
      const col = somaGlow.clone().offsetHSL(center.hueShift, 0, 0).lerp(somaHot, hotness);
      colors[ix] = col.r; colors[ix + 1] = col.g; colors[ix + 2] = col.b;
      ownerNeuron[idx] = n;
      flashWeight[idx] = 0.55 + 0.45 * hotness;
      idx++;
    }

    // --- Axon(s): dense filament reaching the target neuron, tapering and
    // swelling into a synaptic bouton right at the end ---
    for (const ei of outgoing) {
      const edge = edges[ei];
      for (let k = 0; k < axonPerEdge; k++) {
        const ix = idx * 3;
        const t = Math.pow(Math.random(), 0.9);
        const fp = t * steps;
        const s0 = Math.min(steps - 1, Math.floor(fp));
        const localT = fp - s0;
        const p = edge.points;
        const p0x = p[s0 * 3], p0y = p[s0 * 3 + 1], p0z = p[s0 * 3 + 2];
        const p1x = p[(s0 + 1) * 3], p1y = p[(s0 + 1) * 3 + 1], p1z = p[(s0 + 1) * 3 + 2];
        let x = p0x + (p1x - p0x) * localT;
        let y = p0y + (p1y - p0y) * localT;
        let z = p0z + (p1z - p0z) * localT;

        const tx = p1x - p0x, ty = p1y - p0y, tz = p1z - p0z;
        const tlen = Math.hypot(tx, ty, tz) || 1;
        const [ux, uy, uz, vx, vy, vz] = perpBasis(tx / tlen, ty / tlen, tz / tlen);

        const boutonBulge = t > 0.88 ? (t - 0.88) / 0.12 : 0;
        const thickness = 0.22 * (1 - t * 0.7) + boutonBulge * 0.35;
        const jt = Math.random() * Math.PI * 2;
        const jr = thickness * Math.sqrt(Math.random());
        x += (ux * Math.cos(jt) + vx * Math.sin(jt)) * jr;
        y += (uy * Math.cos(jt) + vy * Math.sin(jt)) * jr;
        z += (uz * Math.cos(jt) + vz * Math.sin(jt)) * jr;

        positions[ix] = x; positions[ix + 1] = y; positions[ix + 2] = z;

        let col;
        if (t < 0.15) col = somaGlow.clone().lerp(axonColor, t / 0.15);
        else if (t < 0.85) col = axonDim.clone().lerp(axonColor, 0.4 + 0.6 * Math.sin(t * Math.PI));
        else col = axonColor.clone().lerp(synapseColor, (t - 0.85) / 0.15);
        colors[ix] = col.r; colors[ix + 1] = col.g; colors[ix + 2] = col.b;

        // Base of the axon reads as "belonging" to the source soma; the
        // bouton at the far end belongs to the target soma, so it lights
        // up when the target neuron actually receives the signal.
        if (t > 0.85) {
          ownerNeuron[idx] = edge.b;
          flashWeight[idx] = 0.5 + 0.5 * ((t - 0.85) / 0.15);
        } else {
          ownerNeuron[idx] = n;
          flashWeight[idx] = t < 0.2 ? 0.4 * (1 - t / 0.2) : 0;
        }
        idx++;
      }
    }

    // --- Dendrites: short branches that fork partway out, never quite
    // reaching another neuron ---
    const numBranches = CONFIG.dendriteBranchesPerNeuron;
    for (let d = 0; d < dendriteCount; d++) {
      const ix = idx * 3;
      const branchIdx = d % numBranches;
      const theta0 = (branchIdx / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const phi0 = Math.acos(Math.random() * 2 - 1) * 0.7 + Math.PI * 0.15;
      const dirX = Math.sin(phi0) * Math.cos(theta0);
      const dirY = Math.sin(phi0) * Math.sin(theta0);
      const dirZ = Math.cos(phi0);

      const length = 1.6 + Math.random() * 2.4;
      const t = Math.pow(Math.random(), 1.3);
      const forked = t > CONFIG.dendriteForkPoint && Math.random() < 0.5;
      const forkAngle = forked ? (Math.random() - 0.5) * 1.1 : 0;

      let px_, py_, pz_;
      if (Math.abs(dirZ) < 0.9) { px_ = -dirY; py_ = dirX; pz_ = 0; } else { px_ = 1; py_ = 0; pz_ = 0; }
      const plen = Math.hypot(px_, py_, pz_) || 1;
      px_ /= plen; py_ /= plen; pz_ /= plen;

      const bendAmp = 0.5 * Math.sin(t * Math.PI) + (forked ? 0.4 : 0);
      const wiggle = Math.sin(t * 2.2 + branchIdx * 1.7) * bendAmp + forkAngle * t;
      const thickness = 0.13 * (1 - t);
      const lateral = wiggle + (Math.random() - 0.5) * thickness;

      const r = t * length;
      positions[ix] = center.x + dirX * r + px_ * lateral;
      positions[ix + 1] = center.y + dirY * r + py_ * lateral;
      positions[ix + 2] = center.z + dirZ * r + pz_ * lateral;

      const col = somaGlow.clone().lerp(dendriteTip, t);
      colors[ix] = col.r; colors[ix + 1] = col.g; colors[ix + 2] = col.b;
      ownerNeuron[idx] = n;
      flashWeight[idx] = 0.18 * (1 - t);
      idx++;
    }
  }

  return { positions, colors, centers, edges, ownerNeuron, flashWeight };
}

const ParticleBrain = () => {
  const groupRef = useRef();
  const pointsRef = useRef();
  const linesRef = useRef();
  const pulseRef = useRef();
  const axonLinesRef = useRef();
  const firingRef = useRef();
  const { camera } = useThree();

  // Responsive camera FOV — keeps the full brain visible on all screen sizes
  useEffect(() => {
    const updateFov = () => {
      const w = window.innerWidth;
      let fov;
      if (w <= 480) fov = 95;
      else if (w <= 768) fov = 80;
      else if (w <= 1024) fov = 68;
      else fov = 60;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    };
    updateFov();
    window.addEventListener('resize', updateFov);
    return () => window.removeEventListener('resize', updateFov);
  }, [camera]);

  const [hovered, setHovered] = useState(false);

  const scrollProgress = useRef(0);
  const hoverProgress = useRef(0);
  const targetScatter = useRef(0);
  const mouseNDC = useRef(new THREE.Vector2(0, 0));

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

    // The neuron network hover shape
    const neuron = buildNeuronNetworkData(N);

    // Ambient brain-shape connectivity (idle wireframe + drifting pulses)
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

    const pulses = [];
    for (let i = 0; i < CONFIG.pulseCount; i++) {
      pulses.push({
        edge: Math.floor(Math.random() * edgeCount),
        t: Math.random(),
        speed: 0.6 + Math.random() * 0.9,
        color: Math.random() > 0.5 ? '#ffffff' : '#14b8a6',
      });
    }
    const pulsePositions = new Float32Array(CONFIG.pulseCount * 3);
    const pulseColors = new Float32Array(CONFIG.pulseCount * 3);

    // Flattened home/target buffers for the crisp glowing axon-line overlay,
    // laid out as segment pairs so it can render via <lineSegments>. Each
    // vertex starts collapsed at its source soma and grows out to its true
    // curve position as the neuron shape forms.
    const steps = CONFIG.axonLineSteps;
    const axonVertCount = neuron.edges.length * steps * 2;
    const axonHome = new Float32Array(axonVertCount * 3);
    const axonTarget = new Float32Array(axonVertCount * 3);
    const axonColorArr = new Float32Array(axonVertCount * 3);
    const axonColorA = new THREE.Color('#ff5588');
    const axonColorMid = new THREE.Color('#12a8d8');
    const axonColorEnd = new THREE.Color('#baf3ff');
    let vi = 0;
    neuron.edges.forEach((edge) => {
      const A = neuron.centers[edge.a];
      for (let s = 0; s < steps; s++) {
        for (const idxPt of [s, s + 1]) {
          const t = idxPt / steps;
          axonHome[vi * 3] = A.x; axonHome[vi * 3 + 1] = A.y; axonHome[vi * 3 + 2] = A.z;
          axonTarget[vi * 3] = edge.points[idxPt * 3];
          axonTarget[vi * 3 + 1] = edge.points[idxPt * 3 + 1];
          axonTarget[vi * 3 + 2] = edge.points[idxPt * 3 + 2];
          const col = t < 0.5
            ? axonColorA.clone().lerp(axonColorMid, t / 0.5)
            : axonColorMid.clone().lerp(axonColorEnd, (t - 0.5) / 0.5);
          axonColorArr[vi * 3] = col.r; axonColorArr[vi * 3 + 1] = col.g; axonColorArr[vi * 3 + 2] = col.b;
          vi++;
        }
      }
    });

    const firingPositions = new Float32Array(CONFIG.firingCapacity * 3);
    const firingColors = new Float32Array(CONFIG.firingCapacity * 3);

    const neuronRuntime = neuron.centers.map(() => ({
      flash: 0,
      fireTimer: Math.random() * CONFIG.fireIntervalMax,
      breathPhase: Math.random() * Math.PI * 2,
    }));
    const outgoingByNeuron = Array.from({ length: neuron.centers.length }, () => []);
    neuron.edges.forEach((e, i) => outgoingByNeuron[e.a].push(i));

    return {
      home, positions, scatterTo,
      neuronPositions: neuron.positions,
      neuronColors: neuron.colors,
      neuronCenters: neuron.centers,
      neuronEdges: neuron.edges,
      particleOwnerNeuron: neuron.ownerNeuron,
      particleFlashWeight: neuron.flashWeight,
      neuronRuntime,
      outgoingByNeuron,
      firings: [],
      firingPositions, firingColors,
      axonHome, axonTarget, axonPositions: Float32Array.from(axonHome), axonColorArr,
      wobDir, wobPhase, wobSpeed, colors,
      edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors,
    };
  }, []);

  const spriteTexture = useMemo(() => getSprite(), []);

  useFrame((state) => {
    if (!groupRef.current || !pointsRef.current || !linesRef.current || !pulseRef.current) return;

    const t = state.clock.getElapsedTime();
    const dt = Math.min(0.05, state.clock.getDelta() || 0.016);

    if (groupRef.current.userData.ry === undefined) groupRef.current.userData.ry = 0;
    if (groupRef.current.userData.rx === undefined) groupRef.current.userData.rx = 0;

    groupRef.current.userData.ry += CONFIG.autoRotateSpeed;
    let targetRx = groupRef.current.userData.rx;
    let targetRy = groupRef.current.userData.ry;

    scrollProgress.current += (targetScatter.current - scrollProgress.current) * CONFIG.scatterEase;
    const sProg = scrollProgress.current;

    hoverProgress.current += ((hovered && targetScatter.current < 0.05 ? 1 : 0) - hoverProgress.current) * 0.1;
    const hProg = hoverProgress.current;
    const easeProg = hProg < 0.5 ? 2 * hProg * hProg : 1 - Math.pow(-2 * hProg + 2, 2) / 2;

    let faceScreenRx = -mouseNDC.current.y * 0.15;
    let faceScreenRy = mouseNDC.current.x * 0.25;
    while (faceScreenRy < targetRy - Math.PI) faceScreenRy += Math.PI * 2;
    while (faceScreenRy > targetRy + Math.PI) faceScreenRy -= Math.PI * 2;
    while (faceScreenRx < targetRx - Math.PI) faceScreenRx += Math.PI * 2;
    while (faceScreenRx > targetRx + Math.PI) faceScreenRx -= Math.PI * 2;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(targetRy, faceScreenRy, hProg);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(targetRx, faceScreenRx, hProg);
    groupRef.current.updateMatrixWorld();

    const posArr = pointsRef.current.geometry.attributes.position.array;
    const colorArr = pointsRef.current.geometry.attributes.color.array;
    const {
      wobDir, wobPhase, wobSpeed, scatterTo, home,
      neuronPositions, neuronColors, neuronEdges, neuronRuntime, outgoingByNeuron,
      particleOwnerNeuron, particleFlashWeight, firings,
      edges, edgeCount, linePositions, pulses, pulsePositions, pulseColors, colors: baseColors,
      axonHome, axonTarget, axonPositions, firingPositions, firingColors,
    } = geometryData;

    // --- Neuron firing / cascade simulation (soma-driven, biologically ordered) ---
    for (let n = 0; n < neuronRuntime.length; n++) {
      const nr = neuronRuntime[n];
      nr.flash *= Math.exp(-CONFIG.flashDecayRate * dt);
      nr.fireTimer -= dt;
      if (nr.fireTimer <= 0) {
        nr.fireTimer = CONFIG.fireIntervalMin + Math.random() * (CONFIG.fireIntervalMax - CONFIG.fireIntervalMin);
        const outs = outgoingByNeuron[n];
        if (hProg > 0.5 && outs.length > 0 && firings.length < CONFIG.firingCapacity) {
          firings.push({ edgeIdx: outs[Math.floor(Math.random() * outs.length)], ft: 0 });
          nr.flash = 1;
        }
      }
    }
    for (let i = firings.length - 1; i >= 0; i--) {
      const f = firings[i];
      f.ft += CONFIG.fireSpeed * dt;
      if (f.ft >= 1) {
        const edge = neuronEdges[f.edgeIdx];
        const targetNr = neuronRuntime[edge.b];
        targetNr.flash = 1;
        firings.splice(i, 1);
        if (Math.random() < CONFIG.cascadeProbability) {
          const outs = outgoingByNeuron[edge.b];
          if (outs.length > 0 && firings.length < CONFIG.firingCapacity) {
            firings.push({ edgeIdx: outs[Math.floor(Math.random() * outs.length)], ft: 0 });
            targetNr.fireTimer = CONFIG.fireIntervalMin + Math.random() * (CONFIG.fireIntervalMax - CONFIG.fireIntervalMin);
          }
        }
      }
    }

    // --- Morph + colour particles, including per-neuron flash/breath boost ---
    for (let i = 0; i < CONFIG.particleCount; i++) {
      const ix = i * 3;
      const wob = Math.sin(t * wobSpeed[i] + wobPhase[i]) * CONFIG.wobbleAmplitude * (1 - Math.max(sProg, hProg));

      let px = home[ix] + wobDir[ix] * wob;
      let py = home[ix + 1] + wobDir[ix + 1] * wob;
      let pz = home[ix + 2] + wobDir[ix + 2] * wob;

      if (hProg > 0.001) {
        px += (neuronPositions[ix] - px) * easeProg;
        py += (neuronPositions[ix + 1] - py) * easeProg;
        pz += (neuronPositions[ix + 2] - pz) * easeProg;
      }

      if (sProg > 0.001) {
        px += (scatterTo[ix] - px) * sProg;
        py += (scatterTo[ix + 1] - py) * sProg;
        pz += (scatterTo[ix + 2] - pz) * sProg;
      }

      let colorR = baseColors[ix];
      let colorG = baseColors[ix + 1];
      let colorB = baseColors[ix + 2];

      if (hProg > 0.001) {
        colorR += (neuronColors[ix] - colorR) * hProg;
        colorG += (neuronColors[ix + 1] - colorG) * hProg;
        colorB += (neuronColors[ix + 2] - colorB) * hProg;

        const owner = particleOwnerNeuron[i];
        const weight = particleFlashWeight[i];
        if (weight > 0 && owner >= 0) {
          const nr = neuronRuntime[owner];
          const breathe = 0.10 * (0.5 + 0.5 * Math.sin(t * CONFIG.breathSpeed + nr.breathPhase));
          const boost = Math.min(1, (nr.flash + breathe)) * weight * hProg;
          colorR += (1 - colorR) * boost;
          colorG += (1 - colorG) * boost;
          colorB += (1 - colorB) * boost;
        }
      }

      posArr[ix] = px; posArr[ix + 1] = py; posArr[ix + 2] = pz;
      colorArr[ix] = colorR; colorArr[ix + 1] = colorG; colorArr[ix + 2] = colorB;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.geometry.attributes.color.needsUpdate = true;

    // --- Ambient brain-shape wireframe (fades out completely on hover) ---
    for (let e = 0; e < edgeCount; e++) {
      const i = edges[e * 2], j = edges[e * 2 + 1];
      const li = e * 6;
      linePositions[li] = posArr[i * 3]; linePositions[li + 1] = posArr[i * 3 + 1]; linePositions[li + 2] = posArr[i * 3 + 2];
      linePositions[li + 3] = posArr[j * 3]; linePositions[li + 4] = posArr[j * 3 + 1]; linePositions[li + 5] = posArr[j * 3 + 2];
    }
    linesRef.current.geometry.attributes.position.needsUpdate = true;
    linesRef.current.material.opacity = 0.22 * (1 - sProg) * (1 - hProg);

    // --- Ambient drifting pulses on the brain wireframe (also fade out on hover) ---
    const tmpColor = new THREE.Color();
    for (let p = 0; p < pulses.length; p++) {
      const pulse = pulses[p];
      pulse.t += pulse.speed * dt * 0.6;
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

    // --- Growing glowing axon wires (only relevant once the shape is forming) ---
    if (axonLinesRef.current) {
      for (let i = 0; i < axonHome.length; i++) {
        axonPositions[i] = axonHome[i] + (axonTarget[i] - axonHome[i]) * easeProg;
      }
      axonLinesRef.current.geometry.attributes.position.needsUpdate = true;
      axonLinesRef.current.material.opacity = 0.6 * hProg;
    }

    // --- Traveling signal dots along the real axon paths ---
    if (firingRef.current) {
      for (let i = 0; i < CONFIG.firingCapacity; i++) {
        const ix = i * 3;
        if (i < firings.length) {
          const f = firings[i];
          const edge = neuronEdges[f.edgeIdx];
          const steps = CONFIG.axonLineSteps;
          const fp = f.ft * steps;
          const s0 = Math.min(steps - 1, Math.floor(fp));
          const localT = fp - s0;
          const p = edge.points;
          firingPositions[ix] = p[s0 * 3] + (p[(s0 + 1) * 3] - p[s0 * 3]) * localT;
          firingPositions[ix + 1] = p[s0 * 3 + 1] + (p[(s0 + 1) * 3 + 1] - p[s0 * 3 + 1]) * localT;
          firingPositions[ix + 2] = p[s0 * 3 + 2] + (p[(s0 + 1) * 3 + 2] - p[s0 * 3 + 2]) * localT;
          firingColors[ix] = 1; firingColors[ix + 1] = 1; firingColors[ix + 2] = 1;
        } else {
          firingColors[ix] = 0; firingColors[ix + 1] = 0; firingColors[ix + 2] = 0;
        }
      }
      firingRef.current.geometry.attributes.position.needsUpdate = true;
      firingRef.current.geometry.attributes.color.needsUpdate = true;
      firingRef.current.material.opacity = Math.pow(hProg, 2);
    }
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

      {/* Crisp glowing axon wires — only visible/relevant on the neuron hover shape */}
      <lineSegments ref={axonLinesRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={geometryData.axonPositions.length / 3} array={geometryData.axonPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={geometryData.axonColorArr.length / 3} array={geometryData.axonColorArr} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>

      <points ref={pulseRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.pulseCount} array={geometryData.pulsePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.pulseCount} array={geometryData.pulseColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.6} map={spriteTexture} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {/* Traveling action-potential signals along real axon paths */}
      <points ref={firingRef} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={CONFIG.firingCapacity} array={geometryData.firingPositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={CONFIG.firingCapacity} array={geometryData.firingColors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.7} map={spriteTexture} vertexColors transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
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
        onPointerLeave={() => setHovered(false)}
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
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.78} luminanceSmoothing={0.35} intensity={0.5} mipmapBlur radius={0.7} />
        </EffectComposer>
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

