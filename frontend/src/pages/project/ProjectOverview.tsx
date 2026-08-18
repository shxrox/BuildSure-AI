
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, getDigitalPlan, getCostSettings } from "../../services/project.service";
import { calculateMaterials } from "../../utils/volumetricEngine";
import { calculateSriLankanCost } from "../../utils/pricingEngine";
import { 
  Building2, 
  Layers, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  Share2, 
  Sparkles, 
  MapPin, 
  FileText
} from "lucide-react";

function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);

        const plan = await getDigitalPlan(id);
        const settings = await getCostSettings(id);
        const activeRates = settings?.rates || {
          cementRate: 2800,
          brickRate: 35,
          sandRate: 25000,
          tileRate: 4500,
          laborRatePerSqm: 18000,
        };

        const walls = plan?.walls || [];
        const doors = plan?.doors || [];
        const windows = plan?.windows || [];
        const rooms = plan?.rooms || [];

        const boq = calculateMaterials(walls, doors, windows, rooms);
        const mappedMaterials = {
          bricksCount: Number(boq?.materials?.bricks) || 0,
          cementBags: Number(boq?.materials?.cementBags) || 0,
          sandCubes: Number(boq?.materials?.sandCubes) || 0,
          tileAreaSqm: Number(boq?.materials?.floorTiles) || 0,
        };

        const floorArea = Number(boq?.metrics?.totalFloorAreaSqm) || 0;
        const financial = calculateSriLankanCost(mappedMaterials, floorArea, activeRates);

        setSummary({
          floorArea,
          grandTotal: Number(financial?.breakdown?.grandTotalCost) || 0,
          milestonesCount: projData?.completedMilestones?.length || 0,
          collaboratorsCount: projData?.collaborators?.length || 0,
        });
      } catch (error) {
        console.error("Failed to load project overview summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 font-medium text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span>Loading project executive command center...</span>
        </div>
      </div>
    );
  }

  const floorAreaValue = summary ? Number(summary.floorArea) || 0 : 0;
  const grandTotalValue = summary ? Number(summary.grandTotal) || 0 : 0;
  const milestonesCountValue = summary ? Number(summary.milestonesCount) || 0 : 0;
  const collaboratorsCountValue = summary ? Number(summary.collaboratorsCount) || 0 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12">
      
      {/* ===== EXECUTIVE HEADER BANNER (Clean Normal UI) ===== */}
      <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles size={13} className="text-blue-600" /> Executive Overview
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            {project?.projectName || "Unnamed Construction Project"}
          </h1>
          <p className="text-slate-500 text-xs flex items-center gap-2 font-medium">
            <MapPin size={13} className="text-blue-500 shrink-0" /> {project?.location || "No site location specified"}
          </p>
        </div>

        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="group px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all duration-300 shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          Open Floor Plan CAD 
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ===== TOP METRIC CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Construction Status",
            value: project?.status || "PLANNING",
            subtitle: "Active lifecycle phase",
            icon: <Building2 size={20} className="text-blue-600" />,
            border: "border-blue-200",
            bg: "from-blue-500/10 to-blue-600/5",
            textColor: "text-blue-600"
          },
          {
            title: "Total Floor Area",
            value: `${floorAreaValue.toFixed(2)} m²`,
            subtitle: "Extracted from 2D structures",
            icon: <Layers size={20} className="text-emerald-600" />,
            border: "border-emerald-200",
            bg: "from-emerald-500/10 to-emerald-600/5",
            textColor: "text-slate-900"
          },
          {
            title: "Estimated Cost (LKR)",
            value: `Rs. ${grandTotalValue.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`,
            subtitle: "Live IQSSL market calculation",
            icon: <DollarSign size={20} className="text-amber-600" />,
            border: "border-amber-200",
            bg: "from-amber-500/10 to-amber-600/5",
            textColor: "text-emerald-600"
          },
          {
            title: "Milestones Done",
            value: `${milestonesCountValue} / 7`,
            subtitle: "Schedule execution status",
            icon: <CheckCircle2 size={20} className="text-purple-600" />,
            border: "border-purple-200",
            bg: "from-purple-500/10 to-purple-600/5",
            textColor: "text-purple-600"
          },
        ].map((card, i) => (
          <div
            key={i}
            className={`p-6 rounded-2xl border ${card.border} bg-gradient-to-b ${card.bg} backdrop-blur-sm shadow-lg shadow-slate-200/50 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
              <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div>
              <p className={`text-xl font-extrabold ${card.textColor} tracking-tight mb-1`}>{card.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== PROJECT SPECIFICATION DETAILS ===== */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={15} className="text-blue-600" /> Project Specification Details
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">ID: {id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">Project Name</span>
            <p className="text-slate-900 font-bold text-sm">{project?.projectName}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">Location / Site</span>
            <p className="text-slate-900 font-bold text-sm">{project?.location || "Not specified"}</p>
          </div>
          <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1 text-[10px]">Description</span>
            <p className="text-slate-700 leading-relaxed text-xs">{project?.description || "No project description provided."}</p>
          </div>
        </div>
      </div>

      {/* ===== QUICK ACCESS MODULE CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Bill of Quantities (BOQ)",
            desc: "Inspect exact brick counts, cement bags, sand cubes, and tile area estimates based on IQSSL standards.",
            path: `boq`,
            icon: <Package size={20} className="text-blue-600" />,
            border: "hover:border-blue-500",
            bg: "hover:bg-blue-50/30"
          },
          {
            title: "Cost & Budget Tracking",
            desc: "Monitor actual spending against calculated Sri Lankan market projections and custom unit rates.",
            path: `cost`,
            icon: <DollarSign size={20} className="text-emerald-600" />,
            border: "hover:border-emerald-500",
            bg: "hover:bg-emerald-50/30"
          },
          {
            title: "Sharing & Collaborators",
            desc: `Manage team access rights, engineers, and municipal authority permissions (${collaboratorsCountValue} active).`,
            path: `sharing`,
            icon: <Share2 size={20} className="text-purple-600" />,
            border: "hover:border-purple-500",
            bg: "hover:bg-purple-50/30"
          },
        ].map((module, i) => (
          <div
            key={i}
            onClick={() => navigate(`/projects/${id}/${module.path}`)}
            className={`bg-white p-6 rounded-2xl shadow-xs border border-slate-200 ${module.border} ${module.bg} cursor-pointer transition-all duration-300 flex flex-col justify-between group`}
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {module.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                {module.title}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-600" />
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">{module.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ProjectOverview;