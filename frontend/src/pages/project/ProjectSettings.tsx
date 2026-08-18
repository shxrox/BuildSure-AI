

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject, deleteProject } from "../../services/project.service";
import { Settings, Trash2, Save, Sparkles, CheckCircle2, AlertTriangle, Building2, MapPin, FileText } from "lucide-react";

function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const proj = await getProjectById(id);
        if (proj) {
          setProjectName(proj.projectName || "");
          setLocation(proj.location || "");
          setStatus(proj.status || "PLANNING");
          setDescription(proj.description || "");
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
        status,
        description,
      });
      setMessage("Project settings updated successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update project settings", error);
      setMessage("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to permanently delete this project workspace? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProject(id);
      navigate("/homeowner");
    } catch (error) {
      console.error("Failed to delete project", error);
      setMessage("Failed to delete project workspace.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span>Loading project configuration settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 selection:bg-blue-500/20">
      
      {/* Banner Card Header */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Settings size={13} className="text-blue-600" /> Workspace Settings
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Project Configuration
          </h2>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            Update core project parameters, architectural lifecycle status, or manage workspace deletion parameters.
          </p>
        </div>
      </div>

      {/* General Information Form */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 size={15} className="text-blue-600" /> General Information
        </h3>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                />
                <Building2 size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Location / City</label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 text-slate-800"
                />
                <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Construction Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-blue-500 text-slate-800 cursor-pointer"
            >
              <option value="PLANNING">Planning</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="STRUCTURAL">Structural</option>
              <option value="ROOFING">Roofing</option>
              <option value="FINISHING">Finishing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs focus:outline-none focus:border-blue-500 text-slate-800 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Save size={14} /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>
            {message && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                <CheckCircle2 size={14} /> {message}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/60 p-6 md:p-8 rounded-2xl border border-red-200 space-y-4">
        <h3 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-600" /> Danger Zone
        </h3>
        <p className="text-xs text-red-700 max-w-2xl leading-relaxed">
          Permanently remove this construction project workspace, floor plans, blueprints, and financial tracking data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteProject}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer flex items-center gap-2"
        >
          <Trash2 size={14} /> Delete Project Workspace
        </button>
      </div>

    </div>
  );
}

export default ProjectSettings;