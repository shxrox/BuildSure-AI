import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

function SharingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSharingData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);
        if (projData && projData.collaborators) {
          setCollaborators(projData.collaborators);
        }
      } catch (error) {
        console.error("Failed to load sharing details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharingData();
  }, [id]);

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !collaboratorEmail.trim()) return;

    if (collaborators.includes(collaboratorEmail.trim())) {
      setMessage("Collaborator already added.");
      return;
    }

    const updated = [...collaborators, collaboratorEmail.trim()];
    setCollaborators(updated);
    setCollaboratorEmail("");

    try {
      setSaving(true);
      await updateProject(id, { collaborators: updated });
      setMessage("Collaborator added successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to add collaborator", error);
      setMessage("Failed to save collaborator.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCollaborator = async (emailToRemove: string) => {
    if (!id) return;
    const updated = collaborators.filter((c) => c !== emailToRemove);
    setCollaborators(updated);

    try {
      setSaving(true);
      await updateProject(id, { collaborators: updated });
      setMessage("Collaborator removed.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to remove collaborator", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/projects/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project sharing portal...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔗 Sharing & Collaboration Access</h2>
          <p className="text-gray-600">
            Invite contractors, engineers, and municipal authorities to view or collaborate on this construction project.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/settings`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          View Settings ➔
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Public Workspace Link</h3>
          <p className="text-sm text-gray-600 mb-4">
            Anyone with this secure link can inspect the project overview, floor plan, and material estimations.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/projects/${id}`}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-gray-600 select-all"
            />
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 font-semibold mt-2">Secure link copied to clipboard.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Visibility Status</h3>
          <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 text-sm">Collaborative Access Mode</p>
              <p className="text-xs text-blue-700 mt-0.5">Active — Authorized stakeholders can view metrics.</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Secure</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invited Collaborators & Stakeholders</h3>
        
        <form onSubmit={handleAddCollaborator} className="flex gap-4 mb-6">
          <input
            type="email"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            placeholder="Enter contractor or engineer email (e.g. contractor@buildsure.lk)"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {saving ? "Adding..." : "Invite Collaborator"}
          </button>
        </form>

        {message && <p className="text-xs font-semibold text-green-600 mb-4">{message}</p>}

        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center border-t border-gray-100">
            No collaborators invited yet. Add team members above to share workspace access.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {collaborators.map((email) => (
              <div key={email} className="py-3 flex justify-between items-center text-sm">
                <span className="font-medium text-gray-900">{email}</span>
                <button
                  onClick={() => handleRemoveCollaborator(email)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Remove Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SharingPage;