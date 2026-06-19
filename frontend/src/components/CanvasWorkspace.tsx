import { useState, useRef } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText } from 'react-konva';
import { useCanvasStore, CanvasItem } from '../store/useCanvasStore';

const SNAP_RADIUS = 20;

export default function CanvasWorkspace() {
  const { walls, items, texts, addWall, addItem } = useCanvasStore();
  
  // We need a reference to the Stage to calculate drop coordinates accurately
  const stageRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);

  const getSnapCoordinates = (mouseX: number, mouseY: number) => {
    for (const wall of walls) {
      if (Math.hypot(wall.startX - mouseX, wall.startY - mouseY) < SNAP_RADIUS) {
        return { x: wall.startX, y: wall.startY, isSnapped: true };
      }
      if (Math.hypot(wall.endX - mouseX, wall.endY - mouseY) < SNAP_RADIUS) {
        return { x: wall.endX, y: wall.endY, isSnapped: true };
      }
    }
    return { x: mouseX, y: mouseY, isSnapped: false };
  };

  // --- Wall Drawing Logic ---
  const handleMouseDown = (e: any) => {
    const rawPos = e.target.getStage().getPointerPosition();
    if (!rawPos) return;

    const { x, y } = getSnapCoordinates(rawPos.x, rawPos.y);

    if (!isDrawing) {
      setIsDrawing(true);
      setStartPoint({ x, y });
      setCurrentMousePos({ x, y });
    } else if (startPoint) {
      addWall({
        id: crypto.randomUUID(),
        startX: startPoint.x,
        startY: startPoint.y,
        endX: x,
        endY: y,
        thickness: 9,
        height: 120,
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

    const { x, y, isSnapped } = getSnapCoordinates(rawPos.x, rawPos.y);
    setSnapPoint(isSnapped ? { x, y } : null);
    
    if (isDrawing) setCurrentMousePos({ x, y });
  };

  // --- Drag and Drop Logic ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Get the data payload we set in the Sidebar
    const itemType = e.dataTransfer.getData('application/buildsure-item');
    if (!itemType || !stageRef.current) return;

    // Calculate exact canvas coordinates relative to the window
    stageRef.current.setPointersPositions(e);
    const dropPos = stageRef.current.getPointerPosition();
    
    if (dropPos) {
      if (itemType === 'door' || itemType === 'window') {
        const newItem: CanvasItem = {
          id: crypto.randomUUID(),
          x: dropPos.x - 20, // Center the item on the mouse
          y: dropPos.y - 20,
          type: itemType as 'door' | 'window',
          rotation: 0,
          width: itemType === 'door' ? 40 : 60,
          height: itemType === 'door' ? 40 : 10,
        };
        addItem(newItem);
      }
      // Note: Text dropping logic will be handled in the next step!
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 w-full flex justify-between items-center text-slate-300">
        <h2 className="text-xl font-semibold">Blueprint Canvas</h2>
        <span className="text-sm bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
          Objects: {walls.length + items.length + texts.length}
        </span>
      </div>
      
      {/* The Wrapper DIV handles the browser's Drop Event */}
      <div 
        className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 cursor-crosshair shadow-2xl relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <Stage
          ref={stageRef}
          width={896}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* Render Saved Walls */}
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

            {/* Render Dropped Items (Doors and Windows) */}
            {items.map((item) => (
              <Rect
                key={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                fill={item.type === 'door' ? '#f59e0b' : '#3b82f6'} // Amber for Door, Blue for Window
                stroke="#0f172a"
                strokeWidth={2}
                draggable // Native Konva drag so you can move it after dropping!
                onDragEnd={(e) => {
                   // Update Zustand when user moves the item on the canvas
                   useCanvasStore.getState().updateItem(item.id, {
                     x: e.target.x(),
                     y: e.target.y()
                   });
                }}
              />
            ))}

            {/* Render Active Ghost Wall */}
            {isDrawing && startPoint && currentMousePos && (
              <Line
                points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]}
                stroke="#34d399"
                strokeWidth={9}
                dash={[15, 10]}
                lineCap="round"
              />
            )}

            {/* Render Snap Indicator */}
            {snapPoint && (
              <Circle x={snapPoint.x} y={snapPoint.y} radius={8} stroke="#fbbf24" strokeWidth={2} fill="rgba(251, 191, 36, 0.3)" />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}