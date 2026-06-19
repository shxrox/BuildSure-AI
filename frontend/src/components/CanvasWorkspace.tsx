import { useState } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';

const SNAP_RADIUS = 20; // How close the mouse needs to be to snap to a corner

export default function CanvasWorkspace() {
  const { walls, addWall } = useCanvasStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);

  // The Mathematical Engine for Snapping
  const getSnapCoordinates = (mouseX: number, mouseY: number) => {
    for (const wall of walls) {
      // Check distance to the start of an existing wall
      if (Math.hypot(wall.startX - mouseX, wall.startY - mouseY) < SNAP_RADIUS) {
        return { x: wall.startX, y: wall.startY, isSnapped: true };
      }
      // Check distance to the end of an existing wall
      if (Math.hypot(wall.endX - mouseX, wall.endY - mouseY) < SNAP_RADIUS) {
        return { x: wall.endX, y: wall.endY, isSnapped: true };
      }
    }
    return { x: mouseX, y: mouseY, isSnapped: false };
  };

  const handleMouseDown = (e: any) => {
    const rawPos = e.target.getStage().getPointerPosition();
    if (!rawPos) return;

    // Apply snapping logic to the click position
    const { x, y } = getSnapCoordinates(rawPos.x, rawPos.y);

    if (!isDrawing) {
      // Start drawing
      setIsDrawing(true);
      setStartPoint({ x, y });
      setCurrentMousePos({ x, y });
    } else if (startPoint) {
      // Finish drawing and save to Zustand
      addWall({
        id: crypto.randomUUID(),
        startX: startPoint.x,
        startY: startPoint.y,
        endX: x,
        endY: y,
        thickness: 9, // Default load-bearing
        height: 120, // Default height
        type: 'external'
      });
      
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentMousePos(null);
      setSnapPoint(null);
    }
  };

  const handleMouseMove = (e: any) => {
    const rawPos = e.target.getStage().getPointerPosition();
    if (!rawPos) return;

    // Constantly calculate if we are near an existing corner
    const { x, y, isSnapped } = getSnapCoordinates(rawPos.x, rawPos.y);
    
    if (isSnapped) {
      setSnapPoint({ x, y });
    } else {
      setSnapPoint(null);
    }

    if (isDrawing) {
      setCurrentMousePos({ x, y });
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
      
      <div className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 cursor-crosshair shadow-2xl relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <Stage
          width={896}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* 1. Render Saved Walls */}
            {walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.startX, wall.startY, wall.endX, wall.endY]}
                stroke="#10b981"
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={4}
                shadowOpacity={0.2}
              />
            ))}

            {/* 2. Render Active Ghost Wall */}
            {isDrawing && startPoint && currentMousePos && (
              <Line
                points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]}
                stroke="#34d399"
                strokeWidth={9}
                dash={[15, 10]}
                lineCap="round"
              />
            )}

            {/* 3. Render Snap Indicator (Visual Magnet) */}
            {snapPoint && (
              <Circle
                x={snapPoint.x}
                y={snapPoint.y}
                radius={8}
                stroke="#fbbf24" // Tailwind Amber-400
                strokeWidth={2}
                fill="rgba(251, 191, 36, 0.3)"
              />
            )}
          </Layer>
        </Stage>
      </div>
      
      <p className="mt-4 text-slate-400 text-sm">
        Hover near an existing wall corner to see the yellow snap indicator.
      </p>
    </div>
  );
}