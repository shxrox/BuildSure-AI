import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";

const CONSTRUCTION_MILESTONES = [
  { id: "planning", label: "Planning & Approvals" },
  { id: "foundation", label: "Foundation & Excavation" },
  { id: "structure", label: "Structural Framework" },
  { id: "roof", label: "Roofing & Framing" },
  { id: "electrical", label: "Electrical Wiring" },
  { id: "plumbing", label: "Plumbing & Drainage" },
  { id: "finishing", label: "Finishing & Painting" },
];

function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        const plan = await getDigitalPlan(id);

        setProject(projData);

        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          setMetrics(boq.metrics);
          const costResult = calculateSriLankanCost(boq.materials, boq.metrics.totalFloorAreaSqm);
          setFinancial(costResult.breakdown);
        }
      } catch (error) {
        console.error("Failed to load project overview metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project overview summary...
      </div>
    );
  }

  const completedCount = project?.completedMilestones?.length || 1;
  const progressPercentage = Math.round((completedCount / CONSTRUCTION_MILESTONES.length) * 100);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project?.projectName || "Construction Project"}</h1>
          <p className="text-gray-600 mt-1">📍 Location: {project?.location || "Sri Lanka"} | Status: {project?.status || "PLANNING"}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/projects/${id}/floor-plan`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Open Floor Plan 📐
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Overall Progress</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-2">{progressPercentage}%</p>
          <p className="text-xs text-gray-400 mt-1">{completedCount} of {CONSTRUCTION_MILESTONES.length} phases completed</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Floor Area</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{metrics?.totalFloorAreaSqm || 0} m²</p>
          <p className="text-xs text-gray-400 mt-1">{((metrics?.totalFloorAreaSqm || 0) * 10.764).toFixed(1)} sqft</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Estimated Total Cost</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">
            Rs. {financial ? financial.grandTotalCost.toLocaleString("en-LK", { maximumFractionDigits: 0 }) : "0"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Sri Lankan Market Rates</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Active Collaborators</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{project?.collaborators?.length || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Contractors & Stakeholders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Project Summary & Description</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-6">
            {project?.description || "No project description provided. Use the Settings or Floor Plan modules to configure your architectural design and start estimating construction metrics."}
          </p>

          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Module Navigation</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/projects/${id}/floor-plan`)}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <h4 className="font-semibold text-gray-900">📐 Floor Plan</h4>
              <p className="text-xs text-gray-500 mt-1">Draw walls, rooms, doors & windows</p>
            </button>
            <button
              onClick={() => navigate(`/projects/${id}/boq`)}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <h4 className="font-semibold text-gray-900">📦 Bill of Quantities</h4>
              <p className="text-xs text-gray-500 mt-1">View calculated material volumes</p>
            </button>
            <button
              onClick={() => navigate(`/projects/${id}/cost`)}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <h4 className="font-semibold text-gray-900">💰 Cost Estimation</h4>
              <p className="text-xs text-gray-500 mt-1">LKR material and labor breakdown</p>
            </button>
            <button
              onClick={() => navigate(`/projects/${id}/timeline`)}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <h4 className="font-semibold text-gray-900">📅 Timeline Tracker</h4>
              <p className="text-xs text-gray-500 mt-1">Track milestone progress</p>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Project ID</p>
              <p className="font-mono text-gray-700 text-xs mt-0.5">{project?._id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Current Phase</p>
              <p className="font-semibold text-blue-600 mt-0.5">{project?.status || "PLANNING"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Created Date</p>
              <p className="text-gray-700 mt-0.5">{project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">Last Updated</p>
              <p className="text-gray-700 mt-0.5">{project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectOverview;