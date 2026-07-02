"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { logger } from "../../lib/logger";
import ArrayCanvas from "../../components/visualization/ArrayCanvas";
import LinkedListCanvas from "../../components/visualization/LinkedListCanvas";
import StackCanvas from "../../components/visualization/StackCanvas";
import QueueCanvas from "../../components/visualization/QueueCanvas";
import TreeCanvas from "../../components/visualization/TreeCanvas";
import HeapCanvas from "../../components/visualization/HeapCanvas";
import GraphCanvas from "../../components/visualization/GraphCanvas";
import TheoryPanel from "../../components/workspace/TheoryPanel";
import InteractiveQuiz from "../../components/workspace/InteractiveQuiz";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  // Read the module from the URL, default to arrays if none is provided
  const urlModule = searchParams.get("module") || "arrays";

  const [activeModule, setActiveModule] = useState(urlModule);
  const [isVisualizing, setIsVisualizing] = useState(false);
  
  // UI UX States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(33.33); // Starting at 33.33% width

  // Sync URL parameter to the active module state
  useEffect(() => {
    if (urlModule !== activeModule) {
      logger.info(`URL State Change: Switching active module to ${urlModule.toUpperCase()}`);
      setActiveModule(urlModule);
      setIsVisualizing(false); // Reset canvas when switching modules
      setIsFullscreen(false); // Exit fullscreen if active
    }
  }, [urlModule, activeModule]);

  const handleStartVisualization = () => {
    logger.info(`State Change: User mounted the interactive ${activeModule} Canvas.`);
    setIsVisualizing(true);
  };

  const toggleFullscreen = () => {
    logger.info(`UI Interaction: User toggled fullscreen mode to ${!isFullscreen}`);
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex h-full w-full relative">
      
      {/* Left Pane: Educational Theory Content (Hidden if Fullscreen) */}
      {!isFullscreen && (
        <div 
          style={{ width: `${leftPaneWidth}%` }}
          className="h-full overflow-y-auto bg-white border-r border-slate-200 z-10 shadow-sm relative flex-shrink-0"
        >
          <TheoryPanel topicId={activeModule} />
        </div>
      )}

      {/* Draggable Split-Pane Divider */}
      {!isFullscreen && (
        <div 
          className="w-1.5 hover:w-2 bg-slate-200 hover:bg-indigo-400 cursor-col-resize z-20 transition-all flex items-center justify-center group"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = leftPaneWidth;
            
            const onMouseMove = (moveEvent: MouseEvent) => {
              // Calculate the change as a percentage of the total window width
              const delta = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
              const newWidth = Math.max(20, Math.min(startWidth + delta, 60)); // Constrain between 20% and 60%
              setLeftPaneWidth(newWidth);
            };
            
            const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };
            
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }}
        >
          {/* Visual indicator for the drag handle */}
          <div className="h-8 w-1 bg-slate-400 group-hover:bg-white rounded-full"></div>
        </div>
      )}

      {/* Right Pane: Interactive Workspace & Assessment */}
      <div 
        style={{ width: isFullscreen ? '100%' : `${100 - leftPaneWidth}%` }}
        className="h-full overflow-y-auto p-4 md:p-8 bg-slate-50/50 space-y-8 pb-24 relative custom-scrollbar flex-grow transition-all duration-300"
      >
        <div className={`w-full mx-auto ${isFullscreen ? 'max-w-7xl' : 'max-w-4xl'}`}>
          
          {/* Main Visualization Area */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-4 md:p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden transition-all duration-500">
            
            {/* Background Accent Graphic */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* Fullscreen Toggle Button (Only show if visualizing) */}
            {isVisualizing && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm transition-all z-20 flex items-center space-x-2"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <span className="text-sm font-bold">Exit</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h4v4m0-4l-5 5m11-5h4v4m-4-4l5 5M4 10h4V6m0 4l-5-5m11 5h4V6m-4 4l5-5" /></svg>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-bold">Fullscreen</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  </>
                )}
              </button>
            )}

            {!isVisualizing ? (
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500 z-10">
                <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md transition-all">
                  <span className="text-5xl">
                    {activeModule === "arrays" ? "🚀" : 
                     activeModule === "linked-lists" ? "🔗" : 
                     activeModule === "stacks" ? "🥞" : 
                     activeModule === "queues" ? "🚶" : 
                     activeModule === "trees" ? "🌳" : 
                     activeModule === "heaps" ? "💎" : 
                     activeModule === "graphs" ? "🕸️" : "⚙️"}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Ready to Visualize?</h2>
                <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed capitalize">
                  Initialize the canvas to interact with {activeModule.replace("-", " ")} and observe algorithms executing in real-time.
                </p>
                <button
                  onClick={handleStartVisualization}
                  className="mt-4 px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 capitalize"
                >
                  Initialize {activeModule.replace("-", " ")} Engine
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full animate-in fade-in duration-500 z-10">
                
                {/* Dynamically render the correct visualization engine */}
                {activeModule === "arrays" ? <ArrayCanvas /> : 
                 activeModule === "linked-lists" ? <LinkedListCanvas /> : 
                 activeModule === "stacks" ? <StackCanvas /> :
                 activeModule === "queues" ? <QueueCanvas /> :
                 activeModule === "trees" ? <TreeCanvas /> :
                 activeModule === "heaps" ? <HeapCanvas /> :
                 activeModule === "graphs" ? <GraphCanvas /> :
                 <div className="text-slate-500 font-bold p-8">Module Engine in Development</div>}
                
                <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-200 mt-10 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Interactive Canvas Active.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Section */}
        {isVisualizing && (
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-center mb-12 mt-8">
              <div className="w-full h-px bg-slate-200"></div>
              <span className="px-6 text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Knowledge Assessment
              </span>
              <div className="w-full h-px bg-slate-200"></div>
            </div>
            
            <InteractiveQuiz 
              topicId={activeModule} 
              userId="placeholder-student-id-123" 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full w-full">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}