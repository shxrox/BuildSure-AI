import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Construction,
} from "lucide-react";
import logo from "../assets/LOGO.png";

export default function NotFound(): React.JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 font-sans flex flex-col items-center justify-center p-6 text-slate-800 selection:bg-blue-500/20">

      {/* Background Construction Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating Brand Header */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="backdrop-blur-xl bg-white/70 border border-slate-200/60 rounded-2xl px-6 py-3 flex items-center justify-between shadow-xl shadow-slate-300/20">

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
              <img
                src={logo}
                alt="BuildSure-AI"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-wide">
                BuildSure-AI
              </h1>

              <p className="text-[10px] text-slate-500 font-medium">
                Fix Your Budget Before You Build
              </p>
            </div>
          </div>

        </div>
      </nav>

      {/* Main 404 Error Card */}
      <div className="relative z-10 max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 text-center space-y-6 mt-12">

        {/* Animated Construction Collapse */}
        <div className="relative h-40 flex items-center justify-center overflow-hidden">

          {/* Warning Glow */}
          <div className="absolute w-28 h-28 rounded-full bg-amber-400/10 animate-ping" />

          {/* Building Container */}
          <div className="relative w-32 h-28 animate-[shakeBuilding_4s_ease-in-out_infinite]">

            {/* Roof */}
            <div className="absolute top-0 left-3 w-28 h-4 bg-slate-700 rounded-sm animate-[collapseRoof_4s_ease-in-out_infinite]" />

            {/* Floor 1 */}
            <div className="absolute top-5 left-2 flex gap-1 animate-[collapseLeft_4s_ease-in-out_infinite]">
              <div className="w-9 h-8 bg-blue-500 rounded-sm shadow-md" />
              <div className="w-9 h-8 bg-blue-600 rounded-sm shadow-md" />
              <div className="w-9 h-8 bg-blue-500 rounded-sm shadow-md" />
            </div>

            {/* Floor 2 */}
            <div className="absolute top-14 left-2 flex gap-1 animate-[collapseRight_4s_ease-in-out_infinite]">
              <div className="w-9 h-8 bg-slate-500 rounded-sm shadow-md" />
              <div className="w-9 h-8 bg-slate-600 rounded-sm shadow-md" />
              <div className="w-9 h-8 bg-slate-500 rounded-sm shadow-md" />
            </div>

            {/* Falling Block 1 */}
            <div className="absolute top-8 left-0 w-7 h-7 bg-amber-500 rounded-sm animate-[fallLeft_4s_ease-in_infinite]" />

            {/* Falling Block 2 */}
            <div className="absolute top-5 right-0 w-6 h-6 bg-blue-600 rounded-sm animate-[fallRight_4s_ease-in_infinite]" />

            {/* Falling Block 3 */}
            <div className="absolute top-10 left-1/2 w-5 h-5 bg-slate-600 rounded-sm animate-[fallCenter_4s_ease-in_infinite]" />

            {/* Ground */}
            <div className="absolute bottom-0 -left-5 w-40 h-1.5 bg-slate-200 rounded-full" />

          </div>

          {/* Dust Clouds */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <div className="w-4 h-4 rounded-full bg-slate-300 animate-[dust_4s_ease-out_infinite]" />
            <div className="w-6 h-6 rounded-full bg-slate-200 animate-[dust2_4s_ease-out_infinite]" />
            <div className="w-3 h-3 rounded-full bg-slate-300 animate-[dust3_4s_ease-out_infinite]" />
          </div>

        </div>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-inner">
          <Construction size={28} />
        </div>

        <div className="space-y-2">

          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Error 404
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            This Page Collapsed
          </h2>

          <p className="text-slate-500 text-xs leading-relaxed">
            Looks like this part of the project didn't survive the construction
            process. The page may have been moved, removed, or never built.
          </p>

        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">

          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 shadow-sm cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex-1 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Home size={14} />
            Rebuild From Home
          </button>

        </div>

      </div>

      {/* Footer */}
      <p className="relative z-10 text-xs text-slate-400 mt-8">
        &copy; {new Date().getFullYear()} BuildSure-AI. All rights reserved.
      </p>

      {/* Tailwind Custom Animations */}
      <style>{`

        @keyframes shakeBuilding {
          0%, 60%, 100% {
            transform: translateX(0) rotate(0);
          }

          62% {
            transform: translateX(-3px) rotate(-1deg);
          }

          64% {
            transform: translateX(3px) rotate(1deg);
          }

          66% {
            transform: translateX(-5px) rotate(-2deg);
          }

          68% {
            transform: translateX(4px) rotate(2deg);
          }

          70% {
            transform: translateX(0) rotate(0);
          }
        }

        @keyframes collapseRoof {
          0%, 62% {
            transform: translate(0, 0) rotate(0);
          }

          70% {
            transform: translate(-25px, 55px) rotate(-25deg);
          }

          85%, 100% {
            transform: translate(-25px, 55px) rotate(-25deg);
          }
        }

        @keyframes collapseLeft {
          0%, 63% {
            transform: translate(0, 0) rotate(0);
          }

          72% {
            transform: translate(-30px, 50px) rotate(-35deg);
          }

          100% {
            transform: translate(-30px, 50px) rotate(-35deg);
          }
        }

        @keyframes collapseRight {
          0%, 65% {
            transform: translate(0, 0) rotate(0);
          }

          74% {
            transform: translate(35px, 35px) rotate(40deg);
          }

          100% {
            transform: translate(35px, 35px) rotate(40deg);
          }
        }

        @keyframes fallLeft {
          0%, 65% {
            opacity: 0;
            transform: translate(0, 0) rotate(0);
          }

          70% {
            opacity: 1;
          }

          85%, 100% {
            opacity: 0;
            transform: translate(-40px, 80px) rotate(-180deg);
          }
        }

        @keyframes fallRight {
          0%, 68% {
            opacity: 0;
            transform: translate(0, 0) rotate(0);
          }

          72% {
            opacity: 1;
          }

          88%, 100% {
            opacity: 0;
            transform: translate(40px, 80px) rotate(220deg);
          }
        }

        @keyframes fallCenter {
          0%, 66% {
            opacity: 0;
            transform: translateX(-50%) translateY(0) rotate(0);
          }

          70% {
            opacity: 1;
          }

          88%, 100% {
            opacity: 0;
            transform: translateX(-50%) translateY(85px) rotate(180deg);
          }
        }

        @keyframes dust {
          0%, 68% {
            opacity: 0;
            transform: scale(0);
          }

          78% {
            opacity: 0.7;
            transform: scale(2.5) translateX(-15px);
          }

          100% {
            opacity: 0;
            transform: scale(3);
          }
        }

        @keyframes dust2 {
          0%, 70% {
            opacity: 0;
            transform: scale(0);
          }

          80% {
            opacity: 0.6;
            transform: scale(2.8) translateX(15px);
          }

          100% {
            opacity: 0;
            transform: scale(3.5);
          }
        }

        @keyframes dust3 {
          0%, 72% {
            opacity: 0;
            transform: scale(0);
          }

          82% {
            opacity: 0.8;
            transform: scale(2);
          }

          100% {
            opacity: 0;
            transform: scale(3);
          }
        }

      `}</style>

    </div>
  );
}