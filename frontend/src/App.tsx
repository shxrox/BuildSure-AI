import CanvasWorkspace from './components/CanvasWorkspace';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import { useCanvasStore } from './store/useCanvasStore';
import { Trash2, ArrowUpToLine, ArrowDownToLine, Download, RefreshCcw } from 'lucide-react';

export default function App() {
  // Bring in all our global functions, including the new triggerDownload
  const { clearCanvas, selectedId, deleteSelected, bringToFront, sendToBack, triggerDownload } = useCanvasStore();

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden font-sans text-slate-800" style={{ backgroundColor: '#f9f9f8' }}>
      
      {/* Top Navigation Header */}
      <header className="w-full p-4 flex justify-between items-center shadow-md z-20 shrink-0 relative" style={{ backgroundColor: '#2965a2' }}>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BuildSure-AI</h1>
          <p className="text-xs text-blue-200 uppercase tracking-wider">Digital Site Supervisor</p>
        </div>
        
        {/* Advanced Action Toolbar */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/20">
          
          <button 
            onClick={bringToFront}
            disabled={!selectedId}
            className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Bring to Front"
          >
            <ArrowUpToLine size={20} />
          </button>
          
          <button 
            onClick={sendToBack}
            disabled={!selectedId}
            className="p-2 text-white hover:bg-white/20 rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Send to Back"
          >
            <ArrowDownToLine size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          <button 
            onClick={deleteSelected}
            disabled={!selectedId}
            className="p-2 text-red-300 hover:bg-red-500 hover:text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Delete Selected Item"
          >
            <Trash2 size={20} />
          </button>

          <div className="w-px h-6 bg-white/30 mx-1"></div>

          {/* Connected the real export engine here! */}
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
        
        {/* 1. Left Tools Sidebar */}
        <Sidebar />

        {/* 2. Center Infinite Canvas */}
        <main className="flex-1 p-4 flex justify-center items-center overflow-hidden bg-[#f9f9f8]">
          <CanvasWorkspace />
        </main>

        {/* 3. Right Properties Sidebar */}
        <RightSidebar />
        
      </div>
    </div>
  );
}