export default function Sidebar() {
  // This function packages the "type" of item being dragged
  // so the Canvas knows exactly what to render when it's dropped.
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemType: string) => {
    e.dataTransfer.setData('application/buildsure-item', itemType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto">
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Architectural Elements</h2>
        <div className="flex flex-col gap-3">
          
          {/* Draggable Door */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'door')}
            className="bg-slate-800 border border-slate-700 p-3 rounded-lg cursor-grab hover:bg-slate-700 transition-colors flex items-center gap-3 active:cursor-grabbing shadow-sm"
          >
            {/* Visual Icon for Door */}
            <div className="w-6 h-8 border-2 border-emerald-500 rounded-sm flex items-center justify-start">
              <div className="w-3 h-full border-r border-emerald-500 rounded-tr-full"></div>
            </div>
            <span className="text-sm font-medium text-slate-300">Standard Door</span>
          </div>

          {/* Draggable Window */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'window')}
            className="bg-slate-800 border border-slate-700 p-3 rounded-lg cursor-grab hover:bg-slate-700 transition-colors flex items-center gap-3 active:cursor-grabbing shadow-sm"
          >
            {/* Visual Icon for Window */}
            <div className="w-8 h-4 border-2 border-blue-400 rounded-sm flex flex-col justify-center gap-[2px] p-[2px]">
              <div className="w-full h-[2px] bg-blue-400"></div>
            </div>
            <span className="text-sm font-medium text-slate-300">Glass Window</span>
          </div>

        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Annotations</h2>
        <div className="flex flex-col gap-3">
          
          {/* Draggable Text */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 'text')}
            className="bg-slate-800 border border-slate-700 p-3 rounded-lg cursor-grab hover:bg-slate-700 transition-colors flex items-center gap-3 active:cursor-grabbing shadow-sm"
          >
            {/* Visual Icon for Text */}
            <div className="w-6 h-6 flex items-center justify-center font-serif text-lg font-bold text-amber-400">
              T
            </div>
            <span className="text-sm font-medium text-slate-300">Add Text Label</span>
          </div>

        </div>
      </div>
      
      <div className="mt-auto bg-slate-950 rounded-lg p-3 border border-slate-800">
        <p className="text-xs text-slate-400 text-center">
          Drag an item and drop it onto the canvas area.
        </p>
      </div>
    </aside>
  );
}