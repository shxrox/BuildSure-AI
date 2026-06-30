import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text as KonvaText, Transformer, Group, Arc, Ellipse } from 'react-konva';
import { useCanvasStore, type CanvasItem } from '../store/useCanvasStore';

const SNAP_RADIUS = 20;
const PIXELS_PER_METER = 100;

export default function CanvasWorkspace() {
  const {
    walls,
    items,
    texts,
    rooms,
    selectedId,
    activeTool,
    wallThickness,
    exportTrigger,
    addWall,
    addItem,
    addText,
    updateText,
    updateItem,
    setSelectedId,
    autoDetectRooms
  } = useCanvasStore();

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);
  const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<{ id: string; x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    autoDetectRooms();
  }, [walls, autoDetectRooms]);

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
  }, [exportTrigger, setSelectedId]);

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
  }, [selectedId, items, texts, walls, activeTool]);

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
    const clickedWall = clickedNode.name() === 'wall';
    const clickedOnEmpty = clickedNode === clickedNode.getStage();

    if (activeTool === 'select') {
      if (clickedGroup) setSelectedId(clickedGroup.id());
      else if (clickedText || clickedWall) setSelectedId(clickedNode.id());
      else if (clickedOnEmpty) setSelectedId(null);
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
          startX: startPoint.x,
          startY: startPoint.y,
          endX: x,
          endY: y,
          thickness: wallThickness,
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

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });
    stage.position({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const itemType = e.dataTransfer.getData('application/buildsure-item');
    if (!itemType || !stageRef.current) return;

    stageRef.current.setPointersPositions(e);
    const rawPos = stageRef.current.getPointerPosition();
    if (!rawPos) return;

    const transform = stageRef.current.getAbsoluteTransform().copy();
    transform.invert();
    const dropPos = transform.point(rawPos);

    if (itemType === 'text') {
      addText({
        id: crypto.randomUUID(),
        x: dropPos.x,
        y: dropPos.y,
        text: 'New Label',
        fontSize: 20
      });
      return;
    }

    let width = 40;
    let height = 40;

    if (itemType === 'window') { width = 60; height = 15; }
    if (itemType === 'door') { width = 40; height = 40; }
    if (itemType === 'electrical') { width = 20; height = 20; }
    if (itemType === 'plumbing') { width = 30; height = 40; }
    if (itemType === 'furniture') { width = 60; height = 60; }
    if (itemType === 'bed') { width = 80; height = 100; }
    if (itemType === 'stove') { width = 40; height = 40; }
    if (itemType === 'sink') { width = 40; height = 30; }
    if (itemType === 'toilet') { width = 30; height = 40; }
    if (itemType === 'stairs') { width = 80; height = 120; }

    addItem({
      id: crypto.randomUUID(),
      x: dropPos.x - width / 2,
      y: dropPos.y - height / 2,
      type: itemType as CanvasItem['type'],
      rotation: 0,
      width,
      height
    });
  };

  const finishEditingText = () => {
    if (!editingText) return;
    updateText(editingText.id, { text: editingText.text });
    setEditingText(null);
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'door': return '#f59e0b';
      case 'window': return '#3b82f6';
      case 'plumbing': return '#06b6d4';
      case 'electrical': return '#eab308';
      case 'furniture': return '#6366f1';
      case 'bed': return '#818cf8';
      case 'stove': return '#f97316';
      case 'sink': return '#0ea5e5';
      case 'toilet': return '#14b8a6';
      case 'stairs': return '#57534e';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-bold">Blueprint Canvas</h2>
      </div>

      <div
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Stage
          ref={stageRef}
          width={window.innerWidth - 350}
          height={window.innerHeight - 150}
          draggable={activeTool === 'pan'}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>

            {/* ROOMS */}
            {rooms.map(room => (
              <Group key={room.id}>
                <Line
                  points={room.polygon.flatMap(p => [p.x, p.y])}
                  fill="rgba(41,101,162,0.08)"
                  closed
                />
                <Group x={room.centerX - 40} y={room.centerY - 10}>
                  <Rect width={80} height={20} fill="#fff" opacity={0.8} />
                  <KonvaText width={80} text={`${room.areaM2} sq.m`} fontSize={12} fill="#64748b" align="center" />
                </Group>
              </Group>
            ))}

            {/* WALLS */}
            {walls.map(wall => {
              const midX = (wall.startX + wall.endX) / 2;
              const midY = (wall.startY + wall.endY) / 2;
              const isSelected = selectedId === wall.id;

              return (
                <Group key={wall.id}>
                  <Line id={wall.id} name="wall" points={[wall.startX, wall.startY, wall.endX, wall.endY]} stroke="transparent" strokeWidth={20} />
                  <Line points={[wall.startX, wall.startY, wall.endX, wall.endY]} stroke={isSelected ? '#f59e0b' : '#2965a2'} strokeWidth={wall.thickness} />

                  {isSelected && (
                    <Group x={midX} y={midY - 20}>
                      <Rect width={50} height={20} fill="#f59e0b" />
                      <KonvaText width={50} text="Wall" fontSize={12} fill="#fff" />
                    </Group>
                  )}
                </Group>
              );
            })}

            {/* ITEMS (FULL RESTORED) */}
            {items.map(item => {
              const color = getItemColor(item.type);

              return (
                <Group
                  key={item.id}
                  id={item.id}
                  name="item-group"
                  x={item.x}
                  y={item.y}
                  rotation={item.rotation}
                  draggable={activeTool === 'select'}
                  onDragEnd={e => updateItem(item.id, { x: e.target.x(), y: e.target.y() })}
                >
                  <Rect width={item.width} height={item.height} fill="transparent" />

                  {item.type === 'door' && (
                    <>
                      <Rect width={item.width * 0.15} height={item.height} fill={color} />
                      <Arc x={item.width * 0.15} y={item.height} innerRadius={item.width * 0.8} outerRadius={item.width * 0.85} angle={90} rotation={-90} fill={color} />
                    </>
                  )}

                  {item.type === 'window' && (
                    <>
                      <Rect width={item.width} height={item.height} stroke={color} fill="#fff" />
                      <Line points={[0, item.height * 0.35, item.width, item.height * 0.35]} stroke={color} />
                      <Line points={[0, item.height * 0.65, item.width, item.height * 0.65]} stroke={color} />
                    </>
                  )}

                  {item.type === 'furniture' && (
                    <Rect width={item.width} height={item.height} fill={color} />
                  )}

                  {item.type === 'plumbing' && (
                    <>
                      <Rect width={item.width} height={item.height} fill={color} />
                      <Ellipse x={item.width / 2} y={item.height * 0.65} radiusX={item.width * 0.35} radiusY={item.height * 0.3} fill="#fff" />
                    </>
                  )}

                  {item.type === 'electrical' && (
                    <Circle x={item.width / 2} y={item.height / 2} radius={Math.min(item.width, item.height) / 2} fill="#fff" stroke={color} />
                  )}

                  {/* RESTORED SYMBOLS */}
                  {item.type === 'bed' && (
                    <>
                      <Rect x={0} y={0} width={item.width} height={item.height} fill="#f8fafc" stroke={color} />
                      <Rect x={item.width * 0.1} y={item.height * 0.1} width={item.width * 0.35} height={item.height * 0.2} fill={color} />
                      <Rect x={item.width * 0.55} y={item.height * 0.1} width={item.width * 0.35} height={item.height * 0.2} fill={color} />
                      <Line points={[0, item.height * 0.4, item.width, item.height * 0.4]} stroke={color} />
                    </>
                  )}

                  {item.type === 'stove' && (
                    <>
                      <Rect width={item.width} height={item.height} fill="#f1f5f9" stroke={color} />
                      <Circle x={item.width * 0.25} y={item.height * 0.25} radius={item.width * 0.15} stroke={color} />
                      <Circle x={item.width * 0.75} y={item.height * 0.25} radius={item.width * 0.15} stroke={color} />
                      <Circle x={item.width * 0.25} y={item.height * 0.75} radius={item.width * 0.15} stroke={color} />
                      <Circle x={item.width * 0.75} y={item.height * 0.75} radius={item.width * 0.15} stroke={color} />
                    </>
                  )}

                  {item.type === 'sink' && (
                    <>
                      <Rect width={item.width} height={item.height} fill="#f8fafc" stroke={color} />
                      <Rect x={item.width * 0.1} y={item.height * 0.1} width={item.width * 0.8} height={item.height * 0.6} fill="#e2e8f0" />
                      <Circle x={item.width * 0.5} y={item.height * 0.85} radius={item.height * 0.08} fill={color} />
                    </>
                  )}

                  {item.type === 'toilet' && (
                    <>
                      <Rect x={item.width * 0.15} y={0} width={item.width * 0.7} height={item.height * 0.3} fill={color} />
                      <Ellipse x={item.width * 0.5} y={item.height * 0.65} radiusX={item.width * 0.35} radiusY={item.height * 0.35} fill="#fff" />
                    </>
                  )}

                  {item.type === 'stairs' && (
                    <>
                      <Rect width={item.width} height={item.height} stroke={color} fill="transparent" />
                      {[1,2,3,4,5,6,7].map(i => (
                        <Line key={i} points={[0, item.height*(i/8), item.width, item.height*(i/8)]} stroke={color} />
                      ))}
                      <Line points={[item.width/2, 0, item.width/2, item.height]} stroke={color} />
                    </>
                  )}
                </Group>
              );
            })}

            {/* TEXTS */}
            {texts.map(textItem => (
              <KonvaText
                key={textItem.id}
                id={textItem.id}
                x={textItem.x}
                y={textItem.y}
                text={textItem.text}
                fontSize={textItem.fontSize}
                fill="#334155"
                draggable={activeTool === 'select'}
                onDragEnd={e => updateText(textItem.id, { x: e.target.x(), y: e.target.y() })}
              />
            ))}

          </Layer>
        </Stage>
      </div>
    </div>
  );
}