import React, { useState, useEffect, type ChangeEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Sparkles, ArrowLeft, Upload, RefreshCw, Download, Image as ImageIcon, ShieldCheck } from "lucide-react";

export default function AiRenderStudio(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Verifying PRO access...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-6 md:p-10 selection:bg-blue-500/20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Header / Back Button */}
        <div>
          <button
            onClick={() => navigate(id ? `/projects/${id}/floor-plan` : -1 as any)}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Floor Plan
          </button>
        </div>

        {/* Studio Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-700">
              <Sparkles size={13} className="text-purple-600" /> PRO Studio Suite
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Floor Plan Studio
            </h2>
            <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
              Convert your sketch or active CAD drawing into a clean, professional 2D architectural blueprint instantly with neural processing.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600">
            <ShieldCheck size={16} /> PRO Enabled
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* INPUT CARD */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Upload size={15} className="text-blue-600" /> 1. Source Plan Input
                </h3>
                <span className="text-[10px] font-medium text-slate-400">Auto-synced from canvas</span>
              </div>

              <div className="mb-6">
                <label className="block w-full border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                      <ImageIcon size={18} />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">Click to upload alternative file</span>
                    <span className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Source Preview:</p>
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 flex items-center justify-center max-h-64 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Source Plan"
                      className="max-h-56 object-contain rounded-xl bg-white shadow-2xs p-2"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 px-5 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                loading 
                  ? "bg-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-purple-600 hover:bg-purple-500 shadow-purple-600/25 hover:shadow-purple-600/40 hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Generating 2D Blueprint...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Generate Clean 2D Plan
                </>
              )}
            </button>
          </div>

          {/* OUTPUT CARD */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={15} className="text-purple-600" /> 2. AI Render Result
              </h3>

              {outputImage ? (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 flex items-center justify-center max-h-72 overflow-hidden">
                    <img
                      src={outputImage}
                      alt="AI Floor Plan Result"
                      className="max-h-64 object-contain rounded-xl bg-white shadow-2xs p-2 mx-auto"
                    />
                  </div>
                  <div className="text-center">
                    <a
                      href={outputImage}
                      download="floor-plan-2d.jpg"
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-200 px-5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <Download size={14} /> Download Rendered Image
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-72 items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="font-semibold text-slate-600">Drawing crisp structural lines...</p>
                    </div>
                  ) : (
                    <p className="font-medium">Your generated architectural blueprint result will appear here</p>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-6">
              AI processing engine powered by stable diffusion weights and vector line extraction.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}