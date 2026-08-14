// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useUser } from "@clerk/clerk-react";
// import { ShieldAlert, ArrowRight, CheckCircle2, Hammer, Layers, DollarSign } from "lucide-react";

// export default function Home() {
//   const { isSignedIn, user } = useUser();
//   const navigate = useNavigate();
//   const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

//   const PLANS = [
//     {
//       name: "Trial Pass",
//       price: "$5",
//       interval: "per month",
//       priceId: "price_1U3a5tCC11rBMF9oSwnUsL70",
//       description: "Standard monthly entry pass.",
//     },
//     {
//       name: "Extended Pro Plan",
//       price: "$25",
//       interval: "every 6 months",
//       priceId: "price_1U3ayTCC11rBMF9om4bcFoZB",
//       description: "Great value for intermediate timelines.",
//     },
//     {
//       name: "Annual Plan",
//       price: "$50",
//       interval: "per year",
//       priceId: "price_1U3z7MCC11rBMF9o7YRuVCQa",
//       badge: "Best Value",
//       description: "Full year-round uninterrupted access.",
//     },
//   ];

//   const handleSubscribe = async (priceId: string) => {
//     setLoadingPriceId(priceId);
//     try {
//       const customerEmail = user?.primaryEmailAddress?.emailAddress;

//       if (!customerEmail) {
//         navigate("/login");
//         return;
//       }

//       const response = await fetch("http://localhost:5000/api/create-checkout-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           priceId, 
//           customerEmail 
//         }),
//       });

//       const data = await response.json();
//       if (data.url) {
//         window.location.href = data.url; 
//       } else {
//         alert("Failed to initialize checkout session.");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error connecting to payment server.");
//     } finally {
//       setLoadingPriceId(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
//       {/* Top Navigation Bar */}
//       <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 shadow-xs">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
//               <ShieldAlert size={18} />
//             </div>
//             <div>
//               <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">BuildSure-AI</h1>
//               <p className="text-[10px] text-slate-400 font-medium">Fix Your Budget Before You Build</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             {isSignedIn ? (
//               <button
//                 onClick={() => navigate("/homeowner")}
//                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
//               >
//                 Go to Dashboard &rarr;
//               </button>
//             ) : (
//               <>
//                 <button
//                   onClick={() => navigate("/login")}
//                   className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
//                 >
//                   Sign In
//                 </button>
//                 <button
//                   onClick={() => navigate("/register")}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
//                 >
//                   Register Free
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="py-20 px-6 text-center max-w-4xl mx-auto">
//         <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-200">
//           Digital Architect & Live Quantity Surveyor
//         </span>
//         <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight mb-4">
//           Stop Budget Creep. <br />
//           <span className="text-blue-600">Build Your Dream Home With Confidence.</span>
//         </h1>
//         <p className="text-slate-500 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
//           BuildSure-AI acts as your digital site supervisor. Draw your floor plans, calculate exact material volumetric needs (bricks, sand, cement), and track local Sri Lankan market expenses effortlessly.
//         </p>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={() => navigate(isSignedIn ? "/homeowner" : "/login")}
//             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
//           >
//             Get Started Now <ArrowRight size={14} />
//           </button>
//           <a
//             href="#pricing"
//             className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
//           >
//             View Pricing Plans
//           </a>
//         </div>
//       </section>

//       {/* Core Features Preview */}
//       <section className="py-12 px-6 max-w-6xl mx-auto border-t border-slate-200">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
//             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
//               <Layers size={20} />
//             </div>
//             <h3 className="text-sm font-bold text-slate-900 mb-1">Precision 2D Drawing Canvas</h3>
//             <p className="text-slate-500 text-xs leading-relaxed">
//               Design architectural floor layouts with intelligent wall snapping and automatic window/door cutout deductions.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
//             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
//               <DollarSign size={20} />
//             </div>
//             <h3 className="text-sm font-bold text-slate-900 mb-1">Dynamic Material Takeoffs</h3>
//             <p className="text-slate-500 text-xs leading-relaxed">
//               Input local hardware store pricing rates to generate accurate bills of quantities (BoQ) customized to current market shifts.
//             </p>
//           </div>

