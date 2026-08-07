import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, uploadBlueprint } from "../../services/project.service";

function BlueprintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlueprintData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);
      } catch (error) {
        console.error("Failed to load blueprint file info", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprintData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !file) return;

    try {
      setUploading(true);
      const updatedProj = await uploadBlueprint(id, file);
      setProject(updatedProj);
      setFile(null);
      setMessage("Blueprint file uploaded successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to upload blueprint file", error);
      setMessage("Failed to upload blueprint.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        Loading blueprint file manager...
      </div>
    );
  }

  const blueprint = project?.blueprint;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🖼 Architectural Blueprint File</h2>
          <p className="text-gray-600">
            Upload and view original PDF or image architectural blueprints for reference alongside your 2D floor plan.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Open Floor Plan CAD ➔
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Blueprint File</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf,image/*"
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
          {message && <p className="text-xs font-semibold text-green-600">{message}</p>}
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Uploaded Blueprint</h3>
        {blueprint && blueprint.fileUrl ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center text-sm">
              <div>
                <p className="font-semibold text-gray-900">{blueprint.fileName || "Architectural_Blueprint.pdf"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Uploaded on: {new Date(blueprint.uploadedAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <a
                href={blueprint.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
              >
                Download / View File
              </a>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden flex justify-center bg-gray-100 p-4 min-h-[300px] items-center">
              {blueprint.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                <img src={blueprint.fileUrl} alt="Blueprint Preview" className="max-h-[400px] object-contain rounded" />
              ) : (
                <div className="text-center text-gray-600">
                  <p className="font-semibold">Document Preview (PDF)</p>
                  <p className="text-xs text-gray-500 mt-1">Click the button above to view or download the full blueprint document.</p>
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