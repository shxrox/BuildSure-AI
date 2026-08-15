import { SignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, ShieldCheck, Layers, Calculator, CheckCircle2 } from "lucide-react";
import logo from "../assets/LOGO.png";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800 flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-500/20">
      
      {/* ===== LEFT HERO / BRANDING PANEL ===== */}
      <div className="lg:w-1/2 relative bg-gradient-to-br from-slate-100 via-white to-emerald-50 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Subtle Grid Lines Background */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Navbar Brand */}
        <div className="relative z-10 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-2xl bg-white backdrop-blur-xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="BuildSure-AI" className="w-full h-full object-contain p-1.5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">BuildSure-AI</h1>
              <p className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">Enterprise Edition</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} /> Home
          </button>
        </div>

        {/* Center Hero Message */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6 backdrop-blur-md shadow-sm">
            <Sparkles size={14} className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Start Your Free Account Today</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-[1.15]">
            Build Smarter. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Zero Budget Surprises.
            </span>
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Join hundreds of Sri Lankan homeowners and contractors managing accurate 2D layouts, material quantities, and milestone tracking in one platform.
          </p>

          <div className="space-y-3.5">
            {[
              { icon: <Layers size={16} className="text-blue-600" />, text: "Instant 2D room layouts and square meter calculations" },
              { icon: <Calculator size={16} className="text-emerald-600" />, text: "Custom material unit pricing for cement, brick, and sand" },
              { icon: <ShieldCheck size={16} className="text-amber-600" />, text: "Secure role-based workspace sharing with contractors" },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-sm shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                  {feat.icon}
                </div>
                <span className="text-xs font-medium text-slate-700">{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200 pt-6">
          <span>&copy; {new Date().getFullYear()} BuildSure-AI Inc.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-700 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIGN-UP PANEL ===== */}
      <div className="lg:w-1/2 bg-slate-50/50 flex flex-col items-center justify-center p-6 lg:p-16 relative">
        
        {/* Subtle background highlight for form */}
        <div className="absolute w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          <div className="text-center mb-8 lg:hidden">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Create Account</h3>
            <p className="text-slate-500 text-xs">Get started with your BuildSure workspace</p>
          </div>

          {/* Frosted Glass Container for Clerk SignUp */}
          <div className="backdrop-blur-2xl bg-white/80 border border-slate-200/80 p-6 lg:p-8 rounded-3xl shadow-2xl shadow-slate-300/40">
            
            <div className="mb-6 pb-6 border-b border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block mb-1">New Account Portal</span>
              <h3 className="text-lg font-bold text-slate-900">Register Your Workspace</h3>
              <p className="text-xs text-slate-500">Fill in your details or sign up instantly.</p>
            </div>

            <SignUp 
              signInUrl="/login"
              fallbackRedirectUrl="/homeowner"
              appearance={{
                elements: {
                  rootBox: "w-full flex justify-center",
                  card: "bg-transparent shadow-none w-full p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: 
                    "bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all shadow-xs py-3",
                  socialButtonsBlockButtonText: "text-slate-700 font-semibold",
                  dividerLine: "bg-slate-200",
                  dividerText: "text-slate-400 text-[10px] uppercase font-bold tracking-wider",
                  formFieldLabel: "text-xs font-semibold text-slate-700 mb-1",
                  formFieldInput: 
                    "bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs py-3",
                  formButtonPrimary: 
                    "bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold py-3 transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 mt-2",
                  footerActionLink: "text-emerald-600 hover:text-emerald-700 font-semibold transition-colors",
                  footerActionText: "text-xs text-slate-500",
                  identityPreviewText: "text-slate-700 text-xs",
                  formResendCodeLink: "text-emerald-600 text-xs",
                }
              }}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-500" /> Free Trial & Instant Setup Included
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;