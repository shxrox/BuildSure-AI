import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getDigitalPlan } from '../../services/project.service';
import { ArrowLeft, Eye, Grid, Box as BoxIcon, Compass, Sparkles } from 'lucide-react';

interface Point { x: number; y: number; }
interface Wall { id: string; startX: number; startY: number; endX: number; endY: number; thickness: number; height: number; }
interface Door { id: string; x: number; y: number; width: number; angle: number; }
interface Window { id: string; x: number; y: number; width: number; angle: number; }
interface Room { id: string; name: string; points: Point[]; areaSqm: number; color: string; }
interface FurnitureItem { id: string; name: string; category: string; icon: string; x: number; y: number; width: number; height: number; rotation: number; }

const PX_TO_M = 0.1;
const MM_TO_M = 0.001;
const CM_TO_M = 0.01;

function Wall3D({ wall, wireframe }: { wall: Wall; wireframe: boolean }) {
  const start = new THREE.Vector3(wall.startX * PX_TO_M, 0, wall.startY * PX_TO_M);
  const end = new THREE.Vector3(wall.endX * PX_TO_M, 0, wall.endY * PX_TO_M);
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const length = start.distanceTo(end);
  const angle = Math.atan2(end.z - start.z, end.x - start.x);
  
  const thickness = (wall.thickness || 200) * MM_TO_M;
  const height = wall.height || 3.0;

  return (
    <mesh position={[center.x, height / 2, center.z]} rotation={[0, -angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.3} wireframe={wireframe} />
    </mesh>
  );
}

function Room3D({ room, showLabels, wireframe }: { room: Room; showLabels: boolean; wireframe: boolean }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (room.points.length === 0) return s;
    s.moveTo(room.points[0].x * PX_TO_M, room.points[0].y * PX_TO_M);
    for (let i = 1; i < room.points.length; i++) {
      s.lineTo(room.points[i].x * PX_TO_M, room.points[i].y * PX_TO_M);
    }
    s.closePath();
    return s;
  }, [room.points]);

  const center = useMemo(() => {
    if (room.points.length === 0) return [0, 0, 0];
    const cx = room.points.reduce((s, p) => s + p.x, 0) / room.points.length * PX_TO_M;
    const cz = room.points.reduce((s, p) => s + p.y, 0) / room.points.length * PX_TO_M;
    return [cx, 0.02, cz];
  }, [room.points]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={room.color} side={THREE.DoubleSide} transparent opacity={0.65} wireframe={wireframe} />
      </mesh>
      {showLabels && (
        <Text
          position={[center[0], 0.06, center[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.22}
          color="#0f172a"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {room.name}
        </Text>
      )}
    </group>
  );
}

function Door3D({ door, wireframe }: { door: Door; wireframe: boolean }) {
  const width = (door.width || 900) * MM_TO_M;
  return (
    <group position={[door.x * PX_TO_M, 0, door.y * PX_TO_M]} rotation={[0, -door.angle, 0]}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[width, 2.0, 0.12]} />
        <meshStandardMaterial color="#94a3b8" wireframe={wireframe} />
      </mesh>
      <mesh position={[width / 3, 1.0, 0]}>
        <boxGeometry args={[width * 0.9, 1.95, 0.04]} />
        <meshStandardMaterial color="#b45309" roughness={0.4} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

function Window3D({ win, wireframe }: { win: Window; wireframe: boolean }) {
  const width = (win.width || 1200) * MM_TO_M;
  return (
    <group position={[win.x * PX_TO_M, 1.2, win.y * PX_TO_M]} rotation={[0, -win.angle, 0]}>
      <mesh castShadow>
        <boxGeometry args={[width, 1.0, 0.08]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

function Furniture3D({ item, wireframe }: { item: FurnitureItem; wireframe: boolean }) {
  const w = item.width * CM_TO_M;
  const h = 0.75; 
  const d = item.height * CM_TO_M;
  
  const colorMap: Record<string, string> = {
    Living: '#f59e0b',
    Bedroom: '#8b5cf6',
    Kitchen: '#10b981',
    Bathroom: '#06b6d4',
    Office: '#3b82f6',
  };

  return (
    <mesh position={[item.x * PX_TO_M, h / 2, item.y * PX_TO_M]} rotation={[0, -item.rotation, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={colorMap[item.category] || '#64748b'} roughness={0.5} wireframe={wireframe} />
    </mesh>
  );
}

function SceneController({ plan }: { plan: any }) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!plan || !controlsRef.current) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;

    plan.walls.forEach((w: Wall) => {
      minX = Math.min(minX, w.startX * PX_TO_M, w.endX * PX_TO_M);
      maxX = Math.max(maxX, w.startX * PX_TO_M, w.endX * PX_TO_M);
      minZ = Math.min(minZ, w.startY * PX_TO_M, w.endY * PX_TO_M);
      maxZ = Math.max(maxZ, w.startY * PX_TO_M, w.endY * PX_TO_M);
    });

    if (minX === Infinity) return;

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    controlsRef.current.target.set(centerX, 0, centerZ);
    controlsRef.current.update();
  }, [plan]);

  return <OrbitControls ref={controlsRef} makeDefault minDistance={2} maxDistance={60} />;
}

const ThreeDPlanPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<{ walls: Wall[]; rooms: Room[]; doors: Door[]; windows: Window[]; furniture: FurnitureItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [wireframe, setWireframe] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [cameraAngle, setCameraAngle] = useState<'iso' | 'top'>('iso');

  useEffect(() => {
    if (!id) return;
    getDigitalPlan(id).then((data) => {
      if (data) {
        setPlan({
          walls: data.walls || [],
          rooms: data.rooms || [],
          doors: data.doors || [],
          windows: data.windows || [],
          furniture: data.furniture || [],
        });
      }
      setLoading(false);
    });
  }, [id]);

  const centerOffset = useMemo(() => {
    if (!plan || plan.walls.length === 0) return { x: 0, z: 0 };
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    plan.walls.forEach((w) => {
      minX = Math.min(minX, w.startX * PX_TO_M, w.endX * PX_TO_M);
      maxX = Math.max(maxX, w.startX * PX_TO_M, w.endX * PX_TO_M);
      minZ = Math.min(minZ, w.startY * PX_TO_M, w.endY * PX_TO_M);
      maxZ = Math.max(maxZ, w.startY * PX_TO_M, w.endY * PX_TO_M);
    });
    return { x: -(minX + maxX) / 2, z: -(minZ + maxZ) / 2 };
  }, [plan]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-semibold text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-spin text-blue-400">
            <Sparkles size={16} />
          </div>
          <span>Loading 3D Spatial Environment...</span>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-300 font-semibold text-xs">
        No floor plan data available to render.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 relative overflow-hidden font-sans">
      {/* Top Header Matching Website Design */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="pointer-events-auto group px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-900/40"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to 2D Editor
        </button>

        {/* View Controls Toolbar */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 text-xs text-white">
          <button
            onClick={() => setCameraAngle('iso')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${cameraAngle === 'iso' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Compass size={13} /> Isometric
          </button>
          <button
            onClick={() => setCameraAngle('top')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${cameraAngle === 'top' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            Top-Down View
          </button>
          
          <div className="h-4 w-[1px] bg-slate-700/80 mx-1" />

          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe Mode"
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${wireframe ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <BoxIcon size={14} />
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle Room Labels"
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showLabels ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Ground Grid"
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showGrid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Grid size={14} />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <Canvas 
        shadows 
        camera={{ 
          position: cameraAngle === 'top' ? [0, 18, 0.01] : [10, 12, 10], 
          fov: 45 
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[15, 25, 15]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-15, 15, -10]} intensity={0.4} />
        
        {/* Floor Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        
        {showGrid && <gridHelper args={[100, 100, '#334155', '#1e293b']} position={[0, 0, 0]} />}
        
        {/* Centered Plan Group */}
        <group position={[centerOffset.x, 0, centerOffset.z]}>
          {plan.rooms.map((room) => (
            <Room3D key={room.id} room={room} showLabels={showLabels} wireframe={wireframe} />
          ))}
          
          {plan.walls.map((wall) => (
            <Wall3D key={wall.id} wall={wall} wireframe={wireframe} />
          ))}
          
          {plan.doors.map((door) => (
            <Door3D key={door.id} door={door} wireframe={wireframe} />
          ))}
          
          {plan.windows.map((win) => (
            <Window3D key={win.id} win={win} wireframe={wireframe} />
          ))}
          
          {plan.furniture.map((item) => (
            <Furniture3D key={item.id} item={item} wireframe={wireframe} />
          ))}
        </group>
        
        <SceneController plan={plan} />
      </Canvas>

      {/* Footer Navigation Help Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-2xl text-[11px] font-semibold text-slate-300 shadow-2xl flex items-center gap-2">
        <span>🖱️ Left-Click + Drag to Rotate</span> · <span>Right-Click + Drag to Pan</span> · <span>Scroll to Zoom</span>
      </div>
    </div>
  );
};

export default ThreeDPlanPage;