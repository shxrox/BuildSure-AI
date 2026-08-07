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
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const proj = await getProjectById(id);
        if (proj && proj.completedMilestones) {
          setCompletedMilestones(proj.completedMilestones);
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
      setMessage("Milestone updated.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update milestone", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading construction schedule & timeline...
      </div>
    );
  }

  const completedCount = completedMilestones.length;
  const totalCount = DEFAULT_MILESTONES.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-955">📅 Construction Timeline & Milestones</h2>
          <p className="text-gray-600">
            Track phase-by-phase construction progress from foundation to final homeowner handover.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/sharing`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          View Sharing ➔
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Project Completion</span>
          <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completedCount} of {totalCount} construction milestones completed. {message && <span className="text-green-600 font-semibold ml-2">{message}</span>}
        </p>
      </div>

      <div className="space-y-4">
        {DEFAULT_MILESTONES.map((item, index) => {
          const isDone = completedMilestones.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleMilestone(item.id)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                isDone ? "bg-green-50/50 border-green-200 shadow-sm" : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isDone ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 border border-gray-300"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className={`font-semibold text-base ${isDone ? "text-green-900 line-through" : "text-gray-900"}`}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium">
                    Estimated Duration: {item.estimatedWeeks} weeks
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isDone ? "Completed ✓" : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelinePage;