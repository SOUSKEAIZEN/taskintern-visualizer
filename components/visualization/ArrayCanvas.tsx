"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "../../lib/logger";
import { ArrayElement, AlgorithmStep } from "../../types/dsa";
import { generateBubbleSortSteps } from "../../lib/algorithms/sorting";

interface ArrayCanvasProps {
  initialData?: number[];
}

export default function ArrayCanvas({ initialData = [45, 10, 24, 92, 7] }: ArrayCanvasProps) {
  // Manual Interaction State
  const [baseArray, setBaseArray] = useState<number[]>(initialData);

  // Video Playback Engine State
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [history, setHistory] = useState<AlgorithmStep<ArrayElement[]>[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Manual Controls ---
  const handleAddElement = () => {
    if (baseArray.length >= 10) return;
    const newValue = Math.floor(Math.random() * 100);
    logger.info(`Manual State: Pushed new value ${newValue}`);
    setBaseArray((prev) => [...prev, newValue]);
  };

  const handleRemoveElement = () => {
    if (baseArray.length === 0) return;
    logger.info(`Manual State: Popped last element.`);
    setBaseArray((prev) => prev.slice(0, -1));
  };

  // --- 2. Playback Engine Initialization ---
  const handleStartSorting = () => {
    logger.info(`Playback Engine: Initializing Bubble Sort for ${baseArray.length} elements.`);
    const steps = generateBubbleSortSteps(baseArray);
    setHistory(steps);
    setCurrentFrame(0);
    setIsPlaybackMode(true);
    setIsPlaying(true);
  };

  const handleReset = () => {
    logger.info("Playback Engine: Resetting to manual mode.");
    setIsPlaybackMode(false);
    setIsPlaying(false);
    setHistory([]);
    setCurrentFrame(0);
  };

  // --- 3. Time Travel Controls ---
  const togglePlayPause = () => {
    logger.info(`Playback Engine: Toggled to ${!isPlaying ? 'Playing' : 'Paused'}`);
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    if (currentFrame < history.length - 1) {
      logger.info(`Playback Engine: Manual step forward to frame ${currentFrame + 1}`);
      setCurrentFrame((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentFrame > 0) {
      logger.info(`Playback Engine: Manual step backward to frame ${currentFrame - 1}`);
      setCurrentFrame((prev) => prev - 1);
    }
  };

  // --- 4. The Animation Loop ---
  useEffect(() => {
    if (isPlaying && currentFrame < history.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentFrame((prev) => prev + 1);
      }, 800); // 800ms per frame for visual clarity
    } else if (currentFrame >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentFrame, history.length]);

  // --- 5. Visual Rendering Helpers ---
  const activeFrame = isPlaybackMode && history.length > 0 ? history[currentFrame].snapshot : null;
  const activeDescription = isPlaybackMode && history.length > 0 ? history[currentFrame].description : "";

  // Graphic Design: Mapping logical states to exact color palettes
  const getStyleForState = (state?: string) => {
    switch (state) {
      case "comparing":
        return "bg-amber-400 text-amber-900 border-amber-500 shadow-amber-200 scale-110 z-10";
      case "swapping":
        return "bg-rose-500 text-white border-rose-600 shadow-rose-200 scale-110 -rotate-6 z-10";
      case "sorted":
        return "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200";
      default: // "default" or manual mapping
        return "bg-white text-blue-700 border-blue-400 shadow-sm hover:border-blue-500";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      
      {/* Dynamic Narrative Text */}
      <div className="h-12 flex items-center justify-center w-full">
        {isPlaybackMode && (
          <p className="text-lg font-medium text-slate-700 bg-slate-100 px-6 py-2 rounded-full border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
            {activeDescription}
          </p>
        )}
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-wrap justify-center gap-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[180px] w-full max-w-2xl shadow-inner relative">
        {/* Render Manual State vs Playback State */}
        {!isPlaybackMode ? (
          baseArray.map((num, idx) => (
            <div key={`manual-${idx}`} className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${getStyleForState("default")}`}>
              {num}
            </div>
          ))
        ) : (
          activeFrame?.map((element) => (
            <div key={element.id} className={`w-16 h-16 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${getStyleForState(element.state)}`}>
              {element.value}
            </div>
          ))
        )}
      </div>

      {/* Dynamic Control Panel */}
      {!isPlaybackMode ? (
        <div className="flex space-x-4">
          <button onClick={handleAddElement} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors">Add</button>
          <button onClick={handleRemoveElement} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors">Remove</button>
          <button onClick={handleStartSorting} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors shadow-indigo-200">
            ▶ Visualize Bubble Sort
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4 bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-700">
          <button onClick={handleReset} className="px-4 py-2 text-rose-400 hover:bg-slate-800 rounded-lg font-medium transition-colors">Stop</button>
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button onClick={stepBackward} disabled={currentFrame === 0} className="px-4 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors">⏮ Prev</button>
          <button onClick={togglePlayPause} className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-600 transition-colors w-24">
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={stepForward} disabled={currentFrame >= history.length - 1} className="px-4 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors">Next ⏭</button>
        </div>
      )}

      {/* Progress Bar (Visible only during playback) */}
      {isPlaybackMode && (
        <div className="w-full max-w-2xl bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
          <div 
            className="bg-indigo-500 h-full transition-all duration-300" 
            style={{ width: `${((currentFrame + 1) / history.length) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}