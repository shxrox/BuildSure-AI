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
  Trash2,
  UserCheck,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function AdminUsersPage(): React.JSX.Element {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading User Directory & Administration...
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
              <p className="text-[10px] text-slate-400 font-medium">User Account & Role Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {message && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                {message}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-200 shadow-xs"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex gap-2 text-xs font-semibold overflow-x-auto pt-2 border-t border-slate-100">
          <button onClick={() => navigate("/admin/analytics")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <TrendingUp size={15} /> Analytics & Growth
          </button>
          <button onClick={() => navigate("/admin/financials")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60 cursor-pointer">
            <DollarSign size={15} /> Financials & Payments
          </button>
          <button onClick={() => navigate("/admin/users")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-md cursor-pointer">
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