//           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
//             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
//               <Hammer size={20} />
//             </div>
//             <h3 className="text-sm font-bold text-slate-900 mb-1">Step-by-Step Build Guide</h3>
//             <p className="text-slate-500 text-xs leading-relaxed">
//               Milestone checklists and milestone warnings prevent costly structural errors like forgotten utility conduits or AC channels.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Pricing & Subscription Section */}
//       <section id="pricing" className="py-16 px-6 max-w-6xl mx-auto">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-bold text-slate-900 mb-2">Upgrade Your Workspace</h2>
//           <p className="text-slate-500 text-xs">Select a subscription plan that fits your project timeline.</p>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {PLANS.map((plan) => (
//             <div
//               key={plan.priceId}
//               className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between relative"
//             >
//               {plan.badge && (
//                 <span className="absolute -top-3 right-6 bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
//                   {plan.badge}
//                 </span>
//               )}

//               <div>
//                 <h3 className="text-base font-bold text-slate-900 mb-1">{plan.name}</h3>
//                 <p className="text-slate-500 text-xs mb-6">{plan.description}</p>

//                 <div className="flex items-baseline mb-6">
//                   <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
//                   <span className="text-slate-400 text-xs ml-1">/ {plan.interval}</span>
//                 </div>
//               </div>

//               <button
//                 onClick={() => handleSubscribe(plan.priceId)}
//                 disabled={loadingPriceId === plan.priceId}
//                 className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer disabled:bg-slate-300"
//               >
//                 {loadingPriceId === plan.priceId ? "Redirecting to Stripe..." : "Subscribe Now"}
//               </button>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-xs">
//         <p>&copy; {new Date().getFullYear()} BuildSure-AI. All rights reserved. Software Engineering Dissertation Project.</p>
//       </footer>
//     </div>
//   );
// }

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ShieldAlert, ArrowRight, Hammer, Layers, DollarSign } from "lucide-react";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
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

  // Helper function to handle role-based navigation for logged-in users using Clerk's publicMetadata
  const handleDashboardRedirect = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const role = 
      (user as any)?.role || 
      (user?.publicMetadata as any)?.role;

    if (role === "admin" || role === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/homeowner", { replace: true });
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
      const customerEmail = user?.primaryEmailAddress?.emailAddress;

      if (!customerEmail) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          priceId, 
          customerEmail 
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-wide uppercase">BuildSure-AI</h1>
              <p className="text-[10px] text-slate-400 font-medium">Fix Your Budget Before You Build</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
              >
                Go to Dashboard &rarr;
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  Register Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block border border-blue-200">
          Digital Architect & Live Quantity Surveyor
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight mb-4">
          Stop Budget Creep. <br />
          <span className="text-blue-600">Build Your Dream Home With Confidence.</span>
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
          BuildSure-AI acts as your digital site supervisor. Draw your floor plans, calculate exact material volumetric needs (bricks, sand, cement), and track local Sri Lankan market expenses effortlessly.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => (isSignedIn ? handleDashboardRedirect() : navigate("/login"))}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            Get Started Now <ArrowRight size={14} />
          </button>
          <a
            href="#pricing"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            View Pricing Plans
          </a>
        </div>
      </section>

      {/* Core Features Preview */}
      <section className="py-12 px-6 max-w-6xl mx-auto border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Layers size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Precision 2D Drawing Canvas</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Design architectural floor layouts with intelligent wall snapping and automatic window/door cutout deductions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <DollarSign size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Dynamic Material Takeoffs</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Input local hardware store pricing rates to generate accurate bills of quantities (BoQ) customized to current market shifts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Hammer size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Step-by-Step Build Guide</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Milestone checklists and milestone warnings prevent costly structural errors like forgotten utility conduits or AC channels.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & Subscription Section */}
      <section id="pricing" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Upgrade Your Workspace</h2>
          <p className="text-slate-500 text-xs">Select a subscription plan that fits your project timeline.</p>
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
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} BuildSure-AI. All rights reserved. Software Engineering Dissertation Project.</p>
      </footer>
    </div>
  );
}