import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useClerk,
} from "@clerk/clerk-react";

import {
  useUserContext,
} from "../../context/AuthContext";

import {
  getProjects,
  createProject,
} from "../../services/project.service";

import {
  deleteAccount,
} from "../../services/user.service";

import type {
  Project,
} from "../../services/project.service";

function HomeownerDashboard() {
  const {
    user,
  } = useUserContext();

  const {
    signOut,
  } = useClerk();

  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    filteredProjects,
    setFilteredProjects,
  ] = useState<Project[]>([]);

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const navigate = useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    projectName,
    setProjectName,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    creatingProject,
    setCreatingProject,
  ] = useState(false);

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deleteConfirmText,
    setDeleteConfirmText,
  ] = useState("");

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    activeTab,
    setActiveTab,
  ] = useState<"projects" | "profile">("projects");

  const loadProjects =
    async () => {
      try {
        setLoading(true);
        const data =
          await getProjects();

        setProjects(
          data || []
        );
        setFilteredProjects(
          data || []
        );
      } catch (error) {
        console.log(
          "Failed to load projects",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    let result = projects;

    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (p) => p.status === statusFilter
      );
    }

    setFilteredProjects(result);
  }, [searchQuery, statusFilter, projects]);

  const handleLogout =
    async () => {
      await signOut({
        redirectUrl: "/",
      });
    };

  const handleCreateProject =
    async () => {
      if (
        !projectName ||
        !location ||
        !description
      ) {
        return;
      }

      try {
        setCreatingProject(true);

        const newProject = await createProject({
          projectName,
          location,
          description,
        });

        setProjectName("");
        setLocation("");
        setDescription("");
        setShowCreateModal(false);

        if (newProject && newProject._id) {
          navigate(`/projects/${newProject._id}`);
        } else {
          await loadProjects();
        }
      } catch (error) {
        console.log(
          "Failed to create project",
          error
        );
      } finally {
        setCreatingProject(false);
      }
    };

  const handleDeleteAccount =
    async () => {
      if (
        deleteConfirmText !== "DELETE"
      ) {
        return;
      }

      try {
        setDeleting(true);

        await deleteAccount();

        await signOut({
          redirectUrl: "/",
        });
      } catch (error) {
        console.log(
          "Failed to delete account",
          error
        );
        setDeleting(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
              Homeowner Dashboard
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Welcome back, {user?.firstName || "Homeowner"}. Manage your construction portfolios and project timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              + Create New Project
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 mb-8 pb-2">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-transparent text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            My Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-transparent text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            Profile & Settings
          </button>
        </div>

        {activeTab === "projects" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Search by project name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-xs"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer text-slate-700 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLANNING">Planning</option>
                <option value="FOUNDATION">Foundation</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="ROOFING">Roofing</option>
                <option value="FINISHING">Finishing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {loading && (
              <div className="flex items-center justify-center h-48 text-slate-400 font-medium text-xs">
                Loading your construction projects...
              </div>
            )}

            {!loading && filteredProjects.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800">No construction projects found.</h3>
                <p className="text-slate-400 text-xs mt-1 mb-4">Get started by creating your first workspace blueprint.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Create Project
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.projectName}
                      </h3>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap">
                        {project.status || "PLANNING"}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    <div className="text-[11px] text-slate-400 space-y-1 mb-6 border-t border-slate-100 pt-4">
                      <p className="font-medium text-slate-600">Location: {project.location}</p>
                      <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                    <span className="text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      Open Workspace &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3">User Profile & Account Information</h3>
            <div className="flex items-center gap-5 mb-8">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">Role: {user?.role}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Create New Construction Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Colombo Luxury Duplex"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / City</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Colombo, Sri Lanka"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary of architectural goals..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs h-24 resize-none focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    disabled={creatingProject}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                  >
                    {creatingProject ? "Creating..." : "Save & Open Workspace"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-xl border border-slate-200">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">Confirm Account Deletion</h3>
              <p className="text-slate-500 text-xs mb-4 leading-relaxed">
                Type <strong className="text-slate-800">DELETE</strong> below to permanently erase your profile and all associated data.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 mb-6"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== "DELETE"}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeownerDashboard;