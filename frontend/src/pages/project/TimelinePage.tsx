import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", title: "Excavation & Site Preparation", description: "Clearing land, soil testing, and foundation excavation.", estimatedWeeks: 2 },
  { id: "2", title: "Foundation & Footings", description: "Concreting foundation beds, damp-proof course (DPC), and columns.", estimatedWeeks: 3 },
  { id: "3", title: "Structural Brickwork & Walls", description: "Laying brick walls up to lintel level and roof beam casting.", estimatedWeeks: 4 },
  { id: "4", title: "Roofing & Timber Framing", description: "Installing roof trusses, tiles, and rainwater gutters.", estimatedWeeks: 3 },
  { id: "5", title: "Electrical & Plumbing Rough-ins", description: "Concealed piping, wiring, and conduit installations.", estimatedWeeks: 3 },
  { id: "6", title: "Plastering & Finishes", description: "Interior and exterior wall plastering, ceiling, and flooring.", estimatedWeeks: 4 },
  { id: "7", title: "Painting, Fixtures & Handover", description: "Final painting, bathroom fittings, lighting, and handover.", estimatedWeeks: 3 },
];

function TimelinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newWeeks, setNewWeeks] = useState(2);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const proj = await getProjectById(id);
        if (proj && proj.completedMilestones) {
          setCompletedMilestones(proj.completedMilestones);
        }
        if (proj && proj.customMilestones && Array.isArray(proj.customMilestones)) {
          setMilestones([...DEFAULT_MILESTONES, ...proj.customMilestones]);
        }
      } catch (error) {
        console.error("Failed to load project timeline", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [id]);

  const toggleMilestone = async (milestoneId: string) => {
    if (!id) return;
    let updated: string[];
    if (completedMilestones.includes(milestoneId)) {
      updated = completedMilestones.filter((m) => m !== milestoneId);
    } else {
      updated = [...completedMilestones, milestoneId];
    }
    setCompletedMilestones(updated);

    try {
      setSaving(true);
      await updateProject(id, { completedMilestones: updated });
      setMessage("Progress updated.");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to update milestone", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTitle.trim()) return;

    const newTask: Milestone = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      description: newDesc.trim() || "Custom project task.",
      estimatedWeeks: Number(newWeeks) || 1,
    };

    const updatedMilestonesList = [...milestones, newTask];
    setMilestones(updatedMilestonesList);

    const customOnly = updatedMilestonesList.slice(DEFAULT_MILESTONES.length);

    try {
      setSaving(true);
      await updateProject(id, { customMilestones: customOnly });
      setNewTitle("");
      setNewDesc("");
      setNewWeeks(2);
      setIsAdding(false);
      setMessage("Task added successfully.");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to add custom task", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 font-medium text-xs">
        Loading construction schedule & checklist...
      </div>
    );
  }

  const completedCount = completedMilestones.length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">📅 Construction Action Checklist</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Check off items as phases are executed or add custom tasks to track overall workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors shadow-xs"
          >
            {isAdding ? "Cancel" : "+ Add Task"}
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/sharing`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors shadow-xs"
          >
            View Sharing ➔
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Add Custom Construction Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Boundary wall construction"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description of work"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration (Weeks)</label>
              <input
                type="number"
                value={newWeeks}
                onChange={(e) => setNewWeeks(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Overall Checklist Progress</span>
          <span className="text-xs font-extrabold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex justify-between items-center">
          <span>{completedCount} of {totalCount} tasks completed</span>
          {message && <span className="text-emerald-600 font-bold">{message}</span>}
          {saving && <span className="text-blue-500 font-medium">Saving...</span>}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {milestones.map((item, index) => {
          const isDone = completedMilestones.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleMilestone(item.id)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                isDone ? "bg-slate-50/60" : "hover:bg-slate-50/40 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => {}}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">Task #{index + 1}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    {item.estimatedWeeks} weeks est.
                  </span>
                </div>
                <h3 className={`text-xs font-bold mt-0.5 ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>
                  {item.title}
                </h3>
                <p className={`text-[11px] mt-0.5 ${isDone ? "text-slate-400" : "text-slate-500"}`}>
                  {item.description}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                isDone ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}>
                {isDone ? "Done" : "To Do"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelinePage;