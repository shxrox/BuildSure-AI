import CanvasWorkspace from './components/CanvasWorkspace';
import { useCanvasStore } from './store/useCanvasStore';

export default function App() {
  // Bring in the clear function from our global store
  const { clearCanvas } = useCanvasStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation Header */}
      <header className="w-full bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">BuildSure-AI</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Digital Site Supervisor</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={clearCanvas}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 cursor-pointer rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            Clear Canvas
          </button>
          <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 cursor-pointer text-slate-950 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20">
            Calculate BoQ (Coming Soon)
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 p-6 flex justify-center items-start overflow-auto">
        {/* Render our interactive 2D Konva Canvas here */}
        <CanvasWorkspace />
      </main>
    </div>
  );
}