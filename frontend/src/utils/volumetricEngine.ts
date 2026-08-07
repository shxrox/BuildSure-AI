interface Wall {
  id: string;
  points: number[];
}

interface Door {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  width?: number; 
}

interface BlueprintWindow {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
}

interface Room {
  id: string;
  area: number;
}

// Standard Sri Lankan / General Construction Constants
const CONSTANTS = {
  PIXELS_PER_METER: 100, // 100px = 1m strict scaling
  WALL_HEIGHT_M: 3.0,    // Standard single-story floor height (10 ft)
  WALL_THICKNESS_M: 0.225, // Standard 9-inch brick wall
  
  DOOR_HEIGHT_M: 2.1,
  DOOR_WIDTH_M: 0.8,     // 80cm standard door
  
  WINDOW_HEIGHT_M: 1.2,
  WINDOW_WIDTH_M: 1.2,   // 120cm standard window
  
  // Material consumption per cubic meter (m³) of brickwork
  BRICKS_PER_M3: 400,
  CEMENT_BAGS_PER_M3: 7, // 50kg bags
  SAND_CUBES_PER_M3: 0.3,
  
  // Flooring
  TILES_PER_SQM: 11,     // Standard 30x30cm tiles per square meter
};

export const calculateMaterials = (
  walls: Wall[] = [],
  doors: Door[] = [],
  windows: BlueprintWindow[] = [],
  rooms: Room[] = []
) => {
  // 1. Calculate Gross Wall Volume
  let totalWallLengthPx = 0;
  
  walls.forEach((wall) => {
    if (!wall || !wall.points || wall.points.length < 4) return;
    const dx = wall.points[2] - wall.points[0];
    const dy = wall.points[3] - wall.points[1];
    totalWallLengthPx += Math.sqrt(dx * dx + dy * dy);
  });
  
  const totalWallLengthM = totalWallLengthPx / CONSTANTS.PIXELS_PER_METER;
  const grossWallVolume = totalWallLengthM * CONSTANTS.WALL_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;

  // 2. Calculate Deductions (Holes for Doors & Windows)
  let deductionsVolume = 0;
  
  doors.forEach((door) => {
    const width = (door.width || 80) / CONSTANTS.PIXELS_PER_METER;
    deductionsVolume += width * CONSTANTS.DOOR_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;
  });

  windows.forEach((win) => {
    const width = (win.width || 120) / CONSTANTS.PIXELS_PER_METER;
    deductionsVolume += width * CONSTANTS.WINDOW_HEIGHT_M * CONSTANTS.WALL_THICKNESS_M;
  });

  // 3. Net Wall Volume (Gross minus Deductions)
  const netWallVolume = Math.max(0, grossWallVolume - deductionsVolume);

  // 4. Calculate Total Floor Area
  let totalFloorArea = 0;
  rooms.forEach((room) => {
    if (room && room.area) {
      totalFloorArea += room.area;
    }
  });

  // 5. Output Final BOQ (Bill of Quantities)
  return {
    metrics: {
      totalWallLengthM: parseFloat(totalWallLengthM.toFixed(2)),
      totalFloorAreaSqm: parseFloat(totalFloorArea.toFixed(2)),
      netWallVolumeM3: parseFloat(netWallVolume.toFixed(2)),
    },
    materials: {
      bricks: Math.ceil(netWallVolume * CONSTANTS.BRICKS_PER_M3),
      cementBags: Math.ceil(netWallVolume * CONSTANTS.CEMENT_BAGS_PER_M3),
      sandCubes: parseFloat((netWallVolume * CONSTANTS.SAND_CUBES_PER_M3).toFixed(2)),
      floorTiles: Math.ceil(totalFloorArea * CONSTANTS.TILES_PER_SQM),
      doorsCount: doors.length,
      windowsCount: windows.length
    }
  };
};