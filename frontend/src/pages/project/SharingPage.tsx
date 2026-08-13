

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../../services/project.service";

function SharingPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckingSub, setIsCheckingSub] = useState<boolean>(true); // Subscription checking state
  const [projectName, setProjectName] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Clean shareable link pointing directly to the public shared workspace view
  const publicShareUrl = `${window.origin}/projects/${id}/shared-workspace`;

  // ============================================================
  // CHECK USER SUBSCRIPTION ON LOAD
  // ============================================================
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/me", {
          credentials: "include", // Passes Clerk session cookies
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile.");
        }

        const jsonResponse = await response.json();
        
        // Safely support both root-level and nested .data responses from successResponse utility
        const userData = jsonResponse.data || jsonResponse;
        
        const isPro = userData.subscription === "PRO";
        const hasNotExpired = userData.subscriptionExpiresAt && new Date(userData.subscriptionExpiresAt) > new Date();

        if (!isPro || !hasNotExpired) {
          alert("Project workspace sharing requires an active PRO subscription.");
          navigate("/pricing"); // Redirect free users to pricing page
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

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const projData = await getProjectById(id);
        
        // Safely extract project name handling direct objects or nested data wrappers
        const project = (projData as any)?.data || projData;
        if (project) {
          setProjectName(project.projectName || "Construction Project");
        }
      } catch (error) {
        console.error("Failed to load project details for sharing", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isCheckingSub) {
      fetchProjectDetails();
    }
  }, [id, isCheckingSub]);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Show a loading screen while validating subscription and project details
  if (isCheckingSub || loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium text-xs">
        {isCheckingSub ? "Verifying Pro Subscription access..." : "Loading shareable link configuration..."}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔗 Share Project Workspace</h2>
          <p className="text-gray-600 text-sm mt-1">
            Generate and copy a public link to share <span className="font-semibold text-gray-800">"{projectName}"</span> with clients, stakeholders, or team members.
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${id}/settings`)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          &larr; Back to Settings
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 mb-6">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Public Shareable Link</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Anyone with this link can view the project overview, Bill of Quantities (BOQ), and Sri Lankan cost breakdown schedule instantly without needing an account. A login option is available on the shared view for users who want to sign up.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={publicShareUrl}
            className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-600 select-all focus:outline-none"
          />
          <button
            onClick={handleCopyShareLink}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors whitespace-nowrap shadow-xs"
          >
            {copied ? "Copied to Clipboard!" : "Copy Link"}
          </button>
        </div>
        {copied && <p className="text-xs text-emerald-600 font-semibold mt-2.5">Link successfully copied! Ready to share.</p>}
      </div>

      <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <div className="text-blue-600 font-bold text-base mt-0.5">💡</div>
        <div>
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">How Public Sharing Works</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            The link grants direct read-only access to the project's summary, BOQ metrics, and cost estimations. No authentication or prior registration is required for viewers to inspect the data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SharingPage;