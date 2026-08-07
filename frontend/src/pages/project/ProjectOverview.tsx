import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WorkspaceCard from "../../components/project/WorkspaceCard";
import { getProjectById, getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";

function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [planStatus, setPlanStatus] = useState({ hasBlueprint: false, hasWalls: false, totalArea: 0, estimatedCost: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);

        const plan = await getDigitalPlan(id);
        if (plan) {
          const hasBlueprint = Boolean(plan.blueprintUrl || plan.blueprint?.filename);
          const hasWalls = Boolean(plan.walls && plan.walls.length > 0);
          
          let totalArea = 0;
          let estimatedCost = 0;

          if (hasWalls || (plan.rooms && plan.rooms.length > 0)) {
            const boq = calculateMaterials(
              plan.walls || [],
              plan.doors || [],
              plan.windows || [],
              plan.rooms || []
            );
            totalArea = boq.metrics.totalFloorAreaSqm;
            const financial = calculateSriLankanCost(boq.materials, totalArea);
            estimatedCost = financial.breakdown.grandTotalCost;
          }

          setPlanStatus({ hasBlueprint, hasWalls, totalArea, estimatedCost });
        }
      } catch (error) {
        console.error("Failed to load project overview data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-gray-500 font-medium">Loading project telemetry...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 Project Overview</h2>
          <p className="text-gray-600">
            Manage your construction project from planning to completion with real-time volumetric calculations.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
          <p className="text-xs font-semibold text-blue-600 uppercase">Project Status</p>
          <p className="text-sm font-bold text-blue-900">{project?.status || "PLANNING"}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px", marginTop: "25px" }}>
        <WorkspaceCard
          title="🏗 Project Telemetry"
          description={planStatus.hasWalls ? `Active floor plan loaded (${planStatus.totalArea} m²)` : "Planning phase active, canvas ready"}
        />

        <WorkspaceCard
          title="📅 Construction Timeline"
          description="Standard workflow active (Foundation ➔ Structure ➔ Finishing)"
        />

        <WorkspaceCard
          title="📐 Blueprint"
          description={planStatus.hasBlueprint ? "✅ Blueprint uploaded & linked" : "❌ No blueprint uploaded yet"}
        />

        <WorkspaceCard
          title="📦 Bill of Quantities"
          description={planStatus.hasWalls ? "✅ Live material calculation ready" : "🔄 BOQ pending canvas drawing"}
        />

        <WorkspaceCard
          title="💰 Cost Estimation"
          description={planStatus.estimatedCost > 0 ? `Est. Rs. ${planStatus.estimatedCost.toLocaleString("en-LK", { maximumFractionDigits: 0 })}` : "Cost calculation pending floor plan"}
        />

        <WorkspaceCard
          title="👥 Collaboration"
          description="Secure MERN Role-Based Access Control Active"
        />
      </div>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate(`/projects/${id}/blueprint`)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 cursor-pointer transition-colors"
        >
          📐 Create / Edit Floor Plan
        </button>

        <button
          onClick={() => navigate(`/projects/${id}/blueprint`)}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
        >
          📤 Upload Blueprint
        </button>

        <button
          onClick={() => navigate(`/projects/${id}/boq`)}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
        >
          📦 Generate BOQ
        </button>

        <button
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
        >
          💰 Estimate Cost
        </button>
      </div>
    </div>
  );
}

export default ProjectOverview;