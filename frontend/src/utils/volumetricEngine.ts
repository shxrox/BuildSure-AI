import { Wall } from '../store/useCanvasStore';

// --- Scale & Conversion Constants ---
// We assume 100 pixels on our canvas equals 1 real-world meter
const PIXELS_PER_METER = 100;
const INCHES_TO_METERS = 0.0254;

// --- Construction Material Constants ---
// Standard estimates per 1 Cubic Meter (1 m³) of brickwork
const BRICKS_PER_CUBIC_METER = 500;
const CEMENT_BAGS_PER_CUBIC_METER = 1.26; // 50kg bags
const SAND_CUBES_PER_CUBIC_METER = 0.088; // 1 "Cube" = 100 cubic feet

export interface BoQResult {
  totalVolumeM3: number;
  totalLengthMeters: number;
  totalBricks: number;
  cementBags: number;
  sandCubes: number;
}

/**
 * Calculates the exact material quantities required for a given set of drawn walls.
 */
export const calculateBoQ = (walls: Wall[]): BoQResult => {
  let totalVolumeM3 = 0;
  let totalLengthMeters = 0;

  walls.forEach((wall) => {
    // 1. Calculate the exact length of the wall in pixels using the Pythagorean theorem
    const lengthPx = Math.hypot(wall.endX - wall.startX, wall.endY - wall.startY);
    
    // 2. Convert raw pixels and inches into standardized real-world Meters
    const lengthMeters = lengthPx / PIXELS_PER_METER;
    const thicknessMeters = wall.thickness * INCHES_TO_METERS;
    const heightMeters = wall.height * INCHES_TO_METERS;

    // 3. Calculate Volume (Length * Thickness * Height)
    const volume = lengthMeters * thicknessMeters * heightMeters;

    totalLengthMeters += lengthMeters;
    totalVolumeM3 += volume;
  });

  return {
    totalVolumeM3: Number(totalVolumeM3.toFixed(2)),
    totalLengthMeters: Number(totalLengthMeters.toFixed(2)),
    
    // Math.ceil is used because you cannot buy a fraction of a brick or cement bag!
    totalBricks: Math.ceil(totalVolumeM3 * BRICKS_PER_CUBIC_METER),
    cementBags: Math.ceil(totalVolumeM3 * CEMENT_BAGS_PER_CUBIC_METER),
    sandCubes: Number((totalVolumeM3 * SAND_CUBES_PER_CUBIC_METER).toFixed(2)),
  };
};