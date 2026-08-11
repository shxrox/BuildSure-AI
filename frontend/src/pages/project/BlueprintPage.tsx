import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, uploadBlueprint, deleteBlueprint } from "../../services/project.service";

function BlueprintPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [project, setProject] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>("");
  const [fileTextContent, setFileTextContent] = useState<string>("");

  const processBlueprintData = (projData: any) => {
    const blueprint = projData?.blueprint;
    if (!blueprint) {
      setFilePreviewUrl("");
      setFileTextContent("");
      return;
    }

    // If fileData is stored as a Node.js Buffer from backend
    if (blueprint.fileData?.type === "Buffer" && Array.isArray(blueprint.fileData.data)) {
      const uint8Array = new Uint8Array(blueprint.fileData.data);
      const blob = new Blob([uint8Array], { type: blueprint.fileType || "application/octet-stream" });
      const objectUrl = URL.createObjectURL(blob);

      if (blueprint.fileName.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i)) {
        setFilePreviewUrl(objectUrl);
      } else {
        setFilePreviewUrl("");
        const decodedString = new TextDecoder("utf-8").decode(uint8Array);
        try {
          const parsed = JSON.parse(decodedString);
          setFileTextContent(JSON.stringify(parsed, null, 2));
        } catch {
          setFileTextContent(decodedString);
        }
      }
    } else if (blueprint.fileUrl) {
      setFilePreviewUrl(blueprint.fileUrl);
    }
  };

  const fetchBlueprintData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const projData = await getProjectById(id);
      setProject(projData);
      processBlueprintData(projData);
    } catch (error) {
      console.error("Failed to load blueprint file info", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlueprintData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Instant local preview for selection
      const localUrl = URL.createObjectURL(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setFilePreviewUrl(localUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileTextContent(event.target?.result as string);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !file) return;

    try {
      setUploading(true);
      const updatedProj = await uploadBlueprint(id, file);
      setProject(updatedProj);
      processBlueprintData(updatedProj);
      await fetchBlueprintData();
      setFile(null);
      setMessage("File uploaded successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to upload file", error);
      setMessage("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      setDeleting(true);
      await deleteBlueprint(id);
      setProject((prev: any) => ({ ...prev, blueprint: null }));
      setFilePreviewUrl("");
      setFileTextContent("");
      setMessage("File deleted successfully.");
      setTimeout(() => setMessage(""), 3000);
      await fetchBlueprintData();
    } catch (error) {
      console.error("Failed to delete file", error);
      setMessage("Failed to delete file.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading file manager...
      </div>
    );
  }

  const blueprint = project?.blueprint;
  const fileName = blueprint?.fileName || "";
  const isImage = fileName.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i);
  const isPdf = fileName.match(/\.pdf$/i);
  const isTextOrData = fileName.match(/\.(csv|txt|json)$/i);

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🖼 Architectural Blueprint & Data Files</h2>
          <p className="text-gray-600 text-sm mt-1">
            Upload and view architectural images, PDFs, JSON plans, or CSV quantity data files.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Open Floor Plan CAD ➔
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Plan / Image / PDF / CSV File</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,image/*,.json,.csv,.txt,.dxf,.svg"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 whitespace-nowrap transition-colors"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
          {message && <p className="text-xs font-semibold text-emerald-600">{message}</p>}
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Current Uploaded File</h3>
          {blueprint && blueprint.fileName && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete File"}
            </button>
          )}
        </div>

        {blueprint && blueprint.fileName ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-gray-900">{blueprint.fileName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Uploaded on: {new Date(blueprint.uploadedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <a
                href={filePreviewUrl || `#`}
                download={blueprint.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Download File
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-center bg-gray-100 p-4 min-h-[400px] items-center">
              {/* 1. Image Preview */}
              {filePreviewUrl && isImage ? (
                <img src={filePreviewUrl} alt="Blueprint Preview" className="max-h-[450px] object-contain rounded shadow-sm" />
              ) : /* 2. PDF Viewer */
              isPdf ? (
                <iframe
                  src={filePreviewUrl}
                  title="PDF Blueprint Viewer"
                  className="w-full h-[500px] rounded border border-gray-300 bg-white"
                />
              ) : /* 3. JSON / CSV Text Preview */
              isTextOrData ? (
                <div className="w-full text-left">
                  <p className="text-xs font-bold text-gray-700 mb-2">File Data Contents Preview:</p>
                  <pre className="bg-gray-900 text-emerald-400 p-4 rounded-lg text-xs max-h-[400px] overflow-auto whitespace-pre-wrap">
                    {fileTextContent || "Loading content..."}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-gray-600 py-12">
                  <p className="font-semibold">Document Preview Available via Download</p>
                  <p className="text-xs text-gray-500 mt-1">
                    File '{blueprint.fileName}' is attached. Click 'Download File' above to open it.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-8 text-center border-t border-gray-100">
            No blueprint file uploaded yet. Use the upload form above to attach your project documents.
          </p>
        )}
      </div>
    </div>
  );
}

export default BlueprintPage;