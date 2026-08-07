import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData: any = await getProjectById(id);
        if (projData) {
          setName(projData.name || "");
          setStatus(projData.status || "PLANNING");
        }
      } catch (error) {
        console.error("Failed to load project settings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await updateProject(id, { name, status } as Record<string, any>);
      setMessage("Project settings updated successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Failed to update project settings", error);
      setMessage("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project configuration...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">⚙️ Project Settings</h2>
        <p className="text-gray-600">
          Modify core project parameters, workspace naming, and lifecycle status.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Project Phase / Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="PLANNING">Planning & Approvals</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="STRUCTURE">Structure & Framing</option>
              <option value="FINISHING">Finishing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/projects/${id}`)}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p className="text-xs font-semibold text-blue-600 mt-2">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ProjectSettings;