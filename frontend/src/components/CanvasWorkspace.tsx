import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText, Transformer } from 'react-konva';
import { useCanvasStore, type CanvasItem, type CanvasText } from '../store/useCanvasStore';

const SNAP_RADIUS = 20 / 1; // Base radius, effectively changes with zoom

export default function CanvasWorkspace() {
  const { 
    walls, items, texts, selectedId, 
    activeTool, wallThickness, exportTrigger, // NEW: Brought in from the Brain
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

  // --- 1. Export Engine ---
  useEffect(() => {
    if (exportTrigger > 0 && stageRef.current) {
      // Temporarily hide the transformer box so it doesn't show in the download
      setSelectedId(null);
      
      setTimeout(() => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 }); // High-Res export
        const link = document.createElement('a');
        link.download = 'BuildSure_Blueprint.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    }
  }, [exportTrigger]);

  // --- 2. Transformer Attachment ---
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current && activeTool === 'select') {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      // Detach if not selecting
      trRef.current.nodes([]);
    }
  }, [selectedId, items, texts, activeTool]);

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

  // --- Mouse & Tool Handling Logic ---
  const handleMouseDown = (e: any) => {
    if (activeTool === 'pan') return; // Handled natively by Konva's draggable Stage
    if (editingText) return;

    const clickedNode = e.target;
    const clickedOnEmpty = clickedNode === clickedNode.getStage();
    const isItemOrText = clickedNode.name() === 'item' || clickedNode.name() === 'text';

    // TOOL: Select
    if (activeTool === 'select') {
      if (isItemOrText) {
        setSelectedId(clickedNode.id());
      } else if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return; // Do not draw when selecting
    }

    // TOOL: Draw Wall
    if (activeTool === 'draw_wall') {
      // Prevent selecting when drawing
      setSelectedId(null);

      const rawPos = clickedNode.getStage().getPointerPosition();
      // Adjust for pan and zoom to get relative coordinates
      const transform = clickedNode.getStage().getAbsoluteTransform().copy();
      transform.invert();
      const pos = transform.point(rawPos);
      
      const { x, y } = getSnapCoordinates(pos.x, pos.y);

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
          thickness: wallThickness, // NEW: Uses the exact thickness from the sidebar!
          height: 120,
          type: wallThickness === 9 ? 'external' : 'internal'
        });
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentMousePos(null);
        setSnapPoint(null);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (activeTool !== 'draw_wall') return;

    const rawPos = e.target.getStage().getPointerPosition();
    if (!rawPos) return;

    const transform = e.target.getStage().getAbsoluteTransform().copy();
    transform.invert();
    const pos = transform.point(rawPos);

    const { x, y, isSnapped } = getSnapCoordinates(pos.x, pos.y);
    setSnapPoint(isSnapped ? { x, y } : null);
    
    if (isDrawing) setCurrentMousePos({ x, y });
  };

  // --- Zoom Logic (Mouse Wheel) ---
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Zoom in on Scroll Up, out on Scroll Down
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  };

  // --- Drag and Drop Logic ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('application/buildsure-item');
    if (!itemType || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const rawPos = stageRef.current.getPointerPosition();
    
    if (rawPos) {
      // Adjust for pan and zoom when dropping
      const transform = stageRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const dropPos = transform.point(rawPos);

      if (itemType === 'text') {
        addText({ id: crypto.randomUUID(), x: dropPos.x, y: dropPos.y, text: "New Label", fontSize: 20 });
      } else {
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

  const getItemColor = (type: string) => {
    switch(type) {
      case 'door': return '#f59e0b';
      case 'window': return '#3b82f6';
      case 'plumbing': return '#06b6d4';
      case 'electrical': return '#eab308';
      case 'furniture': return '#6366f1';
      default: return '#94a3b8';
    }
  };

  // --- Dynamic Cursor UI ---
  const getCursorStyle = () => {
    if (activeTool === 'pan') return 'cursor-grab active:cursor-grabbing';
    if (activeTool === 'draw_wall') return 'cursor-crosshair';
    return 'cursor-default';
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 w-full flex justify-between items-center text-slate-600 shrink-0">
        <h2 className="text-lg font-bold">Blueprint Canvas</h2>
        <span className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm font-semibold text-slate-500">
          Scroll wheel to zoom • Drag to pan
        </span>
      </div>
      
      <div 
        className={`flex-1 w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative ${getCursorStyle()}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 opacity-40 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <Stage
          ref={stageRef}
          width={window.innerWidth - 350} // Responsive to sidebar width
          height={window.innerHeight - 150} // Responsive to header heights
          draggable={activeTool === 'pan'} // ONLY draggable if Pan tool is active
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* Render Walls */}
            {walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.startX, wall.startY, wall.endX, wall.endY]}
                stroke="#2965a2"
                strokeWidth={wall.thickness}
                lineCap="round"
                lineJoin="round"
                shadowBlur={2}
                shadowOpacity={0.1}
              />
            ))}

            {/* Render Interactive Items */}
            {items.map((item) => (
              <Rect
                key={item.id}
                id={item.id}
                name="item"
                x={item.x}
                y={item.y}
                width={item.width}
                height={item.height}
                rotation={item.rotation}
                fill={getItemColor(item.type)}
                stroke="#ffffff"
                strokeWidth={2}
                draggable={activeTool === 'select'} // Only draggable if select tool is active
                onDragStart={() => activeTool === 'select' && setSelectedId(item.id)}
                onDragEnd={(e) => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1); node.scaleY(1);
                  updateItem(item.id, {
                    x: node.x(), y: node.y(), rotation: node.rotation(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(5, node.height() * scaleY),
                  });
                }}
              />
            ))}

            {/* Render Texts */}
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
                draggable={activeTool === 'select'}
                onDragStart={() => activeTool === 'select' && setSelectedId(textItem.id)}
                onDragEnd={(e) => updateText(textItem.id, { x: e.target.x(), y: e.target.y() })}
                onDblClick={() => setEditingText({ id: textItem.id, x: textItem.x, y: textItem.y, text: textItem.text })}
              />
            ))}

            {/* Ghost Wall */}
            {isDrawing && startPoint && currentMousePos && activeTool === 'draw_wall' && (
              <Line points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]} stroke="#60a5fa" strokeWidth={wallThickness} dash={[15, 10]} lineCap="round" />
            )}
            
            {/* Snap Indicator */}
            {snapPoint && activeTool === 'draw_wall' && <Circle x={snapPoint.x} y={snapPoint.y} radius={8} stroke="#2965a2" strokeWidth={2} fill="rgba(41, 101, 162, 0.2)" />}

            {/* The Transformer */}
            {selectedId && activeTool === 'select' && (
              <Transformer 
                ref={trRef} 
                boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) ? oldBox : newBox}
                anchorStroke="#2965a2" anchorFill="#ffffff" anchorSize={8} borderStroke="#2965a2"
              />
            )}
          </Layer>
        </Stage>

        {/* HTML Input Overlay */}
        {editingText && (
          <input
            type="text"
            value={editingText.text}
            autoFocus
            onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
            onBlur={finishEditingText}
            onKeyDown={(e) => e.key === 'Enter' && finishEditingText()}
            style={{ position: 'absolute', top: `50px`, left: `50px` }} // Fixed to top left to avoid zoom coordinate math for HTML
            className="bg-white text-slate-800 border-2 border-blue-500 rounded px-2 py-1 outline-none font-sans font-bold shadow-lg z-50"
          />
        )}
      </div>
    </div>
  );
}