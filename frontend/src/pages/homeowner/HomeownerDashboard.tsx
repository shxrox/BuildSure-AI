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
  ] = useState<"projects" | "activity" | "profile">("projects");

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
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "28px" }}>
            🏠 Homeowner Dashboard
          </h1>
          <p style={{ color: "#666", margin: "5px 0 0 0" }}>
            Welcome back, {user?.firstName || "Homeowner"}! Manage your Sri Lankan construction portfolios.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "#0066cc",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Create New Project
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "#f3f4f6",
              color: "#333",
              border: "1px solid #ccc",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #ddd", marginBottom: "25px", paddingBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("projects")}
          style={{
            background: activeTab === "projects" ? "#0066cc" : "transparent",
            color: activeTab === "projects" ? "white" : "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          My Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          style={{
            background: activeTab === "activity" ? "#0066cc" : "transparent",
            color: activeTab === "activity" ? "white" : "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Recent Activity & Notifications
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            background: activeTab === "profile" ? "#0066cc" : "transparent",
            color: activeTab === "profile" ? "white" : "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Profile & Settings
        </button>
      </div>

      {activeTab === "projects" && (
        <div>
          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search by project name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "white",
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNING">Planning</option>
              <option value="FOUNDATION">Foundation</option>
              <option value="STRUCTURE">Structure</option>
              <option value="FINISHING">Finishing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {loading && (
            <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
              Loading your construction projects...
            </p>
          )}

          {!loading && filteredProjects.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px", border: "2px dashed #ddd", borderRadius: "8px" }}>
              <h3>No construction projects found.</h3>
              <p style={{ color: "#666" }}>Get started by creating your first workspace blueprint.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  marginTop: "15px",
                  background: "#0066cc",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Create Project
              </button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                style={{
                  border: "1px solid #e1e4e8",
                  borderRadius: "8px",
                  padding: "20px",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#1a1a1a" }}>
                    {project.projectName}
                  </h3>
                  <span
                    style={{
                      background: "#eef2ff",
                      color: "#3730a3",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {project.status || "PLANNING"}
                  </span>
                </div>

                <p style={{ color: "#555", fontSize: "14px", margin: "0 0 15px 0", minHeight: "40px" }}>
                  {project.description || "No description provided."}
                </p>

                <div style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
                  <p style={{ margin: "4px 0" }}>📍 Location: {project.location}</p>
                  <p style={{ margin: "4px 0" }}>📅 Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "12px" }}>
                  <span style={{ color: "#0066cc", fontWeight: "bold", fontSize: "13px" }}>
                    Open Workspace →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div style={{ background: "white", padding: "25px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>Recent System Activities & Alerts</h3>
          <ul style={{ paddingLeft: "20px", color: "#444", lineHeight: "1.8" }}>
            <li>Digital floor plan wall configuration verified successfully.</li>
            <li>Sri Lankan material cost estimation indexes updated to current LKR standards.</li>
            <li>Collaboration access link generated for project review.</li>
          </ul>
        </div>
      )}

      {activeTab === "profile" && (
        <div style={{ background: "white", padding: "25px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h3>User Profile & Account Information</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", margin: "20px 0" }}>
            {user?.imageUrl && (
              <img
                src={user.imageUrl}
                alt="Profile"
                width="80"
                height="80"
                style={{ borderRadius: "50%" }}
              />
            )}
            <div>
              <p style={{ margin: "4px 0", fontWeight: "bold", fontSize: "16px" }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p style={{ margin: "4px 0", color: "#666" }}>{user?.email}</p>
              <p style={{ margin: "4px 0", color: "#0066cc", fontWeight: "600" }}>Role: {user?.role}</p>
            </div>
          </div>

          <div style={{ marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "#f3f4f6",
                color: "#333",
                border: "1px solid #ccc",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Sign Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "8px", width: "100%", maxWidth: "450px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Create New Construction Project</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Colombo Luxury Duplex"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>Location / City</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Colombo, Sri Lanka"
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of architectural goals..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", height: "80px", resize: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: "#e5e7eb", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={creatingProject}
                  style={{ background: "#0066cc", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                  {creatingProject ? "Creating..." : "Save & Open Workspace"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "8px", width: "100%", maxWidth: "400px" }}>
            <h3 style={{ color: "#dc2626", marginTop: 0 }}>Confirm Account Deletion</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Type <strong>DELETE</strong> below to permanently erase your profile and all associated data.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", marginBottom: "15px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                style={{ background: "#e5e7eb", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText !== "DELETE"}
                style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", opacity: deleteConfirmText !== "DELETE" ? 0.5 : 1 }}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeownerDashboard;