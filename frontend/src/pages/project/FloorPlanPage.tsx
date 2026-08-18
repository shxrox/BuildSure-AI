import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDigitalPlan, saveDigitalPlan } from "../../services/project.service";
import api from "../../services/api";
import {
  MousePointer2,
  Hand,
  BrickWall,
  DoorOpen,
  PanelTop,
  Hexagon,
  Eraser,
  Search,
  X,
  Save,
  Download,
  Trash2,
  Settings,
  Layers,
  Box,
  Sofa,
  Armchair,
  BedDouble,
  Refrigerator,
  Bath,
  Toilet,
  Monitor,
  Utensils,
  Table2,
  LampDesk,
  ChevronRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

interface Point {
  x: number;
  y: number;
}

interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  height: number;
}

interface Door {
  id: string;
  x: number;
  y: number;
  width: number;
  angle: number;
}

interface Window {
  id: string;
  x: number;
  y: number;
  width: number;
  angle: number;
}

interface Room {
  id: string;
  name: string;
  points: Point[];
  areaSqm: number;
  color: string;
}

interface FurnitureItem {
  id: string;
  name: string;
  category: "Living" | "Bedroom" | "Kitchen" | "Bathroom" | "Office";
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface DragState {
  type: "wall-start" | "wall-end" | "door" | "window" | "room" | "furniture" | null;
  id: string | null;
  offsetX: number;
  offsetY: number;
}

type Tool =
  | "select"
  | "pan"
  | "wall"
  | "door"
  | "window"
  | "room"
  | "eraser"
  | "measure"
  | "furniture";

const GRID_SIZE = 20;
const SNAP_DIST = 12;
const SCALE_MM_PER_PX = 100;
const WALL_THICKNESS = 8;

const ROOM_COLORS = [
  "rgba(99,102,241,0.12)",
  "rgba(16,185,129,0.12)",
  "rgba(245,158,11,0.12)",
  "rgba(239,68,68,0.12)",
  "rgba(139,92,246,0.12)",
  "rgba(20,184,166,0.12)",
];

const CATALOG_ITEMS: Omit<FurnitureItem, "id" | "x" | "y" | "rotation">[] = [
  { name: "2-Seater Sofa", category: "Living", icon: "sofa", width: 160, height: 85 },
  { name: "3-Seater Sofa", category: "Living", icon: "sofa", width: 210, height: 90 },
  { name: "L-Shaped Sofa", category: "Living", icon: "sofa", width: 270, height: 170 },
  { name: "Armchair", category: "Living", icon: "armchair", width: 85, height: 80 },
  { name: "Coffee Table", category: "Living", icon: "table", width: 110, height: 60 },
  { name: "TV Stand", category: "Living", icon: "monitor", width: 140, height: 40 },
  { name: "Queen Bed", category: "Bedroom", icon: "bed", width: 160, height: 200 },
  { name: "King Bed", category: "Bedroom", icon: "bed", width: 190, height: 200 },
  { name: "Nightstand", category: "Bedroom", icon: "nightstand", width: 50, height: 50 },
  { name: "Wardrobe", category: "Bedroom", icon: "wardrobe", width: 180, height: 60 },
  { name: "Dining Table", category: "Kitchen", icon: "dining", width: 160, height: 90 },
  { name: "Kitchen Island", category: "Kitchen", icon: "kitchen", width: 200, height: 90 },
  { name: "Refrigerator", category: "Kitchen", icon: "fridge", width: 70, height: 70 },
  { name: "Toilet", category: "Bathroom", icon: "toilet", width: 50, height: 70 },
  { name: "Bathtub", category: "Bathroom", icon: "bath", width: 150, height: 75 },
  { name: "Office Desk", category: "Office", icon: "desk", width: 140, height: 70 },
  { name: "Office Chair", category: "Office", icon: "chair", width: 60, height: 60 },
];

function snapToGrid(v: number) {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay);
}

function ptToSegDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const len2 = (bx - ax) ** 2 + (by - ay) ** 2;
  if (len2 === 0) return dist(px, py, ax, ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, ax + t * (bx - ax), ay + t * (by - ay));
}

function wallAngle(w: Wall) {
  return Math.atan2(w.endY - w.startY, w.endX - w.startX);
}

function wallLength(w: Wall) {
  return dist(w.startX, w.startY, w.endX, w.endY);
}

function pxToMm(px: number) {
  return px * SCALE_MM_PER_PX;
}

function mmToLabel(mm: number) {
  if (mm >= 1000) {
    return `${(mm / 1000).toFixed(2)} m`;
  }
  return `${mm.toFixed(0)} mm`;
}

function polygonArea(pts: Point[]) {
  let a = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(a / 2);
}

