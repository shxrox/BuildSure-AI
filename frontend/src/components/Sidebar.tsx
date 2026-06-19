import { DoorOpen, AppWindow, Droplet, Zap, Armchair, Type } from 'lucide-react';

export default function Sidebar() {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemType: string) => {
    e.dataTransfer.setData('application/buildsure-item', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Helper component to keep our code clean and reusable
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
    <aside className="w-72 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 overflow-y-auto z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      
      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Architectural</h2>
        <div className="flex flex-col gap-3">
          <DraggableItem type="door" icon={DoorOpen} label="Standard Door" color="text-amber-500" />
          <DraggableItem type="window" icon={AppWindow} label="Glass Window" color="text-blue-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Utilities & Interior</h2>
        <div className="flex flex-col gap-3">
          <DraggableItem type="plumbing" icon={Droplet} label="Plumbing Fixture" color="text-cyan-500" />
          <DraggableItem type="electrical" icon={Zap} label="Electrical Point" color="text-yellow-500" />
          <DraggableItem type="furniture" icon={Armchair} label="Furniture Piece" color="text-indigo-500" />
        </div>
      </div>

      <div>
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Annotations</h2>
        <div className="flex flex-col gap-3">
          <DraggableItem type="text" icon={Type} label="Add Text Label" color="text-slate-600" />
        </div>
      </div>
      
      <div className="mt-auto bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="text-xs text-slate-500 text-center font-medium leading-relaxed">
          Drag an item and drop it onto the blueprint canvas to place it.
        </p>
      </div>
    </aside>
  );
}