import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlueprintCanvas from "../../components/blueprint/BlueprintCanvas";
import { getDigitalPlan, saveDigitalPlan } from "../../services/project.service";

function FloorPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [walls, setWalls] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [doors, setDoors] = useState<any[]>([]);
  const [windows, setWindows] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getDigitalPlan(id);
        if (plan) {
          if (plan.walls) setWalls(plan.walls);
          if (plan.rooms) setRooms(plan.rooms);
          if (plan.doors) setDoors(plan.doors);
          if (plan.windows) setWindows(plan.windows);
        }
      } catch (error) {
        console.error("Failed to load digital floor plan", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  const handleSavePlan = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await saveDigitalPlan(id, { walls, rooms, doors, windows });
      setMessage("Floor plan saved successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Failed to save digital plan", error);
      setMessage("Failed to save floor plan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading 2D floor plan workspace...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📐 Interactive 2D Floor Plan Workspace</h2>
          <p className="text-gray-600 text-sm">
            Draw precise architectural walls, rooms, doors, and windows with real-time metric scaling (100px = 1m).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs font-semibold text-green-600">{message}</span>}
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
          >
            {saving ? "Saving Plan..." : "Save Floor Plan"}
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/boq`)}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
          >
            View BOQ ➔
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm relative">
        <BlueprintCanvas
          walls={walls}
          setWalls={setWalls}
          rooms={rooms}
          setRooms={setRooms}
          doors={doors}
          setDoors={setDoors}
          windows={windows}
          setWindows={setWindows}
        />
      </div>
    </div>
  );
}

export default FloorPlanPage;