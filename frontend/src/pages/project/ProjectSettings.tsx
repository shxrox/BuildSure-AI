import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject, deleteProject } from "../../services/project.service";

function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        if (projData) {
          setProjectName(projData.projectName || "");
          setLocation(projData.location || "");
          setDescription(projData.description || "");
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      await updateProject(id, {
        projectName,
        location,
        description,
        status,
      });
      setMessage("Project settings updated successfully.");
      setTimeout(() => setMessage(""), 4000);
    } catch (error) {
      console.error("Failed to update project settings", error);
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to permanently delete this construction project workspace?")) return;

    try {
      await deleteProject(id);
      navigate("/homeowner");
    } catch (error) {
      console.error("Failed to delete project", error);
      setMessage("Failed to delete project.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project configuration settings...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Project Settings & Configuration</h2>
          <p className="text-gray-600">
            Update core project parameters, architectural status, or delete the workspace.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">General Information</h3>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location / City</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Construction Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PLANNING">Planning</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="STRUCTURE">Structure</option>
              <option value="FINISHING">Finishing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            {message ? <span className="text-xs font-semibold text-green-600">{message}</span> : <span />}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Permanently remove this construction project workspace, floor plans, and financial tracking data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteProject}
          className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer transition-colors"
        >
          Delete Project Workspace
        </button>
      </div>
    </div>
  );
}

export default ProjectSettings;