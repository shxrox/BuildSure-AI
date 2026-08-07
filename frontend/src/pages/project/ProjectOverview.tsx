import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getDigitalPlan } from "../../services/project.service";
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
        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          const financial = calculateSriLankanCost(
            boq.materials,
            boq.metrics.totalFloorAreaSqm
          );
          setSummary({
            floorArea: boq.metrics.totalFloorAreaSqm,
            grandTotal: financial.breakdown.grandTotalCost,
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
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project overview metrics...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Project Executive Overview</h2>
          <p className="text-gray-600">
            High-level summary of your construction workspace, financial standing, and architectural metrics.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Open Floor Plan CAD ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Construction Status</p>
          <p className="text-xl font-bold text-blue-600 mt-1 uppercase">{project?.status || "PLANNING"}</p>
          <p className="text-xs text-gray-400 mt-1">Current phase</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Floor Area</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {summary ? `${summary.floorArea} m²` : "0 m²"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Calculated from 2D walls & rooms</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Estimated Cost (LKR)</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {summary ? `Rs. ${summary.grandTotal.toLocaleString("en-LK", { maximumFractionDigits: 0 })}` : "Rs. 0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Market materials & labor</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Milestones Done</p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {summary ? `${summary.milestonesCount} / 7` : "0 / 7"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Construction timeline</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Project Name:</span>
            <p className="text-gray-900 mt-0.5">{project?.projectName}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Location / City:</span>
            <p className="text-gray-900 mt-0.5">📍 {project?.location}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-gray-700">Description:</span>
            <p className="text-gray-900 mt-0.5">{project?.description || "No description provided."}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate(`/projects/${id}/boq`)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-semibold text-gray-900 text-base mb-1">📦 Bill of Quantities</h4>
          <p className="text-xs text-gray-600">Inspect exact brick counts, cement bags, sand cubes, and tile area estimates.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-semibold text-gray-900 text-base mb-1">💰 Cost & Tracking</h4>
          <p className="text-xs text-gray-600">Track actual spending against calculated Sri Lankan market projections.</p>
        </div>
        <div
          onClick={() => navigate(`/projects/${id}/sharing`)}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 cursor-pointer transition-all"
        >
          <h4 className="font-semibold text-gray-900 text-base mb-1">🔗 Sharing & Access</h4>
          <p className="text-xs text-gray-600">Collaborate with contractors, engineers, and municipal authorities.</p>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;