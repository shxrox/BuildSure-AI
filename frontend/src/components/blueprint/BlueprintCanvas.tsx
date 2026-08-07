import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text, Group, Image as KonvaImage, Rect, Arc } from "react-konva";
import useImage from "use-image";

interface Wall {
  id: string;
  points: number[];
  thickness?: number;
}

interface Room {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

interface Door {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

interface BlueprintWindow {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
}

interface Props {
  walls: any[];
  setWalls: any;
  rooms?: any[];
  setRooms?: any;
  doors?: any[];
  setDoors?: any;
  windows?: any[];
  setWindows?: any;
  imageUrl?: string;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 3000;

const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

const calculateLength = (points: number[]) => {
  if (!points || points.length < 4) return "0.00";
  const dx = points[2] - points[0];
  const dy = points[3] - points[1];
  const lengthPx = Math.sqrt(dx * dx + dy * dy);
  return (lengthPx / 100).toFixed(2);
};

const getCenter = (points: number[]) => {
  if (!points || points.length < 4) return { x: 0, y: 0 };
  return {
    x: (points[0] + points[2]) / 2,
    y: (points[1] + points[3]) / 2,
  };
};

function BlueprintCanvas({ 
  imageUrl, 
  walls, 
  setWalls, 
  rooms: propsRooms, 
  setRooms: propsSetRooms,
  doors: propsDoors,
  setDoors: propsSetDoors,
  windows: propsWindows,
  setWindows: propsSetWindows
}: Props) {
  const [image] = useImage(imageUrl || "");
  const stageRef = useRef<any>(null);
  
  const [localRooms, setLocalRooms] = useState<any[]>([]);
  const actualRooms = propsRooms || localRooms;
  const actualSetRooms = propsSetRooms || setLocalRooms;

  const [localDoors, setLocalDoors] = useState<any[]>([]);
  const actualDoors = propsDoors || localDoors;
  const actualSetDoors = propsSetDoors || setLocalDoors;

  const [localWindows, setLocalWindows] = useState<any[]>([]);
  const actualWindows = propsWindows || localWindows;
  const actualSetWindows = propsSetWindows || setLocalWindows;

  const [mode, setMode] = useState<'select' | 'wall' | 'room' | 'door' | 'window'>('wall');
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const gridLines = [];
  for (let i = 0; i < CANVAS_SIZE / GRID_SIZE; i++) {
    gridLines.push(
      <Line key={`v-${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_SIZE]} stroke="#f0f2f5" strokeWidth={1} />
    );
    gridLines.push(
      <Line key={`h-${i}`} points={[0, i * GRID_SIZE, CANVAS_SIZE, i * GRID_SIZE]} stroke="#f0f2f5" strokeWidth={1} />
    );
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedWallId) {
          setWalls((prev: any[]) => prev.filter((w) => w.id !== selectedWallId));
          setSelectedWallId(null);
        }
        if (selectedDoorId) {
          actualSetDoors((prev: any[]) => prev.filter((d) => d.id !== selectedDoorId));
          setSelectedDoorId(null);
        }
        if (selectedWindowId) {
          actualSetWindows((prev: any[]) => prev.filter((w) => w.id !== selectedWindowId));
          setSelectedWindowId(null);
        }
      }
      
      if (e.key === "r" || e.key === "R") {
        if (selectedDoorId) {
          actualSetDoors((prev: any[]) =>
            prev.map((d) => (d.id === selectedDoorId ? { ...d, rotation: (d.rotation + 90) % 360 } : d))
          );
        }
        if (selectedWindowId) {
          actualSetWindows((prev: any[]) =>
            prev.map((w) => (w.id === selectedWindowId ? { ...w, rotation: (w.rotation + 90) % 360 } : w))
          );
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWallId, selectedDoorId, selectedWindowId, setWalls, actualSetDoors, actualSetWindows]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.3, Math.min(3, newScale));

    setScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName("backgroundImage") || e.target.hasName("gridLine");
    
    if (clickedOnEmpty) {
      setSelectedWallId(null);
      setSelectedDoorId(null);
      setSelectedWindowId(null);
      
      if (mode === 'select') return;

      const stage = stageRef.current;
      const pointer = stage.getPointerPosition();
      const transform = stage.getAbsoluteTransform().copy().invert();
      const pos = transform.point(pointer);

      const snappedX = snapToGrid(pos.x);
      const snappedY = snapToGrid(pos.y);
      
      if (mode === 'wall') {
        setDrawing(true);
        setCurrentLine([snappedX, snappedY, snappedX, snappedY]);
      } else if (mode === 'room') {
        setCurrentRect({ x: snappedX, y: snappedY, w: 0, h: 0 });
      } else if (mode === 'door') {
        const newDoor: Door = {
          id: crypto.randomUUID(),
          x: snappedX,
          y: snappedY,
          rotation: 0
        };
        actualSetDoors([...actualDoors, newDoor]);
        setSelectedDoorId(newDoor.id);
        setMode('select');
      } else if (mode === 'window') {
        const newWindow: BlueprintWindow = {
          id: crypto.randomUUID(),
          x: snappedX,
          y: snappedY,
          rotation: 0,
          width: 100
        };
        actualSetWindows([...actualWindows, newWindow]);
        setSelectedWindowId(newWindow.id);
        setMode('select');
      }
    }
  };

  const handleMouseMove = () => {
    if (!drawing && !currentRect) return;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointer);
    const snappedX = snapToGrid(pos.x);
    const snappedY = snapToGrid(pos.y);

    if (mode === 'wall' && drawing) {
      setCurrentLine([currentLine[0], currentLine[1], snappedX, snappedY]);
    } else if (mode === 'room' && currentRect) {
      setCurrentRect({
        ...currentRect,
        w: snappedX - currentRect.x,
        h: snappedY - currentRect.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (mode === 'wall' && drawing) {
      setDrawing(false);
      if (currentLine[0] === currentLine[2] && currentLine[1] === currentLine[3]) {
        setCurrentLine([]);
        return;
      }
      const newWall: Wall = { id: crypto.randomUUID(), points: currentLine };
      setWalls([...walls, newWall]);
      setCurrentLine([]);
      setSelectedWallId(newWall.id);
    } else if (mode === 'room' && currentRect) {
      let { x, y, w, h } = currentRect;
      if (w < 0) { x += w; w = Math.abs(w); }
      if (h < 0) { y += h; h = Math.abs(h); }

      if (w > 20 && h > 20) {
        const area = parseFloat(((w / 100) * (h / 100)).toFixed(2));
        const newRoom: Room = {
          id: crypto.randomUUID(),
          name: `Room ${actualRooms.length + 1}`,
          x, y, width: w, height: h, area
        };
        actualSetRooms([...actualRooms, newRoom]);

        const roomWalls: Wall[] = [
          { id: crypto.randomUUID(), points: [x, y, x + w, y] },
          { id: crypto.randomUUID(), points: [x + w, y, x + w, y + h] },
          { id: crypto.randomUUID(), points: [x + w, y + h, x, y + h] },
          { id: crypto.randomUUID(), points: [x, y + h, x, y] },
        ];
        setWalls([...walls, ...roomWalls]);
      }
      setCurrentRect(null);
      setMode('select');
    }
  };

  const selectElement = (type: 'wall' | 'door' | 'window', id: string) => {
    if (mode !== 'select') return;
    setSelectedWallId(type === 'wall' ? id : null);
    setSelectedDoorId(type === 'door' ? id : null);
    setSelectedWindowId(type === 'window' ? id : null);
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden rounded-xl border border-slate-200 shadow-inner flex flex-col">
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200">
        <button 
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer ${mode === 'select' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          onClick={() => setMode('select')}
        >
          👆 Select / Move
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer ${mode === 'wall' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          onClick={() => setMode('wall')}
        >
          🧱 Draw Wall
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer ${mode === 'room' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          onClick={() => setMode('room')}
        >
          🏠 Draw Room Box
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer ${mode === 'door' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          onClick={() => setMode('door')}
        >
          🚪 Add Door
        </button>
        <button 
          className={`px-4 py-2 rounded-lg font-semibold text-xs tracking-wide uppercase transition-all cursor-pointer ${mode === 'window' ? 'bg-teal-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          onClick={() => setMode('window')}
        >
          🪟 Add Window
        </button>
      </div>

      {(selectedDoorId || selectedWindowId || selectedWallId) && mode === 'select' && (
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl backdrop-blur-sm flex items-center gap-3">
          <span>✨ Tip: Press <strong className="text-amber-400">R</strong> to rotate | <strong className="text-red-400">Delete</strong> to remove</span>
        </div>
      )}

      <div className="flex-1 w-full h-full cursor-crosshair">
        <Stage
          width={window.innerWidth > 1200 ? 1100 : window.innerWidth - 300}
          height={750}
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={mode === 'select'}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDragEnd={(e) => {
            if (e.target === stageRef.current) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
            }
          }}
        >
          <Layer>
            <Group name="gridLine">{gridLines}</Group>
            {image && <KonvaImage image={image} name="backgroundImage" />}

            {actualRooms.map((room) => {
              if (!room) return null;
              return (
                <Group key={room.id}>
                  <Rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill="#3b82f6"
                    opacity={0.12}
                    cornerRadius={4}
                  />
                  <Text
                    x={room.x + (room.width || 0) / 2 - 50}
                    y={room.y + (room.height || 0) / 2 - 12}
                    text={`${room.name}\n${room.area} m²`}
                    fontSize={13}
                    fontFamily="sans-serif"
                    fontStyle="bold"
                    fill="#1e40af"
                    align="center"
                  />
                </Group>
              );
            })}

            {actualWindows.map((windowObj) => {
              if (!windowObj) return null;
              const isSelected = selectedWindowId === windowObj.id;
              return (
                <Group
                  key={windowObj.id}
                  x={windowObj.x}
                  y={windowObj.y}
                  rotation={windowObj.rotation}
                  draggable={mode === 'select'}
                  onClick={() => selectElement('window', windowObj.id)}
                  onTap={() => selectElement('window', windowObj.id)}
                  onDragEnd={(e) => {
                    const node = e.target;
                    const dx = snapToGrid(node.x());
                    const dy = snapToGrid(node.y());
                    actualSetWindows((prev: any[]) =>
                      prev.map((w) => (w.id === windowObj.id ? { ...w, x: dx, y: dy } : w))
                    );
                  }}
                >
                  <Rect
                    width={windowObj.width || 100}
                    height={10}
                    fill={isSelected ? "#0d9488" : "#14b8a6"}
                    stroke={isSelected ? "#115e59" : "#0f766e"}
                    strokeWidth={2}
                    offsetX={(windowObj.width || 100) / 2}
                    offsetY={5}
                    cornerRadius={2}
                  />
                  <Line points={[-(windowObj.width || 100) / 2, 0, (windowObj.width || 100) / 2, 0]} stroke="#ccfbf1" strokeWidth={3} />
                </Group>
              );
            })}

            {actualDoors.map((door) => {
              if (!door) return null;
              const isSelected = selectedDoorId === door.id;
              return (
                <Group
                  key={door.id}
                  x={door.x}
                  y={door.y}
                  rotation={door.rotation}
                  draggable={mode === 'select'}
                  onClick={() => selectElement('door', door.id)}
                  onTap={() => selectElement('door', door.id)}
                  onDragEnd={(e) => {
                    const node = e.target;
                    const dx = snapToGrid(node.x());
                    const dy = snapToGrid(node.y());
                    actualSetDoors((prev: any[]) =>
                      prev.map((d) => (d.id === door.id ? { ...d, x: dx, y: dy } : d))
                    );
                  }}
                >
                  <Rect
                    width={70}
                    height={8}
                    fill={isSelected ? "#d97706" : "#f59e0b"}
                    stroke={isSelected ? "#92400e" : "#b45309"}
                    strokeWidth={2}
                    offsetX={35}
                    offsetY={4}
                  />
                  <Arc
                    x={-35}
                    y={-4}
                    innerRadius={68}
                    outerRadius={70}
                    angle={90}
                    fill="#f59e0b"
                    opacity={0.5}
                  />
                </Group>
              );
            })}

            {currentRect && (
              <Rect
                x={currentRect.w < 0 ? currentRect.x + currentRect.w : currentRect.x}
                y={currentRect.h < 0 ? currentRect.y + currentRect.h : currentRect.y}
                width={Math.abs(currentRect.w)}
                height={Math.abs(currentRect.h)}
                fill="#3b82f6"
                opacity={0.2}
                stroke="#2563eb"
                strokeWidth={2}
                dash={[6, 6]}
              />
            )}

            {walls.map((wall: Wall) => {
              if (!wall || !wall.points || wall.points.length < 4) return null;
              const center = getCenter(wall.points);
              const lengthMeters = calculateLength(wall.points);
              const isSelected = selectedWallId === wall.id;

              return (
                <Group key={wall.id}>
                  <Line
                    points={wall.points}
                    stroke={isSelected ? "#2563eb" : "#0f172a"}
                    strokeWidth={isSelected ? 8 : 6}
                    lineCap="round"
                    lineJoin="round"
                    hitStrokeWidth={24}
                    draggable={mode === 'select'}
                    onClick={() => selectElement('wall', wall.id)}
                    onTap={() => selectElement('wall', wall.id)}
                    onDragEnd={(e) => {
                      const node = e.target;
                      const dx = snapToGrid(node.x());
                      const dy = snapToGrid(node.y());
                      node.position({ x: 0, y: 0 });
                      
                      const updatedPoints = [
                        wall.points[0] + dx, wall.points[1] + dy,
                        wall.points[2] + dx, wall.points[3] + dy,
                      ];
                      setWalls((prevWalls: any[]) =>
                        prevWalls.map((w: Wall) => w.id === wall.id ? { ...w, points: updatedPoints } : w)
                      );
                    }}
                  />
                  {(isSelected || Number(lengthMeters) > 0.5) && (
                    <Text
                      x={center.x + 10}
                      y={center.y + 10}
                      text={`${lengthMeters} m`}
                      fontSize={12}
                      fontFamily="sans-serif"
                      fill={isSelected ? "#2563eb" : "#475569"}
                      padding={3}
                    />
                  )}
                </Group>
              );
            })}

            {drawing && mode === 'wall' && currentLine && currentLine.length === 4 && (
              <Group>
                <Line points={currentLine} stroke="#ef4444" strokeWidth={6} lineCap="round" />
                <Text
                  x={getCenter(currentLine).x + 10}
                  y={getCenter(currentLine).y + 10}
                  text={`${calculateLength(currentLine)} m`}
                  fontSize={12}
                  fontFamily="sans-serif"
                  fill="#ef4444"
                />
              </Group>
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default BlueprintCanvas;