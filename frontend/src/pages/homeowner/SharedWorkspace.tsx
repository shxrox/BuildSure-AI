import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";
import { Sparkles, Building2, MapPin, CheckCircle, AlertCircle, LogIn, ArrowRight } from "lucide-react";

function SharedWorkspace(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);

  const [boqData, setBoqData] = useState<any>(null);
  const [costData, setCostData] = useState<any>(null);

  useEffect(() => {
    const fetchSharedWorkspace = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(false);

        // Fetch project details
        const response = await api.get(`/projects/${id}`);
        if (response.data && response.data.data) {
          const proj = response.data.data;
          setProject(proj);

          // Calculate BOQ and Cost metrics directly from the project's digitalPlan & costSettings
          const plan = proj.digitalPlan || {};
          const walls = plan.walls || [];
          const doors = plan.doors || [];
          const windows = plan.windows || [];
          const rooms = plan.rooms || [];

          const boqResult = calculateMaterials(walls, doors, windows, rooms);
          setBoqData(boqResult);

          const mappedMaterials = {
            bricksCount: Number(boqResult?.materials?.bricks) || 0,
            cementBags: Number(boqResult?.materials?.cementBags) || 0,
            sandCubes: Number(boqResult?.materials?.sandCubes) || 0,
            tileAreaSqm: Number(boqResult?.materials?.floorTiles) || 0,
          };

          const floorArea = Number(boqResult?.metrics?.totalFloorAreaSqm) || 0;
          
          // Use saved custom rates if available, otherwise fallback to defaults
          const activeRates = plan.costSettings?.rates || {
            cementRate: 2800,
            brickRate: 35,
            sandRate: 25000,
            tileRate: 4500,
            laborRatePerSqm: 18000,
          };

          const financial = calculateSriLankanCost(mappedMaterials, floorArea, activeRates);
          setCostData(financial);
        } else {
          setError(true);
        }
      } catch (err: any) {
        console.error("Failed to load shared workspace", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span className="text-slate-500 font-medium text-xs">Loading shared construction workspace & analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-inner">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Project Not Found</h2>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">
            This shared project link may be invalid, or the project has been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-md shadow-blue-600/20"
            >
              Go to Home / Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const materials = boqData?.materials || {};
  const metrics = boqData?.metrics || {};
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
  const actualSpent = Number(project.digitalPlan?.costSettings?.actualSpent) || 0;
  const remainingBudget = grandTotal - actualSpent;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-10 selection:bg-blue-500/20">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
              <Sparkles size={12} /> Public Shared Workspace View
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
              {project.projectName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-slate-400" /> {project.location || "Location not specified"}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 uppercase font-semibold text-slate-700">
                <Building2 size={13} className="text-blue-600" /> {project.status || "Active"}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3 items-center shrink-0">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              <LogIn size={14} /> Log In / Sign Up
            </button>
          </div>
        </div>

        {/* Project Description */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Project Description</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            {project.description || "No description provided for this shared project workspace."}
          </p>
        </div>

        {/* BOQ Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Floor Area</p>
            <p className="text-xl font-extrabold text-blue-600">{metrics?.totalFloorAreaSqm ?? 0} m²</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Wall Length</p>
            <p className="text-xl font-extrabold text-slate-900">{metrics?.totalWallLengthM ?? 0} m</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Doors Count</p>
            <p className="text-xl font-extrabold text-slate-900">{materials?.doorsCount ?? 0} units</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Windows Count</p>
            <p className="text-xl font-extrabold text-slate-900">{materials?.windowsCount ?? 0} units</p>
          </div>
        </div>

        {/* Financial High-Level Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Construction Cost</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              Rs. {grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actual Spent Recorded</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              Rs. {actualSpent.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Variance / Remaining</p>
            <p className={`text-2xl font-extrabold mt-1 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              Rs. {remainingBudget.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Material Takeoff Schedule Table */}
        <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-slate-200/80">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Material Takeoff Schedule (BOQ)</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Material Item</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-xs text-slate-700">
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">Clay Bricks / Blocks</td>
                <td className="px-6 py-3 font-bold text-blue-600">{(materials?.bricks ?? 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-500">Units</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">Cement Bags (50kg)</td>
                <td className="px-6 py-3 font-bold text-blue-600">{(materials?.cementBags ?? 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-500">Bags</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">Construction Sand</td>
                <td className="px-6 py-3 font-bold text-blue-600">{(materials?.sandCubes ?? 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-500">Cubes (m³)</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-slate-900">Floor Tiles & Adhesives</td>
                <td className="px-6 py-3 font-bold text-blue-600">{(materials?.floorTiles ?? 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-500">m²</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cost Breakdown Structure Table */}
        <div className="bg-white shadow-xs rounded-2xl overflow-hidden border border-slate-200/80">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cost Breakdown Structure (Sri Lankan Rates)</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Cost (LKR)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-xs text-slate-700">
              <tr><td className="px-6 py-3 font-medium text-slate-900">Bricks & Blocks Subtotal</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.brickCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr><td className="px-6 py-3 font-medium text-slate-900">Cement Subtotal</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.cementCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr><td className="px-6 py-3 font-medium text-slate-900">Sand Subtotal</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.sandCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr><td className="px-6 py-3 font-medium text-slate-900">Flooring & Tiling Subtotal</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.tileCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr><td className="px-6 py-3 font-medium text-slate-900">Doors & Windows Allowances</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.openingsCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr className="bg-slate-50 font-bold"><td className="px-6 py-3 text-slate-900">Total Material Cost</td><td className="px-6 py-3 text-blue-600 font-mono">Rs. {(Number(breakdown.totalMaterialCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr><td className="px-6 py-3 font-medium text-slate-900">Estimated Labor & Finishing</td><td className="px-6 py-3 font-mono">Rs. {(Number(breakdown.estimatedLaborCost) || 0).toLocaleString("en-LK")}</td></tr>
              <tr className="bg-blue-50 font-extrabold text-sm"><td className="px-6 py-3 text-slate-900">Grand Total Estimated Construction Cost</td><td className="px-6 py-3 text-blue-700 font-mono">Rs. {grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</td></tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default SharedWorkspace;