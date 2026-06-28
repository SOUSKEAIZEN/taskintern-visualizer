"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";
import ArrayCanvas from "../../components/visualization/ArrayCanvas";
import TheoryPanel from "../../components/workspace/TheoryPanel";
import InteractiveQuiz from "../../components/workspace/InteractiveQuiz";

export default function Home() {
  const [isVisualizing, setIsVisualizing] = useState(false);

  const handleStartVisualization = () => {
    // Client-side log to track when the full interactive canvas is mounted
    logger.info("State Change: User mounted the interactive ArrayCanvas.");
    setIsVisualizing(true);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] w-full overflow-hidden -m-6">
      
      {/* Left Pane: Educational Theory Content */}
      <div className="w-full lg:w-1/3 h-full overflow-y-auto bg-white border-r border-slate-200 z-10 shadow-sm relative">
        <TheoryPanel topicId="arrays" />
      </div>

      {/* Right Pane: Interactive Workspace & Assessment */}
      <div className="w-full lg:w-2/3 h-full overflow-y-auto p-8 bg-slate-50/50 space-y-12 pb-24 relative custom-scrollbar">
        
        <div className="w-full max-w-4xl mx-auto">
          {/* Main Visualization Area */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
            
            {/* Background Accent Graphic */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {!isVisualizing ? (
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 z-10">
                <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                  <span className="text-5xl">🚀</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ready to Visualize?</h2>
                <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">
                  Initialize the canvas to interact with arrays, push/pop elements, and watch sorting algorithms execute in real-time.
                </p>
                <button
                  onClick={handleStartVisualization}
                  className="mt-4 px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95"
                >
                  Initialize Array Engine
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full animate-in fade-in duration-500 z-10">
                
                {/* The imported Visualization Engine */}
                <ArrayCanvas />
                
                <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-200 mt-10 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Interactive Canvas Active. Open your console (F12) to view engine logs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Section (Only appears after they start interacting) */}
        {isVisualizing && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-center mb-12">
              <div className="w-full h-px bg-slate-200"></div>
              <span className="px-6 text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Knowledge Assessment
              </span>
              <div className="w-full h-px bg-slate-200"></div>
            </div>
            
            {/* The imported Quiz Engine wired to Prisma */}
            <InteractiveQuiz 
              topicId="arrays" 
              userId="placeholder-student-id-123" 
            />
          </div>
        )}
      </div>
    </div>
  );
}