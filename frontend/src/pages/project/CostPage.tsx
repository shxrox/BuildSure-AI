

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDigitalPlan, saveCostSettings, getCostSettings } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";

function CostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isCheckingSub, setIsCheckingSub] = useState<boolean>(true); // Subscription loading state
  
  const [costData, setCostData] = useState<any>(null);
  const [actualSpent, setActualSpent] = useState<number>(0);
  const [isEditingSpent, setIsEditingSpent] = useState(false);
  const [tempSpent, setTempSpent] = useState("");

  const [isEditingRates, setIsEditingRates] = useState(false);
  const [customRates, setCustomRates] = useState({
    cementRate: 2800,
    brickRate: 35,
    sandRate: 25000,
    tileRate: 4500,
    laborRatePerSqm: 18000,
  });

  // ============================================================
  // CHECK USER SUBSCRIPTION ON LOAD
  // ============================================================
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/me", {
          credentials: "include", // Ensures session/Clerk cookies are passed
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const jsonResponse = await response.json();
        
        // Safely support both root-level and nested .data responses from successResponse utility
        const userData = jsonResponse.data || jsonResponse;
        
        const isPro = userData.subscription === "PRO";
        const hasNotExpired = userData.subscriptionExpiresAt && new Date(userData.subscriptionExpiresAt) > new Date();

        if (!isPro || !hasNotExpired) {
          alert("This financial costing module requires an active PRO subscription.");
          navigate("/pricing"); // Kick free users back to pricing page
        }
      } catch (err) {
        console.error("Subscription validation error:", err);
        navigate("/pricing");
      } finally {
        setIsCheckingSub(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  const fetchCosts = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const plan = await getDigitalPlan(id);
      const settings = await getCostSettings(id);

      let activeRates = customRates;
      if (settings && settings.rates) {
        activeRates = {
          cementRate: Number(settings.rates.cementRate) || 2800,
          brickRate: Number(settings.rates.brickRate) || 35,
          sandRate: Number(settings.rates.sandRate) || 25000,
          tileRate: Number(settings.rates.tileRate) || 4500,
          laborRatePerSqm: Number(settings.rates.laborRatePerSqm) || 18000,
        };
        setCustomRates(activeRates);
      }
      if (settings && typeof settings.actualSpent === "number") {
        setActualSpent(settings.actualSpent);
      }

      const walls = plan?.walls || [];
      const doors = plan?.doors || [];
      const windows = plan?.windows || [];
      const rooms = plan?.rooms || [];

      const boq = calculateMaterials(walls, doors, windows, rooms);
      const mappedMaterials = {
        bricksCount: Number(boq?.materials?.bricks) || 0,
        cementBags: Number(boq?.materials?.cementBags) || 0,
        sandCubes: Number(boq?.materials?.sandCubes) || 0,
        tileAreaSqm: Number(boq?.materials?.floorTiles) || 0,
      };

      const floorArea = Number(boq?.metrics?.totalFloorAreaSqm) || 0;
      const financial = calculateSriLankanCost(mappedMaterials, floorArea, activeRates);
      setCostData(financial);
    } catch (error) {
      console.error("Failed to load financial estimation", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCheckingSub) {
      fetchCosts();
    }
  }, [id, isCheckingSub]);

  const handleSaveSpent = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempSpent);
    if (!isNaN(val) && id) {
      setActualSpent(val);
      await saveCostSettings(id, { actualSpent: val, rates: customRates });
    }
    setIsEditingSpent(false);
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setLoading(true);
      await saveCostSettings(id, { actualSpent, rates: customRates });
      const plan = await getDigitalPlan(id);
      const walls = plan?.walls || [];
      const doors = plan?.doors || [];
      const windows = plan?.windows || [];
      const rooms = plan?.rooms || [];

      const boq = calculateMaterials(walls, doors, windows, rooms);
      const mappedMaterials = {
        bricksCount: Number(boq?.materials?.bricks) || 0,
        cementBags: Number(boq?.materials?.cementBags) || 0,
        sandCubes: Number(boq?.materials?.sandCubes) || 0,
        tileAreaSqm: Number(boq?.materials?.floorTiles) || 0,
      };

      const floorArea = Number(boq?.metrics?.totalFloorAreaSqm) || 0;
      const financial = calculateSriLankanCost(mappedMaterials, floorArea, customRates);
      setCostData(financial);
      setIsEditingRates(false);
    } catch (err) {
      console.error("Failed to update custom rates", err);
    } finally {
      setLoading(false);
    }
  };

  // Show a loading screen while validating the subscription
  if (isCheckingSub || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-medium text-xs">
        {isCheckingSub ? "Verifying Pro Subscription access..." : "Loading cost metrics…"}
      </div>
    );
  }

  const breakdown = costData?.breakdown || {
    brickCost: 0,
    cementCost: 0,
    sandCost: 0,
    tileCost: 0,
    openingsCost: 0,
    totalMaterialCost: 0,
    estimatedLaborCost: 0,
    grandTotalCost: 0,
  };

  const grandTotal = Number(breakdown.grandTotalCost) || 0;
  const remainingBudget = grandTotal - actualSpent;

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">💰 Sri Lankan Construction Costing & Rates</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Prices automatically update based on your latest floor plan additions and saved custom market rates.
          </p>
        </div>
        <button
          onClick={() => setIsEditingRates(!isEditingRates)}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors shadow-xs"
        >
          {isEditingRates ? "Close Customizer" : "⚙️ Adjust Market Rates"}
        </button>
      </div>

      {isEditingRates && (
        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Set Persistent Custom Market Rates (LKR)</h3>
          <form onSubmit={handleSaveRates} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cement Bag Rate (LKR)</label>
              <input type="number" value={customRates.cementRate} onChange={e => setCustomRates({ ...customRates, cementRate: +e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brick Unit Rate (LKR)</label>
              <input type="number" value={customRates.brickRate} onChange={e => setCustomRates({ ...customRates, brickRate: +e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sand Cube Rate (LKR)</label>
              <input type="number" value={customRates.sandRate} onChange={e => setCustomRates({ ...customRates, sandRate: +e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tile Sqm Rate (LKR)</label>
              <input type="number" value={customRates.tileRate} onChange={e => setCustomRates({ ...customRates, tileRate: +e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Labor Rate Per Sqm (LKR)</label>
              <input type="number" value={customRates.laborRatePerSqm} onChange={e => setCustomRates({ ...customRates, laborRatePerSqm: +e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                Save & Recalculate
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Construction Cost</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">
            Rs. {grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Spent Recorded</p>
            <button onClick={() => { setTempSpent(actualSpent.toString()); setIsEditingSpent(true); }}
              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">
              Edit Spend
            </button>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            Rs. {actualSpent.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Variance / Remaining</p>
          <p className={`text-2xl font-extrabold mt-2 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Rs. {remainingBudget.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {isEditingSpent && (
        <div className="mb-8 bg-blue-50 p-4 rounded-xl border border-blue-200">
          <form onSubmit={handleSaveSpent} className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter Total Actual Spending (LKR)</label>
              <input type="number" value={tempSpent} onChange={(e) => setTempSpent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 7950000" autoFocus />
            </div>
            <button type="submit" className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold cursor-pointer">Save Amount</button>
            <button type="button" onClick={() => setIsEditingSpent(false)} className="mt-5 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-white shadow-xs rounded-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cost Breakdown Structure</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Category</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Cost (LKR)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200 text-xs text-slate-700">
            <tr><td className="px-6 py-3 font-medium text-slate-900">Bricks & Blocks Subtotal</td><td className="px-6 py-3">Rs. {(Number(breakdown.brickCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr><td className="px-6 py-3 font-medium text-slate-900">Cement Subtotal</td><td className="px-6 py-3">Rs. {(Number(breakdown.cementCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr><td className="px-6 py-3 font-medium text-slate-900">Sand Subtotal</td><td className="px-6 py-3">Rs. {(Number(breakdown.sandCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr><td className="px-6 py-3 font-medium text-slate-900">Flooring & Tiling Subtotal</td><td className="px-6 py-3">Rs. {(Number(breakdown.tileCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr><td className="px-6 py-3 font-medium text-slate-900">Doors & Windows Allowances</td><td className="px-6 py-3">Rs. {(Number(breakdown.openingsCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr className="bg-slate-50 font-bold"><td className="px-6 py-3 text-slate-900">Total Material Cost</td><td className="px-6 py-3 text-blue-600">Rs. {(Number(breakdown.totalMaterialCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr><td className="px-6 py-3 font-medium text-slate-900">Estimated Labor & Finishing</td><td className="px-6 py-3">Rs. {(Number(breakdown.estimatedLaborCost) || 0).toLocaleString("en-LK")}</td></tr>
            <tr className="bg-blue-50 font-extrabold text-sm"><td className="px-6 py-3 text-slate-900">Grand Total Estimated Construction Cost</td><td className="px-6 py-3 text-blue-700">Rs. {grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CostPage;