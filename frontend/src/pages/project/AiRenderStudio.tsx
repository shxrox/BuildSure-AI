
import React, { useState, useEffect, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AiRenderStudio(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [outputImage, setOutputImage] = useState<string>("");
  
  // Subscription verification state
  const [isCheckingSub, setIsCheckingSub] = useState<boolean>(true);

  // ============================================================
  // CHECK USER SUBSCRIPTION ON LOAD
  // ============================================================
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/me", {
          credentials: "include", // Ensures Clerk / session cookies are sent
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const userData = await response.json();
        
        const isPro = userData.subscription === "PRO";
        const hasNotExpired = userData.subscriptionExpiresAt && new Date(userData.subscriptionExpiresAt) > new Date();

        if (!isPro || !hasNotExpired) {
          alert("This studio requires an active PRO subscription.");
          navigate("/pricing"); // Redirect free users to pricing
        }
      } catch (err) {
        console.error("Subscription validation error:", err);
        navigate("/pricing");
      } finally {
        setIsCheckingSub(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  // ============================================================
  // STRICT 2D TECHNICAL CAD PROMPT (No wood/brown textures)
  // ============================================================
  const ARCHITECTURAL_PROMPT = `
    Clean 2D architectural blueprint floor plan, top-down orthographic view, 
    crisp black architectural lines, technical CAD drawing style, 
    pure solid white background, flat white interior floor spaces, 
    minimalist vector blueprint, professional real estate CAD presentation, 
    sharp black walls, zero wood texture, zero brown coloring.
  `;

  // ============================================================
  // STRICT NEGATIVE PROMPT (Blocks wood and 3D perspectives)
  // ============================================================
  const NEGATIVE_PROMPT = `
    wooden floor, wood texture, brown background, wood flooring, 
    photorealistic interior, 3D render, photo, realistic wood, tiles, 
    3D exterior house, exterior building, building elevation, front elevation, 
    side elevation, street view, house photograph, landscape, garden, road, cars, 
    people, sky, clouds, perspective view, angled view, isometric view, 
    blurry, low resolution, noisy, watermarks, text, logo
  `;

  // ============================================================
  // AUTO-LOAD CANVAS IMAGE FROM FLOOR PLAN PAGE
  // ============================================================
  useEffect(() => {
    const state = location.state as {
      initialImage?: string;
    };

    if (state?.initialImage) {
      setPreviewUrl(state.initialImage);

      fetch(state.initialImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File(
            [blob],
            "floor-plan-sketch.png",
            { type: "image/png" }
          );
          setSelectedImage(file);
        })
        .catch((err) => {
          console.error("Failed to load initial floor plan:", err);
        });
    }
  }, [location.state]);

  // ============================================================
  // FILE UPLOAD
  // ============================================================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOutputImage("");
    }
  };

  // ============================================================
  // GENERATE MODERN FLOOR PLAN
  // ============================================================
  const handleGenerate = async (): Promise<void> => {
    if (!selectedImage) {
      alert("Please draw on your floor plan first or select an image!");
      return;
    }

    setLoading(true);
    setOutputImage("");

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("prompt", ARCHITECTURAL_PROMPT);
    formData.append("negative_prompt", NEGATIVE_PROMPT);
    formData.append("steps", "25");

    try {
      const response = await fetch(
        "https://unremovable-dully-connor.ngrok-free.dev/generate-render",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate AI render from backend.");
      }

      const blob = await response.blob();
      setOutputImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert(
        "Error connecting to the AI microservice. Ensure your Google Colab backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show a loading screen while validating the subscription
  if (isCheckingSub) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs text-slate-500">
        Verifying Pro Subscription access...
      </div>
    );
  }

  // ============================================================
  // UI (TAILWIND CSS)
  // ============================================================
  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        AI Style Injection Studio
      </h2>
      <p className="text-slate-500 text-xs mb-8">
        Your drawn floor plan has been loaded. Convert your line blueprint into a clean, modern 2D technical architectural floor plan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INPUT PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            1. Captured Floor Plan
          </h3>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"
          />

          {previewUrl && (
            <div className="mb-4">
              <p className="text-xs font-medium text-slate-600 mb-1">Source Preview:</p>
              <img
                src={previewUrl}
                alt="2D Preview"
                className="w-full max-h-64 object-contain border border-slate-200 rounded-xl bg-white p-2"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer ${
              loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing Clean CAD Plan (Cloud GPU)..." : "Generate Clean 2D Blueprint"}
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              2. Resulting Architectural Plan
            </h3>

            {outputImage ? (
              <div className="mt-4 text-center">
                <img
                  src={outputImage}
                  alt="Modern Architectural Floor Plan"
                  className="w-full max-h-80 object-contain border border-slate-200 rounded-xl bg-white p-2 mx-auto"
                />
                <a
                  href={outputImage}
                  download="clean-floor-plan.jpg"
                  className="inline-block mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Download Floor Plan Image
                </a>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50 mt-2">
                {loading ? "Rendering crisp vector lines..." : "Your generated plan will appear here"}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}