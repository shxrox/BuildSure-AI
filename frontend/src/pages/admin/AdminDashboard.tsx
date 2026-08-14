import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
  Users,
  FolderKanban,
  TrendingUp,
  ShieldAlert,
  Search,
  CheckCircle,
  LogOut,
  BarChart3,
  CreditCard,
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  activeProUsers: number;
  freeUsers: number;
  newSignupsLast30Days: number;
}

interface FinancialData {
  mrr: number;
  arr: number;
  tierDistribution: { free: number; pro: number };
  estimatedChurnRate: string;
  retentionRate: string;
}

export default function AdminDashboard(): React.JSX.Element {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "transactions">("overview");
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, financialsRes, usersRes, projectsRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/growth`, { credentials: "include" }),
        fetch(`${API_BASE}/analytics/financials`, { credentials: "include" }),
        fetch(`${API_BASE}/users`, { credentials: "include" }),
        fetch(`${API_BASE}/projects`, { credentials: "include" }),
        fetch(`${API_BASE}/transactions`, { credentials: "include" }),
      ]);

      const analyticsData = await analyticsRes.json();
      const financialsData = await financialsRes.json();
      const usersData = await usersRes.json();
      const projectsData = await projectsRes.json();
      const transactionsData = await transactionsRes.json();

      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (financialsData.success) setFinancials(financialsData.data);
      if (usersData.success) setUsers(usersData.data.users);
      if (projectsData.success) setProjects(projectsData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

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
      }
    } catch (err) {
      console.error("Failed to update user subscription:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading Admin Control Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar with Pages Navigation & Clerk Sign Out */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">BuildSure Admin</h1>
              <p className="text-[10px] text-slate-400 font-medium">SaaS Platform Control Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {message && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                {message}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Separate Page Links/Tabs Navbar */}
        <div className="max-w-7xl mx-auto flex gap-2 text-xs font-semibold overflow-x-auto pt-2 border-t border-slate-100">
          {[
            { key: "overview", label: "Analytics & Growth", icon: TrendingUp },
            { key: "users", label: "User Accounts", icon: Users },
            { key: "projects", label: "Projects Oversight", icon: FolderKanban },
            { key: "transactions", label: "Payments & Invoices", icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === item.key ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
                }`}
              >
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full">
          {/* PAGE 1: ANALYTICS & GROWTH OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Active Users (MAU)</p>
                  <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.totalUsers || 0}</h3>
                  <span className="text-[10px] text-emerald-600 font-medium">+{analytics?.newSignupsLast30Days || 0} signups (30d)</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pro Conversions</p>
                  <h3 className="text-2xl font-extrabold text-blue-600">{analytics?.activeProUsers || 0}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{analytics?.freeUsers || 0} Free tier users</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring Revenue</p>
                  <h3 className="text-2xl font-extrabold text-slate-900">LKR {financials?.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                  <span className="text-[10px] text-emerald-600 font-medium">ARR: LKR {financials?.arr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Platform Projects</p>
                  <h3 className="text-2xl font-extrabold text-slate-900">{analytics?.totalProjects || 0}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Digital floor plans & BOQs</span>
                </div>
              </div>

              {/* SaaS Metrics Growth Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 size={15} className="text-blue-600" /> Subscription Tier Breakdown
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-600">Active Pro Plan Subscribers</span>
                      <span className="font-bold text-blue-600">{financials?.tierDistribution.pro || 0} users</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-600">Free Tier Users</span>
                      <span className="font-bold text-slate-700">{financials?.tierDistribution.free || 0} users</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp size={15} className="text-emerald-600" /> Churn & Retention Tracking
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-600">Monthly Churn Rate</span>
                      <span className="font-bold text-rose-600">{financials?.estimatedChurnRate}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-medium text-slate-600">Subscriber Retention Rate</span>
                      <span className="font-bold text-emerald-600">{financials?.retentionRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: USER DIRECTORY & ROLE ADMINISTRATION */}
          {activeTab === "users" && (
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
                      <th className="p-4">User Details</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Subscription Status</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Subscription Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users
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
                            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-[10px] text-slate-600">
                              {user.role}
                            </span>
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
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleTogglePro(user._id, user.subscription)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer transition-colors"
                            >
                              {user.subscription === "PRO" ? "Revoke Pro" : "Grant Pro"}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 3: PROJECT & WORKSPACE OVERSIGHT */}
          {activeTab === "projects" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Global Workspace Projects & Metrics</h3>
                <span className="text-xs text-slate-500 font-medium">Total Tracked Projects: {projects.length}</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Project Name</th>
                    <th className="p-4">Workspace Owner</th>
                    <th className="p-4">Creation Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {projects.map((proj) => (
                    <tr key={proj._id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{proj.name || "Untitled Project"}</td>
                      <td className="p-4 text-slate-600">{proj.ownerId?.email || "Unknown Owner"}</td>
                      <td className="p-4 text-slate-500">{new Date(proj.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGE 4: TRANSACTIONS & INVOICE LOGS */}
          {activeTab === "transactions" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment History & Invoice Logs</h3>
                <span className="text-xs text-slate-500 font-medium">Successful Renewals: {transactions.length}</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">User Email</th>
                    <th className="p-4">Billed Amount</th>
                    <th className="p-4">Renewal Status</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-slate-500">{tx.transactionId}</td>
                      <td className="p-4 font-medium text-slate-900">{tx.userEmail}</td>
                      <td className="p-4 font-bold text-slate-900">{tx.amount}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <CheckCircle size={14} /> {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}