
import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  PieChart as PieIcon,
  BarChart3,
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

export default function AdminUsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchUsersDirectory();
  }, []);

  const fetchUsersDirectory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users directory:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manual Subscription Override Action
  const handleTogglePro = async (userId: string, currentSub: string) => {
    const newSub = currentSub === "PRO" ? "FREE" : "PRO";
    const newExpiry = newSub === "PRO" ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() : null;

    try {
      const res = await fetch(`${API_BASE}/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subscription: newSub, subscriptionExpiresAt: newExpiry }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, subscription: newSub, subscriptionExpiresAt: newExpiry } : u)));
        setMessage("User subscription override updated successfully.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update user subscription:", err);
      alert("Network error updating subscription.");
    }
  };

  // Role Modification Action
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        setMessage(`User role updated to ${newRole} successfully.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      alert("Network error updating role.");
    }
  };

  // Computed Chart Stats from Live Users
  const totalCount = users.length;
  const proCount = users.filter((u) => u.subscription === "PRO").length;
  const freeCount = totalCount - proCount;

  const homeownerCount = users.filter((u) => u.role === "HOMEOWNER" || !u.role).length;
  const contractorCount = users.filter((u) => u.role === "CONTRACTOR").length;
  const adminCount = users.filter((u) => u.role === "ADMIN" || u.role === "admin").length;

  const activeCount = users.filter((u) => u.isActive !== false).length;
  const inactiveCount = totalCount - activeCount;

  // Chart 1: Subscription Tier Breakdown Doughnut
  const tierDistributionData = {
    labels: ["Free Tier", "Pro Subscribers"],
    datasets: [
      {
        data: [freeCount, proCount],
        backgroundColor: ["rgba(148, 163, 184, 0.7)", "rgba(37, 99, 235, 0.9)"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Role Distribution Bar Chart
  const roleDistributionData = {
    labels: ["Homeowners", "Contractors", "Admins"],
    datasets: [
      {
        label: "User Count by Role",
        data: [homeownerCount, contractorCount, adminCount],
        backgroundColor: ["rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(139, 92, 246, 0.8)"],
        borderRadius: 8,
      },
    ],
  };

  // Chart 3: Account Status Breakdown Doughnut
  const accountStatusData = {
    labels: ["Active Status", "Inactive / Suspended"],
    datasets: [
      {
        label: "Account Status",
        data: [activeCount, inactiveCount],
        backgroundColor: ["rgba(16, 185, 129, 0.85)", "rgba(239, 68, 68, 0.85)"],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading User Directory & Administration...
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
          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold shadow-xs">
              {message}
            </div>
          )}

          {/* Charts Section for User Administration (3 Visual Graphs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 self-start">
                <PieIcon size={16} className="text-blue-600" /> Subscription Breakdown
              </h4>
              <div className="w-44 h-44 flex items-center justify-center my-2">
                <Doughnut data={tierDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-600" /> User Role Distribution
              </h4>
              <div className="flex-1 h-48 flex items-center justify-center">
                <Bar data={roleDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 self-start">
                <Users size={16} className="text-purple-600" /> Account Status Metrics
              </h4>
              <div className="w-44 h-44 flex items-center justify-center my-2">
                <Doughnut data={accountStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          {/* User Directory Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              </div>
              <span className="text-xs text-slate-500 font-medium">Total Registered Users: {users.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">User Profile</th>
                    <th className="p-4">Role Visibility</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Registration Date</th>
                    <th className="p-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No registered users found in the directory.
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter(
                        (u) =>
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.firstName && u.firstName.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-medium text-slate-900">
                            {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Unnamed User"}
                            <div className="text-[10px] text-slate-400 font-normal">{user.email}</div>
                          </td>
                          <td className="p-4">
                            <select
                              value={user.role || "HOMEOWNER"}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-[11px] text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                            >
                              <option value="HOMEOWNER">Homeowner</option>
                              <option value="CONTRACTOR">Contractor</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md font-semibold text-[10px] ${
                                user.subscription === "PRO"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {user.subscription || "FREE"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleTogglePro(user._id, user.subscription)}
                              className={`px-3 py-1.5 font-semibold rounded-lg cursor-pointer transition-colors shadow-xs ${
                                user.subscription === "PRO"
                                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                  : "bg-purple-600 text-white hover:bg-purple-700"
                              }`}
                            >
                              {user.subscription === "PRO" ? "Revoke Pro" : "Grant Pro Access"}
                            </button>
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