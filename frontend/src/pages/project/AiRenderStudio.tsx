import React, { useState, useEffect, type ChangeEvent } from "react";
import { useLocation } from "react-router-dom";

export default function AiRenderStudio(): React.JSX.Element {
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(
    "modern architectural luxury house, photorealistic, 8k resolution, highly detailed exterior view"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [outputImage, setOutputImage] = useState<string>("");

  // Auto-load canvas image if passed from FloorPlanPage
  useEffect(() => {
    const state = location.state as { initialImage?: string };
    if (state?.initialImage) {
      setPreviewUrl(state.initialImage);

      // Convert dataURL to File object for FormData upload
      fetch(state.initialImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "floor-plan-sketch.png", { type: "image/png" });
          setSelectedImage(file);
        });
    }
  }, [location.state]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async (): Promise<void> => {
    if (!selectedImage) {
      alert("Please draw on your floor plan first or select an image!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("prompt", prompt);
    formData.append("steps", "20");

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-render", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI render from backend.");
      }

      const blob = await response.blob();
      setOutputImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Error connecting to the AI microservice. Ensure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>AI Style Injection Studio</h2>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Your drawn floor plan has been loaded. Select a style prompt and convert it to a 3D architectural render.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Input Panel */}
        <div style={{ background: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h3>1. Captured Floor Plan</h3>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ margin: "12px 0" }} />
          
          {previewUrl && (
            <div style={{ margin: "12px 0" }}>
              <p>Source Preview:</p>
              <img src={previewUrl} alt="2D Preview" style={{ width: "100%", maxHeight: "250px", objectFit: "contain", border: "1px solid #cbd5e1", background: "#fff" }} />
            </div>
          )}

          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>Style Prompt:</label>
            <textarea
              value={prompt}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: "16px",
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              width: "100%"
            }}
          >
            {loading ? "Generating 3D Render (Local GPU/CPU)..." : "Generate 3D Render"}
          </button>
        </div>

        {/* Output Panel */}
        <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h3>2. Resulting 3D Architectural Render</h3>
          {outputImage ? (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <img src={outputImage} alt="3D Render Output" style={{ width: "100%", maxHeight: "350px", objectFit: "contain", border: "1px solid #cbd5e1" }} />
              <a
                href={outputImage}
                download="architectural-render.png"
                style={{ display: "inline-block", marginTop: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}
              >
                Download Render Image
              </a>
            </div>
          ) : (
            <div style={{ display: "flex", height: "300px", alignItems: "center", justifyContent: "center", color: "#94a3b8", border: "2px dashed #cbd5e1", marginTop: "16px", borderRadius: "6px" }}>
              {loading ? "Processing inference pipeline..." : "Your generated 3D render will appear here"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}