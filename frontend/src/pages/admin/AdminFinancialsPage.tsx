import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  PieChart as PieIcon,
  ArrowUpRight,
  BarChart3,
  Activity,
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
import { Doughnut, Bar } from "react-chartjs-2";
import AdminNavbar from "./AdminNavbar"; // Adjust path as needed

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface FinancialData {
  mrr: number;
  arr: number;
  tierDistribution: { free: number; pro: number };
  estimatedChurnRate: string;
  retentionRate: string;
}

export default function AdminFinancialsPage(): React.JSX.Element {
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

  const revenueComparisonData = {
    labels: ["Monthly Run-Rate (MRR)", "Annual Run-Rate (ARR)"],
    datasets: [
      {
        label: "Revenue in LKR",
        data: [financials?.mrr || 0, financials?.arr || 0],
        backgroundColor: ["rgba(37, 99, 235, 0.85)", "rgba(16, 185, 129, 0.85)"],
        borderRadius: 8,
      },
    ],
  };

  const healthIndexData = {
    labels: ["Churn Rate Index", "Retention Rate Index"],
    datasets: [
      {
        label: "Platform Percentage (%)",
        data: [
          parseFloat(financials?.estimatedChurnRate || "2.4"),
          parseFloat(financials?.retentionRate || "97.6"),
        ],
        backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(16, 185, 129, 0.8)"],
        borderRadius: 8,
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
      {/* Centralized Admin Navbar */}
      <AdminNavbar />

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

          {/* Charts Section: Three Financial Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 self-start">
                <PieIcon size={16} className="text-blue-600" /> Tier Distribution
              </h4>
              <div className="w-44 h-44 flex items-center justify-center my-2">
                <Doughnut data={tierDistributionData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-600" /> Revenue Scale (MRR vs ARR)
              </h4>
              <div className="flex-1 h-48 flex items-center justify-center">
                <Bar data={revenueComparisonData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={16} className="text-orange-500" /> Churn vs Retention Health Index
              </h4>
              <div className="flex-1 h-48 flex items-center justify-center">
                <Bar data={healthIndexData} options={{ responsive: true, maintainAspectRatio: false }} />
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