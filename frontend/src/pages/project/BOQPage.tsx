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
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Calculating Bill of Quantities (BOQ)...
      </div>
    );
  }

  if (!boqData || !boqData.materials) {
    return (
      <div className="p-8 text-gray-600">
        <p className="mb-4">Please draw structural walls and rooms in your 2D Floor Plan workspace to generate a Bill of Quantities.</p>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Go to Floor Plan Canvas
        </button>
      </div>
    );
  }

  const { materials, metrics } = boqData;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 Bill of Quantities (BOQ)</h2>
          <p className="text-gray-600">
            Precise material takeoff calculations derived from your 2D architectural blueprint layout.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/cost`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          View Cost Estimation ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Floor Area</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{metrics?.totalFloorAreaSqm ?? 0} m²</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Wall Length</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metrics?.totalWallLengthM ?? 0} m</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Doors Count</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{materials?.doorsCount ?? 0} units</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Windows Count</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{materials?.windowsCount ?? 0} units</p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Material Takeoff Schedule</h3>
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
              <td className="px-6 py-4 font-medium text-gray-900">Clay Bricks / Blocks</td>
              <td className="px-6 py-4 font-bold text-blue-600">{(materials?.bricks ?? 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">Units</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Cement Bags (50kg)</td>
              <td className="px-6 py-4 font-bold text-blue-600">{(materials?.cementBags ?? 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">Bags</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Construction Sand</td>
              <td className="px-6 py-4 font-bold text-blue-600">{(materials?.sandCubes ?? 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">Cubes (m³)</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-900">Floor Tiles & Adhesives</td>
              <td className="px-6 py-4 font-bold text-blue-600">{(materials?.floorTiles ?? 0).toLocaleString()}</td>
              <td className="px-6 py-4 text-gray-500">m²</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BOQPage;