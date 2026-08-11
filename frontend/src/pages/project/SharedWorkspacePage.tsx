import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getDigitalPlan } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";

function SharedWorkspacePage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<any>(null);
  const [boqData, setBoqData] = useState<any>(null);

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);

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
        console.error("Failed to load shared project workspace", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 font-medium bg-gray-50">
        Loading shared construction workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 bg-gray-50 p-6">
        <h2 className="text-xl font-bold mb-2">Project Not Found or Access Restricted</h2>
        <p className="text-sm text-gray-500 mb-4">The shared link may be invalid or you do not have permission to view it.</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const metrics = boqData?.metrics;
  const materials = boqData?.materials;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 mb-8 flex justify-between items-center">
          <div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">
              Shared Viewer Mode
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">🏗 {project.projectName}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Location: {project.location} | Status: {project.status}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 cursor-pointer"
          >
            Go to Main Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Floor Area</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-2">{metrics?.totalFloorAreaSqm ?? 0} m²</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Wall Length</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">{metrics?.totalWallLengthM ?? 0} m</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Openings</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-2">
              {(materials?.doorsCount || 0) + (materials?.windowsCount || 0)} Units
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Estimated Material Takeoff</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200 text-xs text-gray-700">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Material Item</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Estimated Quantity</th>
                <th className="px-6 py-3 text-left font-bold text-gray-500 uppercase">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr><td className="px-6 py-4 font-medium text-gray-900">Clay Bricks / Blocks</td><td className="px-6 py-4 font-bold text-blue-600">{(materials?.bricks ?? 0).toLocaleString()}</td><td className="px-6 py-4 text-gray-500">Units</td></tr>
              <tr><td className="px-6 py-4 font-medium text-gray-900">Cement Bags (50kg)</td><td className="px-6 py-4 font-bold text-blue-600">{(materials?.cementBags ?? 0).toLocaleString()}</td><td className="px-6 py-4 text-gray-500">Bags</td></tr>
              <tr><td className="px-6 py-4 font-medium text-gray-900">Construction Sand</td><td className="px-6 py-4 font-bold text-blue-600">{(materials?.sandCubes ?? 0).toLocaleString()}</td><td className="px-6 py-4 text-gray-500">Cubes (m³)</td></tr>
              <tr><td className="px-6 py-4 font-medium text-gray-900">Floor Tiles & Adhesives</td><td className="px-6 py-4 font-bold text-blue-600">{(materials?.floorTiles ?? 0).toLocaleString()}</td><td className="px-6 py-4 text-gray-500">m²</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SharedWorkspacePage;