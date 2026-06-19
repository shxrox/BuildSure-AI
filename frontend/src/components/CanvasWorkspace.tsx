import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText, Transformer } from 'react-konva';
import { useCanvasStore, type CanvasItem, type CanvasText } from '../store/useCanvasStore';

const SNAP_RADIUS = 20;

export default function CanvasWorkspace() {
  const { 
    walls, items, texts, selectedId, 
    addWall, addItem, addText, updateText, updateItem, setSelectedId 
  } = useCanvasStore();
  
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; x: number; y: number; text: string } | null>(null);

  // --- Transformer Attachment Logic ---
  // Whenever the selectedId changes, attach the transformer box to that specific item
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current) {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedId, items, texts]);

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
    // 1. Check what we clicked on
    const clickedNode = e.target;
    const clickedOnEmpty = clickedNode === clickedNode.getStage();
    
    // 2. If we clicked a draggable item or text, select it and STOP drawing logic
    if (clickedNode.name() === 'item' || clickedNode.name() === 'text') {
      setSelectedId(clickedNode.id());
      return;
    }

    // 3. If we clicked empty space, deselect current item
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    // Prevent drawing if editing text
    if (editingText) return;

    // 4. Proceed with Wall Drawing Logic
    const rawPos = clickedNode.getStage().getPointerPosition();
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
      if (itemType === 'text') {
        addText({ id: crypto.randomUUID(), x: dropPos.x, y: dropPos.y, text: "New Label", fontSize: 20 });
      } else {
        // Define default sizes based on type
        let width = 40, height = 40;
        if (itemType === 'window') { width = 60; height = 10; }
        if (itemType === 'electrical') { width = 20; height = 20; }
        if (itemType === 'furniture') { width = 60; height = 60; }
        if (itemType === 'plumbing') { width = 30; height = 30; }

        addItem({
          id: crypto.randomUUID(),
          x: dropPos.x - (width/2),
          y: dropPos.y - (height/2),
          type: itemType as CanvasItem['type'],
          rotation: 0,
          width,
          height,
        });
      }
    }
  };

  const finishEditingText = () => {
    if (editingText) {
      updateText(editingText.id, { text: editingText.text });
      setEditingText(null);
    }
  };

  // Map item types to your professional color palette
  const getItemColor = (type: string) => {
    switch(type) {
      case 'door': return '#f59e0b'; // Amber
      case 'window': return '#3b82f6'; // Blue
      case 'plumbing': return '#06b6d4'; // Cyan
      case 'electrical': return '#eab308'; // Yellow
      case 'furniture': return '#6366f1'; // Indigo
      default: return '#94a3b8';
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 w-full flex justify-between items-center text-slate-600">
        <h2 className="text-lg font-bold">Blueprint Canvas</h2>
        <span className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm font-semibold">
          Objects: {walls.length + items.length + texts.length}
        </span>
      </div>
      
      <div 
        className="w-full max-w-4xl h-[600px] bg-white rounded-xl overflow-hidden border border-slate-200 cursor-crosshair shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Light Theme Grid Background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

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
                stroke="#2965a2" // Your primary corporate blue for walls!
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowBlur={2}
                shadowOpacity={0.1}
              />
            ))}

            {/* 2. Render Interactive Items */}
            {items.map((item) => (
              <Rect
                key={item.id}
                id={item.id} // ID is required for Transformer to find it
                name="item"  // Name is required for click selection
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                fill={getItemColor(item.type)}
                stroke="#ffffff"
                strokeWidth={2}
                shadowBlur={4}
                shadowColor="rgba(0,0,0,0.2)"
                draggable
                onDragStart={() => setSelectedId(item.id)}
                onDragEnd={(e) => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => {
                  // Konva transforms by scaling. We convert scale back to width/height to keep data clean
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateItem(item.id, {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                  });
                }}
              />
            ))}

            {/* 3. Render Texts */}
            {texts.map((textItem) => (
              <KonvaText
                key={textItem.id}
                id={textItem.id}
                name="text"
                x={textItem.x}
                y={textItem.y}
                text={textItem.text}
                fontSize={textItem.fontSize}
                fontFamily="sans-serif"
                fontStyle="bold"
                fill={editingText?.id === textItem.id ? 'transparent' : '#334155'}
                draggable
                onDragStart={() => setSelectedId(textItem.id)}
                onDragEnd={(e) => updateText(textItem.id, { x: e.target.x(), y: e.target.y() })}
                onDblClick={() => setEditingText({ id: textItem.id, x: textItem.x, y: textItem.y, text: textItem.text })}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateText(textItem.id, {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    fontSize: Math.max(10, textItem.fontSize * scaleX),
                  });
                }}
              />
            ))}

            {/* Ghost Wall */}
            {isDrawing && startPoint && currentMousePos && (
              <Line points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]} stroke="#60a5fa" strokeWidth={9} dash={[15, 10]} lineCap="round" />
            )}
            
            {/* Snap Indicator */}
            {snapPoint && <Circle x={snapPoint.x} y={snapPoint.y} radius={8} stroke="#2965a2" strokeWidth={2} fill="rgba(41, 101, 162, 0.2)" />}

            {/* 4. The Transformer (Handles Resizing and Rotation) */}
            {selectedId && (
              <Transformer 
                ref={trRef} 
                boundBoxFunc={(oldBox, newBox) => {
                  // Prevent resizing smaller than 5x5 pixels
                  if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                  return newBox;
                }}
                anchorStroke="#2965a2"
                anchorFill="#ffffff"
                anchorSize={8}
                borderStroke="#2965a2"
              />
            )}
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
            style={{ position: 'absolute', top: `${editingText.y}px`, left: `${editingText.x}px` }}
            className="bg-white text-slate-800 border-2 border-blue-500 rounded px-2 py-1 outline-none font-sans font-bold shadow-lg z-50"
          />
        )}
      </div>
    </div>
  );
}