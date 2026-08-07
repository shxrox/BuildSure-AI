import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getDigitalPlan, getCostSettings } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";

function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);

        const plan = await getDigitalPlan(id);
        const settings = await getCostSettings(id);
        const activeRates = settings?.rates || {
          cementRate: 2800,
          brickRate: 35,
          sandRate: 25000,
          tileRate: 4500,
          laborRatePerSqm: 18000,
        };

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

        setSummary({
          floorArea,
          grandTotal: Number(financial?.breakdown?.grandTotalCost) || 0,
          milestonesCount: projData?.completedMilestones?.length || 0,
          collaboratorsCount: projData?.collaborators?.length || 0,
        });
      } catch (error) {
        console.error("Failed to load project overview summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-medium text-xs">
        Loading project overview metrics...
      </div>
    );
  }

  const floorAreaValue = summary ? Number(summary.floorArea) || 0 : 0;
  const grandTotalValue = summary ? Number(summary.grandTotal) || 0 : 0;
  const milestonesCountValue = summary ? Number(summary.milestonesCount) || 0 : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Executive Overview</h2>
          <p className="text-slate-500 text-xs mt-1">
            Centralized summary of construction progress, financial allocations, and architectural layout parameters.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors shadow-xs whitespace-nowrap"
        >
          Open Floor Plan CAD &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-center items-center text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Construction Status</p>
          <p className="text-xl font-extrabold text-blue-600 uppercase tracking-wide">{project?.status || "PLANNING"}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active lifecycle phase</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-center items-center text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Floor Area</p>
          <p className="text-xl font-extrabold text-slate-900">
            {floorAreaValue.toFixed(2)} m²
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Extracted from 2D structures</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-center items-center text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated Cost (LKR)</p>
          <p className="text-xl font-extrabold text-emerald-600">
            Rs. {grandTotalValue.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Live market calculations</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-center items-center text-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Milestones Done</p>
          <p className="text-xl font-extrabold text-amber-600">
            {milestonesCountValue} / 7
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Schedule execution</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 mb-8">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">Project Specification Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Project Name</span>
            <p className="text-slate-900 font-bold text-sm">{project?.projectName}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Location / Site</span>
            <p className="text-slate-900 font-bold text-sm">{project?.location}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Description</span>
            <p className="text-slate-700 leading-relaxed text-sm">{project?.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate(`/projects/${id}/boq`)}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-center items-center text-center group"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">Bill of Quantities</h4>
          <p className="text-xs text-slate-500 mt-1">Inspect exact brick counts, cement bags, sand cubes, and tile area estimates.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-center items-center text-center group"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">Cost & Budget Tracking</h4>
          <p className="text-xs text-slate-500 mt-1">Monitor actual spending against calculated Sri Lankan market projections.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/sharing`)}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-center items-center text-center group"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">Sharing & Access</h4>
          <p className="text-xs text-slate-500 mt-1">Manage collaborators, engineers, and municipal authority access rights.</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;