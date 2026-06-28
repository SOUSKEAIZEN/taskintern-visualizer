"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";

export default function Home() {
  const [isVisualizing, setIsVisualizing] = useState(false);

  const handleStartVisualization = () => {
    // Step 2: Client-side log to track user interaction and state changes
    logger.info("State Change: User initialized the Array Canvas.");
    setIsVisualizing(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in duration-500">
      <div className="text-center mt-10">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          Array Operations
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-lg">
          Select an algorithm from the sidebar to begin, or click below to initialize a sample data structure in the canvas.
        </p>
      </div>

      {/* Main Canvas Area */}
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[350px]">
        {!isVisualizing ? (
          <button
            onClick={handleStartVisualization}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            Initialize Canvas
          </button>
        ) : (
          <div className="flex flex-col items-center space-y-8">
            <div className="flex space-x-4">
              {/* Graphic Representation of an Array */}
              {[10, 24, 45, 7, 92].map((num, idx) => (
                <div 
                  key={idx} 
                  className="w-16 h-16 bg-blue-50 border-2 border-blue-400 rounded-xl flex items-center justify-center text-2xl font-bold text-blue-700 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
              ✓ Canvas active. Right-click &gt; Inspect &gt; Console to view your frontend log!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}