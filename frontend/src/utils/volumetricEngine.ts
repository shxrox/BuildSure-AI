export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  height: number;
}

export interface Room {
  id: string;
  name: string;
  points: { x: number; y: number }[];
  areaSqm?: number;
}

export interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
}

export interface WindowItem {
  id: string;
  x: number;
  y: number;
  width: number;
}

export const calculateMaterials = (
  walls: Wall[],
  doors: Door[],
  windows: WindowItem[],
  rooms: Room[]
) => {
  const PIXEL_TO_METER = 0.01; // 100px = 1m

  let totalWallLengthM = 0;
  let netWallVolumeM3 = 0;

  walls.forEach((wall) => {
    const dx = wall.endX - wall.startX;
    const dy = wall.endY - wall.startY;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    const lengthM = lengthPx * PIXEL_TO_METER;
    const thicknessM = (wall.thickness || 200) * 0.001; // mm to meters
    const heightM = wall.height || 3.0; // standard 3 meters

    totalWallLengthM += lengthM;
    netWallVolumeM3 += lengthM * thicknessM * heightM;
  });

  // Deduct openings approximately
  const openingCount = doors.length + windows.length;
  const openingDeductionM3 = openingCount * 0.9 * 1.2 * 0.2; // approx volume per opening
  const finalWallVolumeM3 = Math.max(0, netWallVolumeM3 - openingDeductionM3);

  // Volumetric material conversions (Sri Lankan Construction Standards)
  // Bricks: ~550 standard bricks per 1m³ of brick masonry
  const bricks = Math.round(finalWallVolumeM3 * 550);

  // Cement: ~7.5 bags of cement per 1m³ of masonry & plaster
  const cementBags = Math.round(finalWallVolumeM3 * 7.5);

  // Sand: ~0.42 cubes (m³) of sand per 1m³ of masonry & plaster
  const sandCubes = parseFloat((finalWallVolumeM3 * 0.42).toFixed(2));

  // Floor area calculation from rooms or walls
  let totalFloorAreaSqm = 0;
  if (rooms && rooms.length > 0) {
    rooms.forEach((room) => {
      if (room.areaSqm) {
        totalFloorAreaSqm += room.areaSqm;
      } else if (room.points && room.points.length >= 3) {
        // Shoelace formula for polygon area in pixels, then convert to sqm
        let areaPx = 0;
        const pts = room.points;
        for (let i = 0; i < pts.length; i++) {
          const j = (i + 1) % pts.length;
          areaPx += pts[i].x * pts[j].y;
          areaPx -= pts[j].x * pts[i].y;
        }
        areaPx = Math.abs(areaPx) / 2;
        totalFloorAreaSqm += areaPx * (PIXEL_TO_METER * PIXEL_TO_METER);
      }
    });
  }

  // Fallback if no rooms drawn yet but walls exist
  if (totalFloorAreaSqm === 0 && totalWallLengthM > 0) {
    totalFloorAreaSqm = parseFloat(((totalWallLengthM / 4) * (totalWallLengthM / 4)).toFixed(2));
  }

  // Floor tiles including 10% waste margin (expressed in total tile area sqm)
  const floorTiles = parseFloat((totalFloorAreaSqm * 1.10).toFixed(2));

  return {
    metrics: {
      totalWallLengthM: parseFloat(totalWallLengthM.toFixed(2)),
      netWallVolumeM3: parseFloat(finalWallVolumeM3.toFixed(2)),
      totalFloorAreaSqm: parseFloat(totalFloorAreaSqm.toFixed(2)),
    },
    materials: {
      bricks,
      cementBags,
      sandCubes,
      floorTiles,
      doorsCount: doors.length,
      windowsCount: windows.length,
    },
  };
};