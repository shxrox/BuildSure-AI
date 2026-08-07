import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../../services/project.service";

function SharingPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [emailInput, setEmailInput] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProjectSharing = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData: any = await getProjectById(id);
        if (projData) {
          setProject(projData);
          if (projData.collaborators && Array.isArray(projData.collaborators)) {
            setCollaborators(projData.collaborators);
          }
        }
      } catch (error) {
        console.error("Failed to load project sharing details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectSharing();
  }, [id]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    if (!collaborators.includes(emailInput)) {
      const updated = [...collaborators, emailInput];
      setCollaborators(updated);
      setSuccessMsg(`Invitation link generated and sent to ${emailInput}.`);
      setEmailInput("");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = window.location.href.replace("/sharing", "");
    navigator.clipboard.writeText(shareableUrl);
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🔗 Project Sharing & Collaboration</h2>
        <p className="text-gray-600">
          Share secure workspace access with contractors, engineers, and family members.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Public Share Link</h3>
        <p className="text-sm text-gray-500 mb-4">Anyone with this link can view project metrics and cost estimations.</p>
        <div className="flex gap-4">
          <input
            type="text"
            readOnly
            value={window.location.href.replace("/sharing", "")}
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite Collaborators by Email</h3>
        <form onSubmit={handleInvite} className="flex gap-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="contractor@buildsure.lk"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Send Invite
          </button>
        </form>
        {successMsg && (
          <p className="mt-3 text-xs text-green-600 font-semibold">{successMsg}</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Authorized Workspace Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{project?.owner?.email || project?.userId || "Project Owner"}</p>
              <p className="text-xs text-gray-500">Project Creator</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Owner
            </span>
          </div>

          {collaborators.map((email, idx) => (
            <div key={idx} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{email}</p>
                <p className="text-xs text-gray-500">Invited Collaborator</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                Viewer
              </span>
            </div>
          ))}

          {collaborators.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              No shared collaborators added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SharingPage;