// Average Sri Lankan Market Unit Prices (LKR)
const SRI_LANKAN_PRICES = {
  BRICK_UNIT: 35,          // Per clay brick / cement block
  CEMENT_BAG_50KG: 2250,   // Per 50kg bag (e.g., Sanstha / Tokyo Super)
  SAND_CUBE: 28000,        // Per cubic meter / cube of sand
  TILE_SQM: 2500,          // Average floor tiles per m² including adhesive/grout
  LABOR_AND_FINISHING_SQFT: 3500 // Estimated labor & overhead per sqft
};

export const calculateSriLankanCost = (boqMaterials: {
  bricks: number;
  cementBags: number;
  sandCubes: number;
  floorTiles: number;
  doorsCount: number;
  windowsCount: number;
}, totalFloorAreaSqm: number) => {
  
  const brickCost = boqMaterials.bricks * SRI_LANKAN_PRICES.BRICK_UNIT;
  const cementCost = boqMaterials.cementBags * SRI_LANKAN_PRICES.CEMENT_BAG_50KG;
  const sandCost = boqMaterials.sandCubes * SRI_LANKAN_PRICES.SAND_CUBE;
  const tileCost = boqMaterials.floorTiles * SRI_LANKAN_PRICES.TILE_SQM;
  
  // Standard allowances for doors (approx Rs. 35,000 each) and windows (approx Rs. 25,000 each)
  const openingsCost = (boqMaterials.doorsCount * 35000) + (boqMaterials.windowsCount * 25000);

  const totalMaterialCost = brickCost + cementCost + sandCost + tileCost + openingsCost;

  // Convert m² to sqft for standard Sri Lankan labor calculation (1 m² = 10.764 sqft)
  const totalFloorAreaSqft = totalFloorAreaSqm * 10.764;
  const estimatedLaborCost = totalFloorAreaSqft * SRI_LANKAN_PRICES.LABOR_AND_FINISHING_SQFT;

  const grandTotalCost = totalMaterialCost + estimatedLaborCost;

  return {
    unitPrices: SRI_LANKAN_PRICES,
    breakdown: {
      brickCost,
      cementCost,
      sandCost,
      tileCost,
      openingsCost,
      totalMaterialCost,
      estimatedLaborCost,
      grandTotalCost
    }
  };
};