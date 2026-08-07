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

        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          const mappedMaterials = {
            bricksCount: Number(boq?.materials?.bricks) || 0,
            cementBags: Number(boq?.materials?.cementBags) || 0,
            sandCubes: Number(boq?.materials?.sandCubes) || 0,
            tileAreaSqm: Number(boq?.materials?.floorTiles) || 0,
          };
          const financial = calculateSriLankanCost(
            mappedMaterials,
            Number(boq?.metrics?.totalFloorAreaSqm) || 0,
            activeRates
          );
          setSummary({
            floorArea: Number(boq?.metrics?.totalFloorAreaSqm) || 0,
            grandTotal: Number(financial?.breakdown?.grandTotalCost) || 0,
            milestonesCount: projData?.completedMilestones?.length || 0,
            collaboratorsCount: projData?.collaborators?.length || 0,
          });
        }
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

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">📊 Project Executive Overview</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            High-level summary of your construction workspace, financial standing, and architectural metrics.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors shadow-xs"
        >
          Open Floor Plan CAD ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Construction Status</p>
          <p className="text-xl font-extrabold text-blue-600 mt-2 uppercase">{project?.status || "PLANNING"}</p>
          <p className="text-[11px] text-slate-400 mt-1">Current phase</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Floor Area</p>
          <p className="text-xl font-extrabold text-slate-900 mt-2">
            {summary ? `${summary.floorArea.toFixed(2)} m²` : "0 m²"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Calculated from 2D walls & rooms</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Cost (LKR)</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-2">
            {summary ? `Rs. ${summary.grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}` : "Rs. 0"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Market materials & labor</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestones Done</p>
          <p className="text-xl font-extrabold text-amber-600 mt-2">
            {summary ? `${summary.milestonesCount} / 7` : "0 / 7"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Construction timeline</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 mb-8">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-500">Project Name:</span>
            <p className="text-slate-900 font-bold mt-0.5">{project?.projectName}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Location / City:</span>
            <p className="text-slate-900 font-bold mt-0.5">📍 {project?.location}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-slate-500">Description:</span>
            <p className="text-slate-800 mt-0.5">{project?.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate(`/projects/${id}/boq`)}
          className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1">📦 Bill of Quantities</h4>
          <p className="text-xs text-slate-500">Inspect exact brick counts, cement bags, sand cubes, and tile area estimates.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1">💰 Cost & Tracking</h4>
          <p className="text-xs text-slate-500">Track actual spending against calculated Sri Lankan market projections.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/sharing`)}
          className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-bold text-slate-900 text-sm mb-1">🔗 Sharing & Access</h4>
          <p className="text-xs text-slate-500">Collaborate with contractors, engineers, and municipal authorities.</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;