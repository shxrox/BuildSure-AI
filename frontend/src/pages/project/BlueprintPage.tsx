import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, uploadBlueprint } from "../../services/project.service";

function BlueprintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlueprintInfo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        setProject(projData);
      } catch (error) {
        console.error("Failed to load blueprint details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlueprintInfo();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedFile) return;

    try {
      setUploading(true);
      const updatedProj = await uploadBlueprint(id, selectedFile);
      setProject(updatedProj);
      setSelectedFile(null);
      setMessage("Blueprint PDF/Image uploaded successfully.");
      setTimeout(() => setMessage(""), 4000);
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
        Loading blueprint document portal...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🖼 Architectural Blueprint Upload</h2>
          <p className="text-gray-600">
            Upload official architectural CAD drawings, PDF floor plans, or structural sketches for reference.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/floor-plan`)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Open 2D Floor Plan ➔
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Document</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="blueprint-file-input"
            />
            <label htmlFor="blueprint-file-input" className="cursor-pointer flex flex-col items-center">
              <span className="text-3xl mb-2">📄</span>
              <span className="text-sm font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : "Click to select architectural file (PDF, PNG, JPG)"}
              </span>
              <span className="text-xs text-gray-400 mt-1">Maximum file size: 25MB</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading Document..." : "Upload Blueprint"}
            </button>
          </div>
          {message && <p className="text-xs font-semibold text-green-600">{message}</p>}
        </form>
      </div>

      {project?.blueprint && project.blueprint.fileUrl ? (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Blueprint Reference</h3>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-900">{project.blueprint.fileName || "Architectural_Plan"}</p>
              <p className="text-xs text-gray-500 mt-0.5">Uploaded on {new Date(project.blueprint.uploadedAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <a
              href={project.blueprint.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Document ↗
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200 p-8 text-center text-gray-500 text-sm">
          No architectural blueprint document uploaded for this project yet.
        </div>
      )}
    </div>
  );
}

export default BlueprintPage;