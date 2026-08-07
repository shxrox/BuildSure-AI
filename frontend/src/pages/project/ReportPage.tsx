import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function ReportPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const project: any = await getProjectById(id);
        const plan = await getDigitalPlan(id);

        let metrics = { totalWallLengthM: 0, totalFloorAreaSqm: 0, netWallVolumeM3: 0 };
        let materials = { bricks: 0, cementBags: 0, sandCubes: 0, floorTiles: 0, doorsCount: 0, windowsCount: 0 };
        let financial = { breakdown: { totalMaterialCost: 0, estimatedLaborCost: 0, grandTotalCost: 0 } };

        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          metrics = boq.metrics;
          materials = boq.materials;
          financial = calculateSriLankanCost(boq.materials, boq.metrics.totalFloorAreaSqm);
        }

        setReportData({
          project,
          plan,
          metrics,
          materials,
          financial: financial.breakdown,
        });
      } catch (error) {
        console.error("Failed to generate comprehensive project report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Compiling professional project report...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 text-gray-600">
        Project data unavailable for report generation.
      </div>
    );
  }

  const { project, metrics, materials, financial } = reportData;
  const completedCount = project?.completedMilestones?.length || 1;
  const progressPercentage = Math.round((completedCount / CONSTRUCTION_MILESTONES.length) * 100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📑 BuildSure-AI Project Report</h1>
          <p className="text-sm text-gray-500 mt-1">Official Construction Assessment & Financial Summary</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 cursor-pointer transition-colors"
        >
          🖨 Print / Export PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Project Name</p>
          <p className="text-lg font-bold text-gray-900">{project?.name || "Residential Construction"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Overall Progress</p>
          <p className="text-lg font-bold text-blue-600">{progressPercentage}% Completed</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Total Floor Area</p>
          <p className="text-base font-semibold text-gray-800">{metrics.totalFloorAreaSqm} m²</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Estimated Grand Total</p>
          <p className="text-base font-semibold text-blue-600">
            Rs. {financial.grandTotalCost.toLocaleString("en-LK", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Bill of Quantities (BoQ) Summary</h3>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Material / Item</th>
              <th className="px-6 py-3 text-left">Quantity</th>
              <th className="px-6 py-3 text-left">Unit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Clay / Concrete Bricks</td>
              <td className="px-6 py-4">{materials.bricks.toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">Units</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Cement Bags (50kg)</td>
              <td className="px-6 py-4">{materials.cementBags}</td>
              <td className="px-6 py-4 text-gray-500">Bags</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Sand</td>
              <td className="px-6 py-4">{materials.sandCubes}</td>
              <td className="px-6 py-4 text-gray-500">m³ (Cubes)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Floor Tiles</td>
              <td className="px-6 py-4">{materials.floorTiles.toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">Units</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Sri Lankan Financial Breakdown</h3>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Material Subtotal</span>
            <span className="font-semibold text-gray-900">Rs. {financial.totalMaterialCost.toLocaleString("en-LK")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Labor & Finishing Subtotal</span>
            <span className="font-semibold text-gray-900">Rs. {financial.estimatedLaborCost.toLocaleString("en-LK")}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-bold">
            <span className="text-gray-900">Grand Total Estimated Cost</span>
            <span className="text-blue-600">Rs. {financial.grandTotalCost.toLocaleString("en-LK", { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportPage;