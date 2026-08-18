

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { 
  Package, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  FileSpreadsheet, 
  DoorOpen, 
  PanelTop, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

function BOQPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [boqData, setBoqData] = useState<any>(null);

  useEffect(() => {
    const fetchBoq = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getDigitalPlan(id);
        if (plan) {
          const result = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          setBoqData(result);
        }
      } catch (error) {
        console.error("Failed to calculate BOQ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoq();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span>Calculating Bill of Quantities (BOQ)...</span>
        </div>
      </div>
    );
  }

  if (!boqData || !boqData.materials) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Structural Data Found</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
            Please draw structural walls and rooms in your 2D Floor Plan workspace to automatically generate a detailed Bill of Quantities.
          </p>
          <button
            onClick={() => navigate(`/projects/${id}/floor-plan`)}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-900/20 cursor-pointer inline-flex items-center gap-2"
          >
            Go to Floor Plan Canvas <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const { materials, metrics } = boqData;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 selection:bg-blue-500/20">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-700">
            <Package size={13} className="text-emerald-600" /> Quantity Survey
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bill of Quantities (BOQ)
          </h2>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            Precise material takeoff calculations derived directly from your 2D architectural blueprint layout and volumetric engine standards.
          </p>
        </div>

        <button
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="group px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          View Cost Estimation 
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Floor Area",
            value: `${metrics?.totalFloorAreaSqm ?? 0} m²`,
            subtitle: "Calculated room surfaces",
            icon: <Layers size={20} className="text-blue-600" />,
            border: "border-blue-200",
            bg: "from-blue-500/10 to-blue-600/5",
            textColor: "text-blue-600"
          },
          {
            title: "Total Wall Length",
            value: `${metrics?.totalWallLengthM ?? 0} m`,
            subtitle: "Structural linear perimeter",
            icon: <FileSpreadsheet size={20} className="text-emerald-600" />,
            border: "border-emerald-200",
            bg: "from-emerald-500/10 to-emerald-600/5",
            textColor: "text-slate-900"
          },
          {
            title: "Doors Count",
            value: `${materials?.doorsCount ?? 0} units`,
            subtitle: "Placed entryway cutouts",
            icon: <DoorOpen size={20} className="text-amber-600" />,
            border: "border-amber-200",
            bg: "from-amber-500/10 to-amber-600/5",
            textColor: "text-amber-600"
          },
          {
            title: "Windows Count",
            value: `${materials?.windowsCount ?? 0} units`,
            subtitle: "Placed ventilation openings",
            icon: <PanelTop size={20} className="text-purple-600" />,
            border: "border-purple-200",
            bg: "from-purple-500/10 to-purple-600/5",
            textColor: "text-purple-600"
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border ${card.border} bg-gradient-to-b ${card.bg} backdrop-blur-sm shadow-lg shadow-slate-200/50 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div>
              <p className={`text-xl font-extrabold ${card.textColor} tracking-tight mb-1`}>{card.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Material Takeoff Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Package size={15} className="text-blue-600" /> Material Takeoff Schedule
          </h3>
          <span className="text-[10px] font-semibold text-slate-400">IQSSL Standard Metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Material Item</th>
                <th className="p-4">Estimated Quantity</th>
                <th className="p-4">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900">Clay Bricks / Blocks</td>
                <td className="p-4 font-extrabold text-blue-600 font-mono">{(materials?.bricks ?? 0).toLocaleString()}</td>
                <td className="p-4 text-slate-400">Units</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900">Cement Bags (50kg)</td>
                <td className="p-4 font-extrabold text-blue-600 font-mono">{(materials?.cementBags ?? 0).toLocaleString()}</td>
                <td className="p-4 text-slate-400">Bags</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900">Construction Sand</td>
                <td className="p-4 font-extrabold text-blue-600 font-mono">{(materials?.sandCubes ?? 0).toLocaleString()}</td>
                <td className="p-4 text-slate-400">Cubes (m³)</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-bold text-slate-900">Floor Tiles & Adhesives</td>
                <td className="p-4 font-extrabold text-blue-600 font-mono">{(materials?.floorTiles ?? 0).toLocaleString()}</td>
                <td className="p-4 text-slate-400">m²</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default BOQPage;