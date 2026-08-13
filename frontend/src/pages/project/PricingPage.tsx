import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react"; // Import Clerk hook

export default function PricingPage() {
  const { user } = useUser(); // Get current logged-in user from Clerk
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const PLANS = [
    {
      name: "Trial Pass",
      price: "$5",
      interval: "per month",
      priceId: "price_1U3a5tCC11rBMF9oSwnUsL70",
      description: "Standard monthly entry pass.",
    },
    {
      name: "Extended Pro Plan",
      price: "$25",
      interval: "every 6 months",
      priceId: "price_1U3ayTCC11rBMF9om4bcFoZB",
      description: "Great value for intermediate timelines.",
    },
    {
      name: "Annual Plan",
      price: "$50",
      interval: "per year",
      priceId: "price_1U3z7MCC11rBMF9o7YRuVCQa",
      badge: "Best Value",
      description: "Full year-round uninterrupted access.",
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
          customerEmail // Pass the logged-in user's email to the backend!
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
    <div className="py-12 px-6 max-w-6xl mx-auto font-sans">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upgrade Your Workspace</h2>
        <p className="text-slate-500 text-xs">Select a subscription plan that fits your goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.priceId}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative"
          >
            {plan.badge && (
              <span className="absolute -top-3 right-6 bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {plan.badge}
              </span>
            )}

            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-xs mb-6">{plan.description}</p>

              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-400 text-xs ml-1">/ {plan.interval}</span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe(plan.priceId)}
              disabled={loadingPriceId === plan.priceId}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:bg-slate-300"
            >
              {loadingPriceId === plan.priceId ? "Redirecting to Stripe..." : "Subscribe Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}