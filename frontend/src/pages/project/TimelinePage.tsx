import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

const CONSTRUCTION_MILESTONES = [
  { id: "planning", label: "Planning & Approvals", description: "Blueprint design, BOQ calculation, and regulatory permits." },
  { id: "foundation", label: "Foundation & Excavation", description: "Site clearing, excavation, damp-proof course (DPC), and concreting." },
  { id: "structure", label: "Structural Framework", description: "Columns, beams, slab casting, and brick wall masonry." },
  { id: "roof", label: "Roofing & Framing", description: "Roof trusses, purlins, and tile or sheet installation." },
  { id: "electrical", label: "Electrical Wiring", description: "Conduit piping, wall chasing, and main distribution box setup." },
  { id: "plumbing", label: "Plumbing & Drainage", description: "Water supply lines, sewage pipe layout, and underground drainage." },
  { id: "finishing", label: "Finishing & Painting", description: "Plastering, floor tiling, door/window fitting, and interior/exterior paint." },
];

function TimelinePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(["planning"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const project: any = await getProjectById(id);
        if (project && project.completedMilestones) {
          setCompletedMilestones(project.completedMilestones);
        }
      } catch (error) {
        console.error("Failed to load project progress", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
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
      // Type assertion as Record<string, any> to satisfy TypeScript compiler
      await updateProject(id, { completedMilestones: updated } as Record<string, any>);
    } catch (error) {
      console.error("Failed to update milestone progress", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading construction timeline...
      </div>
    );
  }

  const progressPercentage = Math.round((completedMilestones.length / CONSTRUCTION_MILESTONES.length) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📅 Construction Timeline & Progress Tracker</h2>
          <p className="text-gray-600">
            Track physical site milestones from initial architectural planning down to final finishing.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{progressPercentage}%</span>
          <p className="text-xs text-gray-500 uppercase font-semibold">Completed</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {saving && <p className="text-xs text-blue-500 mb-4 font-semibold">Saving progress update...</p>}

      <div className="space-y-4">
        {CONSTRUCTION_MILESTONES.map((milestone, index) => {
          const isCompleted = completedMilestones.includes(milestone.id);

          return (
            <div
              key={milestone.id}
              onClick={() => toggleMilestone(milestone.id)}
              className={`p-5 rounded-lg border transition-all cursor-pointer flex items-start gap-4 ${
                isCompleted 
                  ? "bg-blue-50/50 border-blue-200 shadow-sm" 
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0 ${
                isCompleted ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {isCompleted ? "✓" : index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold text-base ${isCompleted ? "text-blue-900" : "text-gray-900"}`}>
                    {milestone.label}
                  </h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isCompleted ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelinePage;