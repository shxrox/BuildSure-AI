import type { ReactNode, Dispatch, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Maximize2,
  Image as ImageIcon,
  Package,
  DollarSign,
  Calendar,
  Share2,
  Settings,
  ArrowLeft,
  MapPin,
  Menu,
  X,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import logo from "../../assets/LOGO.png";

export interface Project {
  _id: string;
  projectName: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface ProjectLayoutProps {
  project: Project;
  active: string;
  setActive: Dispatch<SetStateAction<string>>;
  children: ReactNode;
}

function ProjectLayout({
  project,
  active,
  setActive,
  children,
}: ProjectLayoutProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Left sidebar states matching Navbar 10 style
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation items paired with professional Lucide icons matching the home page theme
  const navItems = [
    { id: "overview", label: "Overview", path: `/projects/${id}`, icon: LayoutDashboard },
    { id: "floor-plan", label: "Floor Plan", path: `/projects/${id}/floor-plan`, icon: Maximize2 },
    { id: "blueprint", label: "Blueprint", path: `/projects/${id}/blueprint`, icon: ImageIcon },
    { id: "boq", label: "BOQ", path: `/projects/${id}/boq`, icon: Package },
    { id: "cost", label: "Cost & Tracking", path: `/projects/${id}/cost`, icon: DollarSign },
    { id: "timeline", label: "Timeline", path: `/projects/${id}/timeline`, icon: Calendar },
    { id: "sharing", label: "Sharing", path: `/projects/${id}/sharing`, icon: Share2 },
    // { id: "pricing", label: "Pricing", path: `/pricing`, icon: CreditCard },
    { id: "pricing", label: "Pricing", path: `/projects/${id}/pricing`, icon: CreditCard },
    { id: "settings", label: "Settings", path: `/projects/${id}/settings`, icon: Settings },
    
  ];

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-800 selection:bg-blue-500/20 overflow-x-hidden">
      
      {/* ===== DESKTOP LEFT SIDEBAR (Navbar 10 Style - Fixed to left without moving) ===== */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 transition-all duration-300 fixed top-0 left-0 h-screen z-30 shadow-sm ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between h-16">
          {!sidebarCollapsed ? (
            <div 
              className="flex items-center gap-2.5 cursor-pointer group overflow-hidden px-1"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shadow-md bg-slate-900 group-hover:scale-105 transition-transform shrink-0">
                <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain" />
              </div>
              <div className="truncate">
                <h1 className="text-xs font-bold text-slate-900 tracking-wide truncate">BuildSure-AI</h1>
                <p className="text-[9px] text-slate-400 font-medium truncate">Workspace Navigator</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shadow-md bg-slate-900">
                <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Command Search Bar & Version Selector */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-slate-100 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-200/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 placeholder:text-slate-400"
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
            
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
              <span>Environment</span>
              <span className="bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-md text-[10px] border border-emerald-200/60">v2.4 Live</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = active === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  navigate(item.path);
                }}
                title={sidebarCollapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <IconComponent size={16} className={isActive ? "text-white shrink-0" : "text-slate-500 shrink-0"} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => navigate("/homeowner")}
              className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        )}
      </aside>

      {/* ===== MAIN CONTAINER WRAPPER (Offset dynamically by desktop sidebar width) ===== */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        
        {/* ===== TOP HEADER BAR ===== */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-20 shadow-xs h-16 flex items-center justify-between px-6">
          
          {/* Left section: Mobile Toggle & Project Details */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => navigate("/homeowner")}
              className="group lg:hidden text-slate-600 font-semibold cursor-pointer text-xs flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 px-3.5 py-2 rounded-xl transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Dashboard
            </button>

            <div className="flex items-center gap-3">
              <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight truncate max-w-[180px] sm:max-w-xs">
                {project?.projectName}
              </h1>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {project?.status || "PLANNING"}
              </span>
            </div>
          </div>

          {/* Right section: Location */}
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl shadow-2xs">
            <MapPin size={14} className="text-blue-500 shrink-0" /> 
            <span className="max-w-[120px] sm:max-w-xs truncate">{project?.location || "No location set"}</span>
          </div>
        </header>

        {/* ===== MOBILE DRAWER SIDEBAR ===== */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setMobileDrawerOpen(false)} 
            />

            {/* Drawer */}
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col p-6 z-10 border-r border-slate-200 animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                    <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">BuildSure-AI</span>
                </div>
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <Search size={13} className="absolute left-2.5 top-3 text-slate-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
                {filteredNavItems.map((item) => {
                  const isActive = active === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActive(item.id);
                        setMobileDrawerOpen(false);
                        navigate(item.path);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl cursor-pointer font-semibold text-xs flex items-center gap-3 transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? "text-white" : "text-slate-500"} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    navigate("/homeowner");
                  }}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT AREA ===== */}
        <main className="flex-1 flex flex-col p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}

export default ProjectLayout;