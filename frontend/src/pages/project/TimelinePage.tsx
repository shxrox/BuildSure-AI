import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";
import { Calendar, Plus, ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";

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
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span>Loading construction schedule & checklist...</span>
        </div>
      </div>
    );
  }

  const completedCount = completedMilestones.length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 selection:bg-blue-500/20">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Calendar size={13} className="text-blue-600" /> Timeline & Execution
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Construction Action Checklist
          </h2>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            Check off items as phases are executed or add custom construction tasks to track your workflow progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-900/20 cursor-pointer flex items-center gap-2"
          >
            <Plus size={15} /> {isAdding ? "Cancel" : "Add Task"}
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/sharing`)}
            className="group px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            View Sharing 
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Add Task Form Modal / Drawer */}
      {isAdding && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Add Custom Construction Task</h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Boundary wall construction"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800"
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Duration (Weeks)</label>
              <input
                type="number"
                value={newWeeks}
                onChange={(e) => setNewWeeks(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Bar Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={15} className="text-blue-600" /> Overall Checklist Progress
          </span>
          <span className="text-sm font-extrabold text-blue-600 font-mono">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs pt-1">
          <span className="text-slate-500 font-medium">{completedCount} of {totalCount} tasks completed</span>
          {message && <span className="text-emerald-600 font-bold">{message}</span>}
          {saving && <span className="text-blue-500 font-medium flex items-center gap-1"><Clock size={12} className="animate-spin" /> Saving...</span>}
        </div>
      </div>

      {/* Milestones List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {milestones.map((item, index) => {
          const isDone = completedMilestones.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleMilestone(item.id)}
              className={`p-5 flex items-center gap-4 cursor-pointer transition-colors ${
                isDone ? "bg-slate-50/60" : "hover:bg-slate-50/50 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => {}}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">Task #{index + 1}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                    <Clock size={10} /> {item.estimatedWeeks} weeks est.
                  </span>
                </div>
                <h3 className={`text-xs font-bold truncate ${isDone ? "text-slate-400 line-through" : "text-slate-900"}`}>
                  {item.title}
                </h3>
                <p className={`text-[11px] mt-0.5 leading-relaxed ${isDone ? "text-slate-400" : "text-slate-500"}`}>
                  {item.description}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 ${
                isDone ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-slate-100 text-slate-500 border border-slate-200/60"
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