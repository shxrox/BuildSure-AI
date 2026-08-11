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
  // FIXED: Adjusted scale factor to match canvas grid coordinates (10 units = 1m)
  const PIXEL_TO_METER = 0.1; 

  let totalWallLengthM = 0;
  let netWallVolumeM3 = 0;

  walls.forEach((wall) => {
    const dx = wall.endX - wall.startX;
    const dy = wall.endY - wall.startY;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);
    
    // Scale wall length accurately
    const lengthM = lengthPx * PIXEL_TO_METER;
    const thicknessM = (wall.thickness || 200) * 0.001; // mm to meters
    const heightM = wall.height || 3.0; // standard 3.0 meters height

    totalWallLengthM += lengthM;
    netWallVolumeM3 += lengthM * thicknessM * heightM;
  });

  // Deduct openings (doors & windows)
  const openingCount = doors.length + windows.length;
  const openingDeductionM3 = openingCount * 0.9 * 1.2 * 0.2; 
  const finalWallVolumeM3 = Math.max(0, netWallVolumeM3 - openingDeductionM3);

  // Volumetric material conversions (Sri Lankan IQSSL Construction Standards)
  const bricks = Math.round(finalWallVolumeM3 * 550);
  const cementBags = Math.round(finalWallVolumeM3 * 7.5);
  const sandCubes = parseFloat((finalWallVolumeM3 * 0.42).toFixed(2));

  // Floor area calculation
  let totalFloorAreaSqm = 0;
  if (rooms && rooms.length > 0) {
    rooms.forEach((room) => {
      if (room.areaSqm) {
        totalFloorAreaSqm += room.areaSqm;
      } else if (room.points && room.points.length >= 3) {
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

  // Fallback if no room polygon drawn
  if (totalFloorAreaSqm === 0 && totalWallLengthM > 0) {
    const estimatedSide = totalWallLengthM / 4;
    totalFloorAreaSqm = parseFloat((estimatedSide * estimatedSide).toFixed(2));
  }

  // Floor tiles calculation (+10% waste margin)
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