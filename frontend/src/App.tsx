import { useState } from 'react';

export default function App() {
  const [testStatus, setTestStatus] = useState<string>("Click to verify system");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-emerald-400 mb-2">
          BuildSure-AI
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          SaaS-Based Digital Architect & Live Quantity Surveyor
        </p>
        
        <div className="rounded-lg bg-slate-950 p-4 border border-slate-800 mb-6">
          <span className="text-xs uppercase tracking-wider text-slate-500 block mb-1">
            Tailwind v4 Engine Status
          </span>
          <p className="text-sm font-mono text-emerald-300">
            {testStatus}
          </p>
        </div>

        <button
          onClick={() => setTestStatus("Tailwind v4 & React-TS Active ✓")}
          className="w-full cursor-pointer rounded-xl bg-emerald-500 py-3 px-4 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 active:bg-emerald-600"
        >
          Test Configuration
        </button>
      </div>
    </div>
  );
}