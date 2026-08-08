// import type { ReactNode, Dispatch, SetStateAction } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// export interface Project {
//   _id: string;
//   projectName: string;
//   location: string;
//   description: string;
//   status: string;
//   createdAt: string;
// }

// export interface ProjectLayoutProps {
//   project: Project;
//   active: string;
//   setActive: Dispatch<SetStateAction<string>>;
//   children: ReactNode; // <-- This property must be present here
// }

// function ProjectLayout({
//   project,
//   active,
//   setActive,
//   children,
// }: ProjectLayoutProps) {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   const navItems = [
//     { id: "overview", label: "📊 Overview", path: `/projects/${id}` },
//     { id: "floor-plan", label: "📐 Floor Plan", path: `/projects/${id}/floor-plan` },
//     { id: "blueprint", label: "🖼 Blueprint", path: `/projects/${id}/blueprint` },
//     { id: "boq", label: "📦 BOQ", path: `/projects/${id}/boq` },
//     { id: "cost", label: "💰 Cost & Tracking", path: `/projects/${id}/cost` },
//     { id: "timeline", label: "📅 Timeline", path: `/projects/${id}/timeline` },
//     { id: "sharing", label: "🔗 Sharing", path: `/projects/${id}/sharing` },
//     { id: "settings", label: "⚙️ Settings", path: `/projects/${id}/settings` },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
//       <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 30 }}>
//         <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", height: "65px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
//             <button
//               onClick={() => navigate("/homeowner")}
//               style={{ background: "none", border: "none", color: "#475569", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
//             >
//               ← Dashboard
//             </button>
//             <div style={{ width: "1px", height: "20px", background: "#cbd5e1" }} />
//             <h1 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>
//               {project?.projectName}
//             </h1>
//             <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
//               {project?.status || "PLANNING"}
//             </span>
//           </div>

//           <div style={{ fontSize: "13px", color: "#64748b" }}>
//             📍 {project?.location}
//           </div>
//         </div>

//         <nav style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", gap: "5px", overflowX: "auto", borderTop: "1px solid #f1f5f9", paddingBottom: "10px", paddingTop: "10px" }}>
//           {navItems.map((item) => {
//             const isActive = active === item.id;
//             return (
//               <button
//                 key={item.id}
//                 onClick={() => {
//                   setActive(item.id);
//                   navigate(item.path);
//                 }}
//                 style={{
//                   background: isActive ? "#2563eb" : "transparent",
//                   color: isActive ? "white" : "#475569",
//                   border: "none",
//                   padding: "8px 14px",
//                   borderRadius: "6px",
//                   cursor: "pointer",
//                   fontWeight: "bold",
//                   fontSize: "13px",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 {item.label}
//               </button>
//             );
//           })}
//         </nav>
//       </header>

//       <main style={{ flex: 1, padding: "20px 0" }}>
//         {children}
//       </main>
//     </div>
//   );
// }

// export default ProjectLayout;

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
} from "lucide-react";

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

  // Navigation items paired with professional Lucide icons
  const navItems = [
    { id: "overview", label: "Overview", path: `/projects/${id}`, icon: LayoutDashboard },
    { id: "floor-plan", label: "Floor Plan", path: `/projects/${id}/floor-plan`, icon: Maximize2 },
    { id: "blueprint", label: "Blueprint", path: `/projects/${id}/blueprint`, icon: ImageIcon },
    { id: "boq", label: "BOQ", path: `/projects/${id}/boq`, icon: Package },
    { id: "cost", label: "Cost & Tracking", path: `/projects/${id}/cost`, icon: DollarSign },
    { id: "timeline", label: "Timeline", path: `/projects/${id}/timeline`, icon: Calendar },
    { id: "sharing", label: "Sharing", path: `/projects/${id}/sharing`, icon: Share2 },
    { id: "settings", label: "Settings", path: `/projects/${id}/settings`, icon: Settings },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", height: "65px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {/* Left section: Back button, Title & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button
              onClick={() => navigate("/homeowner")}
              style={{ background: "none", border: "none", color: "#475569", fontWeight: "600", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
            <div style={{ width: "1px", height: "20px", background: "#cbd5e1" }} />
            <h1 style={{ margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: "700" }}>
              {project?.projectName}
            </h1>
            <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
              {project?.status || "PLANNING"}
            </span>
          </div>

          {/* Right section: Location */}
          <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
            <MapPin size={14} color="#64748b" /> {project?.location}
          </div>
        </div>

        {/* Navigation Bar */}
        <nav style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", gap: "8px", overflowX: "auto", borderTop: "1px solid #f1f5f9", paddingBottom: "10px", paddingTop: "10px" }}>
          {navItems.map((item) => {
            const isActive = active === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  navigate(item.path);
                }}
                style={{
                  background: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "white" : "#475569",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  transition: "background 0.2s ease, color 0.2s ease"
                }}
              >
                <IconComponent size={15} color={isActive ? "white" : "#64748b"} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "20px 0" }}>
        {children}
      </main>
    </div>
  );
}

export default ProjectLayout;