function getFurnitureIcon(icon: string) {
  switch (icon) {
    case "sofa": return Sofa;
    case "armchair": return Armchair;
    case "bed": return BedDouble;
    case "fridge": return Refrigerator;
    case "bath": return Bath;
    case "toilet": return Toilet;
    case "monitor": return Monitor;
    case "dining": return Utensils;
    case "table": return Table2;
    case "desk": return LampDesk;
    case "chair": return Armchair;
    default: return Box;
  }
}

function FloorPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Modal State for Subscription Upgrade Notice
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [modalFeatureName, setModalFeatureName] = useState("");

  const [walls, setWalls] = useState<Wall[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);
  const [windows, setWindows] = useState<Window[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);

  const [tool, setTool] = useState<Tool>("wall");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"wall" | "door" | "window" | "room" | "furniture" | null>(null);

  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);
  const [roomPoints, setRoomPoints] = useState<Point[]>([]);
  const [activeFurniture, setActiveFurniture] = useState<typeof CATALOG_ITEMS[number] | null>(null);

  const furnitureIconCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const furnitureIconLoading = useRef<Set<string>>(new Set());
  const [, setIconRenderVersion] = useState(0);

  const getFurnitureCanvasIcon = useCallback((iconName: string) => {
    const cached = furnitureIconCache.current.get(iconName);
    if (cached) return cached;

    if (furnitureIconLoading.current.has(iconName)) return null;
    furnitureIconLoading.current.add(iconName);

    const Icon = getFurnitureIcon(iconName);
    const svg = renderToStaticMarkup(<Icon width="64" height="64" strokeWidth="1.8" />);
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      furnitureIconCache.current.set(iconName, img);
      furnitureIconLoading.current.delete(iconName);
      URL.revokeObjectURL(url);
      setIconRenderVersion((v) => v + 1);
    };

    img.onerror = () => {
      furnitureIconLoading.current.delete(iconName);
      URL.revokeObjectURL(url);
    };

    img.src = url;
    return null;
  }, []);

  const panRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const dragRef = useRef<DragState>({
    type: null,
    id: null,
    offsetX: 0,
    offsetY: 0,
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSidebarTab, setActiveSidebarTab] = useState<"objects" | "layers" | "settings">("objects");
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setCanvasSize({
          w: Math.max(600, width - 40),
          h: Math.max(400, height - 40),
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fetchPlan = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      try {
        const userRes = await api.get("/users/me");
        const userData = userRes.data?.data || userRes.data;
        if (userData && userData.subscription && userData.subscription !== "FREE") {
          if (userData.subscriptionExpiresAt) {
            const expiryDate = new Date(userData.subscriptionExpiresAt);
            if (expiryDate > new Date()) {
              setIsSubscribed(true);
            } else {
              setIsSubscribed(false);
            }
          } else {
            setIsSubscribed(true);
          }
        } else {
          setIsSubscribed(false);
        }
      } catch (err) {
        console.error("Failed to check subscription status", err);
      }

      const plan = await getDigitalPlan(id);
      if (plan) {
        setWalls(plan.walls || []);
        setRooms(plan.rooms || []);
        setDoors(plan.doors || []);
        setWindows(plan.windows || []);
        setFurniture(plan.furniture || []);
      }
    } catch (e) {
      console.error("Failed to load digital plan", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlan();
    const handleFocus = () => fetchPlan();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchPlan]);

  const toWorld = useCallback((cx: number, cy: number): Point => ({
    x: (cx - pan.x) / zoom,
    y: (cy - pan.y) / zoom,
  }), [pan, zoom]);

  const snapPoint = useCallback((wx: number, wy: number): Point => {
    let sx = snapToGrid(wx);
    let sy = snapToGrid(wy);
    for (const w of walls) {
      if (dist(wx, wy, w.startX, w.startY) < SNAP_DIST / zoom) {
        sx = w.startX;
        sy = w.startY;
        break;
      }
      if (dist(wx, wy, w.endX, w.endY) < SNAP_DIST / zoom) {
        sx = w.endX;
        sy = w.endY;
        break;
      }
    }
    return { x: sx, y: sy };
  }, [walls, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const w0 = -pan.x / zoom;
    const h0 = -pan.y / zoom;
    const wW = canvas.width / zoom;
    const wH = canvas.height / zoom;

    const startX = Math.floor(w0 / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(h0 / GRID_SIZE) * GRID_SIZE;

    if (showGrid) {
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 0.5 / zoom;
      for (let gx = startX; gx < w0 + wW; gx += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(gx, h0);
        ctx.lineTo(gx, h0 + wH);
        ctx.stroke();
      }
      for (let gy = startY; gy < h0 + wH; gy += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(w0, gy);
        ctx.lineTo(w0 + wW, gy);
        ctx.stroke();
      }

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1 / zoom;
      for (let gx = startX; gx < w0 + wW; gx += GRID_SIZE * 5) {
        ctx.beginPath();
        ctx.moveTo(gx, h0);
        ctx.lineTo(gx, h0 + wH);
        ctx.stroke();
      }
      for (let gy = startY; gy < h0 + wH; gy += GRID_SIZE * 5) {
        ctx.beginPath();
        ctx.moveTo(w0, gy);
        ctx.lineTo(w0 + wW, gy);
        ctx.stroke();
      }
    }

    rooms.forEach((room) => {
      if (room.points.length < 3) return;
      const sel = selectedType === "room" && selectedId === room.id;
      ctx.beginPath();
      ctx.moveTo(room.points[0].x, room.points[0].y);
      room.points.forEach((p, i) => {
        if (i) ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = room.color;
      ctx.fill();
      ctx.strokeStyle = sel ? "#3b82f6" : "rgba(59,130,246,0.3)";
      ctx.lineWidth = (sel ? 2.5 : 1.5) / zoom;
      ctx.stroke();

      const cx = room.points.reduce((s, p) => s + p.x, 0) / room.points.length;
      const cy = room.points.reduce((s, p) => s + p.y, 0) / room.points.length;
      const areaSqm = polygonArea(room.points) * (SCALE_MM_PER_PX / 1000) ** 2;

      ctx.fillStyle = "#1e293b";
      ctx.font = `bold ${12 / zoom}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(room.name, cx, cy - 6 / zoom);

      ctx.font = `${10 / zoom}px Inter, sans-serif`;
      ctx.fillStyle = "#64748b";
      ctx.fillText(`${areaSqm.toFixed(2)} m²`, cx, cy + 8 / zoom);
    });

    walls.forEach((wall) => {
      const sel = selectedType === "wall" && selectedId === wall.id;
      const ang = wallAngle(wall);
      const nx = -Math.sin(ang) * (WALL_THICKNESS / 2);
      const ny = Math.cos(ang) * (WALL_THICKNESS / 2);

      ctx.beginPath();
      ctx.moveTo(wall.startX + nx, wall.startY + ny);
      ctx.lineTo(wall.endX + nx, wall.endY + ny);
      ctx.lineTo(wall.endX - nx, wall.endY - ny);
      ctx.lineTo(wall.startX - nx, wall.startY - ny);
      ctx.closePath();
      ctx.fillStyle = sel ? "#dbeafe" : "#f1f5f9";
      ctx.fill();
      ctx.strokeStyle = sel ? "#2563eb" : "#334155";
      ctx.lineWidth = (sel ? 2 : 1.5) / zoom;
      ctx.stroke();

      if (showDimensions) {
        const len = wallLength(wall);
        if (len > 20 / zoom) {
          const mx = (wall.startX + wall.endX) / 2;
          const my = (wall.startY + wall.endY) / 2;
          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(ang);
          ctx.fillStyle = "#64748b";
          ctx.font = `${10 / zoom}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(mmToLabel(pxToMm(len)), 0, -12 / zoom);
          ctx.restore();
        }
      }
    });

    if (tool === "wall" && drawStart && previewEnd) {
      ctx.beginPath();
      ctx.moveTo(drawStart.x, drawStart.y);
      ctx.lineTo(previewEnd.x, previewEnd.y);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = WALL_THICKNESS / zoom;
      ctx.lineCap = "round";
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineCap = "butt";
    }

    if (tool === "room" && roomPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(roomPoints[0].x, roomPoints[0].y);
      for (let i = 1; i < roomPoints.length; i++) {
        ctx.lineTo(roomPoints[i].x, roomPoints[i].y);
      }
      if (previewEnd) {
        ctx.lineTo(previewEnd.x, previewEnd.y);
      }
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([6 / zoom, 4 / zoom]);
      ctx.stroke();
      ctx.setLineDash([]);

      roomPoints.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, index === 0 ? 6 / zoom : 4 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? "#2563eb" : "#60a5fa";
        ctx.fill();
      });
    }

    doors.forEach((door) => {
      const sel = selectedType === "door" && selectedId === door.id;
      ctx.save();
      ctx.translate(door.x, door.y);
      ctx.rotate(door.angle);
      ctx.fillStyle = sel ? "#bfdbfe" : "#dbeafe";
      ctx.strokeStyle = sel ? "#2563eb" : "#3b82f6";
      ctx.lineWidth = (sel ? 2 : 1.5) / zoom;
      ctx.beginPath();
      ctx.rect(-18, -3, 36, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    windows.forEach((win) => {
      const sel = selectedType === "window" && selectedId === win.id;
      ctx.save();
      ctx.translate(win.x, win.y);
      ctx.rotate(win.angle);
      ctx.fillStyle = sel ? "#a7f3d0" : "#d1fae5";
      ctx.strokeStyle = sel ? "#059669" : "#10b981";
      ctx.lineWidth = (sel ? 2 : 1.5) / zoom;
      ctx.beginPath();
      ctx.rect(-20, -4, 40, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    furniture.forEach((item) => {
      const sel = selectedType === "furniture" && selectedId === item.id;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      const fw = item.width / 10;
      const fh = item.height / 10;

      ctx.fillStyle = sel ? "#fef3c7" : "#f8fafc";
      ctx.strokeStyle = sel ? "#f59e0b" : "#94a3b8";
      ctx.lineWidth = (sel ? 2 : 1.5) / zoom;
      ctx.beginPath();
      ctx.roundRect(-fw / 2, -fh / 2, fw, fh, 8);
      ctx.fill();
      ctx.stroke();

      const icon = getFurnitureCanvasIcon(item.icon);
      if (icon) {
        const maxIconSize = Math.min(fw, fh) * 0.65;
        const iconSize = Math.max(18, Math.min(maxIconSize, 70));
        ctx.drawImage(icon, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(fw, fh) * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      if (fw > 55 && fh > 30) {
        ctx.fillStyle = "#475569";
        ctx.font = `${8 / zoom}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(item.name, 0, fh / 2 + 5 / zoom);
      }
      ctx.restore();
    });

    ctx.restore();
  }, [
    walls,
    doors,
    windows,
    rooms,
    furniture,
    drawStart,
    previewEnd,
    roomPoints,
    tool,
    zoom,
    pan,
    canvasSize,
    selectedId,
    selectedType,
    showGrid,
    showDimensions,
    getFurnitureCanvasIcon,
  ]);

  const pointInPolygon = (px: number, py: number, pts: Point[]) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i].x, yi = pts[i].y;
      const xj = pts[j].x, yj = pts[j].y;
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };

  const hitTest = useCallback((wx: number, wy: number) => {
    for (const f of [...furniture].reverse()) {
      const fw = f.width / 10;
      const fh = f.height / 10;
      if (Math.abs(wx - f.x) < fw / 2 && Math.abs(wy - f.y) < fh / 2) {
        return { type: "furniture" as const, id: f.id };
      }
    }
    for (const d of [...doors].reverse()) {
      if (dist(wx, wy, d.x, d.y) < 20) return { type: "door" as const, id: d.id };
    }
    for (const w of [...windows].reverse()) {
      if (dist(wx, wy, w.x, w.y) < 20) return { type: "window" as const, id: w.id };
    }
    for (const w of [...walls].reverse()) {
      if (ptToSegDist(wx, wy, w.startX, w.startY, w.endX, w.endY) < 8) {
        return { type: "wall" as const, id: w.id };
      }
    }
    for (const r of [...rooms].reverse()) {
      if (pointInPolygon(wx, wy, r.points)) return { type: "room" as const, id: r.id };
    }
    return null;
  }, [doors, windows, walls, rooms, furniture]);

  const getWorld = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    return toWorld(e.clientX - r.left, e.clientY - r.top);
  };

  const finishRoom = useCallback(async () => {
    if (roomPoints.length < 3) {
      setRoomPoints([]);
      setPreviewEnd(null);
      return;
    }
    const color = ROOM_COLORS[rooms.length % ROOM_COLORS.length];
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${rooms.length + 1}`,
      points: roomPoints,
      areaSqm: polygonArea(roomPoints) * (SCALE_MM_PER_PX / 1000) ** 2,
      color,
    };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    setRoomPoints([]);
    setPreviewEnd(null);

    if (id) {
      try {
        await saveDigitalPlan(id, { walls, rooms: updatedRooms, doors, windows, furniture });
      } catch (err) {
        console.error("Failed to save room", err);
      }
    }
  }, [roomPoints, rooms, id, walls, doors, windows, furniture]);

  const finishWall = useCallback(() => {
    setDrawStart(null);
    setPreviewEnd(null);
  }, []);

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tool === "wall") finishWall();
    if (tool === "room") await finishRoom();
  };

  const handleMouseDown = async (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !id || e.button === 2) return;

    if (tool === "pan" || e.shiftKey) {
      panRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
      return;
    }

    const raw = getWorld(e);
    const wp = snapPoint(raw.x, raw.y);

    let updatedWalls = walls;
    let updatedRooms = rooms;
    let updatedDoors = doors;
    let updatedWindows = windows;
    let updatedFurniture = furniture;

    if (tool === "furniture" && activeFurniture) {
      const newFurniture: FurnitureItem = {
        id: Date.now().toString(),
        name: activeFurniture.name,
        category: activeFurniture.category,
        icon: activeFurniture.icon,
        x: wp.x,
        y: wp.y,
        width: activeFurniture.width,
        height: activeFurniture.height,
        rotation: 0,
      };
      updatedFurniture = [...furniture, newFurniture];
      setFurniture(updatedFurniture);
      setSelectedId(newFurniture.id);
      setSelectedType("furniture");
      setActiveFurniture(null);
      setTool("select");
    } else if (tool === "select") {
      const hit = hitTest(raw.x, raw.y);
      if (hit) {
        setSelectedId(hit.id);
        setSelectedType(hit.type);
        if (hit.type === "furniture") {
          const obj = furniture.find((x) => x.id === hit.id);
          if (obj) {
            dragRef.current = { type: "furniture", id: hit.id, offsetX: raw.x - obj.x, offsetY: raw.y - obj.y };
          }
        } else if (hit.type === "door") {
          const obj = doors.find((x) => x.id === hit.id);
          if (obj) {
            dragRef.current = { type: "door", id: hit.id, offsetX: raw.x - obj.x, offsetY: raw.y - obj.y };
          }
        } else if (hit.type === "window") {
          const obj = windows.find((x) => x.id === hit.id);
          if (obj) {
            dragRef.current = { type: "window", id: hit.id, offsetX: raw.x - obj.x, offsetY: raw.y - obj.y };
          }
        }
      } else {
        setSelectedId(null);
        setSelectedType(null);
      }
      return;
    } else if (tool === "eraser") {
      const hit = hitTest(raw.x, raw.y);
      if (!hit) return;
      if (hit.type === "wall") updatedWalls = walls.filter((x) => x.id !== hit.id);
      if (hit.type === "door") updatedDoors = doors.filter((x) => x.id !== hit.id);
      if (hit.type === "window") updatedWindows = windows.filter((x) => x.id !== hit.id);
      if (hit.type === "room") updatedRooms = rooms.filter((x) => x.id !== hit.id);
      if (hit.type === "furniture") updatedFurniture = furniture.filter((x) => x.id !== hit.id);

      setWalls(updatedWalls);
      setDoors(updatedDoors);
      setWindows(updatedWindows);
      setRooms(updatedRooms);
      setFurniture(updatedFurniture);
    } else if (tool === "wall") {
      if (!drawStart) {
        setDrawStart(wp);
        setPreviewEnd(wp);
        return;
      }
      if (dist(drawStart.x, drawStart.y, wp.x, wp.y) > 4) {
        updatedWalls = [
          ...walls,
          { id: Date.now().toString(), startX: drawStart.x, startY: drawStart.y, endX: wp.x, endY: wp.y, thickness: 200, height: 3.0 },
        ];
        setWalls(updatedWalls);
        setDrawStart({ x: wp.x, y: wp.y });
      }
    } else if (tool === "door") {
      updatedDoors = [...doors, { id: Date.now().toString(), x: wp.x, y: wp.y, width: 900, angle: 0 }];
      setDoors(updatedDoors);
    } else if (tool === "window") {
      updatedWindows = [...windows, { id: Date.now().toString(), x: wp.x, y: wp.y, width: 1200, angle: 0 }];
      setWindows(updatedWindows);
    } else if (tool === "room") {
      if (roomPoints.length >= 3 && dist(wp.x, wp.y, roomPoints[0].x, roomPoints[0].y) < 15) {
        await finishRoom();
      } else {
        setRoomPoints((p) => [...p, wp]);
      }
      return;
    }

    try {
      await saveDigitalPlan(id, { walls: updatedWalls, rooms: updatedRooms, doors: updatedDoors, windows: updatedWindows, furniture: updatedFurniture });
    } catch (err) {
      console.error("Auto-save failed", err);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panRef.current.active) {
      const dx = e.clientX - panRef.current.lastX;
      const dy = e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      return;
    }

    const raw = getWorld(e);
    const wp = snapPoint(raw.x, raw.y);

    if (tool === "wall" || tool === "room") {
      setPreviewEnd(wp);
    }

    const dr = dragRef.current;
    if (dr.type === "door") {
      setDoors((p) => p.map((d) => (d.id === dr.id ? { ...d, x: raw.x - dr.offsetX, y: raw.y - dr.offsetY } : d)));
    } else if (dr.type === "window") {
      setWindows((p) => p.map((w) => (w.id === dr.id ? { ...w, x: raw.x - dr.offsetX, y: raw.y - dr.offsetY } : w)));
    } else if (dr.type === "furniture") {
      setFurniture((p) => p.map((f) => (f.id === dr.id ? { ...f, x: raw.x - dr.offsetX, y: raw.y - dr.offsetY } : f)));
    }
  };

  const handleMouseUp = async () => {
    panRef.current.active = false;
    const dr = dragRef.current;
    dragRef.current = { type: null, id: null, offsetX: 0, offsetY: 0 };

    if (dr.id && id) {
      try {
        await saveDigitalPlan(id, { walls, rooms, doors, windows, furniture });
      } catch (err) {
        console.error("Auto-save after drag failed", err);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nz = Math.min(4, Math.max(0.2, zoom * factor));
    setPan((p) => ({
      x: cx - (cx - p.x) * (nz / zoom),
      y: cy - (cy - p.y) * (nz / zoom),
    }));
    setZoom(nz);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await saveDigitalPlan(id, { walls, rooms, doors, windows, furniture });
      setMessage("Saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPlan = () => {
    const planData = JSON.stringify({ walls, rooms, doors, windows, furniture }, null, 2);
    const blob = new Blob([planData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `floor-plan-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalWallLength = walls.reduce((s, w) => s + pxToMm(wallLength(w)), 0);
  const totalRoomArea = rooms.reduce((s, r) => s + polygonArea(r.points) * (SCALE_MM_PER_PX / 1000) ** 2, 0);

  const selectedWall = selectedType === "wall" ? walls.find((x) => x.id === selectedId) : null;
  const selectedRoom = selectedType === "room" ? rooms.find((x) => x.id === selectedId) : null;
  const selectedFurniture = selectedType === "furniture" ? furniture.find((x) => x.id === selectedId) : null;

  const filteredCatalog = CATALOG_ITEMS.filter(
    (item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Loading floor plan...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-blue-500/25">
      {/* ====================================================
          TOP HEADER
      ==================================================== */}
      <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PanelTop size={18} className="text-blue-600" />
            Floor Plan Studio
          </h1>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">
            {walls.length} Walls · {rooms.length} Rooms · {furniture.length} Objects
          </span>
        </div>

        <div className="flex items-center gap-3">
          {message && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl shadow-2xs">
              {message}
            </span>
          )}

          <button
            onClick={async () => {
              if (!window.confirm("Clear canvas?")) return;
              setWalls([]);
              setRooms([]);
              setDoors([]);
              setWindows([]);
              setFurniture([]);
              setRoomPoints([]);
              setDrawStart(null);
              setPreviewEnd(null);
              setSelectedId(null);
              setSelectedType(null);
              if (id) {
                await saveDigitalPlan(id, { walls: [], rooms: [], doors: [], windows: [], furniture: [] });
              }
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2"
          >
            <Trash2 size={14} />
            Clear Canvas
          </button>

          <button
            onClick={handleDownloadPlan}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2"
          >
            <Download size={14} />
            Download JSON
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-900/20"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Plan"}
          </button>

          <button
            onClick={() => {
              if (!isSubscribed) {
                setModalFeatureName("3D Plan Conversion");
                setShowSubscriptionModal(true);
                return;
              }
              navigate(`/projects/${id}/3d-plan`);
            }}
            className={`px-4 py-2 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-xs ${
              isSubscribed ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20" : "bg-slate-700 hover:bg-slate-800 opacity-90"
            }`}
          >
            {isSubscribed ? "🏠 Convert to 3D Plan" : <><Lock size={14} /> 🏠 Convert to 3D Plan (Locked)</>}
          </button>

          <button
            onClick={() => {
              if (!isSubscribed) {
                setModalFeatureName("AI 3D Render");
                setShowSubscriptionModal(true);
                return;
              }
              const canvas = canvasRef.current;
              if (!canvas) {
                alert("Canvas not found!");
                return;
              }
              const dataUrl = canvas.toDataURL("image/png");
              navigate(`/projects/${id}/ai-render`, { state: { initialImage: dataUrl } });
            }}
            className={`px-4 py-2 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-xs ${
              isSubscribed ? "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20" : "bg-slate-700 hover:bg-slate-800 opacity-90"
            }`}
          >
            {isSubscribed ? "✨ AI 3D Render" : <><Lock size={14} /> ✨ AI 3D Render (Locked)</>}
          </button>

          <button
            onClick={() => navigate(`/projects/${id}/boq`)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            View BOQ
            <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {/* ====================================================
          MAIN BODY
      ==================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* =================================================
            LEFT SIDEBAR
        ================================================ */}
        <aside className="w-80 bg-white border-r border-slate-200/80 flex flex-col z-10 shadow-xs">
          <div className="flex border-b border-slate-200/80 bg-slate-50/50 p-1.5 gap-1">
            {(["objects", "layers", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSidebarTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl capitalize cursor-pointer transition-all ${
                  activeSidebarTab === tab
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {tab === "objects" && <Box size={13} />}
                  {tab === "layers" && <Layers size={13} />}
                  {tab === "settings" && <Settings size={13} />}
                  {tab}
                </span>
              </button>
            ))}
          </div>

          {/* OBJECTS TAB */}
          {activeSidebarTab === "objects" && (
            <div className="flex flex-col flex-1 p-4 overflow-y-auto gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                />
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              </div>

              {activeFurniture && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex justify-between items-center shadow-2xs">
                  <span>
                    Placing: <b>{activeFurniture.name}</b>
                  </span>
                  <button
                    onClick={() => {
                      setActiveFurniture(null);
                      setTool("select");
                    }}
                    className="font-bold text-amber-600 hover:text-amber-900 cursor-pointer p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                  Structure Tools
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "wall", label: "Wall", icon: BrickWall },
                    { key: "door", label: "Door", icon: DoorOpen },
                    { key: "window", label: "Window", icon: PanelTop },
                    { key: "room", label: "Room", icon: Hexagon },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          setTool(t.key as Tool);
                          setActiveFurniture(null);
                          if (t.key !== "wall") {
                            setDrawStart(null);
                            setPreviewEnd(null);
                          }
                          if (t.key !== "room") {
                            setRoomPoints([]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                          tool === t.key
                            ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                  Furniture & Fixtures
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCatalog.map((item) => {
                    const Icon = getFurnitureIcon(item.icon);
                    return (
                      <div
                        key={item.name}
                        onClick={() => {
                          setActiveFurniture(item);
                          setTool("furniture");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 cursor-pointer transition-all bg-white hover:border-blue-400 hover:shadow-xs ${
                          activeFurniture?.name === item.name
                            ? "border-blue-500 bg-blue-50/50 shadow-xs"
                            : "border-slate-200"
                        }`}
                      >
                        <Icon size={22} className="text-slate-700" />
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.width} × {item.height} cm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* LAYERS TAB */}
          {activeSidebarTab === "layers" && (
            <div className="p-4 flex-1 overflow-y-auto space-y-1 text-xs">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
                Canvas Elements
              </h4>
              {walls.map((w, i) => (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedId(w.id);
                    setSelectedType("wall");
                  }}
                  className={`p-2.5 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                    selectedId === w.id
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BrickWall size={14} /> Wall #{i + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {mmToLabel(pxToMm(wallLength(w)))}
                  </span>
                </div>
              ))}

              {rooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedId(r.id);
                    setSelectedType("room");
                  }}
                  className={`p-2.5 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                    selectedId === r.id
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hexagon size={14} /> {r.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {(polygonArea(r.points) * (SCALE_MM_PER_PX / 1e6)).toFixed(2)} m²
                  </span>
                </div>
              ))}

              {furniture.map((f) => {
                const Icon = getFurnitureIcon(f.icon);
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedId(f.id);
                      setSelectedType("furniture");
                    }}
                    className={`p-2.5 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                      selectedId === f.id
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={14} /> {f.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeSidebarTab === "settings" && (
            <div className="p-4 space-y-4 text-xs">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Preferences
              </h4>
              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                <span className="text-slate-700 font-medium">Show Grid Lines</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50">
                <span className="text-slate-700 font-medium">Show Dimensions</span>
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          )}
        </aside>

        {/* =================================================
            CENTER CANVAS
        ================================================ */}
        <main
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-slate-100 flex items-center justify-center p-4"
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
            className="shadow-xl rounded-2xl bg-white border border-slate-200/80"
            style={{
              cursor:
                tool === "pan"
                  ? panRef.current.active
                    ? "grabbing"
                    : "grab"
                  : tool === "select"
                  ? "default"
                  : tool === "eraser"
                  ? "cell"
                  : "crosshair",
            }}
          />

          {/* =================================================
              FLOATING TOOLBAR
          ================================================ */}
          <div className="absolute top-6 bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xl rounded-2xl p-1.5 flex items-center gap-1 z-10">
            {[
              { key: "select", icon: MousePointer2, label: "Select" },
              { key: "pan", icon: Hand, label: "Pan / Hand" },
              { key: "wall", icon: BrickWall, label: "Wall" },
              { key: "door", icon: DoorOpen, label: "Door" },
              { key: "window", icon: PanelTop, label: "Window" },
              { key: "room", icon: Hexagon, label: "Room" },
              { key: "eraser", icon: Eraser, label: "Eraser" },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTool(t.key as Tool);
                    setActiveFurniture(null);
                    if (t.key !== "wall") {
                      setDrawStart(null);
                      setPreviewEnd(null);
                    }
                    if (t.key !== "room") {
                      setRoomPoints([]);
                    }
                  }}
                  title={t.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer transition-all ${
                    tool === t.key
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          {tool === "wall" && drawStart && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-4 py-2.5 text-xs text-slate-700 font-medium">
              <b className="text-blue-600">Wall drawing</b> — Left click to add segments · Right click to finish
            </div>
          )}

          {tool === "room" && roomPoints.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-4 py-2.5 text-xs text-slate-700 font-medium">
              <b className="text-blue-600">Room drawing</b> — Left click to add points · Right click to finish
            </div>
          )}

          {tool === "furniture" && activeFurniture && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-4 py-2.5 text-xs text-slate-700 font-medium">
              <b className="text-blue-600">{activeFurniture.name}</b> — Click on the canvas to place
            </div>
          )}
        </main>

        {/* =================================================
            RIGHT SIDEBAR
        ================================================ */}
        <aside className="w-85 bg-white border-l border-slate-200/80 flex flex-col z-10 shadow-xs">
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Room Statistics
            </h3>
          </div>

          <div className="p-4 border-b border-slate-200/80 space-y-3 text-xs bg-slate-50/30">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Rooms</span>
              <span className="font-bold text-slate-900">{rooms.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Area</span>
              <span className="font-bold text-blue-600">{totalRoomArea.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Total Perimeter</span>
              <span className="font-bold text-slate-900">{(totalWallLength / 1000).toFixed(2)} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Objects Placed</span>
              <span className="font-bold text-slate-900">{furniture.length + doors.length + windows.length}</span>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-4">
              Properties
            </h3>

            {!selectedId ? (
              <div className="text-center text-slate-400 text-xs py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-4">
                No element selected.
                <br />
                Click any item on canvas to edit.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {selectedWall && (
                  <>
                    <div className="font-bold text-slate-900 text-sm">Wall Segment</div>
                    <div className="text-slate-600">
                      Length: <b className="text-blue-600 font-mono">{mmToLabel(pxToMm(wallLength(selectedWall)))}</b>
                    </div>
                    <button
                      onClick={async () => {
                        const updated = walls.filter((x) => x.id !== selectedId);
                        setWalls(updated);
                        setSelectedId(null);
                        setSelectedType(null);
                        if (id) {
                          await saveDigitalPlan(id, { walls: updated, rooms, doors, windows, furniture });
                        }
                      }}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Trash2 size={14} /> Delete Wall
                    </button>
                  </>
                )}

                {selectedRoom && (
                  <>
                    <div className="font-bold text-slate-900 text-sm">Room Zone</div>
                    <label className="block space-y-1">
                      <span className="text-slate-500 font-medium">Room Name</span>
                      <input
                        type="text"
                        value={selectedRoom.name}
                        onChange={async (e) => {
                          const name = e.target.value;
                          const updated = rooms.map((r) => (r.id === selectedRoom.id ? { ...r, name } : r));
                          setRooms(updated);
                          if (id) {
                            await saveDigitalPlan(id, { walls, rooms: updated, doors, windows, furniture });
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                      />
                    </label>
                    <div className="text-slate-600">
                      Area: <b className="font-mono text-slate-900">{(polygonArea(selectedRoom.points) * (SCALE_MM_PER_PX / 1e6)).toFixed(2)} m²</b>
                    </div>
                    <button
                      onClick={async () => {
                        const updated = rooms.filter((x) => x.id !== selectedId);
                        setRooms(updated);
                        setSelectedId(null);
                        setSelectedType(null);
                        if (id) {
                          await saveDigitalPlan(id, { walls, rooms: updated, doors, windows, furniture });
                        }
                      }}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Trash2 size={14} /> Delete Room
                    </button>
                  </>
                )}

                {selectedFurniture && (
                  <>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {(() => {
                        const Icon = getFurnitureIcon(selectedFurniture.icon);
                        return <Icon size={17} />;
                      })()}
                      {selectedFurniture.name}
                    </div>
                    <div className="text-slate-600">
                      Category: <b>{selectedFurniture.category}</b>
                    </div>
                    <div className="text-slate-600">
                      Dimensions: <span className="font-mono">{selectedFurniture.width} × {selectedFurniture.height} cm</span>
                    </div>
                    <div className="text-slate-600">
                      Position: <b className="font-mono">{Math.round(selectedFurniture.x)} × {Math.round(selectedFurniture.y)}</b>
                    </div>
                    <button
                      onClick={async () => {
                        const updated = furniture.filter((x) => x.id !== selectedId);
                        setFurniture(updated);
                        setSelectedId(null);
                        setSelectedType(null);
                        if (id) {
                          await saveDigitalPlan(id, { walls, rooms, doors, windows, furniture: updated });
                        }
                      }}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors cursor-pointer mt-4 flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Trash2 size={14} /> Delete Item
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ====================================================
          SUBSCRIPTION REQUIRED MODAL POPUP
      ==================================================== */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col items-center text-center">
            {/* Close Button */}
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 shadow-inner">
              <Sparkles size={28} />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Subscription Required
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              The <span className="font-semibold text-slate-700">{modalFeatureName}</span> feature requires an active premium subscription to access advanced workspace tools.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  navigate("/projects/{id}/pricing");
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all shadow-md shadow-blue-600/20"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloorPlanPage;