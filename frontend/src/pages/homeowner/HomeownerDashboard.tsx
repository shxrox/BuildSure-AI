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

import { 
  Building2, Plus, LogOut, Search, SlidersHorizontal, 
  User, Trash2, ArrowRight, Sparkles, Layers, MapPin, Calendar 
} from "lucide-react";
import logo from "../../assets/LOGO.png";

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

  const isProUser = 
    (user as any)?.subscription === "PRO" || 
    (user as any)?.publicMetadata?.subscription === "PRO" || 
    (user as any)?.public_metadata?.subscription === "PRO";

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative overflow-x-hidden selection:bg-blue-500/20 pb-20">
      
      {/* ===== AMBIENT BACKGROUND GLOWS ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-400/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/6 rounded-full blur-[100px]" />
      </div>

      {/* ===== FLOATING NAVIGATION BAR ===== */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="backdrop-blur-xl bg-white/75 border border-slate-200/60 rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl shadow-slate-300/20">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300 bg-white border border-slate-200/60">
              <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">BuildSure-AI</h1>
              <p className="text-[10px] text-slate-500 font-medium">Homeowner Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> New Project
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-all shadow-sm cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="relative z-10 max-w-6xl mx-auto pt-32 px-6">
        
        {/* Welcome Header Banner - Matching Homepage Light Aesthetic */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-8 md:p-10 shadow-xl shadow-slate-200/40 mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-full px-4 py-1.5 mb-4">
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Live Project Supervisor</span>
                {isProUser && (
                  <span className="bg-purple-100 border border-purple-200 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">
                    PRO Workspace
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                Welcome back, {user?.firstName || "Homeowner"}!
              </h1>
              <p className="text-slate-500 text-xs md:text-sm max-w-xl leading-relaxed">
                Manage your construction portfolios, track milestone project timelines, and supervise exact material quantities.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} /> Create New Project
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200/80 mb-8 pb-3">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Building2 size={15} />
            My Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "profile"
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <User size={15} />
            Profile & Settings
          </button>
        </div>

        {/* TAB 1: PROJECTS */}
        {activeTab === "projects" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by project name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-lg shadow-slate-200/30 text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-11 pr-8 py-3 bg-white border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:border-blue-500 shadow-lg shadow-slate-200/30 cursor-pointer text-slate-700 font-semibold appearance-none"
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
            </div>

            {loading && (
              <div className="flex items-center justify-center h-48 bg-white rounded-3xl border border-slate-200/80 text-slate-400 font-medium text-xs shadow-lg shadow-slate-200/20">
                Loading your construction projects...
              </div>
            )}

            {!loading && filteredProjects.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-xl shadow-slate-200/30 p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-4">
                  <Layers size={26} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">No construction projects found.</h3>
                <p className="text-slate-500 text-xs mb-6">Get started by creating your first workspace blueprint.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg shadow-slate-900/20"
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
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl shadow-slate-200/30 hover:border-blue-500 hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {project.projectName}
                      </h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap">
                        {project.status || "PLANNING"}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed">
                      {project.description || "No description provided."}
                    </p>

                    <div className="text-[11px] text-slate-400 space-y-2 mb-6 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                    <span className="text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Open Workspace <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & SETTINGS */}
        {activeTab === "profile" && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/30">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={15} className="text-blue-600" /> User Profile & Account Information
            </h3>
            
            <div className="flex items-center gap-5 mb-8">
              {user?.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-md"
                />
              )}
              <div>
                <div className="flex items-center gap-2.5">
                  <p className="text-base font-bold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  {isProUser && (
                    <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      PRO Subscriber
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">Role: {(user as any)?.role || "Homeowner"}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-2"
              >
                <LogOut size={14} /> Sign Out
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        )}

        {/* CREATE PROJECT MODAL */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Create New Construction Project</h3>
                <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 font-bold px-2 py-0.5 rounded-md">Blueprint Studio</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Colombo Luxury Duplex"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium text-slate-800"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary of architectural goals..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs h-24 resize-none focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateProject}
                    disabled={creatingProject}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50"
                  >
                    {creatingProject ? "Creating..." : "Save & Open Workspace"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE ACCOUNT MODAL */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">Confirm Account Deletion</h3>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed">
                Type <strong className="text-slate-900 font-bold">DELETE</strong> below to permanently erase your profile and all associated data.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 mb-6 font-semibold text-slate-900"
                autoFocus
              />
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmText !== "DELETE"}
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg shadow-red-600/25 disabled:opacity-50"
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