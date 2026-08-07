import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";

function BOQPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [boqData, setBoqData] = useState<any>(null);

  useEffect(() => {
    const fetchBOQ = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getDigitalPlan(id);
        if (plan) {
          const boq = calculateMaterials(
            plan.walls || [],
            plan.doors || [],
            plan.windows || [],
            plan.rooms || []
          );
          setBoqData(boq);
        }
      } catch (error) {
        console.error("Failed to calculate Bill of Quantities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBOQ();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Calculating material quantities and volumetric metrics...
      </div>
    );
  }

  if (!boqData) {
    return (
      <div className="p-8 text-gray-600">
        <p className="mb-4">Please draw your architectural floor plan in the 2D workspace to generate a Bill of Quantities (BOQ).</p>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Go to Floor Plan Workspace
        </button>
      </div>
    );
  }

  const { metrics, materials } = boqData;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Bill of Quantities (BOQ)</h2>
          <p className="text-gray-600">
            Calculated material volumes, wall lengths, and floor metrics based on your 2D digital floor plan.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          View Cost Estimation ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Floor Area</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.totalFloorAreaSqm} m²</p>
          <p className="text-xs text-gray-400 mt-1">{(metrics.totalFloorAreaSqm * 10.764).toFixed(1)} sqft</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Wall Length</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalWallLengthMeters} meters</p>
          <p className="text-xs text-gray-400 mt-1">Linear perimeter estimation</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Openings Count</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{metrics.totalOpeningsCount} units</p>
          <p className="text-xs text-gray-400 mt-1">Doors & Windows total</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Material Requirements Schedule</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Material Item</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Clay Bricks / Cement Blocks</td>
              <td className="px-6 py-4 font-bold text-blue-600">{materials.bricksCount.toLocaleString()}</td>
              <td className="px-6 py-4">pieces</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Cement Bags (50kg)</td>
              <td className="px-6 py-4 font-bold text-blue-600">{materials.cementBagsCount.toLocaleString()}</td>
              <td className="px-6 py-4">bags</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Construction Sand</td>
              <td className="px-6 py-4 font-bold text-blue-600">{materials.sandCubes.toLocaleString()}</td>
              <td className="px-6 py-4">cubes</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Floor Tiles Requirement</td>
              <td className="px-6 py-4 font-bold text-blue-600">{materials.tileAreaSqm.toLocaleString()}</td>
              <td className="px-6 py-4">m²</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Doors & Windows Allowances</td>
              <td className="px-6 py-4 font-bold text-blue-600">{materials.openingsCount}</td>
              <td className="px-6 py-4">units</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BOQPage;