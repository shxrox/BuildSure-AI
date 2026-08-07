import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Text, Group, Image as KonvaImage, Rect, Arc } from "react-konva";
import useImage from "use-image";

interface Wall {
  id: string;
  points: number[];
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
  svgData?: string;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 2000; 

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

  const gridLines = [];
  for (let i = 0; i < CANVAS_SIZE / GRID_SIZE; i++) {
    gridLines.push(
      <Line key={`v-${i}`} points={[i * GRID_SIZE, 0, i * GRID_SIZE, CANVAS_SIZE]} stroke="#e5e7eb" strokeWidth={1} />
    );
    gridLines.push(
      <Line key={`h-${i}`} points={[0, i * GRID_SIZE, CANVAS_SIZE, i * GRID_SIZE]} stroke="#e5e7eb" strokeWidth={1} />
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

  const handleMouseDown = (e: any) => {
    const isInteractiveElement = e.target.getClassName() === "Line" || e.target.hasName("doorRect") || e.target.hasName("windowRect");
    
    if (isInteractiveElement && e.target.name() !== "gridLine" && mode === 'select') {
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName("backgroundImage") || e.target.hasName("gridLine") || e.target.hasName("roomRect") || e.target.hasName("roomLabel");
    
    if (clickedOnEmpty) {
      setSelectedWallId(null);
      setSelectedDoorId(null);
      setSelectedWindowId(null);
      
      if (mode === 'select') return;

      const pos = e.target.getStage().getPointerPosition();
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
          width: 120
        };
        actualSetWindows([...actualWindows, newWindow]);
        setSelectedWindowId(newWindow.id);
        setMode('select');
      }
    }
  };

  const handleMouseMove = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
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

      if (w > 0 && h > 0) {
        const widthMeters = w / 100;
        const heightMeters = h / 100;
        const area = parseFloat((widthMeters * heightMeters).toFixed(2));

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
    <div className="relative w-full h-full bg-white overflow-hidden rounded-md border border-gray-200">
      <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200">
        <button 
          className={`px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors ${mode === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setMode('select')}
        >
          Select
        </button>
        <button 
          className={`px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors ${mode === 'wall' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setMode('wall')}
        >
          Draw Wall
        </button>
        <button 
          className={`px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors ${mode === 'room' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setMode('room')}
        >
          Draw Room
        </button>
        <button 
          className={`px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors ${mode === 'door' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setMode('door')}
        >
          Add Door
        </button>
        <button 
          className={`px-4 py-2 rounded-md font-medium text-sm cursor-pointer transition-colors ${mode === 'window' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setMode('window')}
        >
          Add Window
        </button>
      </div>
      
      {(selectedDoorId || selectedWindowId) && mode === 'select' && (
        <div className="absolute bottom-4 left-4 z-10 bg-gray-800 text-white px-4 py-2 rounded-md text-sm shadow-md">
          Press <strong>R</strong> to rotate | Press <strong>Delete</strong> to remove
        </div>
      )}

      <Stage
        width={900}
        height={700}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Group name="gridLine">{gridLines}</Group>

          {image && <KonvaImage image={image} name="backgroundImage" />}

          {actualRooms.map((room) => {
            if (!room) return null;
            return (
              <Group key={room.id}>
                <Rect
                  name="roomRect"
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill="#bfdbfe"
                  opacity={0.4}
                />
                <Text
                  name="roomLabel"
                  x={room.x + (room.width || 0) / 2 - 40}
                  y={room.y + (room.height || 0) / 2 - 10}
                  text={`${room.name}\n${room.area} m²`}
                  fontSize={14}
                  fontFamily="sans-serif"
                  fill="#1e3a8a"
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
                onDragStart={() => selectElement('window', windowObj.id)}
                onDragEnd={(e) => {
                  const node = e.target;
                  const dx = snapToGrid(node.x());
                  const dy = snapToGrid(node.y());
                  node.position({ x: dx, y: dy });
                  actualSetWindows((prev: any[]) =>
                    prev.map((w) => (w.id === windowObj.id ? { ...w, x: dx, y: dy } : w))
                  );
                }}
              >
                <Rect
                  name="windowRect"
                  width={windowObj.width || 120}
                  height={12}
                  fill={isSelected ? "#0d9488" : "#14b8a6"} 
                  stroke={isSelected ? "#0f766e" : "#0d9488"}
                  strokeWidth={2}
                  hitStrokeWidth={15}
                  offsetX={(windowObj.width || 120) / 2}
                  offsetY={6}
                />
                <Line
                  points={[-(windowObj.width || 120) / 2, 0, (windowObj.width || 120) / 2, 0]}
                  stroke="#cffafe" 
                  strokeWidth={4}
                />
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
                onDragStart={() => selectElement('door', door.id)}
                onDragEnd={(e) => {
                  const node = e.target;
                  const dx = snapToGrid(node.x());
                  const dy = snapToGrid(node.y());
                  node.position({ x: dx, y: dy });
                  actualSetDoors((prev: any[]) =>
                    prev.map((d) => (d.id === door.id ? { ...d, x: dx, y: dy } : d))
                  );
                }}
              >
                <Rect
                  name="doorRect"
                  width={80}
                  height={10}
                  fill={isSelected ? "#d97706" : "#f59e0b"}
                  stroke={isSelected ? "#b45309" : "#d97706"}
                  strokeWidth={2}
                  hitStrokeWidth={15}
                  offsetX={40}
                  offsetY={5}
                />
                <Arc
                  x={-40}
                  y={-5}
                  innerRadius={78}
                  outerRadius={80}
                  angle={90}
                  fill={isSelected ? "#d97706" : "#f59e0b"}
                  opacity={0.6}
                  rotation={0}
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
              fill="#bfdbfe"
              opacity={0.5}
              stroke="#3b82f6"
              strokeWidth={2}
              dash={[5, 5]}
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
                  stroke={isSelected ? "#3b82f6" : "#1f2937"}
                  strokeWidth={isSelected ? 6 : 5}
                  lineCap="round"
                  hitStrokeWidth={20}
                  draggable={mode === 'select'}
                  onClick={() => selectElement('wall', wall.id)}
                  onTap={() => selectElement('wall', wall.id)}
                  onDragStart={() => selectElement('wall', wall.id)}
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
                
                {isSelected && (
                  <Text
                    x={center.x + 15}
                    y={center.y + 15}
                    text={`${lengthMeters} m`}
                    fontSize={14}
                    fontFamily="sans-serif"
                    fill="#3b82f6"
                    padding={4}
                    background="white"
                  />
                )}
              </Group>
            );
          })}

          {drawing && mode === 'wall' && currentLine && currentLine.length === 4 && (
            <Group>
              <Line points={currentLine} stroke="#ef4444" strokeWidth={5} lineCap="round" />
              <Text
                x={getCenter(currentLine).x + 15}
                y={getCenter(currentLine).y + 15}
                text={`${calculateLength(currentLine)} m`}
                fontSize={14}
                fontFamily="sans-serif"
                fill="#ef4444"
                padding={4}
              />
            </Group>
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default BlueprintCanvas;