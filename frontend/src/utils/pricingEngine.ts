// export interface MaterialQuantities {
//   bricks: number;
//   cementBags: number;
//   sandCubes: number;
//   floorTiles: number;
//   doorsCount: number;
//   windowsCount: number;
// }

// export const calculateSriLankanCost = (
//   materials: MaterialQuantities,
//   totalFloorAreaSqm: number
// ) => {
//   // Current Sri Lankan Market Rates (LKR)
//   const RATE_BRICK_UNIT = 35; // Per clay brick
//   const RATE_CEMENT_BAG = 3200; // Per 50kg bag (e.g., Tokyo Cement / INSEE)
//   const RATE_SAND_CUBE = 38000; // Per cube (m³) of river/construction sand
//   const RATE_TILE_SQM = 4500; // Average ceramic/porcelain floor tile per sqm including adhesive/grout
  
//   const RATE_DOOR_ALLOWANCE = 45000; // Average wooden/aluminum door with frame
//   const RATE_WINDOW_ALLOWANCE = 35000; // Average aluminum glazed window
  
//   // Standard Sri Lankan labor & finishing rate per square meter (approx Rs. 45,000 to Rs. 65,000 per sqm for mid-range)
//   const RATE_LABOR_FINISHING_SQM = 55000;

//   const brickCost = materials.bricks * RATE_BRICK_UNIT;
//   const cementCost = materials.cementBags * RATE_CEMENT_BAG;
//   const sandCost = materials.sandCubes * RATE_SAND_CUBE;
//   const tileCost = materials.floorTiles * RATE_TILE_SQM;

//   const openingsCost =
//     (materials.doorsCount * RATE_DOOR_ALLOWANCE) +
//     (materials.windowsCount * RATE_WINDOW_ALLOWANCE);

//   const totalMaterialCost = brickCost + cementCost + sandCost + tileCost + openingsCost;
//   const estimatedLaborCost = totalFloorAreaSqm * RATE_LABOR_FINISHING_SQM;
  
//   const grandTotalCost = totalMaterialCost + estimatedLaborCost;

//   return {
//     breakdown: {
//       brickCost,
//       cementCost,
//       sandCost,
//       tileCost,
//       openingsCost,
//       totalMaterialCost,
//       estimatedLaborCost,
//       grandTotalCost,
//     },
//     ratesUsed: {
//       brickUnit: RATE_BRICK_UNIT,
//       cementBag: RATE_CEMENT_BAG,
//       sandCube: RATE_SAND_CUBE,
//       tileSqm: RATE_TILE_SQM,
//       laborSqm: RATE_LABOR_FINISHING_SQM,
//     },
//   };
// };

export interface MarketRates {
  cementRate: number;
  brickRate: number;
  sandRate: number;
  tileRate: number;
  laborRatePerSqm: number;
}

export function calculateSriLankanCost(
  materials: {
    bricksCount: number;
    cementBags: number;
    sandCubes: number;
    tileAreaSqm: number;
  },
  totalFloorAreaSqm: number,
  customRates?: MarketRates
) {
  const rates = customRates || {
    cementRate: 2800,
    brickRate: 35,
    sandRate: 25000,
    tileRate: 4500,
    laborRatePerSqm: 18000,
  };

  const brickCost = materials.bricksCount * rates.brickRate;
  const cementCost = materials.cementBags * rates.cementRate;
  const sandCost = materials.sandCubes * rates.sandRate;
  const tileCost = materials.tileAreaSqm * rates.tileRate;
  const openingsCost = totalFloorAreaSqm * 2500; // standard joinery allowance

  const totalMaterialCost = brickCost + cementCost + sandCost + tileCost + openingsCost;
  const estimatedLaborCost = totalFloorAreaSqm * rates.laborRatePerSqm;
  const grandTotalCost = totalMaterialCost + estimatedLaborCost;

  return {
    breakdown: {
      brickCost,
      cementCost,
      sandCost,
      tileCost,
      openingsCost,
      totalMaterialCost,
      estimatedLaborCost,
      grandTotalCost,
    },
  };
}