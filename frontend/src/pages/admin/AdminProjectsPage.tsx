import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  TrendingUp,
  ShieldAlert,
  LogOut,
  DollarSign,
  Search,
  Box,
  Calendar,
  Layers,
} from "lucide-react";

export default function AdminProjectsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchProjectsOverview();
  }, []);

  const fetchProjectsOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/projects`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch projects oversight list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading Platform Projects Oversight...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">BuildSure Admin</h1>
              <p className="text-[10px] text-slate-400 font-medium">Project & Workspace Oversight</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-200 shadow-xs"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex gap-2 text-xs font-semibold overflow-x-auto pt-2 border-t border-slate-100">
          <button onClick={() => navigate("/admin/analytics")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <TrendingUp size={15} /> Analytics & Growth
          </button>
          <button onClick={() => navigate("/admin/financials")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <DollarSign size={15} /> Financials & Payments
          </button>
          <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <Users size={15} /> User Accounts
          </button>
          <button onClick={() => navigate("/admin/projects")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-md cursor-pointer">
            <FolderKanban size={15} /> Projects Oversight
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Projects Oversight Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search projects or owner email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Total Tracked Workspaces: {projects.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Project Title</th>
                    <th className="p-4">Workspace Owner</th>
                    <th className="p-4">Components</th>
                    <th className="p-4">Creation Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No user workspace projects created across the platform yet.
                      </td>
                    </tr>
                  ) : (
                    projects
                      .filter(
                        (p) =>
                          (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.ownerId?.email && p.ownerId.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((proj) => (
                        <tr key={proj._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                            <Box size={15} className="text-blue-600" />
                            {proj.name || "Untitled Workspace Plan"}
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {proj.ownerId?.email || "Unknown / Deleted User"}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {proj.ownerId?.firstName || ""}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                              <Layers size={14} className="text-slate-400" /> Digital Floor Plan Active
                            </span>
                          </td>
                          <td className="p-4 text-slate-500 flex items-center gap-1.5">
                            <Calendar size={13} className="text-slate-400" />
                            {new Date(proj.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}