// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getProjectById, updateProject } from "../../services/project.service";

// function SharingPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [collaboratorEmail, setCollaboratorEmail] = useState("");
//   const [collaborators, setCollaborators] = useState<string[]>([]);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     const fetchSharingData = async () => {
//       if (!id) return;
//       try {
//         setLoading(true);
//         const projData = await getProjectById(id);
//         if (projData && projData.collaborators) {
//           setCollaborators(projData.collaborators);
//         }
//       } catch (error) {
//         console.error("Failed to load sharing details", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSharingData();
//   }, [id]);

//   const handleAddCollaborator = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!id || !collaboratorEmail.trim()) return;

//     if (collaborators.includes(collaboratorEmail.trim())) {
//       setMessage("Collaborator already added.");
//       return;
//     }

//     const updated = [...collaborators, collaboratorEmail.trim()];
//     setCollaborators(updated);
//     setCollaboratorEmail("");

//     try {
//       setSaving(true);
//       await updateProject(id, { collaborators: updated });
//       setMessage("Collaborator added successfully.");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       console.error("Failed to add collaborator", error);
//       setMessage("Failed to save collaborator.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleRemoveCollaborator = async (emailToRemove: string) => {
//     if (!id) return;
//     const updated = collaborators.filter((c) => c !== emailToRemove);
//     setCollaborators(updated);

//     try {
//       setSaving(true);
//       await updateProject(id, { collaborators: updated });
//       setMessage("Collaborator removed.");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       console.error("Failed to remove collaborator", error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCopyShareLink = () => {
//     const shareUrl = `${window.location.origin}/projects/${id}`;
//     navigator.clipboard.writeText(shareUrl);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 3000);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
//         Loading project sharing portal...
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 max-w-5xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">🔗 Sharing & Collaboration Access</h2>
//           <p className="text-gray-600">
//             Invite contractors, engineers, and municipal authorities to view or collaborate on this construction project.
//           </p>
//         </div>
//         <button
//           onClick={() => navigate(`/projects/${id}/settings`)}
//           className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
//         >
//           View Settings ➔
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Public Workspace Link</h3>
//           <p className="text-sm text-gray-600 mb-4">
//             Anyone with this secure link can inspect the project overview, floor plan, and material estimations.
//           </p>
//           <div className="flex gap-2">
//             <input
//               type="text"
//               readOnly
//               value={`${window.location.origin}/projects/${id}`}
//               className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-gray-600 select-all"
//             />
//             <button
//               onClick={handleCopyShareLink}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
//             >
//               {copied ? "Copied!" : "Copy Link"}
//             </button>
//           </div>
//           {copied && <p className="text-xs text-green-600 font-semibold mt-2">Secure link copied to clipboard.</p>}
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Visibility Status</h3>
//           <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg flex items-center justify-between">
//             <div>
//               <p className="font-semibold text-blue-900 text-sm">Collaborative Access Mode</p>
//               <p className="text-xs text-blue-700 mt-0.5">Active — Authorized stakeholders can view metrics.</p>
//             </div>
//             <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Secure</span>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-800 mb-4">Invited Collaborators & Stakeholders</h3>
        
//         <form onSubmit={handleAddCollaborator} className="flex gap-4 mb-6">
//           <input
//             type="email"
//             value={collaboratorEmail}
//             onChange={(e) => setCollaboratorEmail(e.target.value)}
//             placeholder="Enter contractor or engineer email (e.g. contractor@buildsure.lk)"
//             className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <button
//             type="submit"
//             disabled={saving}
//             className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
//           >
//             {saving ? "Adding..." : "Invite Collaborator"}
//           </button>
//         </form>

//         {message && <p className="text-xs font-semibold text-green-600 mb-4">{message}</p>}

//         {collaborators.length === 0 ? (
//           <p className="text-sm text-gray-500 py-4 text-center border-t border-gray-100">
//             No collaborators invited yet. Add team members above to share workspace access.
//           </p>
//         ) : (
//           <div className="divide-y divide-gray-100 border-t border-gray-100">
//             {collaborators.map((email) => (
//               <div key={email} className="py-3 flex justify-between items-center text-sm">
//                 <span className="font-medium text-gray-900">{email}</span>
//                 <button
//                   onClick={() => handleRemoveCollaborator(email)}
//                   className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
//                 >
//                   Remove Access
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default SharingPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../../services/project.service";

interface Collaborator {
  email: string;
  permission: "view" | "edit";
}

function SharingPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [collaboratorEmail, setCollaboratorEmail] = useState<string>("");
  const [collaboratorPermission, setCollaboratorPermission] = useState<"view" | "edit">("view");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Use production domain or fallback safely
  const publicShareUrl = `${window.origin}/projects/${id}/shared-workspace`;

  useEffect(() => {
    const fetchSharingData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        if (projData && projData.collaborators) {
          // Normalize legacy string arrays or objects
          const formatted = projData.collaborators.map((c: any) => 
            typeof c === "string" ? { email: c, permission: "view" } : c
          );
          setCollaborators(formatted);
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

    const emailTrimmed = collaboratorEmail.trim().toLowerCase();

    if (collaborators.some((c) => c.email.toLowerCase() === emailTrimmed)) {
      setMessage("Collaborator already added.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const updated: Collaborator[] = [
      ...collaborators,
      { email: emailTrimmed, permission: collaboratorPermission },
    ];
    setCollaborators(updated);
    setCollaboratorEmail("");

    try {
      setSaving(true);
      await updateProject(id, { collaborators: updated });
      setMessage("Collaborator invited successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to add collaborator", error);
      setMessage("Failed to save collaborator.");
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = async (emailToUpdate: string, newPermission: "view" | "edit") => {
    if (!id) return;
    const updated = collaborators.map((c) =>
      c.email === emailToUpdate ? { ...c, permission: newPermission } : c
    );
    setCollaborators(updated);

    try {
      setSaving(true);
      await updateProject(id, { collaborators: updated });
      setMessage("Permissions updated.");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to update permission", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveCollaborator = async (emailToRemove: string) => {
    if (!id) return;
    const updated = collaborators.filter((c) => c.email !== emailToRemove);
    setCollaborators(updated);

    try {
      setSaving(true);
      await updateProject(id, { collaborators: updated });
      setMessage("Collaborator removed access.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to remove collaborator", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading project collaboration portal...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔗 Sharing & Role-Based Access</h2>
          <p className="text-gray-600 text-sm mt-1">
            Manage authenticated team members, assign view or edit permissions, and share live project links.
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
        <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure Public Link</h3>
          <p className="text-xs text-gray-500 mb-4">
            Registered platform users clicking this link will authenticate and automatically sync with their granted access role.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={publicShareUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-gray-600 select-all"
            />
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 font-semibold mt-2">Public workspace link copied!</p>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Access Control Protocol</h3>
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between mt-3">
            <div>
              <p className="font-semibold text-emerald-900 text-sm">Role-Based Security Active</p>
              <p className="text-xs text-emerald-700 mt-0.5">Collaborators must log in with their registered account email.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Enforced</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Invited Team Members & Permissions</h3>
        
        <form onSubmit={handleAddCollaborator} className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="email"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            placeholder="Registered user email (e.g., engineer@buildsure.lk)"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={collaboratorPermission}
            onChange={(e) => setCollaboratorPermission(e.target.value as "view" | "edit")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-700 cursor-pointer"
          >
            <option value="view">Can View Only</option>
            <option value="edit">Can Edit Workspace</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {saving ? "Granting Access..." : "Grant Access"}
          </button>
        </form>

        {message && <p className="text-xs font-semibold text-emerald-600 mb-4">{message}</p>}

        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center border-t border-gray-100">
            No collaborators assigned. Add registered accounts above to delegate project responsibilities.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {collaborators.map((collab) => (
              <div key={collab.email} className="py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{collab.email}</p>
                  <p className="text-xs text-gray-400">Registered platform account</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <select
                    value={collab.permission}
                    onChange={(e) => handlePermissionChange(collab.email, e.target.value as "view" | "edit")}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 cursor-pointer focus:outline-none"
                  >
                    <option value="view">Viewer Mode</option>
                    <option value="edit">Editor Mode</option>
                  </select>
                  <button
                    onClick={() => handleRemoveCollaborator(collab.email)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default SharingPage;