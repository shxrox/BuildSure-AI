import { 
  MousePointer2, Hand, Pencil, Ruler, 
  DoorOpen, AppWindow, Droplet, Zap, Armchair, Type,
  BedDouble, ChefHat, Bath, UtilityPole, Spline // New Icons!
} from 'lucide-react';
import { useCanvasStore, type ToolType } from '../store/useCanvasStore';

export default function Sidebar() {
  const { activeTool, setActiveTool, wallThickness, setWallThickness } = useCanvasStore();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemType: string) => {
    e.dataTransfer.setData('application/buildsure-item', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const ToolButton = ({ icon: Icon, label, toolId }: { icon: any, label: string, toolId: ToolType }) => {
    const isActive = activeTool === toolId;
    return (
      <button
        onClick={() => setActiveTool(toolId)}
        className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all text-sm font-semibold shadow-sm ${
          isActive 
            ? 'bg-[#2965a2]/10 border-[#2965a2]/40 text-[#2965a2]' 
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        {label}
      </button>
    );
  };

  const ThicknessButton = ({ value, label, desc }: { value: number, label: string, desc: string }) => {
    const isActive = wallThickness === value;
    const isDisabled = activeTool !== 'draw_wall';
    
    return (
      <button
        onClick={() => setWallThickness(value)}
        disabled={isDisabled}
        className={`flex flex-col items-start w-full p-2.5 rounded-lg border transition-all text-left shadow-sm ${
          isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        } ${
          isActive && !isDisabled
            ? 'bg-[#2965a2]/10 border-[#2965a2]/40'
            : 'bg-white border-slate-200 hover:bg-slate-50'
        }`}
      >
        <span className={`text-sm font-bold ${isActive && !isDisabled ? 'text-[#2965a2]' : 'text-slate-700'}`}>
          {label}
        </span>
        <span className="text-[10px] text-slate-400 mt-0.5">{desc}</span>
      </button>
    );
  };

  const DraggableItem = ({ type, icon: Icon, label, color }: { type: string, icon: any, label: string, color: string }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, type)}
      className="bg-white border border-slate-200 p-2 rounded-lg cursor-grab hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center gap-3 active:cursor-grabbing shadow-sm"
    >
      <div className={`p-1.5 rounded-md ${color} bg-slate-50 border border-slate-100`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </div>
  );

  return (
    <aside className="w-[280px] bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-5 overflow-y-auto z-10 custom-scrollbar shrink-0">
      
      {/* Canvas Modes */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Tools</h2>
        <div className="flex flex-col gap-2">
          <ToolButton toolId="select" icon={MousePointer2} label="Select & Edit" />
          <ToolButton toolId="pan" icon={Hand} label="Pan Canvas" />
          <ToolButton toolId="draw_wall" icon={Pencil} label="Draw Wall" />
        </div>
      </div>

      {/* Wall Properties */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-1">
          <Ruler size={12} /> Pen Properties
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <ThicknessButton value={9} label="9-Inch" desc="Exterior Wall" />
          <ThicknessButton value={4.5} label="4.5-Inch" desc="Interior Wall" />
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 my-1"></div>

      {/* Expanded Library */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Structural</h2>
        <div className="grid grid-cols-2 gap-2">
          <DraggableItem type="door" icon={DoorOpen} label="Door" color="text-amber-500" />
          <DraggableItem type="window" icon={AppWindow} label="Window" color="text-blue-500" />
          <DraggableItem type="stairs" icon={Spline} label="Stairs" color="text-stone-600" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Living & Bedroom</h2>
        <div className="grid grid-cols-2 gap-2">
          <DraggableItem type="furniture" icon={Armchair} label="Sofa" color="text-indigo-500" />
          <DraggableItem type="bed" icon={BedDouble} label="Bed" color="text-indigo-400" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Kitchen & Bath</h2>
        <div className="grid grid-cols-2 gap-2">
          <DraggableItem type="stove" icon={ChefHat} label="Stove" color="text-orange-500" />
          <DraggableItem type="sink" icon={Droplet} label="Sink" color="text-cyan-500" />
          <DraggableItem type="toilet" icon={Bath} label="Toilet" color="text-teal-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Utilities</h2>
        <div className="grid grid-cols-2 gap-2">
          <DraggableItem type="electrical" icon={Zap} label="Outlet" color="text-yellow-500" />
          <DraggableItem type="plumbing" icon={UtilityPole} label="HVAC" color="text-slate-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Annotations</h2>
        <div className="flex flex-col gap-2">
          <DraggableItem type="text" icon={Type} label="Text Label" color="text-slate-800" />
        </div>
      </div>
      
    </aside>
  );
}