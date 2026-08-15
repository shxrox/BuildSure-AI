import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ArrowRight, Hammer, Layers, DollarSign, CheckCircle2, Users, TrendingDown, Clock, Sparkles, Menu, X, Zap, Calendar, Crown, ShieldCheck, FileSpreadsheet, Calculator, MapPin, Building2, Check, ArrowUpRight } from "lucide-react";
import logo from "../assets/LOGO.png";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      interval: "per day",
      priceId: "price_1U3a5tCC11rBMF9oSwnUsL70",
      description: "Quick 24-hour full platform access for instant blueprint estimates.",
      icon: <Zap size={18} />,
      accent: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
    },
    {
      name: "Extended Pro Plan",
      price: "$25",
      interval: "every 6 months",
      priceId: "price_1U3ayTCC11rBMF9om4bcFoZB",
      description: "Ideal timeline coverage for mid-scale home builds and renovations.",
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
      description: "Complete year-round uninterrupted access for contractors and major projects.",
      icon: <Crown size={18} />,
      accent: "from-emerald-400 to-emerald-600",
      shadow: "shadow-emerald-500/20",
    },
  ];

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden selection:bg-blue-500/20">
      
      {/* ===== FLOATING NAVIGATION ===== */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="backdrop-blur-xl bg-white/70 border border-slate-200/60 rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl shadow-slate-300/20">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">BuildSure-AI</h1>
              <p className="text-[10px] text-slate-500 font-medium">Fix Your Budget Before You Build</p>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Features", id: "features" },
              { label: "Workflow", id: "workflow" },
              { label: "About", id: "about" },
              { label: "Pricing", id: "pricing" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100/80 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {isSignedIn ? (
              <button
                onClick={handleDashboardRedirect}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-slate-600 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 backdrop-blur-xl bg-white/95 border border-slate-200/60 rounded-2xl p-4 space-y-2 shadow-2xl">
            {[
              { label: "Features", id: "features" },
              { label: "Workflow", id: "workflow" },
              { label: "About", id: "about" },
              { label: "Pricing", id: "pricing" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
              {isSignedIn ? (
                <button
                  onClick={handleDashboardRedirect}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    className="w-full py-3 text-slate-600 text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold"
                  >
                    Register Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION WITH 3D TERRAFORM HOUSE ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-slate-50">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-blue-400/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-400/6 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] left-[-5%] w-[400px] h-[400px] bg-amber-400/5 rounded-full blur-[80px]" />
        </div>

        {/* 3D Grid Floor */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            transform: 'perspective(1000px) rotateX(60deg) translateY(200px) scale(2)',
            transformOrigin: 'center bottom',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 border border-slate-200/80 backdrop-blur-md rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-slate-200/50 hover:shadow-slate-300/50 transition-all duration-300 cursor-default group">
            <Sparkles size={14} className="text-blue-500 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold text-slate-700 tracking-wide">Digital Floor Planner & Live Quantity Surveyor</span>
          </div>

          {/* ===== 3D TERRAFORM HOUSE VISUAL ===== */}
          <div className="mb-10 flex justify-center">
            <div 
              className="relative w-64 h-64 md:w-80 md:h-80"
              style={{ perspective: '1200px' }}
            >
              {/* Terraform Container */}
              <div 
                className="w-full h-full relative"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(55deg) rotateZ(-25deg)',
                }}
              >
                {/* Floor/Base Grid */}
                <div 
                  className="absolute inset-0 border-2 border-slate-300 rounded-lg"
                  style={{ 
                    transform: 'translateZ(0px)',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(16,185,129,0.05) 100%)'
                  }}
                />
                
                {/* Grid lines on floor */}
                <div className="absolute inset-0" style={{ transform: 'translateZ(1px)' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={`h${i}`} className="absolute w-full h-px bg-slate-300/50" style={{ top: `${(i + 1) * 20}%` }} />
                  ))}
                  {[...Array(5)].map((_, i) => (
                    <div key={`v${i}`} className="absolute h-full w-px bg-slate-300/50" style={{ left: `${(i + 1) * 20}%` }} />
                  ))}
                </div>

                {/* House Walls - Back */}
                <div 
                  className="absolute bg-blue-500/20 border border-blue-400/60 backdrop-blur-sm"
                  style={{ 
                    bottom: '20%', left: '20%', width: '60%', height: '40%',
                    transform: 'translateZ(40px)',
                  }}
                />
                
                {/* House Walls - Left */}
                <div 
                  className="absolute bg-blue-500/15 border border-blue-400/50"
                  style={{ 
                    bottom: '20%', left: '20%', width: '40%', height: '40%',
                    transform: 'rotateY(-90deg) translateZ(20px) translateX(-20px)',
                    transformOrigin: 'left center'
                  }}
                />

                {/* House Walls - Right */}
                <div 
                  className="absolute bg-blue-500/15 border border-blue-400/50"
                  style={{ 
                    bottom: '20%', right: '20%', width: '40%', height: '40%',
                    transform: 'rotateY(90deg) translateZ(20px) translateX(20px)',
                    transformOrigin: 'right center'
                  }}
                />

                {/* House Walls - Front */}
                <div 
                  className="absolute bg-blue-500/25 border border-blue-500/70 backdrop-blur-sm"
                  style={{ 
                    bottom: '20%', left: '20%', width: '60%', height: '40%',
                    transform: 'translateZ(80px)',
                  }}
                >
                  {/* Door cutout */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 bg-slate-50/80 border border-slate-300" />
                </div>

                {/* Roof - Main */}
                <div 
                  className="absolute bg-emerald-500/20 border-2 border-emerald-400/60"
                  style={{ 
                    bottom: '55%', left: '15%', width: '70%', height: '35%',
                    transform: 'translateZ(60px) rotateX(45deg)',
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  }}
                />

                {/* Roof shadow line */}
                <div 
                  className="absolute border-t-2 border-emerald-500/40"
                  style={{ 
                    bottom: '55%', left: '20%', width: '60%',
                    transform: 'translateZ(80px)',
                  }}
                />

                {/* Chimney */}
                <div 
                  className="absolute bg-slate-400/30 border border-slate-400/50"
                  style={{ 
                    bottom: '65%', right: '25%', width: '8%', height: '15%',
                    transform: 'translateZ(90px)',
                  }}
                />

                {/* Terraform Particles - Floating dots */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-pulse"
                    style={{
                      bottom: `${15 + Math.random() * 70}%`,
                      left: `${15 + Math.random() * 70}%`,
                      transform: `translateZ(${20 + Math.random() * 100}px)`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}

                {/* Measurement Lines */}
                <div 
                  className="absolute border-l-2 border-dashed border-slate-400/40"
                  style={{ bottom: '20%', left: '10%', height: '40%', transform: 'translateZ(85px)' }}
                >
                  <span className="absolute -left-8 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-mono -rotate-90">4.5m</span>
                </div>
                <div 
                  className="absolute border-t-2 border-dashed border-slate-400/40"
                  style={{ bottom: '15%', left: '20%', width: '60%', transform: 'translateZ(85px)' }}
                >
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[8px] text-slate-400 font-mono">6.0m</span>
                </div>
              </div>

              {/* Shadow underneath */}
              <div 
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[60%] h-6 bg-slate-900/5 rounded-full blur-xl"
              />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Stop Budget Creep.
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
              Build With Confidence.
            </span>
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Your digital site supervisor for Sri Lankan home construction. Draw precise floor plans, 
            calculate exact material volumes, manage blueprints, and track real-time project costs — all in one intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => (isSignedIn ? handleDashboardRedirect() : navigate("/login"))}
              className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-1 flex items-center gap-2 cursor-pointer"
            >
              Get Started Now 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-bold transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-slate-200/30 cursor-pointer"
            >
              Explore Features
            </button>
          </div>

          {/* 3D Feature Cards */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto"
            style={{ perspective: '1000px' }}
          >
            {[
              { 
                icon: <Layers size={22} />, 
                title: "Precision 2D Canvas", 
                desc: "Draw walls, rooms, doors & windows with smart snapping",
                color: "from-blue-500/10 to-blue-600/5",
                border: "border-blue-200",
                iconBg: "bg-blue-500/10 text-blue-600",
                shadow: "shadow-blue-500/10"
              },
              { 
                icon: <DollarSign size={22} />, 
                title: "Live Material Takeoffs", 
                desc: "Calculate cement, brick, sand, tile & labor rates instantly",
                color: "from-emerald-500/10 to-emerald-600/5",
                border: "border-emerald-200",
                iconBg: "bg-emerald-500/10 text-emerald-600",
                shadow: "shadow-emerald-500/10"
              },
              { 
                icon: <Hammer size={22} />, 
                title: "Project & Milestone Tracker", 
                desc: "Monitor status phases, collaborator permissions & blueprints",
                color: "from-amber-500/10 to-amber-600/5",
                border: "border-amber-200",
                iconBg: "bg-amber-500/10 text-amber-600",
                shadow: "shadow-amber-500/10"
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`relative group p-6 rounded-2xl border ${card.border} bg-gradient-to-b ${card.color} backdrop-blur-sm hover:-translate-y-2 transition-all duration-500 cursor-default shadow-lg ${card.shadow}`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(5deg) translateZ(${10 + i * 5}px)`,
                }}
              >
                <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{card.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW DEEP DIVE SECTION ===== */}
      <section id="workflow" className="py-24 px-6 relative bg-white border-y border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3 block">End-to-End Workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How BuildSure-AI Powers Your Build</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Built specifically around your project workspace — from floor planning to cost settings and team collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Project Setup",
                desc: "Define your project name, location, and description. Set initial status from Planning through to Completion.",
                icon: <Building2 size={20} className="text-blue-600" />
              },
              {
                step: "02",
                title: "2D Digital Plan",
                desc: "Draw precise walls, add rooms with area calculations in square meters, and position doors, windows & furniture.",
                icon: <Layers size={20} className="text-emerald-600" />
              },
              {
                step: "03",
                title: "Cost & Material Rates",
                desc: "Configure local unit rates for cement, bricks, sand, tiles, and labor per square meter to track actual vs estimated spending.",
                icon: <Calculator size={20} className="text-amber-600" />
              },
              {
                step: "04",
                title: "Collaborate & Blueprints",
                desc: "Upload structural blueprint files and invite team members or contractors with view or edit permissions.",
                icon: <Users size={20} className="text-purple-600" />
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 font-mono">{item.step}</span>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-6">
                <Users size={14} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Built for Sri Lankan Homeowners</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Why Construction Projects Fail — 
                <span className="text-slate-400"> And How We Fix It</span>
              </h2>
              
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                In Sri Lanka, over 60% of residential construction projects exceed their budget by more than 30%. 
                Families pour their life savings into building a home, only to face unexpected material shortages and inflated labor rates. 
                BuildSure-AI was built to give homeowners full digital transparency over every brick, bag of cement, and square meter.
              </p>

              <div className="space-y-4">
                {[
                  { icon: <TrendingDown size={18} />, text: "Precise wall and room dimension calculations to eliminate waste" },
                  { icon: <Clock size={18} />, text: "Milestone tracking and custom schedule estimation in weeks" },
                  { icon: <CheckCircle2 size={18} />, text: "Full cost settings control for cement, brick, sand, and tile rates" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Stats Cards with 3D */}
            <div className="relative" style={{ perspective: '1200px' }}>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ transform: 'rotateY(-5deg) translateZ(20px)' }}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-1">2D</div>
                  <div className="text-xs text-slate-500">Interactive floor canvas</div>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300 mt-8"
                  style={{ transform: 'rotateY(5deg) translateZ(20px)' }}
                >
                  <div className="text-3xl font-bold text-emerald-600 mb-1">100%</div>
                  <div className="text-xs text-slate-500">Custom rate controls</div>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300"
                  style={{ transform: 'rotateY(-3deg) translateZ(10px)' }}
                >
                  <div className="text-3xl font-bold text-purple-600 mb-1">Live</div>
                  <div className="text-xs text-slate-500">Collaborator sharing</div>
                </div>
                <div 
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300 mt-8"
                  style={{ transform: 'rotateY(3deg) translateZ(10px)' }}
                >
                  <div className="text-3xl font-bold text-amber-600 mb-1">Secure</div>
                  <div className="text-xs text-slate-500">Stripe encrypted billing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 px-6 relative bg-slate-100/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3 block">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything You Need to Build Smart</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              From the initial digital floor plan to team collaboration and material cost tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Layers size={24} />,
                title: "Precision 2D Drawing Canvas",
                desc: "Design architectural floor layouts with walls, rooms, doors, windows, and furniture items. Automatically calculate area in square meters for accurate material requirements.",
                color: "blue",
                bg: "bg-blue-50",
                text: "text-blue-600",
                border: "border-blue-200",
                gradient: "from-blue-500/5 to-transparent"
              },
              {
                icon: <DollarSign size={24} />,
                title: "Cost Settings & Material Rates",
                desc: "Configure exact unit prices for cement, bricks, sand, tiles, and labor per square meter. Keep your actual spending aligned with your estimated budget.",
                color: "emerald",
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                border: "border-emerald-200",
                gradient: "from-emerald-500/5 to-transparent"
              },
              {
                icon: <Hammer size={24} />,
                title: "Blueprints & Collaborators",
                desc: "Upload structural PDF/CAD blueprints and invite project partners with view or edit permissions. Track custom milestones and estimated completion weeks.",
                color: "amber",
                bg: "bg-amber-50",
                text: "text-amber-600",
                border: "border-amber-200",
                gradient: "from-amber-500/5 to-transparent"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.text} border ${feature.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-50" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase mb-3 block">Pricing Plans</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Every plan unlocks full platform access. Choose the duration that matches your build schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => {
              const isPopular = plan.badge === "Best Value";
              return (
                <div
                  key={plan.priceId}
                  className={`relative group p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
                    isPopular 
                      ? "bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-400 shadow-xl shadow-emerald-200/40" 
                      : "bg-white border border-slate-200 hover:border-slate-300 shadow-lg shadow-slate-200/20"
                  }`}
                  style={{ 
                    perspective: '1000px',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Header with Icon */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${plan.accent} text-white mb-4 shadow-lg ${plan.shadow}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-slate-500 text-xs">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-xs ml-2">/ {plan.interval}</span>
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
          
          <p className="text-center text-xs text-slate-400 mt-8">
            All plans include the same complete feature set. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
              <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">BuildSure-AI</h4>
              <p className="text-[10px] text-slate-500">Fix Your Budget Before You Build</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button onClick={() => scrollToSection("features")} className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection("workflow")} className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Workflow</button>
            <button onClick={() => scrollToSection("about")} className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">About</button>
            <button onClick={() => scrollToSection("pricing")} className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">Pricing</button>
          </div>

          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} BuildSure-AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}