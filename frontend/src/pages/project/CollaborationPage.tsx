import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProjectById } from "../../services/project.service";

function CollaborationPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [emailInput, setEmailInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData: any = await getProjectById(id);
        if (projData) {
          setProject(projData);
          if (projData.collaborators && Array.isArray(projData.collaborators)) {
            setMembers(projData.collaborators);
          }
        }
      } catch (error) {
        console.error("Failed to load project collaboration details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectMembers();
  }, [id]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    if (!members.includes(emailInput)) {
      const updated = [...members, emailInput];
      setMembers(updated);
      setSuccessMsg(`Successfully invited ${emailInput} to the project workspace.`);
      setEmailInput("");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading collaboration workspace...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">👥 Project Collaboration</h2>
        <p className="text-gray-600">
          Manage access permissions and invite stakeholders, contractors, or team members to review this construction project.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invite Collaborator</h3>
        <form onSubmit={handleInvite} className="flex gap-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter collaborator email address"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Invite Member
          </button>
        </form>
        {successMsg && (
          <p className="mt-3 text-xs text-green-600 font-semibold">{successMsg}</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Project Team Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{project?.owner?.email || project?.userId || "Project Owner"}</p>
              <p className="text-xs text-gray-500">Owner (Full Permissions)</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Owner
            </span>
          </div>

          {members.map((memberEmail, index) => (
            <div key={index} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{memberEmail}</p>
                <p className="text-xs text-gray-500">Collaborator (View & Estimate)</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                Editor
              </span>
            </div>
          ))}

          {members.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              No additional collaborators invited yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborationPage;