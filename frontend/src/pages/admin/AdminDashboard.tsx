import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard(): React.JSX.Element {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header Bar with Logout */}
        <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              🛠️ Admin Dashboard
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage users, subscriptions, and platform analytics.
            </p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Sign Out
          </button>
        </div>

        {/* Main Content Card Area */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            System Overview
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Welcome to the master control panel. You have successfully authenticated with administrative privileges.
          </p>
        </div>

      </div>
    </div>
  );
}