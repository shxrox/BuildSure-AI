import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import logo from "../../assets/LOGO.png";
import {
  TrendingUp,
  DollarSign,
  Users,
  FolderKanban,
  LogOut,
  Activity,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function AdminNavbar(): React.JSX.Element {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/home", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-5 sticky top-0 z-30 font-sans shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        
        {/* Brand / Logo & Status badge */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-md shadow-slate-200/50 border border-slate-200/80 p-1.5 shrink-0">
            <img src={logo} alt="BuildSure Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">BuildSure Admin</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={11} /> Secure System
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">SaaS Platform Control Panel & Analytics Hub</p>
          </div>
        </div>

        {/* Right Info & Sign Out Action */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200/60 px-3.5 py-2 rounded-xl">
            <Sparkles size={14} className="text-amber-500" />
            <span>Master Administration Workspace</span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-2xs hover:shadow-sm flex items-center gap-2 border border-red-100"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Links / Tabs */}
      <div className="max-w-7xl mx-auto flex gap-2 text-xs font-semibold overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            isActive("/admin/dashboard") || isActive("/")
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60"
          }`}
        >
          <TrendingUp size={15} className={isActive("/admin/dashboard") || isActive("/") ? "text-blue-400" : "text-slate-400"} /> 
          Analytics & Growth
        </button>

        <button
          onClick={() => navigate("/admin/financials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            isActive("/admin/financials")
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60"
          }`}
        >
          <DollarSign size={15} className={isActive("/admin/financials") ? "text-emerald-400" : "text-slate-400"} /> 
          Financials & Payments
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            isActive("/admin/users")
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60"
          }`}
        >
          <Users size={15} className={isActive("/admin/users") ? "text-blue-400" : "text-slate-400"} /> 
          User Accounts
        </button>

        <button
          onClick={() => navigate("/admin/projects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            isActive("/admin/projects")
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60"
          }`}
        >
          <FolderKanban size={15} className={isActive("/admin/projects") ? "text-purple-400" : "text-slate-400"} /> 
          Projects Oversight
        </button>

        <button
          onClick={() => navigate("/admin/health")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
            isActive("/admin/health")
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50/80 border border-slate-200/60"
          }`}
        >
          <Activity size={15} className={isActive("/admin/health") ? "text-emerald-400" : "text-slate-400"} /> 
          Health & Logs
        </button>
      </div>
    </header>
  );
}