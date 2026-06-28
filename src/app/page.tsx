"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";
import ArrayCanvas from "../../components/visualization/ArrayCanvas";

export default function Home() {
  const [isVisualizing, setIsVisualizing] = useState(false);

  const handleStartVisualization = () => {
    // Client-side log to track when the full interactive canvas is mounted
    logger.info("State Change: User mounted the interactive ArrayCanvas.");
    setIsVisualizing(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center mt-10">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          Array Operations
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-lg">
          Select an algorithm from the sidebar to begin, or click below to initialize the interactive data structure.
        </p>
      </div>

      {/* Main Canvas Area */}
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[450px]">
        {!isVisualizing ? (
          <button
            onClick={handleStartVisualization}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            Initialize Canvas
          </button>
        ) : (
          <div className="flex flex-col items-center w-full">
            {/* The imported Visualization Engine */}
            <ArrayCanvas />
            
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 mt-8">
              ✓ Interactive Canvas active. Open your console (F12) to see every interaction log!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}