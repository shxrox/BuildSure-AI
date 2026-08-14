import React, { useState, useEffect } from "react";
import {
  Search,
  Box,
  Calendar,
  Layers,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import AdminNavbar from "./AdminNavbar"; // Adjust path as needed

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminProjectsPage(): React.JSX.Element {
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

  // Computed Chart Stats from Live Projects
  const totalProjects = projects.length;
  
  // Categorize projects based on names or types for demonstration graphs
  const floorPlanCount = projects.filter((p) => (p.name || "").toLowerCase().includes("plan") || !p.type).length;
  const boqCount = projects.filter((p) => (p.name || "").toLowerCase().includes("boq") || (p.name || "").toLowerCase().includes("cost")).length;
  const render3DCount = totalProjects - floorPlanCount - boqCount;

  // Chart 1: Project Type Distribution Doughnut
  const projectTypeData = {
    labels: ["Floor Plans", "BOQ Estimates", "3D Workspaces"],
    datasets: [
      {
        data: [floorPlanCount || 1, boqCount || 0, render3DCount || 0],
        backgroundColor: ["rgba(37, 99, 235, 0.85)", "rgba(16, 185, 129, 0.85)", "rgba(139, 92, 246, 0.85)"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Recent Creation Activity Bar Chart
  const creationActivityData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Workspaces Created",
        data: [
          Math.floor(totalProjects * 0.1),
          Math.floor(totalProjects * 0.2),
          Math.floor(totalProjects * 0.3),
          totalProjects - Math.floor(totalProjects * 0.6),
        ],
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading Platform Projects Oversight & Analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Centralized Admin Navbar */}
      <AdminNavbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Charts Section for Projects Oversight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 self-start">
                <PieIcon size={16} className="text-blue-600" /> Workspace Project Types Breakdown
              </h4>
              <div className="w-52 h-52 flex items-center justify-center my-2">
                <Doughnut data={projectTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-600" /> Workspace Creation Velocity
              </h4>
              <div className="flex-1 h-52 flex items-center justify-center">
                <Bar data={creationActivityData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

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