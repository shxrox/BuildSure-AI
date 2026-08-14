import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  TrendingUp,
  ShieldAlert,
  LogOut,
  BarChart3,
  UserPlus,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  activeProUsers: number;
  freeUsers: number;
  newSignupsLast30Days: number;
}

export default function AdminAnalyticsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/analytics/growth`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
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

  // Chart 1: MAU & DAU Trend Mock Data (Driven by live total users)
  const mauDauData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Monthly Active Users (MAU)",
        data: [
          Math.max(10, (analytics?.totalUsers || 10) - 15),
          Math.max(15, (analytics?.totalUsers || 10) - 8),
          Math.max(20, (analytics?.totalUsers || 10) - 3),
          analytics?.totalUsers || 10,
        ],
        borderColor: "rgb(37, 99, 235)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Daily Active Users (DAU)",
        data: [
          Math.floor((analytics?.totalUsers || 5) * 0.3),
          Math.floor((analytics?.totalUsers || 5) * 0.4),
          Math.floor((analytics?.totalUsers || 5) * 0.5),
          Math.floor((analytics?.totalUsers || 5) * 0.65),
        ],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart 2: Free vs Pro Conversion Growth Curve
  const conversionData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Current"],
    datasets: [
      {
        label: "Free Tier Users",
        data: [12, 19, 25, 40, 55, analytics?.freeUsers || 30],
        backgroundColor: "rgba(148, 163, 184, 0.7)",
      },
      {
        label: "Pro Subscribers",
        data: [2, 5, 8, 14, 22, analytics?.activeProUsers || 10],
        backgroundColor: "rgba(139, 92, 246, 0.85)",
      },
    ],
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading Analytics & Growth Dashboard...
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
              <p className="text-[10px] text-slate-400 font-medium">Platform Analytics & Growth</p>
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
          <button onClick={() => navigate("/admin/analytics")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-md cursor-pointer">
            <TrendingUp size={15} /> Analytics & Growth
          </button>
          <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <Users size={15} /> User Accounts
          </button>
          <button onClick={() => navigate("/admin/projects")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <FolderKanban size={15} /> Projects Oversight
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Top Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Users (MAU Base)</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.totalUsers || 0}</h3>
              <span className="text-[10px] text-emerald-600 font-medium">+{analytics?.newSignupsLast30Days || 0} in last 30 days</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Pro Subscribers</p>
              <h3 className="text-2xl font-extrabold text-blue-600">{analytics?.activeProUsers || 0}</h3>
              <span className="text-[10px] text-slate-400 font-medium">Monetized users</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Free Tier Base</p>
              <h3 className="text-2xl font-extrabold text-slate-700">{analytics?.freeUsers || 0}</h3>
              <span className="text-[10px] text-slate-400 font-medium">Conversion pipeline</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Projects Created</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">{analytics?.totalProjects || 0}</h3>
              <span className="text-[10px] text-slate-400 font-medium">Digital workspaces & BOQs</span>
            </div>
          </div>

          {/* Charts Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MAU / DAU Trends Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600" /> MAU & DAU Engagement Trends
              </h4>
              <div className="flex-1 h-64 flex items-center justify-center">
                <Line data={mauDauData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Free vs Pro Conversion Curves */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserPlus size={16} className="text-purple-600" /> New Signup & Pro Conversion Curves
              </h4>
              <div className="flex-1 h-64 flex items-center justify-center">
                <Bar data={conversionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}