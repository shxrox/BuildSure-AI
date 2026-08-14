import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FolderKanban,
  TrendingUp,
  ShieldAlert,
  LogOut,
  DollarSign,
  CreditCard,
  CheckCircle,
  PieChart as PieIcon,
  ArrowUpRight,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface FinancialData {
  mrr: number;
  arr: number;
  tierDistribution: { free: number; pro: number };
  estimatedChurnRate: string;
  retentionRate: string;
}

export default function AdminFinancialsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [financialsRes, transactionsRes] = await Promise.all([
        fetch(`${API_BASE}/analytics/financials`, { credentials: "include" }),
        fetch(`${API_BASE}/transactions`, { credentials: "include" }),
      ]);

      const financialsData = await financialsRes.json();
      const transactionsData = await transactionsRes.json();

      if (financialsData.success) setFinancials(financialsData.data);
      if (transactionsData.success) setTransactions(transactionsData.data);
    } catch (err) {
      console.error("Failed to fetch financial data:", err);
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

  // Doughnut Chart Data for Tier Breakdown
  const tierDistributionData = {
    labels: ["Free Tier", "Pro Subscribers"],
    datasets: [
      {
        data: [financials?.tierDistribution.free || 0, financials?.tierDistribution.pro || 0],
        backgroundColor: ["rgba(148, 163, 184, 0.7)", "rgba(37, 99, 235, 0.9)"],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading SaaS Financials & Transactions...
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
              <p className="text-[10px] text-slate-400 font-medium">SaaS Financials & Payment Trackers</p>
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
          <button onClick={() => navigate("/admin/financials")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white shadow-md cursor-pointer">
            <DollarSign size={15} /> Financials & Payments
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
          {/* Top Financial Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Recurring Revenue (MRR)</p>
              <h3 className="text-2xl font-extrabold text-slate-900">
                LKR {financials?.mrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <ArrowUpRight size={12} /> Active subscription flow
              </span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Annual Recurring Revenue (ARR)</p>
              <h3 className="text-2xl font-extrabold text-blue-600">
                LKR {financials?.arr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Projected yearly run-rate</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Churn Rate</p>
              <h3 className="text-2xl font-extrabold text-rose-600">{financials?.estimatedChurnRate}</h3>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Baseline cancellation index</span>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subscriber Retention Rate</p>
              <h3 className="text-2xl font-extrabold text-emerald-600">{financials?.retentionRate}</h3>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">Healthy platform stickiness</span>
            </div>
          </div>

          {/* Breakdown Section & Doughnut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs md:col-span-1 flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 self-start">
                <PieIcon size={16} className="text-blue-600" /> Tier Distribution
              </h4>
              <div className="w-48 h-48 flex items-center justify-center">
                <Doughnut data={tierDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            {/* Financial Summary Info Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Subscription Monetization Breakdown</h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">
                  Platform monetization is structured around the Extended Pro Plan (LKR 8,656.88 every 6 months). 
                  Active subscribers directly contribute to recurring revenue flows tracked through automated gateway logs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1 font-semibold">Active Pro Payers</span>
                  <span className="text-base font-extrabold text-blue-600">{financials?.tierDistribution.pro || 0}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block mb-1 font-semibold">Free Tier Accounts</span>
                  <span className="text-base font-extrabold text-slate-700">{financials?.tierDistribution.free || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History & Invoice Transaction Tracker Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={15} className="text-blue-600" /> Payment History & Invoices Tracker
              </h3>
              <span className="text-xs text-slate-500 font-medium">Successful Charges Logged: {transactions.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">User Email</th>
                    <th className="p-4">Billed Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
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