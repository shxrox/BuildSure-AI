// interface Wall {
//   id: string;
//   points: number[];
// }

// interface Door {
//   id: string;
//   x: number;
//   y: number;
//   rotation?: number;
//   width?: number; 
// }

// interface BlueprintWindow {
//   id: string;
//   x: number;
//   y: number;
//   rotation?: number;
//   width?: number;
// }

// interface Room {
//   id: string;
//   area: number;
// }

// // Standard Sri Lankan / General Construction Constants
// const CONSTANTS = {
//   PIXELS_PER_METER: 100, // 100px = 1m strict scaling
//   WALL_HEIGHT_M: 3.0,    // Standard single-story floor height (10 ft)
//   WALL_THICKNESS_M: 0.225, // Standard 9-inch brick wall
  
//   DOOR_HEIGHT_M: 2.1,
//   DOOR_WIDTH_M: 0.8,     // 80cm standard door
  
//   WINDOW_HEIGHT_M: 1.2,
//   WINDOW_WIDTH_M: 1.2,   // 120cm standard window
  
//   // Material consumption per cubic meter (m³) of brickwork
//   BRICKS_PER_M3: 400,
//   CEMENT_BAGS_PER_M3: 7, // 50kg bags
//   SAND_CUBES_PER_M3: 0.3,
  
//   // Flooring
//   TILES_PER_SQM: 11,     // Standard 30x30cm tiles per square meter
// };

// export const calculateMaterials = (
//   walls: Wall[] = [],
//   doors: Door[] = [],
//   windows: BlueprintWindow[] = [],
//   rooms: Room[] = []
// ) => {
//   // 1. Calculate Gross Wall Volume
//   let totalWallLengthPx = 0;
  
//   walls.forEach((wall) => {
//     if (!wall || !wall.points || wall.points.length < 4) return;
//     const dx = wall.points[2] - wall.points[0];
//     const dy = wall.points[3] - wall.points[1];
//     totalWallLengthPx += Math.sqrt(dx * dx + dy * dy);
//   });
  
//   const totalWallLengthM = totalWallLengthPx / CONSTANTS.PIXELS_PER_METER;
//   const grossWallVolume = totalWallLengthM * CONSTANTS.WALL_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;

//   // 2. Calculate Deductions (Holes for Doors & Windows)
//   let deductionsVolume = 0;
  
//   doors.forEach((door) => {
//     const width = (door.width || 80) / CONSTANTS.PIXELS_PER_METER;
//     deductionsVolume += width * CONSTANTS.DOOR_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;
//   });

//   windows.forEach((win) => {
//     const width = (win.width || 120) / CONSTANTS.PIXELS_PER_METER;
//     deductionsVolume += width * CONSTANTS.WINDOW_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;
//   });

//   // 3. Net Wall Volume (Gross minus Deductions)
//   const netWallVolume = Math.max(0, grossWallVolume - deductionsVolume);

//   // 4. Calculate Total Floor Area
//   let totalFloorArea = 0;
//   rooms.forEach((room) => {
//     if (room && room.area) {
//       totalFloorArea += room.area;
//     }
//   });

//   // 5. Output Final BOQ (Bill of Quantities)
//   return {
//     metrics: {
//       totalWallLengthM: parseFloat(totalWallLengthM.toFixed(2)),
//       totalFloorAreaSqm: parseFloat(totalFloorArea.toFixed(2)),
//       netWallVolumeM3: parseFloat(netWallVolume.toFixed(2)),
//     },
//     materials: {
//       bricks: Math.ceil(netWallVolume * CONSTANTS.BRICKS_PER_M3),
//       cementBags: Math.ceil(netWallVolume * CONSTANTS.CEMENT_BAGS_PER_M3),
//       sandCubes: parseFloat((netWallVolume * CONSTANTS.SAND_CUBES_PER_M3).toFixed(2)),
//       floorTiles: Math.ceil(totalFloorArea * CONSTANTS.TILES_PER_SQM),
//       doorsCount: doors.length,
//       windowsCount: windows.length
//     }
//   };
// };

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

  // Floor tiles including 10% waste margin
  const floorTiles = Math.round(totalFloorAreaSqm * 1.10);

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