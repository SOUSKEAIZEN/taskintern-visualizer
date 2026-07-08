"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmStep, SearchState, VisualState, ArrayElement } from '../../types/dsa';
import { logger } from '../../lib/logger';
import { markVisualizationComplete } from '../../lib/actions/progress';
import { generateLinearSearchSteps, generateBinarySearchSteps } from '../../lib/algorithms/searching';

type SearchAlgorithmType = "linear" | "binary";

const getColorForState = (state: VisualState) => {
  switch (state) {
    case "active": 
      return "bg-indigo-100 border-indigo-500 text-indigo-900";
    case "found": 
      return "bg-green-100 border-green-500 text-green-900";
    case "outOfBounds": 
      return "bg-slate-100 border-slate-200 text-slate-300 opacity-50 grayscale";
    default: 
      return "bg-white border-slate-300 text-slate-700 hover:border-slate-400";
  }
};

export default function SearchingCanvas() {
  // --- States ---
  // Manual Interaction State
  const [baseArray, setBaseArray] = useState<number[]>([12, 24, 35, 47, 59, 62, 78, 85, 91]);
  const [customInput, setCustomInput] = useState<string>("");
  const [targetValue, setTargetValue] = useState<number>(59);
  const [activeAlgorithm, setActiveAlgorithm] = useState<SearchAlgorithmType>("binary");

  // Video Playback Engine State
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [history, setHistory] = useState<AlgorithmStep<SearchState>[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Speed Control
  const [speedLevel, setSpeedLevel] = useState<number>(3); 

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const CURRENT_USER_ID = "placeholder-student-id-123";
  const MAX_ELEMENTS = 20;

  // --- 1. Manual Controls & Custom Input ---
  const handleApplyCustomInput = () => {
    if (!customInput.trim()) return;
    
    let parsedArray = customInput
      .split(",")
      .map((str) => parseInt(str.trim(), 10))
      .filter((num) => !isNaN(num));

    if (parsedArray.length === 0) {
      alert("Please enter valid comma-separated numbers (e.g., 5, 12, 8, 99)");
      return;
    }

    if (parsedArray.length > MAX_ELEMENTS) {
      parsedArray.length = MAX_ELEMENTS;
    }
    
    // Sort automatically for binary search if selected
    if (activeAlgorithm === "binary") {
      parsedArray = parsedArray.sort((a, b) => a - b);
    }

    setBaseArray(parsedArray);
    setCustomInput("");
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SearchAlgorithmType;
    if (selected === "binary") {
      // Force sort the array if switching to binary
      setBaseArray([...baseArray].sort((a, b) => a - b));
    }
    setActiveAlgorithm(selected);
  };

  const handleGenerateRandom = () => {
    const newArr = Array.from({ length: 9 }, () => Math.floor(Math.random() * 100));
    if (activeAlgorithm === "binary") {
      newArr.sort((a, b) => a - b);
    }
    setBaseArray(newArr);
    setTargetValue(newArr[Math.floor(Math.random() * newArr.length)]);
  };

  // --- 2. Playback Engine Initialization ---
  const handleStartSearching = () => {
    let steps: AlgorithmStep<SearchState>[] = [];
    
    if (activeAlgorithm === "linear") {
      steps = generateLinearSearchSteps(baseArray, targetValue);
    } else {
      steps = generateBinarySearchSteps(baseArray, targetValue);
    }

    setHistory(steps);
    setCurrentFrame(0);
    setIsPlaybackMode(true);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaybackMode(false);
    setIsPlaying(false);
    setHistory([]);
    setCurrentFrame(0);
  };

  // --- 3. Time Travel & Speed Controls ---
  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const stepForward = () => {
    if (currentFrame < history.length - 1) setCurrentFrame(prev => prev + 1);
  };

  const stepBackward = () => {
    if (currentFrame > 0) setCurrentFrame(prev => prev - 1);
  };

  // --- 4. The Animation Loop ---
  useEffect(() => {
    const currentDelayMs = 1100 - (speedLevel * 100);

    if (isPlaying && currentFrame < history.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentFrame((prev) => prev + 1);
      }, currentDelayMs); 
    } else if (currentFrame >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentFrame, history, speedLevel]);

  // --- 5. Interactive Completion & Point of Failure Tracking ---
  useEffect(() => {
    if (isPlaybackMode && history.length > 0) {
      const frameData = history[currentFrame];
      // Explicit point-of-failure logging for the current state transition
      logger.info(`VISUALIZER RENDER [Frame ${currentFrame}]: ${frameData.logMessage || frameData.description}`);

      // Mark completion if we hit the last frame
      if (currentFrame === history.length - 1) {
        const visualizationId = `search-${activeAlgorithm}`;
        markVisualizationComplete(CURRENT_USER_ID, "searching", visualizationId)
          .catch((err) => {
            logger.error(`UI Point of Failure: Network exception while marking visualization complete.`, err);
          });
      }
    }
  }, [currentFrame, isPlaybackMode, activeAlgorithm, history]); // FIXED: Array size will strictly stay at 4 elements

  // --- 6. Visual Rendering Helpers ---
  const activeFrame = isPlaybackMode && history.length > 0 ? history[currentFrame] : null;
  const activeDescription = activeFrame ? activeFrame.description : "";
  
  // Render Data
  const renderArray = isPlaybackMode && activeFrame 
    ? activeFrame.snapshot.arraySnapshot 
    : baseArray.map((val, idx) => ({ id: `manual-${idx}`, value: val, state: "default" as VisualState }));
    
  const renderPointers = isPlaybackMode && activeFrame ? activeFrame.snapshot.pointers : {};

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
      <div className="flex flex-col items-center justify-center w-full max-w-4xl p-8 bg-slate-50 relative overflow-x-auto rounded-3xl border-2 border-dashed border-slate-200 shadow-inner min-h-[350px] transition-all duration-300">
        
        <div className="mb-12 flex flex-col items-center animate-in fade-in zoom-in">
          <span className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
            Target Value
          </span>
          <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold bg-amber-50 border-2 border-amber-400 text-amber-800 rounded-xl shadow-sm">
            {targetValue}
          </div>
        </div>

        {/* Array Container - Increased min-h and added pb-20 to prevent pointer clipping */}
        <div className="flex items-start space-x-3 relative min-h-[200px] px-8 pb-20">
          {renderArray.map((item, index) => {
            const isCurrent = renderPointers.current === index;
            const isLow = renderPointers.low === index;
            const isMid = renderPointers.mid === index;
            const isHigh = renderPointers.high === index;

            return (
              <div key={item.id} className="flex flex-col items-center group relative mt-4">
                
                {/* Array Box */}
                <div 
                  className={`w-14 h-14 flex items-center justify-center text-xl font-bold border-2 rounded-lg transition-all duration-300 shadow-sm
                    ${getColorForState(item.state)}
                    ${(isCurrent || isMid) ? 'scale-110 shadow-md z-10 border-indigo-400' : ''}
                  `}
                >
                  {item.value}
                </div>

                {/* Index Number */}
                <div className="text-xs text-slate-400 font-mono mt-3 font-semibold">
                  {index}
                </div>

                {/* Pointers Area - Pushed below the index to ensure complete visibility */}
                <div className="absolute top-[85px] flex flex-col items-center gap-1 w-full text-[10px] font-bold uppercase tracking-wider z-20">
                  {(isCurrent || isLow || isMid || isHigh) && (
                    <div className="text-slate-400 text-lg -mt-2 mb-1 leading-none">↑</div>
                  )}
                  {isCurrent && <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shadow-sm border border-indigo-100">Curr</span>}
                  {isLow && <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shadow-sm border border-blue-100">Low</span>}
                  {isMid && <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shadow-sm border border-amber-100">Mid</span>}
                  {isHigh && <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded shadow-sm border border-red-100">High</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Control Panel */}
      {!isPlaybackMode ? (
        <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
          
          <div className="flex w-full space-x-4">
            {/* Custom Input Field */}
            <div className="flex flex-1 items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <input 
                type="text" 
                placeholder={`Array: 12, 24, 35...`}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-4 py-2 outline-none text-slate-700 font-medium bg-transparent min-w-[150px]"
                onKeyDown={(e) => e.key === "Enter" && handleApplyCustomInput()}
              />
              <button 
                onClick={handleApplyCustomInput}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                Set Array
              </button>
            </div>
            
            {/* Target Input Field */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-48">
              <span className="text-slate-400 font-semibold pl-2">Target:</span>
              <input 
                type="number" 
                value={targetValue}
                onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                className="flex-1 w-full px-2 py-2 outline-none text-slate-700 font-bold bg-transparent text-center"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full">
            <button onClick={handleGenerateRandom} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors whitespace-nowrap">Randomize</button>
            
            {/* Algorithm Selector & Visualize Button */}
            <div className="flex bg-indigo-50 p-1 rounded-xl border border-indigo-100 shadow-sm">
              <select
                value={activeAlgorithm}
                onChange={handleAlgorithmChange}
                className="bg-transparent px-4 py-2 text-indigo-800 font-bold outline-none cursor-pointer"
              >
                <option value="linear">Linear Search</option>
                <option value="binary">Binary Search</option>
              </select>
              <button 
                onClick={handleStartSearching} 
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                ▶ Visualize
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Media Player Controls */}
          <div className="flex items-center space-x-4 bg-slate-900 p-2 rounded-2xl shadow-lg border border-slate-700">
            <button onClick={handleReset} className="px-4 py-2 text-rose-400 hover:bg-slate-800 rounded-lg font-medium transition-colors">Stop</button>
            <div className="w-px h-6 bg-slate-700 mx-2"></div>
            <button onClick={stepBackward} disabled={currentFrame === 0} className="px-4 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors">⏮ Prev</button>
            <button onClick={togglePlayPause} className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-lg shadow-md hover:bg-indigo-600 transition-colors w-24">
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button onClick={stepForward} disabled={currentFrame >= history.length - 1} className="px-4 py-2 text-slate-300 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors">Next ⏭</button>
          </div>

          {/* Animation Speed Slider */}
          <div className="flex items-center space-x-4 text-sm font-semibold text-slate-500 bg-white px-6 py-2 border border-slate-200 rounded-full shadow-sm">
            <span>Slow</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={speedLevel} 
              onChange={(e) => setSpeedLevel(Number(e.target.value))}
              className="w-32 accent-indigo-600 cursor-pointer"
            />
            <span>Fast</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
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