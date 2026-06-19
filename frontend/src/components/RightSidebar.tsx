import { useCanvasStore } from '../store/useCanvasStore';
import { Settings2, Type, Layers, Box } from 'lucide-react';

export default function RightSidebar() {
  const { 
    selectedId, items, texts, walls,
    updateItem, updateText, updateWall, bringToFront, sendToBack, deleteSelected 
  } = useCanvasStore();

  if (!selectedId) {
    return (
      <aside className="w-[280px] bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <Settings2 size={32} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-bold text-slate-500">No Object Selected</h3>
      </aside>
    );
  }

  const selectedItem = items.find(i => i.id === selectedId);
  const selectedText = texts.find(t => t.id === selectedId);
  const selectedWall = walls.find(w => w.id === selectedId);

  const isItem = !!selectedItem;
  const isText = !!selectedText;
  const isWall = !!selectedWall;

  return (
    <aside className="w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
         <Settings2 size={16} className="text-[#2965a2]" />
         <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Properties</h2>
      </div>

      <div className="p-5 flex flex-col gap-6">
        
        {/* WALL PROPERTIES PANEL */}
        {isWall && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Box size={14} /> Wall Settings
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Height (inches)</label>
                <input
                  type="number"
                  value={selectedWall.height}
                  onChange={(e) => updateWall(selectedId, { height: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Thickness (inches)</label>
                <input
                  type="number"
                  value={selectedWall.thickness}
                  onChange={(e) => updateWall(selectedId, { thickness: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ITEM PROPERTIES (Position & Transform) */}
        {(isItem || isText) && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Transform</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">X Position</label>
                <input type="number" value={Math.round(selectedItem?.x || selectedText?.x || 0)} onChange={(e) => isItem ? updateItem(selectedId, { x: Number(e.target.value) }) : updateText(selectedId, { x: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Y Position</label>
                <input type="number" value={Math.round(selectedItem?.y || selectedText?.y || 0)} onChange={(e) => isItem ? updateItem(selectedId, { y: Number(e.target.value) }) : updateText(selectedId, { y: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* ARRANGEMENT */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Layers size={14} /> Arrange
          </h3>
          <div className="flex gap-2">
            <button onClick={bringToFront} className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-lg py-2 text-xs font-semibold hover:border-[#2965a2] transition-all">Forward</button>
            <button onClick={sendToBack} className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-lg py-2 text-xs font-semibold hover:border-[#2965a2] transition-all">Backward</button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <button onClick={deleteSelected} className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all">Delete Object</button>
        </div>
      </div>
    </aside>
  );
}