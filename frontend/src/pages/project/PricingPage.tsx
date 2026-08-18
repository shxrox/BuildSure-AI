

import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk hook
import { CheckCircle2, Zap, Calendar, Crown, Sparkles } from "lucide-react";

interface PricingPageProps {
  setActive?: (id: string) => void;
}

export default function PricingPage({ setActive }: PricingPageProps) {
  const { user } = useUser(); // Get current logged-in user from Clerk
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  // Sync active sidebar state when component loads
  React.useEffect(() => {
    if (setActive) {
      setActive("pricing");
    }
  }, [setActive]);

  const ALL_FEATURES = [
    "Precision 2D Drawing Canvas",
    "Smart Wall & Room Area Calculator",
    "IQSSL Standard Material Takeoffs",
    "Live Cost Estimation & BOQ",
    "Collaborative Team & Contractor Sharing",
    "Blueprint & Document File Management",
    "Milestone & Project Phase Tracking",
    "Customizable Unit Rate Settings",
    "Instant Stripe Checkout Integration",
    "Priority Support & Updates",
  ];

  const PLANS = [
    {
      name: "Trial Pass",
      price: "$5",
      interval: "per month",
      priceId: "price_1U3a5tCC11rBMF9oSwnUsL70",
      description: "Standard monthly entry pass.",
      icon: <Zap size={18} />,
      accent: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      name: "Extended Pro Plan",
      price: "$25",
      interval: "every 6 months",
      priceId: "price_1U3ayTCC11rBMF9om4bcFoZB",
      description: "Great value for intermediate timelines.",
      icon: <Calendar size={18} />,
      accent: "from-blue-400 to-blue-600",
      shadow: "shadow-blue-500/20",
    },
    {
      name: "Annual Plan",
      price: "$50",
      interval: "per year",
      priceId: "price_1U3z7MCC11rBMF9o7YRuVCQa",
      badge: "Best Value",
      description: "Full year-round uninterrupted access.",
      icon: <Crown size={18} />,
      accent: "from-emerald-400 to-emerald-600",
      shadow: "shadow-emerald-500/20",
    },
  ];

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      // Grab the primary email address from the logged-in Clerk user
      const customerEmail = user?.primaryEmailAddress?.emailAddress;

      if (!customerEmail) {
        alert("Please log in before subscribing.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          customerEmail, // Pass the logged-in user's email to the backend!
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to initialize checkout session.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to payment server.");
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans pb-12 selection:bg-blue-500/20">
      
      {/* Banner Card Header */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-8 shadow-xs text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-700">
          <Sparkles size={13} className="text-blue-600" /> Subscription Hub
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upgrade Your Workspace
        </h2>
        <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
          Select a subscription plan that fits your goals and build timeline.
        </p>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isPopular = plan.badge === "Best Value";
          return (
            <div
              key={plan.priceId}
              className={`relative group p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between ${
                isPopular 
                  ? "bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-400 shadow-xl shadow-emerald-200/40" 
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/20"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${plan.accent} text-white mb-4 shadow-lg ${plan.shadow}`}>
                  {plan.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-xs mb-6">{plan.description}</p>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-xs ml-1">/ {plan.interval}</span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Workspace Access Includes:</span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {ALL_FEATURES.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-xs text-slate-600">
                      <CheckCircle2 size={14} className={isPopular ? "text-emerald-500" : "text-slate-400"} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={loadingPriceId === plan.priceId}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isPopular
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPriceId === plan.priceId ? "Redirecting to Stripe..." : "Subscribe Now"}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}