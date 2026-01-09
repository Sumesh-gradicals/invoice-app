"use client";

import { useState } from "react";
import { checkVercelHealth } from "@/app/actions/diagnostics";

export default function DiagnosticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    try {
      const result = await checkVercelHealth();
      setData(result);
    } catch (e: any) {
      setData({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 font-mono text-xs text-left">
      <h1 className="text-xl font-bold mb-4">Vercel Deployment Diagnostics</h1>
      <button 
        onClick={runCheck}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Run Health Check"}
      </button>

      {data && (
        <pre className="bg-slate-100 p-4 rounded overflow-auto max-w-full">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
