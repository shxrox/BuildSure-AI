import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDigitalPlan, saveDigitalPlan } from "../../services/project.service";

function FloorPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [walls, setWalls] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [doors, setDoors] = useState<any[]>([]);
  const [windows, setWindows] = useState<any[]>([]);

  const [tool, setTool] = useState<"wall" | "door" | "window" | "room">("wall");
  const [drawing, setDrawing] = useState(false);
  const [currentWallStart, setCurrentWallStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getDigitalPlan(id);
        if (plan) {
          setWalls(plan.walls || []);
          setRooms(plan.rooms || []);
          setDoors(plan.doors || []);
          setWindows(plan.windows || []);
        }
      } catch (error) {
        console.error("Failed to load digital floor plan", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    rooms.forEach((room) => {
      ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
      ctx.strokeStyle = "rgba(59, 130, 246, 0.3)";
      ctx.lineWidth = 2;
      if (room.points && room.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(room.points[0].x, room.points[0].y);
        for (let i = 1; i < room.points.length; i++) {
          ctx.lineTo(room.points[i].x, room.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 6;
    walls.forEach((wall) => {
      ctx.beginPath();
      ctx.moveTo(wall.startX, wall.startY);
      ctx.lineTo(wall.endX, wall.endY);
      ctx.stroke();
    });

    ctx.fillStyle = "#2563eb";
    doors.forEach((door) => {
      ctx.fillRect(door.x - 6, door.y - 6, 12, 12);
    });

    ctx.fillStyle = "#059669";
    windows.forEach((win) => {
      ctx.fillRect(win.x - 6, win.y - 6, 12, 12);
    });
  }, [walls, rooms, doors, windows]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "wall") {
      if (!drawing) {
        setCurrentWallStart({ x, y });
        setDrawing(true);
      } else {
        if (currentWallStart) {
          const newWall = {
            id: Date.now().toString(),
            startX: currentWallStart.x,
            startY: currentWallStart.y,
            endX: x,
            endY: y,
            thickness: 200,
            height: 3.0,
          };
          setWalls([...walls, newWall]);
        }
        setDrawing(false);
        setCurrentWallStart(null);
      }
    } else if (tool === "door") {
      const newDoor = {
        id: Date.now().toString(),
        x,
        y,
        width: 900,
      };
      setDoors([...doors, newDoor]);
    } else if (tool === "window") {
      const newWin = {
        id: Date.now().toString(),
        x,
        y,
        width: 1200,
      };
      setWindows([...windows, newWin]);
    } else if (tool === "room") {
      const newRoom = {
        id: Date.now().toString(),
        name: `Room ${rooms.length + 1}`,
        points: [
          { x: x - 50, y: y - 50 },
          { x: x + 50, y: y - 50 },
          { x: x + 50, y: y + 50 },
          { x: x - 50, y: y + 50 },
        ],
        areaSqm: 25,
      };
      setRooms([...rooms, newRoom]);
    }
  };

  const handleSavePlan = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await saveDigitalPlan(id, { walls, rooms, doors, windows });
      setMessage("Digital floor plan saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save digital plan", error);
      setMessage("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearPlan = () => {
    if (!window.confirm("Clear all canvas elements?")) return;
    setWalls([]);
    setRooms([]);
    setDoors([]);
    setWindows([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading 2D floor plan canvas...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📐 2D Floor Plan CAD Workspace</h2>
          <p className="text-gray-600">
            Design structural walls, insert door/window openings, and map rooms to compute precise BOQ.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs font-semibold text-green-600">{message}</span>}
          <button
            onClick={handleClearPlan}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving Plan..." : "Save Plan"}
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/boq`)}
            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 cursor-pointer transition-colors"
          >
            View BOQ ➔
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTool("wall")}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tool === "wall" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Draw Wall
        </button>
        <button
          onClick={() => setTool("door")}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tool === "door" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Add Door
        </button>
        <button
          onClick={() => setTool("window")}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tool === "window" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Add Window
        </button>
        <button
          onClick={() => setTool("room")}
          className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            tool === "room" ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Add Room Zone
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex justify-center p-4">
        <canvas
          ref={canvasRef}
          width={900}
          height={550}
          onMouseDown={handleCanvasMouseDown}
          className="border border-gray-300 bg-white cursor-crosshair rounded-lg"
        />
      </div>
    </div>
  );
}

export default FloorPlanPage;