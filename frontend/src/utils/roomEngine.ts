import { Wall } from '../store/useCanvasStore';

export interface Room {
  id: string;
  polygon: { x: number; y: number }[];
  areaM2: number;
  centerX: number;
  centerY: number;
}

const PIXELS_PER_METER = 100;

/**
 * Calculates the internal area of a polygon using the Shoelace Formula.
 */
const calculatePolygonArea = (points: { x: number; y: number }[]): number => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

/**
 * Calculates the exact visual center (centroid) of the room for text labeling.
 */
const calculateCentroid = (points: { x: number; y: number }[]) => {
  let cx = 0, cy = 0;
  points.forEach(p => { cx += p.x; cy += p.y; });
  return { x: cx / points.length, y: cy / points.length };
};

/**
 * Scans the canvas for perfectly snapped, closed 4-sided rooms (Rectangles/Quadrilaterals).
 * Note: Enterprise BIM uses complex planar graph face-finding. This is a highly optimized 
 * heuristic specifically looking for orthogonal/snapped room loops.
 */
export const detectRooms = (walls: Wall[]): Room[] => {
  const rooms: Room[] = [];
  const processedLoops = new Set<string>();

  // Helper to check if two points are perfectly snapped together
  const isSamePoint = (p1: {x: number, y: number}, p2: {x: number, y: number}) => 
    Math.abs(p1.x - p2.x) < 5 && Math.abs(p1.y - p2.y) < 5;

  // O(N^4) naive search optimized for small-to-medium residential layouts
  for (let i = 0; i < walls.length; i++) {
    for (let j = 0; j < walls.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < walls.length; k++) {
        if (k === i || k === j) continue;
        for (let l = 0; l < walls.length; l++) {
          if (l === i || l === j || l === k) continue;

          const w1 = walls[i]; const w2 = walls[j]; const w3 = walls[k]; const w4 = walls[l];
          
          // Check if these 4 walls form a continuous closed loop
          const loop = [
            { x: w1.startX, y: w1.startY }, { x: w1.endX, y: w1.endY },
            { x: w2.startX, y: w2.startY }, { x: w2.endX, y: w2.endY },
            { x: w3.startX, y: w3.startY }, { x: w3.endX, y: w3.endY },
            { x: w4.startX, y: w4.startY }, { x: w4.endX, y: w4.endY }
          ];

          // Simplified connectivity validation (Assuming continuous drawing flow)
          if (
            (isSamePoint(loop[1], loop[2]) || isSamePoint(loop[1], loop[3])) &&
            (isSamePoint(loop[3], loop[4]) || isSamePoint(loop[3], loop[5]) || isSamePoint(loop[2], loop[4])) &&
            (isSamePoint(loop[5], loop[6]) || isSamePoint(loop[5], loop[7]) || isSamePoint(loop[4], loop[6])) &&
            (isSamePoint(loop[7], loop[0]) || isSamePoint(loop[6], loop[0]))
          ) {
            
            // Extract the 4 unique corners
            const corners = [loop[0], loop[2], loop[4], loop[6]];
            
            // Generate a unique signature for this room to prevent duplicates
            const signature = corners.map(c => `${Math.round(c.x)},${Math.round(c.y)}`).sort().join('|');
            
            if (!processedLoops.has(signature)) {
              processedLoops.add(signature);
              
              const areaPx = calculatePolygonArea(corners);
              const areaM2 = Number((areaPx / (PIXELS_PER_METER * PIXELS_PER_METER)).toFixed(2));
              const centroid = calculateCentroid(corners);

              // Only register rooms larger than 1 square meter (filters out intersecting wall glitches)
              if (areaM2 > 1.0) {
                rooms.push({
                  id: `room-${crypto.randomUUID()}`,
                  polygon: corners,
                  areaM2,
                  centerX: centroid.x,
                  centerY: centroid.y
                });
              }
            }
          }
        }
      }
    }
  }

  return rooms;
};