import { useEffect } from 'react';
import CanvasWorkspace from './components/CanvasWorkspace';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import { useCanvasStore } from './store/useCanvasStore';
import { calculateBoQ } from './utils/volumetricEngine';
import { 
  Trash2, ArrowUpToLine, ArrowDownToLine, 
  Download, RefreshCcw, HardHat, Save, FolderOpen 
} from 'lucide-react';

export default function App() {
  // 1. Bring in all global functions from our Zustand store
  const { 
    walls, selectedId, 
    deleteSelected, bringToFront, sendToBack, clearCanvas, 
    triggerDownload, exportProject, importProject,
    undo, redo
  } = useCanvasStore();

  // 2. Calculate the real-time Bill of Quantities on every render
  const boq = calculateBoQ(walls);

  // 3. Global Keyboard Shortcuts (Undo/Redo & Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y or Cmd+Y
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Delete Object: Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Optional: you can uncomment this to enable keyboard deletion!
        // e.preventDefault();
        // deleteSelected(); 
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, deleteSelected]);

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden font-sans text-slate-800" style={{ backgroundColor: '#f9f9f8' }}>
      
      {/* --- TOP NAVIGATION HEADER --- */}
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
          
          {/* Layer Controls */}
          <button onClick={bringToFront} disabled={!selectedId} className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="Bring to Front">
            <ArrowUpToLine size={20} />
          </button>
          
          <button onClick={sendToBack} disabled={!selectedId} className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="Send to Back">
            <ArrowDownToLine size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          {/* Delete Control */}
          <button onClick={deleteSelected} disabled={!selectedId} className="p-2 text-red-300 hover:bg-red-500 hover:text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="Delete Selected Item">
            <Trash2 size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          {/* File Management Controls (JSON Import/Export) */}
          <input 
            type="file" id="fileInput" className="hidden" accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => importProject(e.target?.result as string);
              reader.readAsText(file);
              // Reset input so the same file can be loaded again if needed
              e.target.value = ''; 
            }}
          />

          <button onClick={() => document.getElementById('fileInput')?.click()} className="p-2 text-white hover:bg-white/20 rounded-md transition-all" title="Open Project (JSON)">
            <FolderOpen size={20} />
          </button>

          <button onClick={exportProject} className="p-2 text-white hover:bg-white/20 rounded-md transition-all" title="Save Project (JSON)">
            <Save size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          {/* Image Export & Reset Controls */}
          <button onClick={triggerDownload} className="p-2 text-white hover:bg-white/20 rounded-md transition-all" title="Download Image (PNG)">
            <Download size={20} />
          </button>

          <button onClick={clearCanvas} className="p-2 text-white hover:bg-white/20 rounded-md transition-all" title="Clear Entire Canvas">
            <RefreshCcw size={20} />
          </button>
        </div>
      </header>

      {/* --- MAIN DASHBOARD: THREE-PANE SPLIT SCREEN --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* 1. Left Tools & Library Sidebar */}
        <Sidebar />

        {/* 2. Center Infinite Blueprint Canvas */}
        <main className="flex-1 p-4 flex justify-center items-center overflow-hidden bg-[#f9f9f8]">
          <CanvasWorkspace />
        </main>

        {/* 3. Right Interactive Properties Sidebar */}
        <RightSidebar />
        
      </div>
    </div>
  );
}