import { 
  MousePointer2, Hand, Pencil, Ruler, 
  DoorOpen, AppWindow, Droplet, Zap, Armchair, Type 
} from 'lucide-react';
import { useCanvasStore, type ToolType } from '../store/useCanvasStore';

export default function Sidebar() {
  // Bring in our new global state functions
  const { activeTool, setActiveTool, wallThickness, setWallThickness } = useCanvasStore();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemType: string) => {
    e.dataTransfer.setData('application/buildsure-item', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // --- Helper Components for cleaner code ---
  const ToolButton = ({ icon: Icon, label, toolId }: { icon: any, label: string, toolId: ToolType }) => {
    const isActive = activeTool === toolId;
    return (
      <button
        onClick={() => setActiveTool(toolId)}
        className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all text-sm font-semibold shadow-sm ${
          isActive 
            ? 'bg-[#2965a2]/10 border-[#2965a2]/40 text-[#2965a2]' // Your primary corporate blue when active
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
    const isDisabled = activeTool !== 'draw_wall'; // Only let users change thickness if they are drawing
    
    return (
      <button
        onClick={() => setWallThickness(value)}
        disabled={isDisabled}
        className={`flex flex-col items-start w-full p-3 rounded-xl border transition-all text-left shadow-sm ${
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
        <span className="text-xs text-slate-400 mt-0.5">{desc}</span>
      </button>
    );
  };

  const DraggableItem = ({ type, icon: Icon, label, color }: { type: string, icon: any, label: string, color: string }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, type)}
      className="bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-grab hover:bg-blue-50 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3 active:cursor-grabbing shadow-sm"
    >
      <div className={`p-2 rounded-lg ${color} bg-white border border-slate-100 shadow-sm`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  );

  return (
    <aside className="w-[300px] bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
      
      {/* NEW: Canvas Interaction Modes */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Canvas Modes</h2>
        <div className="flex flex-col gap-2">
          <ToolButton toolId="select" icon={MousePointer2} label="Select & Edit Tool" />
          <ToolButton toolId="pan" icon={Hand} label="Pan Canvas Tool" />
          <ToolButton toolId="draw_wall" icon={Pencil} label="Draw Wall Tool" />
        </div>
      </div>

      {/* NEW: Wall Thickness Properties */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
          <Ruler size={12} /> Pen Properties
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <ThicknessButton value={9} label="9-Inch" desc="Exterior Load-Bearing" />
          <ThicknessButton value={4.5} label="4.5-Inch" desc="Interior Partition" />
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 my-1"></div>

      {/* EXISTING: Drag and Drop Items */}
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Architectural</h2>
        <div className="flex flex-col gap-2">
          <DraggableItem type="door" icon={DoorOpen} label="Standard Door" color="text-amber-500" />
          <DraggableItem type="window" icon={AppWindow} label="Glass Window" color="text-blue-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Utilities & Interior</h2>
        <div className="flex flex-col gap-2">
          <DraggableItem type="plumbing" icon={Droplet} label="Plumbing Fixture" color="text-cyan-500" />
          <DraggableItem type="electrical" icon={Zap} label="Electrical Point" color="text-yellow-500" />
          <DraggableItem type="furniture" icon={Armchair} label="Furniture Piece" color="text-indigo-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Annotations</h2>
        <div className="flex flex-col gap-2">
          <DraggableItem type="text" icon={Type} label="Add Text Label" color="text-slate-600" />
        </div>
      </div>
      
    </aside>
  );
}