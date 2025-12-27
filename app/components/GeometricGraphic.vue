<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Point3D { x: number; y: number; z: number }
interface Point2D { x: number; y: number; r: number; opacity: number }
interface Edge { p1: number; p2: number; opacity: number }
interface Face { p1: number; p2: number; p3: number; opacity: number; z: number }

const width = 800;
const height = 800;
const count = 50;
const connectionDistance = 180;

// State
const points = ref<Point3D[]>([]);
const projectedPoints = ref<Point2D[]>([]);
const edges = ref<Edge[]>([]);
const faces = ref<Face[]>([]);

let animationId: number;
let angleX = 0;
let angleY = 0;

// Initialize Geometry
const init = () => {
  const pts: Point3D[] = [];
  // Generate points in a spherical volume with variation
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = 200 + Math.random() * 150; // Radius variation for "shattered" look
    
    pts.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi)
    });
  }
  points.value = pts;

  // Pre-calculate topology (edges and faces)
  const es: Edge[] = [];
  const fs: Face[] = [];
  
  for (let i = 0; i < count; i++) {
    const neighbors: number[] = [];
    for (let j = i + 1; j < count; j++) {
      const p1 = pts[i];
      const p2 = pts[j];
      if (!p1 || !p2) continue;

      const d = Math.sqrt(
        (p1.x - p2.x) ** 2 +
        (p1.y - p2.y) ** 2 +
        (p1.z - p2.z) ** 2
      );
      if (d < connectionDistance) {
        es.push({ p1: i, p2: j, opacity: Math.max(0.1, 1 - d / connectionDistance) });
        neighbors.push(j);
      }
    }
    
    // Form triangles from neighbors (Plexus effect)
    for (let k = 0; k < neighbors.length; k++) {
      for (let l = k + 1; l < neighbors.length; l++) {
        const n1 = neighbors[k];
        const n2 = neighbors[l];
        
        if (n1 === undefined || n2 === undefined) continue;

        const p1 = pts[n1];
        const p2 = pts[n2];
        if (!p1 || !p2) continue;

        // Check if n1 and n2 are connected
        const d = Math.sqrt(
          (p1.x - p2.x) ** 2 +
          (p1.y - p2.y) ** 2 +
          (p1.z - p2.z) ** 2
        );
        if (d < connectionDistance) {
           // Found a triangle (i, n1, n2)
           // Randomly decide to fill it to create "shards"
           if (Math.random() > 0.3) {
             fs.push({ 
               p1: i, p2: n1, p3: n2, 
               opacity: 0.05 + Math.random() * 0.15, 
               z: 0 
             });
           }
        }
      }
    }
  }
  edges.value = es;
  faces.value = fs;
};

const animate = () => {
  angleY += 0.0015;
  angleX += 0.0005;
  
  const cx = width / 2;
  const cy = height / 2;
  const fov = 600;
  
  // Project Points
  const p2d: Point2D[] = [];
  const rotatedPoints: Point3D[] = [];

  points.value.forEach((p) => {
    // Rotate Y
    let x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
    let z = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);
    let y = p.y;

    // Rotate X
    const y2 = y * Math.cos(angleX) - z * Math.sin(angleX);
    const z2 = y * Math.sin(angleX) + z * Math.cos(angleX);
    
    x = x;
    y = y2;
    z = z2;

    rotatedPoints.push({ x, y, z });

    const scale = fov / (fov + z + 600); // Camera distance
    const x2d = cx + x * scale;
    const y2d = cy + y * scale;
    const r = Math.max(1, 4 * scale);
    
    p2d.push({ x: x2d, y: y2d, r, opacity: Math.min(1, scale) });
  });
  
  projectedPoints.value = p2d;

  // Sort faces by Z depth (Painters algorithm)
  faces.value.forEach(f => {
    const p1 = rotatedPoints[f.p1];
    const p2 = rotatedPoints[f.p2];
    const p3 = rotatedPoints[f.p3];
    if (p1 && p2 && p3) {
      f.z = (p1.z + p2.z + p3.z) / 3;
    }
  });
  faces.value.sort((a, b) => (b.z || 0) - (a.z || 0));

  animationId = requestAnimationFrame(animate);
};

onMounted(() => {
  init();
  animate();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="absolute inset-0 pointer-events-none overflow-hidden select-none">
    <!-- Plexus Container -->
    <div class="absolute top-1/2 right-[-50%] md:right-[-300px] -translate-y-1/2 w-[180%] h-[180%] md:w-[1300px] md:h-[1300px] opacity-60 dark:opacity-80">
      <svg class="w-full h-full" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet">
        
        <!-- Faces (Triangles) -->
        <template v-for="(face, i) in faces" :key="`f-${i}`">
          <polygon
            v-if="projectedPoints[face.p1] && projectedPoints[face.p2] && projectedPoints[face.p3]"
            :points="`${projectedPoints[face.p1]!.x},${projectedPoints[face.p1]!.y} ${projectedPoints[face.p2]!.x},${projectedPoints[face.p2]!.y} ${projectedPoints[face.p3]!.x},${projectedPoints[face.p3]!.y}`"
            class="fill-primary transition-colors duration-1000"
            :fill-opacity="face.opacity"
            stroke="none"
          />
        </template>

        <!-- Edges (Lines) -->
        <template v-for="(edge, i) in edges" :key="`e-${i}`">
          <line
            v-if="projectedPoints[edge.p1] && projectedPoints[edge.p2]"
            :x1="projectedPoints[edge.p1]!.x" :y1="projectedPoints[edge.p1]!.y"
            :x2="projectedPoints[edge.p2]!.x" :y2="projectedPoints[edge.p2]!.y"
            class="stroke-primary"
            stroke-width="0.5"
            :stroke-opacity="edge.opacity * 0.4"
          />
        </template>

        <!-- Nodes (Points) -->
        <circle v-for="(p, i) in projectedPoints" :key="`p-${i}`"
          :cx="p.x" :cy="p.y" :r="p.r"
          class="fill-primary"
          :fill-opacity="p.opacity"
        />
      </svg>
    </div>
    
    <!-- Background Glow -->
    <div class="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-50 pointer-events-none"></div>
  </div>
</template>

<style scoped>
/* Optional: Add a subtle pulse to the whole container */
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
