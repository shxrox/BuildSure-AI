import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import {
  TrendingUp,
  DollarSign,
  Users,
  FolderKanban,
  ShieldAlert,
  LogOut,
} from "lucide-react";

export default function AdminNavbar(): React.JSX.Element {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-xs sticky top-0 z-30 font-sans">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">BuildSure Admin</h1>
            <p className="text-[10px] text-slate-400 font-medium">SaaS Platform Control Panel</p>
          </div>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Navigation Links / Tabs */}
      <div className="max-w-7xl mx-auto flex gap-2 text-xs font-semibold overflow-x-auto pt-2 border-t border-slate-100">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            isActive("/")
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
          }`}
        >
          <TrendingUp size={15} /> Analytics & Growth
        </button>

        <button
          onClick={() => navigate("/admin/financials")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            isActive("/admin/financials")
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
          }`}
        >
          <DollarSign size={15} /> Financials & Payments
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            isActive("/admin/users")
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
          }`}
        >
          <Users size={15} /> User Accounts
        </button>

        <button
          onClick={() => navigate("/admin/projects")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            isActive("/admin/projects")
              ? "bg-blue-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200/60"
          }`}
        >
          <FolderKanban size={15} /> Projects Oversight
        </button>
      </div>
    </header>
  );
}