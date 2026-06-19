import CanvasWorkspace from './components/CanvasWorkspace';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import { useCanvasStore } from './store/useCanvasStore';
import { calculateBoQ } from './utils/volumetricEngine'; // NEW: Importing our QS Engine
import { Trash2, ArrowUpToLine, ArrowDownToLine, Download, RefreshCcw, HardHat } from 'lucide-react';
import { useEffect } from 'react';


export default function App() {
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check for Ctrl+Z (Undo)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      useCanvasStore.getState().undo();
    }
    // Check for Ctrl+Y (Redo)
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      useCanvasStore.getState().redo();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);

  const { walls, clearCanvas, selectedId, deleteSelected, bringToFront, sendToBack, triggerDownload } = useCanvasStore();

  // NEW: Calculate the real-time Bill of Quantities every time the screen renders
  const boq = calculateBoQ(walls);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden font-sans text-slate-800" style={{ backgroundColor: '#f9f9f8' }}>
      
      {/* Top Navigation Header */}
      <header className="w-full p-3 flex justify-between items-center shadow-md z-20 shrink-0 relative" style={{ backgroundColor: '#2965a2' }}>
        
        {/* Left Side: Brand & Live Estimation Scoreboard */}
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">BuildSure-AI</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Digital Site Supervisor</p>
          </div>

          {/* Live BoQ Scoreboard */}
          <div className="hidden lg:flex items-center gap-4 bg-black/20 px-5 py-1.5 rounded-lg border border-white/10 shadow-inner">
            <div className="flex items-center gap-2">
              <HardHat size={18} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Live BoQ</span>
            </div>
            <div className="w-px h-6 bg-white/20 mx-1"></div>
            
            <div className="flex gap-6">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-blue-200 font-semibold uppercase">Total Bricks</span>
                <span className="text-sm font-bold text-white">{boq.totalBricks.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-blue-200 font-semibold uppercase">Cement (50kg Bags)</span>
                <span className="text-sm font-bold text-white">{boq.cementBags.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-blue-200 font-semibold uppercase">Sand (Cubes)</span>
                <span className="text-sm font-bold text-white">{boq.sandCubes}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Advanced Action Toolbar */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/20">
          
          <button 
            onClick={bringToFront} disabled={!selectedId}
            className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Bring to Front"
          >
            <ArrowUpToLine size={20} />
          </button>
          
          <button 
            onClick={sendToBack} disabled={!selectedId}
            className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Send to Back"
          >
            <ArrowDownToLine size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          <button 
            onClick={deleteSelected} disabled={!selectedId}
            className="p-2 text-red-300 hover:bg-red-500 hover:text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Delete Selected Item"
          >
            <Trash2 size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          <button 
            onClick={triggerDownload}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-all"
            title="Download PDF/Image"
          >
            <Download size={20} />
          </button>

          <button 
            onClick={clearCanvas}
            className="p-2 text-white hover:bg-white/20 rounded-md transition-all"
            title="Clear Entire Canvas"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout: Three-Pane Split Screen */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 p-4 flex justify-center items-center overflow-hidden bg-[#f9f9f8]">
          <CanvasWorkspace />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}