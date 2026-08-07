import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface Wall {
  id: string;
  points: number[];
}

interface Props {
  walls: Wall[];
  setWalls: React.Dispatch<React.SetStateAction<Wall[]>>;
  imageUrl?: string;
  svgData?: string;
}

function BlueprintCanvas({ imageUrl, walls, setWalls }: Props) {
  const [image] = useImage(imageUrl || "");
  const stageRef = useRef<any>(null);
  
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<number[]>([]);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedWallId) {
        setWalls((prevWalls) => prevWalls.filter((w) => w.id !== selectedWallId));
        setSelectedWallId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedWallId, setWalls]);

  const handleMouseDown = (e: any) => {
    // Check if we clicked on the empty stage or the background image
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName("backgroundImage");
    
    if (clickedOnEmpty) {
      setSelectedWallId(null);
      const pos = e.target.getStage().getPointerPosition();
      setDrawing(true);
      setCurrentLine([pos.x, pos.y, pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!drawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLine([currentLine[0], currentLine[1], pos.x, pos.y]);
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    
    setDrawing(false);
    
    const newWall: Wall = {
      id: crypto.randomUUID(),
      points: currentLine
    };
    
    setWalls([...walls, newWall]);
    setCurrentLine([]);
    setSelectedWallId(newWall.id);
  };

  return (
    <Stage
      width={900}
      height={700}
      ref={stageRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        {image && (
          <KonvaImage 
            image={image} 
            name="backgroundImage" 
          />
        )}

        {walls.map((wall) => (
          <Line
            key={wall.id}
            points={wall.points}
            stroke={selectedWallId === wall.id ? "#007AFF" : "black"}
            strokeWidth={selectedWallId === wall.id ? 6 : 5}
            lineCap="round"
            hitStrokeWidth={20} // Extends the clickable area around the line
            onClick={() => setSelectedWallId(wall.id)}
            onTap={() => setSelectedWallId(wall.id)}
          />
        ))}

        {drawing && (
          <Line
            points={currentLine}
            stroke="red"
            strokeWidth={5}
            lineCap="round"
          />
        )}
      </Layer>
    </Stage>
  );
}

export default BlueprintCanvas;