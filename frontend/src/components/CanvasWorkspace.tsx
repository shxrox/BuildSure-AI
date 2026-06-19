import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText, Transformer, Group, Arc, Ellipse } from 'react-konva';
import { useCanvasStore, type CanvasItem, type CanvasText, type Wall } from '../store/useCanvasStore';
import { create } from 'zustand';

const SNAP_RADIUS = 20;
const PIXELS_PER_METER = 100; // Conversion rate

export default function CanvasWorkspace() {
  const { 
    walls, items, texts, selectedId, 
    activeTool, wallThickness, exportTrigger,
    addWall, addItem, addText, updateText, updateItem, setSelectedId 
  } = useCanvasStore();
  
  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; x: number; y: number; text: string } | null>(null);

  // --- Export Engine ---
  useEffect(() => {
    if (exportTrigger > 0 && stageRef.current) {
      setSelectedId(null);
      setTimeout(() => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'BuildSure_Blueprint.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    }
  }, [exportTrigger]);

  // --- Transformer Attachment ---
  useEffect(() => {
    if (selectedId && trRef.current && stageRef.current && activeTool === 'select') {
      const node = stageRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, items, texts, walls, activeTool]); // Added walls to dependency array

  // --- Coordinate Logic ---
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
    if (activeTool === 'pan' || editingText) return;

    const clickedNode = e.target;
    const clickedGroup = clickedNode.findAncestor('.item-group');
    const clickedText = clickedNode.name() === 'text';
    const clickedWall = clickedNode.name() === 'wall'; // NEW: Detect Wall Clicks
    const clickedOnEmpty = clickedNode === clickedNode.getStage();

    if (activeTool === 'select') {
      if (clickedGroup) {
        setSelectedId(clickedGroup.id());
      } else if (clickedText || clickedWall) {
        setSelectedId(clickedNode.id());
      } else if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    if (activeTool === 'draw_wall') {
      setSelectedId(null);
      const rawPos = clickedNode.getStage().getPointerPosition();
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
          startX: startPoint.x, startY: startPoint.y, endX: x, endY: y,
          thickness: wallThickness, 
          height: 120, // Default 10 feet
          type: wallThickness === 9 ? 'external' : 'internal'
        });
        setIsDrawing(false); setStartPoint(null); setCurrentMousePos(null); setSnapPoint(null);
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

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('application/buildsure-item');
    if (!itemType || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const rawPos = stageRef.current.getPointerPosition();
    
    if (rawPos) {
      const transform = stageRef.current.getAbsoluteTransform().copy();
      transform.invert();
      const dropPos = transform.point(rawPos);

      if (itemType === 'text') {
        addText({ id: crypto.randomUUID(), x: dropPos.x, y: dropPos.y, text: "New Label", fontSize: 20 });
      } else {
        let width = 40, height = 40;
        if (itemType === 'window') { width = 60; height = 15; }
        if (itemType === 'electrical') { width = 20; height = 20; }
        if (itemType === 'furniture') { width = 60; height = 60; }
        if (itemType === 'plumbing') { width = 30; height = 40; }

        addItem({
          id: crypto.randomUUID(),
          x: dropPos.x - (width/2), y: dropPos.y - (height/2),
          type: itemType as CanvasItem['type'], rotation: 0, width, height,
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

  // --- Helper to render Live Dimensions ---
  const renderLiveDimension = () => {
    if (!isDrawing || !startPoint || !currentMousePos || activeTool !== 'draw_wall') return null;
    
    const lengthPx = Math.hypot(currentMousePos.x - startPoint.x, currentMousePos.y - startPoint.y);
    const lengthMeters = (lengthPx / PIXELS_PER_METER).toFixed(2);
    
    // Position text slightly above the midpoint of the line
    const midX = (startPoint.x + currentMousePos.x) / 2;
    const midY = (startPoint.y + currentMousePos.y) / 2;

    return (
      <Group x={midX} y={midY - 20}>
        <Rect x={-25} y={-10} width={50} height={20} fill="#2965a2" cornerRadius={4} shadowBlur={4} shadowOpacity={0.2} />
        <KonvaText x={-25} y={-6} width={50} text={`${lengthMeters}m`} fontSize={12} fill="#ffffff" align="center" fontStyle="bold" />
      </Group>
    );
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
        className={`flex-1 w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : activeTool === 'draw_wall' ? 'cursor-crosshair' : 'cursor-default'}`}
        onDrop={handleDrop} onDragOver={handleDragOver}
      >
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <Stage
          ref={stageRef}
          width={window.innerWidth - 350} height={window.innerHeight - 150}
          draggable={activeTool === 'pan'} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        >
          <Layer>
            {/* Walls */}
            {walls.map((wall) => {
              const lengthPx = Math.hypot(wall.endX - wall.startX, wall.endY - wall.startY);
              const lengthMeters = (lengthPx / PIXELS_PER_METER).toFixed(2);
              const midX = (wall.startX + wall.endX) / 2;
              const midY = (wall.startY + wall.endY) / 2;
              const isSelected = selectedId === wall.id;

              return (
                <Group key={wall.id}>
                  {/* Invisible thicker line to make clicking walls easier */}
                  <Line 
                    id={wall.id} name="wall"
                    points={[wall.startX, wall.startY, wall.endX, wall.endY]} 
                    stroke="transparent" strokeWidth={20} lineCap="round" 
                  />
                  <Line 
                    points={[wall.startX, wall.startY, wall.endX, wall.endY]} 
                    stroke={isSelected ? "#f59e0b" : "#2965a2"} // Turns orange when selected!
                    strokeWidth={wall.thickness} lineCap="round" lineJoin="round" 
                  />
                  {/* Static Dimensions shown only when wall is selected */}
                  {isSelected && (
                     <Group x={midX} y={midY - 20}>
                       <Rect x={-25} y={-10} width={50} height={20} fill="#f59e0b" cornerRadius={4} />
                       <KonvaText x={-25} y={-6} width={50} text={`${lengthMeters}m`} fontSize={12} fill="#ffffff" align="center" fontStyle="bold" />
                     </Group>
                  )}
                </Group>
              );
            })}

            {/* Architectural Items */}
            {items.map((item) => {
              const color = getItemColor(item.type);
              return (
                <Group
                  key={item.id} id={item.id} name="item-group"
                  x={item.x} y={item.y} rotation={item.rotation}
                  draggable={activeTool === 'select'}
                  onDragStart={() => activeTool === 'select' && setSelectedId(item.id)}
                  onDragEnd={(e) => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                  onTransformEnd={(e) => {
                    const node = e.target; const scaleX = node.scaleX(); const scaleY = node.scaleY();
                    node.scaleX(1); node.scaleY(1);
                    updateItem(item.id, {
                      x: node.x(), y: node.y(), rotation: node.rotation(),
                      width: Math.max(10, item.width * scaleX), height: Math.max(10, item.height * scaleY),
                    });
                  }}
                >
                  <Rect x={0} y={0} width={item.width} height={item.height} fill="transparent" />
                  {item.type === 'door' && ( <><Rect x={0} y={0} width={item.width * 0.15} height={item.height} fill={color} cornerRadius={2} /><Arc x={item.width * 0.15} y={item.height} innerRadius={item.width * 0.8} outerRadius={item.width * 0.85} angle={90} rotation={-90} fill={color} opacity={0.6} /></> )}
                  {item.type === 'window' && ( <><Rect width={item.width} height={item.height} stroke={color} strokeWidth={2} fill="#ffffff" cornerRadius={2} /><Line points={[0, item.height * 0.35, item.width, item.height * 0.35]} stroke={color} strokeWidth={1} /><Line points={[0, item.height * 0.65, item.width, item.height * 0.65]} stroke={color} strokeWidth={1} /></> )}
                  {item.type === 'furniture' && ( <><Rect x={0} y={0} width={item.width} height={item.height * 0.25} fill={color} cornerRadius={4} /><Rect x={0} y={item.height * 0.2} width={item.width * 0.2} height={item.height * 0.8} fill={color} cornerRadius={4} /><Rect x={item.width * 0.8} y={item.height * 0.2} width={item.width * 0.2} height={item.height * 0.8} fill={color} cornerRadius={4} /><Rect x={item.width * 0.2} y={item.height * 0.25} width={item.width * 0.6} height={item.height * 0.75} fill="#f1f5f9" cornerRadius={2} /></> )}
                  {item.type === 'plumbing' && ( <><Rect x={item.width * 0.1} y={0} width={item.width * 0.8} height={item.height * 0.35} fill={color} cornerRadius={3} /><Ellipse x={item.width / 2} y={item.height * 0.65} radiusX={item.width * 0.35} radiusY={item.height * 0.3} fill="#ffffff" stroke={color} strokeWidth={2} /></> )}
                  {item.type === 'electrical' && ( <><Circle x={item.width / 2} y={item.height / 2} radius={Math.min(item.width, item.height) / 2} fill="#ffffff" stroke={color} strokeWidth={2} /><Line points={[item.width * 0.55, item.height * 0.2, item.width * 0.4, item.height * 0.55, item.width * 0.6, item.height * 0.55, item.width * 0.45, item.height * 0.8]} stroke={color} strokeWidth={1.5} /></> )}
                </Group>
              );
            })}

            {/* Texts */}
            {texts.map((textItem) => (
              <KonvaText
                key={textItem.id} id={textItem.id} name="text" x={textItem.x} y={textItem.y} text={textItem.text} fontSize={textItem.fontSize} fontFamily="sans-serif" fontStyle="bold" fill={editingText?.id === textItem.id ? 'transparent' : '#334155'}
                draggable={activeTool === 'select'}
                onDragStart={() => activeTool === 'select' && setSelectedId(textItem.id)}
                onDragEnd={(e) => updateText(textItem.id, { x: e.target.x(), y: e.target.y() })}
                onDblClick={() => setEditingText({ id: textItem.id, x: textItem.x, y: textItem.y, text: textItem.text })}
                onTransformEnd={(e) => {
                  const node = e.target; const scaleX = node.scaleX(); node.scaleX(1); node.scaleY(1);
                  updateText(textItem.id, { x: node.x(), y: node.y(), rotation: node.rotation(), fontSize: Math.max(10, textItem.fontSize * scaleX) });
                }}
              />
            ))}

            {/* Ghost Wall & Live Dimension */}
            {isDrawing && startPoint && currentMousePos && activeTool === 'draw_wall' && (
              <>
                <Line points={[startPoint.x, startPoint.y, currentMousePos.x, currentMousePos.y]} stroke="#60a5fa" strokeWidth={wallThickness} dash={[15, 10]} lineCap="round" />
                {renderLiveDimension()}
              </>
            )}
            
            {snapPoint && activeTool === 'draw_wall' && <Circle x={snapPoint.x} y={snapPoint.y} radius={8} stroke="#2965a2" strokeWidth={2} fill="rgba(41, 101, 162, 0.2)" />}

            {/* Transformer */}
            {selectedId && activeTool === 'select' && !walls.find(w => w.id === selectedId) && ( // Ensure transformer doesn't attach to walls
              <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) ? oldBox : newBox} anchorStroke="#2965a2" anchorFill="#ffffff" anchorSize={8} borderStroke="#2965a2" />
            )}
          </Layer>
        </Stage>

        {editingText && (
          <input type="text" value={editingText.text} autoFocus onChange={(e) => setEditingText({ ...editingText, text: e.target.value })} onBlur={finishEditingText} onKeyDown={(e) => e.key === 'Enter' && finishEditingText()} style={{ position: 'absolute', top: `50px`, left: `50px` }} className="bg-white text-slate-800 border-2 border-blue-500 rounded px-2 py-1 outline-none font-sans font-bold shadow-lg z-50" />
        )}
      </div>
    </div>
  );
}