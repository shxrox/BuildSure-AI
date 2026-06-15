import { useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useCanvasStore } from '../store/useCanvasStore';

export default function CanvasWorkspace() {
  const { walls, addWall } = useCanvasStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    if (!isDrawing) {
      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentMousePos(pos);
    } else if (startPoint) {
      addWall({
        id: crypto.randomUUID(),
        startX: startPoint.x,
        startY: startPoint.y,
        endX: pos.x,
        endY: pos.y,
        thickness: 9,
        height: 120,
        type: 'external'
      });

      setIsDrawing(false);
      setStartPoint(null);
      setCurrentMousePos(null);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

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

      <div className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 cursor-crosshair shadow-2xl relative">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        <Stage
          width={896}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.startX, wall.startY, wall.endX, wall.endY]}
                stroke="#10b981"
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowColor="#000"
                shadowBlur={5}
                shadowOpacity={0.3}
              />
            ))}

            {isDrawing && startPoint && currentMousePos && (
              <Line
                points={[
                  startPoint.x,
                  startPoint.y,
                  currentMousePos.x,
                  currentMousePos.y
                ]}
                stroke="#34d399"
                strokeWidth={9}
                dash={[15, 10]}
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