

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById } from "../../services/project.service";
import { Share2, ArrowLeft, Copy, CheckCircle2, ShieldCheck, Sparkles, Link2, X } from "lucide-react";

interface SharingPageProps {
  setActive?: (id: string) => void;
}

export default function SharingPage({ setActive }: SharingPageProps): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckingSub, setIsCheckingSub] = useState<boolean>(true); // Subscription checking state
  const [projectName, setProjectName] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Modal State for Subscription Upgrade Notice
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);

  // Sync active sidebar state when component loads
  useEffect(() => {
    if (setActive) {
      setActive("sharing");
    }
  }, [setActive]);

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
          setShowSubscriptionModal(true);
        }
      } catch (err) {
        console.error("Subscription validation error:", err);
        setShowSubscriptionModal(true);
      } finally {
        setIsCheckingSub(false);
      }
    };

    checkSubscription();
  }, []);

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

    if (!isCheckingSub && !showSubscriptionModal) {
      fetchProjectDetails();
    }
  }, [id, isCheckingSub, showSubscriptionModal]);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Show a loading screen while validating subscription and project details
  if (isCheckingSub || (loading && !showSubscriptionModal)) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Sparkles size={16} />
          </div>
          <span>{isCheckingSub ? "Verifying Pro Subscription access..." : "Loading shareable link configuration..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 selection:bg-blue-500/20 relative">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${id}/settings`)}
          className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Settings
        </button>
      </div>

      {/* Banner Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-4 py-1.5 text-xs font-semibold text-purple-700">
            <Share2 size={13} className="text-purple-600" /> PRO Collaboration
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Share Project Workspace
          </h2>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            Generate and copy a public link to share <span className="font-semibold text-slate-800">"{projectName}"</span> with clients, stakeholders, or team members.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-600 shrink-0">
          <ShieldCheck size={16} /> PRO Feature
        </div>
      </div>

      {/* Main Link Box */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Link2 size={15} className="text-blue-600" /> Public Shareable Link
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed max-w-2xl">
          Anyone with this link can view the project overview, Bill of Quantities (BOQ), and Sri Lankan cost breakdown schedule instantly without needing an account. A login option is available on the shared view for users who want to sign up.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            readOnly
            value={publicShareUrl}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 select-all focus:outline-none"
          />
          <button
            onClick={handleCopyShareLink}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <Copy size={14} /> {copied ? "Copied to Clipboard!" : "Copy Link"}
          </button>
        </div>
        {copied && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl mt-3">
            <CheckCircle2 size={14} /> Link successfully copied! Ready to share.
          </div>
        )}
      </div>

      {/* Info Callout Box */}
      <div className="bg-blue-50/60 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold">
          💡
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">How Public Sharing Works</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            The link grants direct read-only access to the project's summary, BOQ metrics, and cost estimations. No authentication or prior registration is required for viewers to inspect the data.
          </p>
        </div>
      </div>

      {/* ====================================================
          SUBSCRIPTION REQUIRED MODAL POPUP
      ==================================================== */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative flex flex-col items-center text-center">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSubscriptionModal(false);
                navigate(`/projects/${id}/settings`);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>

            {/* Icon Header */}
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 border border-amber-100 shadow-inner">
              <Sparkles size={28} />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              PRO Subscription Required
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Project workspace sharing requires an active <span className="font-semibold text-slate-700">PRO subscription</span> to unlock external collaboration features.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  navigate(`/projects/${id}/settings`);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all"
              >
                Go Back
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