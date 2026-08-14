
import React, { useState, useEffect, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AiRenderStudio(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [outputImage, setOutputImage] = useState("");
  const [isCheckingSub, setIsCheckingSub] = useState(true);

  /* ============================================================
     SUBSCRIPTION CHECK
     ============================================================ */
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/users/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Auth failed");

        const data = await res.json();
        const isPro = data.subscription === "PRO";
        const notExpired =
          data.subscriptionExpiresAt &&
          new Date(data.subscriptionExpiresAt) > new Date();

        if (!isPro || !notExpired) {
          alert("PRO subscription required.");
          navigate("/pricing");
        }
      } catch {
        navigate("/pricing");
      } finally {
        setIsCheckingSub(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  /* ============================================================
     AUTO-LOAD IMAGE FROM FLOOR PLAN CANVAS
     ============================================================ */
  useEffect(() => {
    const state = location.state as { initialImage?: string };

    if (state?.initialImage) {
      setPreviewUrl(state.initialImage);

      fetch(state.initialImage)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], "floor-plan.png", { type: "image/png" });
          setSelectedImage(file);
        })
        .catch((err) => console.error("Failed to load canvas image:", err));
    }
  }, [location.state]);

  /* ============================================================
     FILE UPLOAD
     ============================================================ */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOutputImage("");
  };

  /* ============================================================
     GENERATE 2D BLUEPRINT
     ============================================================ */
  const handleGenerate = async () => {
    if (!selectedImage) {
      alert("Please upload or draw a floor plan first.");
      return;
    }

    setLoading(true);
    setOutputImage("");

    const formData = new FormData();
    formData.append("file", selectedImage);

    // Simple 2D prompts — backend will use these
    formData.append(
      "prompt",
      "2D architectural floor plan, top-down view, clean CAD blueprint, black lines, white background, simple furniture symbols, flat vector style, no 3D, no perspective"
    );
    formData.append(
      "negative_prompt",
      "3D render, perspective, isometric, photorealistic, shadows, depth, wood texture, brown floor, exterior, sky, people, blurry, watermark, text, logo"
    );
    formData.append("steps", "25");

    try {
      // TODO: Replace with your live ngrok URL from Colab
      const res = await fetch("https://unremovable-dully-connor.ngrok-free.dev/generate-render", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      setOutputImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("AI service error. Make sure your Colab backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSub) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs text-slate-500">
        Verifying PRO access...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        AI Floor Plan Studio
      </h2>
      <p className="text-slate-500 text-xs mb-8">
        Convert your sketch into a clean, professional 2D architectural blueprint.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INPUT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            1. Source Plan
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"
          />

          {previewUrl && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-600 mb-1">Preview:</p>
              <img
                src={previewUrl}
                alt="Source"
                className="w-full max-h-64 object-contain border border-slate-200 rounded-xl bg-white p-2"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Generating 2D Blueprint..." : "Generate Clean 2D Plan"}
          </button>
        </div>

        {/* OUTPUT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            2. Result
          </h3>

          {outputImage ? (
            <div className="text-center">
              <img
                src={outputImage}
                alt="AI Floor Plan"
                className="w-full max-h-80 object-contain border border-slate-200 rounded-xl bg-white p-2 mx-auto"
              />
              <a
                href={outputImage}
                download="floor-plan-2d.jpg"
                className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Download Image
              </a>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              {loading ? "Drawing crisp lines..." : "Result appears here"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect, useCallback, type ChangeEvent } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { getDigitalPlan } from "../../services/project.service";
// import { Download, ArrowLeft, PenTool, Sparkles, Ruler } from "lucide-react";

// /* ============================================================
//    TYPES
//    ============================================================ */
// interface Point {
//   x: number;
//   y: number;
// }

// interface Wall {
//   id: string;
//   startX: number;
//   startY: number;
//   endX: number;
//   endY: number;
//   thickness: number;
//   height: number;
// }

// interface Door {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   angle: number;
// }

// interface WindowItem {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   angle: number;
// }

// interface Room {
//   id: string;
//   name: string;
//   points: Point[];
//   areaSqm: number;
//   color: string;
// }

// interface FurnitureItem {
//   id: string;
//   name: string;
//   category: "Living" | "Bedroom" | "Kitchen" | "Bathroom" | "Office";
//   icon: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   rotation: number;
// }

// /* ============================================================
//    HELPERS
//    ============================================================ */
// function polygonArea(pts: Point[]) {
//   let a = 0;
//   const n = pts.length;
//   for (let i = 0; i < n; i++) {
//     const j = (i + 1) % n;
//     a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
//   }
//   return Math.abs(a / 2);
// }

// function dist(ax: number, ay: number, bx: number, by: number) {
//   return Math.hypot(bx - ax, by - ay);
// }

// /* ============================================================
//    COMPONENT
//    ============================================================ */
// export default function AiRenderStudio(): React.JSX.Element {
//   const { id } = useParams<{ id: string }>();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [mode, setMode] = useState<"exact" | "ai">("exact");
//   const [previewUrl, setPreviewUrl] = useState("");
//   const [outputImage, setOutputImage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isCheckingSub, setIsCheckingSub] = useState(true);

//   /* ==========================================================
//      SUBSCRIPTION CHECK
//      ========================================================== */
//   useEffect(() => {
//     const check = async () => {
//       try {
//         const res = await fetch("http://localhost:5000/api/v1/users/me", {
//           credentials: "include",
//         });
//         if (!res.ok) throw new Error("Auth failed");
//         const data = await res.json();
//         const isPro = data.subscription === "PRO";
//         const valid = data.subscriptionExpiresAt && new Date(data.subscriptionExpiresAt) > new Date();
//         if (!isPro || !valid) {
//           alert("PRO subscription required.");
//           navigate("/pricing");
//         }
//       } catch {
//         navigate("/pricing");
//       } finally {
//         setIsCheckingSub(false);
//       }
//     };
//     check();
//   }, [navigate]);

//   /* ==========================================================
//      LOAD CANVAS IMAGE FROM FLOOR PLAN
//      ========================================================== */
//   useEffect(() => {
//     const state = location.state as { initialImage?: string };
//     if (state?.initialImage) {
//       setPreviewUrl(state.initialImage);
//       fetch(state.initialImage)
//         .then((r) => r.blob())
//         .then((blob) => {
//           const file = new File([blob], "floor-plan.png", { type: "image/png" });
//           // store if user wants AI mode later
//           (window as any).__planFile = file;
//         })
//         .catch(console.error);
//     }
//   }, [location.state]);

//   /* ==========================================================
//      EXACT PREMIUM 2D RENDER (RECOMMENDED)
//      ========================================================== */
//   const renderExactPlan = useCallback(async () => {
//     if (!id) return;
//     setLoading(true);
//     try {
//       const plan = await getDigitalPlan(id);
//       if (!plan) throw new Error("No plan data");

//       const canvas = document.createElement("canvas");
//       const W = 2000;
//       const H = 1400;
//       canvas.width = W;
//       canvas.height = H;
//       const ctx = canvas.getContext("2d")!;
//       const PAD = 80;

//       // White background
//       ctx.fillStyle = "#ffffff";
//       ctx.fillRect(0, 0, W, H);

//       // Collect bounds
//       const allPts: Point[] = [];
//       plan.walls?.forEach((w: Wall) => {
//         allPts.push({ x: w.startX, y: w.startY }, { x: w.endX, y: w.endY });
//       });
//       plan.rooms?.forEach((r: Room) => allPts.push(...r.points));
//       plan.furniture?.forEach((f: FurnitureItem) => {
//         allPts.push(
//           { x: f.x - f.width / 2, y: f.y - f.height / 2 },
//           { x: f.x + f.width / 2, y: f.y + f.height / 2 }
//         );
//       });
//       plan.doors?.forEach((d: Door) => allPts.push({ x: d.x, y: d.y }));
//       plan.windows?.forEach((w: WindowItem) => allPts.push({ x: w.x, y: w.y }));

//       let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//       allPts.forEach((p) => {
//         minX = Math.min(minX, p.x);
//         minY = Math.min(minY, p.y);
//         maxX = Math.max(maxX, p.x);
//         maxY = Math.max(maxY, p.y);
//       });

//       const cW = maxX - minX || 1;
//       const cH = maxY - minY || 1;
//       const s = Math.min((W - PAD * 2) / cW, (H - PAD * 2) / cH);
//       const ox = PAD + (W - PAD * 2 - cW * s) / 2 - minX * s;
//       const oy = PAD + (H - PAD * 2 - cH * s) / 2 - minY * s;

//       const tx = (x: number) => x * s + ox;
//       const ty = (y: number) => y * s + oy;

//       // Light grid
//       ctx.strokeStyle = "#f1f5f9";
//       ctx.lineWidth = 1;
//       const gs = 20 * s;
//       const startGX = Math.floor((minX * s + ox) / gs) * gs;
//       const startGY = Math.floor((minY * s + oy) / gs) * gs;
//       for (let gx = startGX; gx < W; gx += gs) {
//         ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
//       }
//       for (let gy = startGY; gy < H; gy += gs) {
//         ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
//       }

//       // Rooms
//       plan.rooms?.forEach((room: Room) => {
//         if (room.points.length < 3) return;
//         ctx.beginPath();
//         const p0 = room.points[0];
//         ctx.moveTo(tx(p0.x), ty(p0.y));
//         room.points.forEach((pt, i) => {
//           if (i === 0) return;
//           ctx.lineTo(tx(pt.x), ty(pt.y));
//         });
//         ctx.closePath();
//         ctx.fillStyle = room.color || "rgba(99,102,241,0.15)";
//         ctx.fill();
//         ctx.strokeStyle = "#3b82f6";
//         ctx.lineWidth = 2;
//         ctx.stroke();

//         // Label
//         const cx = room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length;
//         const cy = room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length;
//         const area = (polygonArea(room.points) * 0.01).toFixed(2);
//         ctx.fillStyle = "#0f172a";
//         ctx.font = `bold ${Math.max(12, 14)}px Inter, sans-serif`;
//         ctx.textAlign = "center";
//         ctx.fillText(room.name, tx(cx), ty(cy) - 6);
//         ctx.fillStyle = "#64748b";
//         ctx.font = `${Math.max(11, 12)}px Inter, sans-serif`;
//         ctx.fillText(`${area} m²`, tx(cx), ty(cy) + 10);
//       });

//       // Walls
//       plan.walls?.forEach((wall: Wall) => {
//         const ang = Math.atan2(wall.endY - wall.startY, wall.endX - wall.startX);
//         const t = ((wall.thickness || 200) / 100 / 2) * s; // mm->world units->px
//         const nx = -Math.sin(ang) * t;
//         const ny = Math.cos(ang) * t;
//         const x1 = tx(wall.startX);
//         const y1 = ty(wall.startY);
//         const x2 = tx(wall.endX);
//         const y2 = ty(wall.endY);

//         ctx.beginPath();
//         ctx.moveTo(x1 + nx, y1 + ny);
//         ctx.lineTo(x2 + nx, y2 + ny);
//         ctx.lineTo(x2 - nx, y2 - ny);
//         ctx.lineTo(x1 - nx, y1 - ny);
//         ctx.closePath();
//         ctx.fillStyle = "#e2e8f0";
//         ctx.fill();
//         ctx.strokeStyle = "#1e293b";
//         ctx.lineWidth = 2;
//         ctx.stroke();

//         // Dimension
//         const mx = (x1 + x2) / 2;
//         const my = (y1 + y2) / 2;
//         const lenM = dist(wall.startX, wall.startY, wall.endX, wall.endY) * 0.1;
//         ctx.save();
//         ctx.translate(mx, my);
//         ctx.rotate(ang);
//         ctx.fillStyle = "#64748b";
//         ctx.font = `10px Inter, sans-serif`;
//         ctx.textAlign = "center";
//         ctx.fillText(`${lenM.toFixed(2)} m`, 0, -10);
//         ctx.restore();
//       });

//       // Doors
//       plan.doors?.forEach((door: Door) => {
//         const x = tx(door.x);
//         const y = ty(door.y);
//         const w = ((door.width || 900) / 100) * s;
//         const h = 6 * s;
//         ctx.save();
//         ctx.translate(x, y);
//         ctx.rotate(door.angle);
//         ctx.fillStyle = "#dbeafe";
//         ctx.strokeStyle = "#2563eb";
//         ctx.lineWidth = 2;
//         ctx.fillRect(-w / 2, -h / 2, w, h);
//         ctx.strokeRect(-w / 2, -h / 2, w, h);
//         // Swing arc
//         ctx.beginPath();
//         ctx.arc(-w / 2, 0, w, -Math.PI / 2, 0);
//         ctx.strokeStyle = "#93c5fd";
//         ctx.lineWidth = 1.5;
//         ctx.stroke();
//         ctx.restore();
//       });

//       // Windows
//       plan.windows?.forEach((win: WindowItem) => {
//         const x = tx(win.x);
//         const y = ty(win.y);
//         const w = ((win.width || 1200) / 100) * s;
//         const h = 5 * s;
//         ctx.save();
//         ctx.translate(x, y);
//         ctx.rotate(win.angle);
//         ctx.fillStyle = "#d1fae5";
//         ctx.strokeStyle = "#059669";
//         ctx.lineWidth = 2;
//         ctx.fillRect(-w / 2, -h / 2, w, h);
//         ctx.strokeRect(-w / 2, -h / 2, w, h);
//         ctx.restore();
//       });

//       // Furniture
//       const catColors: Record<string, string> = {
//         Living: "#f59e0b",
//         Bedroom: "#8b5cf6",
//         Kitchen: "#10b981",
//         Bathroom: "#06b6d4",
//         Office: "#3b82f6",
//       };

//       plan.furniture?.forEach((item: FurnitureItem) => {
//         ctx.save();
//         ctx.translate(tx(item.x), ty(item.y));
//         ctx.rotate(item.rotation);
//         const w = (item.width / 10) * s;
//         const h = (item.height / 10) * s;
//         const hw = w / 2;
//         const hh = h / 2;
//         const col = catColors[item.category] || "#64748b";

//         // Base
//         ctx.fillStyle = col + "18";
//         ctx.strokeStyle = col;
//         ctx.lineWidth = Math.max(1.5, 2);
//         ctx.beginPath();
//         (ctx as any).roundRect(-hw, -hh, w, h, Math.min(w, h) * 0.08);
//         ctx.fill();
//         ctx.stroke();

//         // Symbol
//         ctx.strokeStyle = col;
//         ctx.lineWidth = Math.max(1, 1.5);
//         ctx.fillStyle = col + "35";
//         const name = item.name.toLowerCase();

//         if (item.icon === "bed" || name.includes("bed")) {
//           ctx.strokeRect(-hw + w * 0.1, -hh + h * 0.12, w * 0.8, h * 0.76);
//           ctx.beginPath();
//           ctx.moveTo(-hw + w * 0.1, -hh + h * 0.38);
//           ctx.lineTo(hw - w * 0.1, -hh + h * 0.38);
//           ctx.stroke();
//           ctx.fillRect(-hw + w * 0.12, -hh + h * 0.14, w * 0.22, h * 0.22);
//           ctx.fillRect(hw - w * 0.12 - w * 0.22, -hh + h * 0.14, w * 0.22, h * 0.22);
//         } else if (item.icon === "sofa" || name.includes("sofa")) {
//           ctx.fillRect(-hw + w * 0.05, -hh + h * 0.2, w * 0.9, h * 0.6);
//           ctx.strokeRect(-hw + w * 0.05, -hh + h * 0.2, w * 0.9, h * 0.6);
//           ctx.beginPath();
//           ctx.moveTo(-hw + w * 0.05, -hh + h * 0.2);
//           ctx.lineTo(hw - w * 0.05, -hh + h * 0.2);
//           ctx.stroke();
//         } else if (item.icon === "armchair" || name.includes("chair")) {
//           ctx.fillRect(-hw + w * 0.15, -hh + h * 0.15, w * 0.7, h * 0.7);
//           ctx.strokeRect(-hw + w * 0.15, -hh + h * 0.15, w * 0.7, h * 0.7);
//         } else if (item.icon === "fridge" || name.includes("fridge")) {
//           ctx.strokeRect(-hw + w * 0.2, -hh + h * 0.05, w * 0.6, h * 0.9);
//           ctx.beginPath();
//           ctx.moveTo(-hw + w * 0.2, -hh + h * 0.3);
//           ctx.lineTo(hw - w * 0.2, -hh + h * 0.3);
//           ctx.stroke();
//         } else if (item.icon === "bath" || name.includes("bath")) {
//           ctx.beginPath();
//           (ctx as any).roundRect(-hw + w * 0.1, -hh + h * 0.1, w * 0.8, h * 0.8, w * 0.15);
//           ctx.stroke();
//         } else if (item.icon === "toilet") {
//           ctx.strokeRect(-hw + w * 0.2, -hh + h * 0.05, w * 0.6, h * 0.35);
//           ctx.beginPath();
//           ctx.ellipse(0, hh - h * 0.25, w * 0.22, h * 0.18, 0, 0, Math.PI * 2);
//           ctx.stroke();
//         } else if (item.icon === "monitor" || name.includes("tv")) {
//           ctx.strokeRect(-hw + w * 0.1, -hh + h * 0.15, w * 0.8, h * 0.55);
//           ctx.beginPath();
//           ctx.moveTo(0, hh - h * 0.15);
//           ctx.lineTo(0, hh - h * 0.02);
//           ctx.moveTo(-w * 0.12, hh - h * 0.02);
//           ctx.lineTo(w * 0.12, hh - h * 0.02);
//           ctx.stroke();
//         } else if (item.icon === "table" || name.includes("table") || name.includes("dining")) {
//           ctx.strokeRect(-hw + w * 0.1, -hh + h * 0.1, w * 0.8, h * 0.8);
//           ctx.beginPath();
//           ctx.moveTo(-hw + w * 0.15, -hh + h * 0.15);
//           ctx.lineTo(hw - w * 0.15, hh - h * 0.15);
//           ctx.moveTo(hw - w * 0.15, -hh + h * 0.15);
//           ctx.lineTo(-hw + w * 0.15, hh - h * 0.15);
//           ctx.stroke();
//         } else if (item.icon === "desk" || name.includes("desk")) {
//           ctx.strokeRect(-hw + w * 0.05, -hh + h * 0.2, w * 0.9, h * 0.6);
//         } else {
//           ctx.beginPath();
//           ctx.moveTo(-hw + w * 0.2, -hh + h * 0.2);
//           ctx.lineTo(hw - w * 0.2, hh - h * 0.2);
//           ctx.moveTo(hw - w * 0.2, -hh + h * 0.2);
//           ctx.lineTo(-hw + w * 0.2, hh - h * 0.2);
//           ctx.stroke();
//         }

//         // Label
//         if (w > 30) {
//           ctx.fillStyle = "#334155";
//           ctx.font = `bold ${Math.max(9, 11)}px Inter, sans-serif`;
//           ctx.textAlign = "center";
//           ctx.textBaseline = "top";
//           ctx.fillText(item.name, 0, hh + 4);
//         }
//         ctx.restore();
//       });

//       // North arrow
//       ctx.save();
//       ctx.translate(W - 100, 100);
//       ctx.beginPath();
//       ctx.moveTo(0, -35);
//       ctx.lineTo(12, 12);
//       ctx.lineTo(-12, 12);
//       ctx.closePath();
//       ctx.fillStyle = "#ef4444";
//       ctx.fill();
//       ctx.fillStyle = "#0f172a";
//       ctx.font = "bold 13px sans-serif";
//       ctx.textAlign = "center";
//       ctx.fillText("N", 0, 30);
//       ctx.restore();

//       // Title block
//       const tbW = 320;
//       const tbH = 90;
//       const tbX = W - tbW - 40;
//       const tbY = H - tbH - 40;
//       ctx.fillStyle = "#ffffff";
//       ctx.strokeStyle = "#cbd5e1";
//       ctx.lineWidth = 1.5;
//       ctx.fillRect(tbX, tbY, tbW, tbH);
//       ctx.strokeRect(tbX, tbY, tbW, tbH);
//       ctx.fillStyle = "#0f172a";
//       ctx.font = "bold 18px Inter, sans-serif";
//       ctx.textAlign = "left";
//       ctx.fillText("ARCHITECTURAL FLOOR PLAN", tbX + 16, tbY + 28);
//       ctx.fillStyle = "#64748b";
//       ctx.font = "12px Inter, sans-serif";
//       ctx.fillText(`Project: ${id}`, tbX + 16, tbY + 50);
//       ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, tbX + 16, tbY + 68);
//       ctx.fillText(`Scale: 1:100`, tbX + 180, tbY + 50);

//       setOutputImage(canvas.toDataURL("image/png"));
//     } catch (err) {
//       console.error(err);
//       alert("Failed to render exact plan. Make sure plan data exists.");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   /* ==========================================================
//      AI GENERATE (IMPROVED PROMPTS)
//      ========================================================== */
//   const handleAIGenerate = async () => {
//     const file = (window as any).__planFile as File | undefined;
//     if (!file && !previewUrl) {
//       alert("No plan image loaded.");
//       return;
//     }
//     setLoading(true);
//     setOutputImage("");

//     const formData = new FormData();
//     formData.append("file", file || await fetch(previewUrl).then((r) => r.blob()).then((b) => new File([b], "plan.png", { type: "image/png" })));
//     formData.append(
//       "prompt",
//       "2D architectural floor plan, top-down orthographic view, clean CAD blueprint, colored room fills, standard 2D furniture symbols, bed, sofa, kitchen, toilet, crisp black walls, pure white background, flat vector style, no 3D, no perspective, no shadows."
//     );
//     formData.append(
//       "negative_prompt",
//       "3D render, perspective, isometric, photorealistic, wood texture, brown floor, tiles, exterior, sky, people, shadows, depth, blurry, gray background, muddy colors, watermark, text, logo."
//     );
//     formData.append("steps", "25");

//     try {
//       const res = await fetch("https://unremovable-dully-connor.ngrok-free.dev/generate-render", {
//         method: "POST",
//         body: formData,
//       });
//       if (!res.ok) throw new Error("AI failed");
//       const blob = await res.blob();
//       setOutputImage(URL.createObjectURL(blob));
//     } catch (err) {
//       console.error(err);
//       alert("AI service error. Check Colab URL.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isCheckingSub) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-slate-50 text-xs text-slate-500">
//         Verifying PRO access...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 font-sans">
//       {/* Header */}
//       <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => navigate(`/projects/${id}/floor-plan`)}
//             className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
//           >
//             <ArrowLeft size={18} />
//           </button>
//           <div>
//             <h1 className="text-xl font-bold text-slate-900">Plan Studio</h1>
//             <p className="text-xs text-slate-500">Export your floor plan as a professional drawing</p>
//           </div>
//         </div>

//         {/* Mode Switcher */}
//         <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-xs">
//           <button
//             onClick={() => setMode("exact")}
//             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
//               mode === "exact"
//                 ? "bg-blue-600 text-white shadow-sm"
//                 : "text-slate-600 hover:bg-slate-50"
//             }`}
//           >
//             <PenTool size={14} />
//             Exact Blueprint
//           </button>
//           <button
//             onClick={() => setMode("ai")}
//             className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
//               mode === "ai"
//                 ? "bg-purple-600 text-white shadow-sm"
//                 : "text-slate-600 hover:bg-slate-50"
//             }`}
//           >
//             <Sparkles size={14} />
//             AI Style
//           </button>
//         </div>
//       </div>

//       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left: Source / Controls */}
//         <div className="lg:col-span-1 space-y-4">
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
//             <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
//               <Ruler size={14} />
//               Source Sketch
//             </h3>
//             {previewUrl ? (
//               <img
//                 src={previewUrl}
//                 alt="Source"
//                 className="w-full rounded-xl border border-slate-200 bg-white mb-4"
//               />
//             ) : (
//               <div className="h-40 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 mb-4">
//                 No sketch loaded
//               </div>
//             )}

//             {mode === "exact" ? (
//               <button
//                 onClick={renderExactPlan}
//                 disabled={loading}
//                 className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 ${
//                   loading ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {loading ? "Drawing Blueprint..." : "Generate Exact 2D Plan"}
//               </button>
//             ) : (
//               <button
//                 onClick={handleAIGenerate}
//                 disabled={loading}
//                 className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer flex items-center justify-center gap-2 ${
//                   loading ? "bg-slate-400" : "bg-purple-600 hover:bg-purple-700"
//                 }`}
//               >
//                 {loading ? "AI Processing..." : "Generate AI Style"}
//               </button>
//             )}

//             <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
//               {mode === "exact"
//                 ? "Renders your exact wall positions, furniture, doors, and room labels as a clean architectural drawing."
//                 : "Sends your sketch to the AI microservice. Results may vary — AI is not precise with CAD symbols."}
//             </p>
//           </div>
//         </div>

//         {/* Right: Output */}
//         <div className="lg:col-span-2">
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 h-full flex flex-col">
//             <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
//               Result
//             </h3>

//             {outputImage ? (
//               <div className="flex-1 flex flex-col items-center">
//                 <img
//                   src={outputImage}
//                   alt="Result"
//                   className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-200 bg-white"
//                 />
//                 <a
//                   href={outputImage}
//                   download={`floor-plan-${id}-${mode}.png`}
//                   className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
//                 >
//                   <Download size={14} />
//                   Download PNG
//                 </a>
//               </div>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[400px]">
//                 {loading
//                   ? mode === "exact"
//                     ? "Rendering crisp blueprint..."
//                     : "AI is dreaming..."
//                   : "Your plan will appear here"}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }