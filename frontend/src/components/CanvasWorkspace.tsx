import { useState, useRef } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText } from 'react-konva';
// FIX: We added the 'type' keyword before CanvasItem and CanvasText
import { useCanvasStore, type CanvasItem, type CanvasText } from '../store/useCanvasStore';

const SNAP_RADIUS = 20;

export default function CanvasWorkspace() {
  const { walls, items, texts, addWall, addItem, addText, updateText } = useCanvasStore();
  const stageRef = useRef<any>(null);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);

  // Text Editing State (Overlay)
  const [editingText, setEditingText] = useState<{ id: string; x: number; y: number; text: string } | null>(null);

  // --- Coordinate & Snap Logic ---
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

  const handleMouseDown = (e: any) => {
    // Prevent drawing a wall if we are just clicking to edit text or move an item
    if (e.target.className === 'Text' || e.target.className === 'Rect' || editingText) return;

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
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('application/buildsure-item');
    if (!itemType || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const dropPos = stageRef.current.getPointerPosition();
    
    if (dropPos) {
      if (itemType === 'door' || itemType === 'window') {
        const newItem: CanvasItem = {
          id: crypto.randomUUID(),
          x: dropPos.x - 20,
          y: dropPos.y - 10,
          type: itemType as 'door' | 'window',
          rotation: 0,
          width: itemType === 'door' ? 40 : 60,
          height: itemType === 'door' ? 40 : 10,
        };
        addItem(newItem);
      } else if (itemType === 'text') {
        const newText: CanvasText = {
          id: crypto.randomUUID(),
          x: dropPos.x,
          y: dropPos.y,
          text: "Double-click to edit",
          fontSize: 20,
        };
        addText(newText);
      }
    }
  };

  // --- Text Edit Save Handler ---
  const finishEditingText = () => {
    if (editingText) {
      updateText(editingText.id, { text: editingText.text });
      setEditingText(null);
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
      
      <div 
        className="w-full max-w-4xl h-[600px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 cursor-crosshair shadow-2xl relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <Stage
          ref={stageRef}
          width={896}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* 1. Render Walls */}
            {walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.startX, wall.startY, wall.endX, wall.endY]}
                stroke="#10b981"
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowBlur={4}
                shadowOpacity={0.2}
              />
            ))}

            {/* 2. Render Doors and Windows */}
            {items.map((item) => (
              <Rect
                key={item.id}
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                fill={item.type === 'door' ? '#f59e0b' : '#3b82f6'}
                stroke="#0f172a"
                strokeWidth={2}
                draggable
                onDragEnd={(e) => useCanvasStore.getState().updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
              />
            ))}

            {/* 3. Render Texts */}
            {texts.map((textItem) => (
              <KonvaText
                key={textItem.id}
                x={textItem.x}
                y={textItem.y}
                text={textItem.text}
                fontSize={textItem.fontSize}
                fontFamily="serif"
                fill={editingText?.id === textItem.id ? 'transparent' : '#fbbf24'} // Hide Konva text while HTML input is active
                draggable
                onDragEnd={(e) => useCanvasStore.getState().updateText(textItem.id, { x: e.target.x(), y: e.target.y() })}
                onDblClick={() => {
                  setEditingText({ id: textItem.id, x: textItem.x, y: textItem.y, text: textItem.text });
                }}
              />
            ))}

            {/* Ghost Wall */}
            {isDrawing && startPoint && currentMousePos && (
              <Line points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]} stroke="#34d399" strokeWidth={9} dash={[15, 10]} lineCap="round" />
            )}
            {/* Snap Indicator */}
            {snapPoint && <Circle x={snapPoint.x} y={snapPoint.y} radius={8} stroke="#fbbf24" strokeWidth={2} fill="rgba(251, 191, 36, 0.3)" />}
          </Layer>
        </Stage>

        {/* HTML Input Overlay for Editing Text */}
        {editingText && (
          <input
            type="text"
            value={editingText.text}
            autoFocus
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onBlur={finishEditingText}
            onKeyDown={(e) => e.key === 'Enter' && finishEditingText()}
            style={{
              position: 'absolute',
              top: `${editingText.y - 2}px`,
              left: `${editingText.x - 2}px`,
            }}
            className="bg-slate-800 text-amber-400 border border-amber-500 rounded px-1 outline-none font-serif text-[20px] z-50 shadow-lg"
          />
        )}
      </div>
    </div>
  );
}