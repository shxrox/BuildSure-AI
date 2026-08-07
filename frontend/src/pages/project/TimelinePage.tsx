import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

const CONSTRUCTION_TIMELINE_PHASES = [
  { id: "planning", title: "Phase 1: Planning, Approvals & Estimations", duration: "2-4 Weeks", desc: "Architectural blueprinting, municipal approvals, BOQ calculations, and budget finalization." },
  { id: "foundation", title: "Phase 2: Site Preparation & Foundation", duration: "3-5 Weeks", desc: "Land clearing, excavation, foundation footings, damp-proof course (DPC), and concrete slab casting." },
  { id: "structure", title: "Phase 3: Structural Framing & Brickwork", duration: "6-8 Weeks", desc: "Column raising, beam casting, exterior/interior brick masonry work, and lintel construction." },
  { id: "roof", title: "Phase 4: Roofing & Timber/Steel Trusses", duration: "3-4 Weeks", desc: "Roof framing installation, tile laying or asbestos/zinc-aluminum sheeting, and gutter placement." },
  { id: "electrical", title: "Phase 5: Electrical & Plumbing Rough-ins", duration: "3-4 Weeks", desc: "Conduit pipe laying for electrical wiring, water supply piping, and drainage system setup." },
  { id: "finishing", title: "Phase 6: Plastering, Flooring & Painting", duration: "5-7 Weeks", desc: "Internal/external wall plastering, floor tiling, ceiling installation, fixture fittings, and painting." },
];

function TimelinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        if (projData && projData.completedMilestones) {
          setCompletedPhases(projData.completedMilestones);
        } else {
          setCompletedPhases(["planning"]);
        }
      } catch (error) {
        console.error("Failed to load project timeline", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [id]);

  const togglePhase = async (phaseId: string) => {
    if (!id) return;
    let updated: string[];
    if (completedPhases.includes(phaseId)) {
      updated = completedPhases.filter((p) => p !== phaseId);
    } else {
      updated = [...completedPhases, phaseId];
    }

    setCompletedPhases(updated);

    try {
      setSaving(true);
      await updateProject(id, { completedMilestones: updated });
      setMessage("Milestone progress updated.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update milestone progress", error);
      setMessage("Failed to sync progress.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading construction timeline schedule...
      </div>
    );
  }

  const progressPercent = Math.round((completedPhases.length / CONSTRUCTION_TIMELINE_PHASES.length) * 100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Construction Timeline & Milestone Tracker</h2>
          <p className="text-gray-600">
            Monitor phase-by-phase building progress based on Sri Lankan residential construction standards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-xs font-semibold text-green-600">{message}</span>}
          <button
            onClick={() => navigate(`/projects/${id}/sharing`)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
          >
            View Sharing Portal ➔
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Overall Construction Progress</span>
          <span className="text-sm font-bold text-blue-600">{progressPercent}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {CONSTRUCTION_TIMELINE_PHASES.map((phase, index) => {
          const isCompleted = completedPhases.includes(phase.id);
          return (
            <div
              key={phase.id}
              onClick={() => togglePhase(phase.id)}
              className={`p-6 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                isCompleted
                  ? "bg-blue-50/40 border-blue-200 shadow-sm"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => {}}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className={`text-base font-bold ${isCompleted ? "text-blue-900 line-through opacity-80" : "text-gray-900"}`}>
                    {phase.title}
                  </h3>
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {phase.duration}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{phase.desc}</p>
              </div>
              <div className="self-center">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {isCompleted ? "Completed" : `Phase ${index + 1}`}
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