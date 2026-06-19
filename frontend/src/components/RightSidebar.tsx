import { useCanvasStore } from '../store/useCanvasStore';
import { Settings2, Type, Layers } from 'lucide-react';

export default function RightSidebar() {
  const { 
    selectedId, items, texts, 
    updateItem, updateText, bringToFront, sendToBack, deleteSelected 
  } = useCanvasStore();

  // 1. If nothing is selected, show the empty state
  if (!selectedId) {
    return (
      <aside className="w-[280px] bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-center shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] hidden lg:flex">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <Settings2 size={32} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-bold text-slate-500">No Object Selected</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Click on a door, window, furniture, or text label on the canvas to edit its exact properties here.
        </p>
      </aside>
    );
  }

  // 2. Identify exactly what the user clicked on
  const selectedItem = items.find(i => i.id === selectedId);
  const selectedText = texts.find(t => t.id === selectedId);

  const isItem = !!selectedItem;
  const isText = !!selectedText;

  return (
    <aside className="w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
         <Settings2 size={16} className="text-[#2965a2]" />
         <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Properties</h2>
      </div>

      <div className="p-5 flex flex-col gap-6">
        
        {/* SECTION A: Transform (Position & Size) */}
        {(isItem || isText) && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Transform</h3>
            <div className="grid grid-cols-2 gap-3">
              
              {/* X Position */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">X Position (px)</label>
                <input
                  type="number"
                  value={Math.round(selectedItem?.x || selectedText?.x || 0)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isItem) updateItem(selectedId, { x: val });
                    if (isText) updateText(selectedId, { x: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                />
              </div>

              {/* Y Position */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Y Position (px)</label>
                <input
                  type="number"
                  value={Math.round(selectedItem?.y || selectedText?.y || 0)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isItem) updateItem(selectedId, { y: val });
                    if (isText) updateText(selectedId, { y: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                />
              </div>

              {/* Width & Height (Only applies to architectural items, not text) */}
              {isItem && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500">Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.width)}
                      onChange={(e) => updateItem(selectedId, { width: Math.max(5, Number(e.target.value)) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-500">Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedItem.height)}
                      onChange={(e) => updateItem(selectedId, { height: Math.max(5, Number(e.target.value)) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Rotation */}
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-semibold text-slate-500">Rotation (Degrees)</label>
                <input
                  type="number"
                  value={Math.round(selectedItem?.rotation || selectedText?.rotation || 0)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (isItem) updateItem(selectedId, { rotation: val });
                    if (isText) updateText(selectedId, { rotation: val });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: Typography (Only shows if a Text element is selected) */}
        {isText && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Type size={14} /> Text Properties
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Label Output</label>
                <input
                  type="text"
                  value={selectedText.text}
                  onChange={(e) => updateText(selectedId, { text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500">Font Size (px)</label>
                <input
                  type="number"
                  value={Math.round(selectedText.fontSize)}
                  onChange={(e) => updateText(selectedId, { fontSize: Math.max(8, Number(e.target.value)) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded text-sm px-2 py-1.5 text-slate-700 outline-none focus:border-[#2965a2] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: Arrange (Layer Control) */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Layers size={14} /> Arrange
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={bringToFront} 
              className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-lg py-2 text-xs font-semibold hover:bg-slate-50 hover:border-[#2965a2] hover:text-[#2965a2] transition-all shadow-sm"
            >
              Bring Forward
            </button>
            <button 
              onClick={sendToBack} 
              className="flex-1 bg-white border border-slate-200 text-slate-600 rounded-lg py-2 text-xs font-semibold hover:bg-slate-50 hover:border-[#2965a2] hover:text-[#2965a2] transition-all shadow-sm"
            >
              Send Backward
            </button>
          </div>
        </div>

        {/* SECTION D: Danger Zone */}
        <div className="mt-auto pt-6 border-t border-slate-100">
           <button 
             onClick={deleteSelected} 
             className="w-full bg-red-50 text-red-600 border border-red-200 rounded-lg py-2 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all shadow-sm"
           >
             Delete Object
           </button>
        </div>

      </div>
    </aside>
  );
}