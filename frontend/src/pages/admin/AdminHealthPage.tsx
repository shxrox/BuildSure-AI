

import React, { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import AdminNavbar from "./AdminNavbar"; // Adjust path as needed

interface SystemHealthData {
  uptime: string;
  mongodbStatus: string;
  dbLatencyMs: number;
  memoryUsagePercent: number;
  cpuLoadPercent: number;
  activeWebhooks: number;
  recentErrors: {
    id: string;
    timestamp: string;
    errorCode: number;
    message: string;
    route: string;
  }[];
}

export default function AdminHealthPage(): React.JSX.Element {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE = "http://localhost:5000/api/v1/admin";

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setRefreshing(true);
      // Simulated live health check payload or connect to your real backend /health endpoint
      await new Promise((resolve) => setTimeout(resolve, 600));

      setHealth({
        uptime: "14 days, 6 hours, 22 mins",
        mongodbStatus: "Connected (Replica Set)",
        dbLatencyMs: 14,
        memoryUsagePercent: 42.8,
        cpuLoadPercent: 18.2,
        activeWebhooks: 12,
        recentErrors: [
          {
            id: "err_9921",
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleString(),
            errorCode: 401,
            message: "Unauthorized token attempt from expired Clerk session",
            route: "/api/v1/projects",
          },
          {
            id: "err_9920",
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleString(),
            errorCode: 403,
            message: "Role mismatch: User attempted admin route access",
            route: "/api/v1/admin/users",
          },
        ],
      });
    } catch (err) {
      console.error("Failed to fetch system health stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Diagnosing Platform Health & System Logs...
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
          
          {/* Header Action Row */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">All Systems Operational</h3>
            </div>
            <button
              onClick={fetchSystemHealth}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh Diagnostics
            </button>
          </div>

          {/* Core System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Server size={14} className="text-blue-600" /> Server Uptime
              </p>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">{health?.uptime}</h3>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block flex items-center gap-1">
                <CheckCircle2 size={12} /> Stable node cluster
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Database size={14} className="text-emerald-600" /> Database Latency
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{health?.dbLatencyMs} ms</h3>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">{health?.mongodbStatus}</span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Cpu size={14} className="text-purple-600" /> RAM Memory Load
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{health?.memoryUsagePercent}%</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${health?.memoryUsagePercent}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <HardDrive size={14} className="text-orange-500" /> CPU Core Load
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{health?.cpuLoadPercent}%</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${health?.cpuLoadPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Recent Exception Logs Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={15} className="text-rose-600" /> Recent Exception & Error Log Stream
              </h3>
              <span className="text-xs text-slate-500 font-medium">Logged Exceptions: {health?.recentErrors.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Log ID</th>
                    <th className="p-4">Error Status</th>
                    <th className="p-4">Target API Route</th>
                    <th className="p-4">Exception Description</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {health?.recentErrors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No critical platform exceptions logged.
                      </td>
                    </tr>
                  ) : (
                    health?.recentErrors.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono text-slate-500">{err.id}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                            <AlertTriangle size={12} /> {err.errorCode} Error
                          </span>
                        </td>
                        <td className="p-4 font-mono text-blue-600">{err.route}</td>
                        <td className="p-4 font-medium text-slate-900">{err.message}</td>
                        <td className="p-4 text-right text-slate-500">{err.timestamp}</td>
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