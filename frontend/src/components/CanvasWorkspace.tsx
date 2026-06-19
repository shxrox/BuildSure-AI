import { useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';

export default function CanvasWorkspace() {
  // Pull in our global state
  const { walls, addWall } = useCanvasStore();
  
  // Local state for the drawing interaction
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: any) => {
    // Get the exact X/Y coordinates of the mouse on the canvas
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    if (!isDrawing) {
      // First click: Start drawing a wall
      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentMousePos(pos);
    } else if (startPoint) {
      // Second click: Finish the wall and save it to Zustand
      addWall({
        id: crypto.randomUUID(), // Generates a unique ID natively in the browser
        startX: startPoint.x,
        startY: startPoint.y,
        endX: pos.x,
        endY: pos.y,
        thickness: 9, // Default to a 9-inch load-bearing wall
        height: 120, // Default to 10 feet (120 inches)
        type: 'external'
      });
      
      // Reset the drawing state
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentMousePos(null);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;
    
    // Update the visual line as the mouse moves
    const pos = e.target.getStage().getPointerPosition();
    if (pos) {
      setCurrentMousePos(pos);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 w-full flex justify-between items-center text-slate-300">
        <h2 className="text-xl font-semibold">Blueprint Canvas</h2>
        <span className="text-sm bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
          Total Walls: {walls.length}
        </span>
      </div>
      
      {/* The drawing area */}
      <div className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 cursor-crosshair shadow-2xl relative">
        {/* Subtle grid background using Tailwind */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <Stage
          width={896} // Fixed width for max-w-4xl
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* 1. Render all saved walls from the Zustand Store */}
            {walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.startX, wall.startY, wall.endX, wall.endY]}
                stroke="#10b981" // Tailwind Emerald-500
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={5}
                shadowOpacity={0.3}
              />
            ))}

            {/* 2. Render the temporary "ghost" wall currently being drawn */}
            {isDrawing && startPoint && currentMousePos && (
              <Line
                points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]}
                stroke="#34d399" // Tailwind Emerald-400
                strokeWidth={9}
                dash={[15, 10]} // Makes it a dashed line to indicate it's not saved yet
                lineCap="round"
              />
            )}
          </Layer>
        </Stage>
      </div>
      
      <p className="mt-4 text-slate-400 text-sm">
        Click once to start a wall, move your mouse, and click again to finish it.
      </p>
    </div>
  );
}