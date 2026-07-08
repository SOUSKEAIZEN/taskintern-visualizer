"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmStep, HashMapState, VisualState, HashNode } from '../../types/dsa';
import { logger } from '../../lib/logger';
import { markVisualizationComplete } from '../../lib/actions/progress';
import { generateHashMapSteps, HashOperation } from '../../lib/algorithms/hashmaps';

const getColorForState = (state: VisualState) => {
  switch (state) {
    case "active": 
      return "bg-indigo-100 border-indigo-500 text-indigo-900 shadow-md scale-105 z-10";
    case "found": 
      return "bg-green-100 border-green-500 text-green-900 shadow-md scale-105 z-10";
    default: 
      return "bg-white border-slate-300 text-slate-700 hover:border-slate-400";
  }
};

export default function HashMapCanvas() {
  const TABLE_SIZE = 5; // Fixed for visual simplicity

  // --- States ---
  // Setup State
  const [operationsQueue, setOperationsQueue] = useState<HashOperation[]>([
    { type: "insert", key: "apple", value: 100 },
    { type: "insert", key: "banana", value: 200 },
    { type: "insert", key: "peach", value: 300 }, // Forces a collision with a table size of 5
    { type: "search", key: "apple" },
  ]);
  
  const [opType, setOpType] = useState<"insert" | "search" | "delete">("insert");
  const [opKey, setOpKey] = useState<string>("");
  const [opVal, setOpVal] = useState<string>("");

  // Playback Engine State
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [history, setHistory] = useState<AlgorithmStep<HashMapState>[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedLevel, setSpeedLevel] = useState<number>(3); 

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const CURRENT_USER_ID = "placeholder-student-id-123";

  // --- 1. Manual Controls ---
  const handleAddOperation = () => {
    if (!opKey.trim()) {
      alert("Key cannot be empty.");
      return;
    }
    setOperationsQueue([...operationsQueue, { 
      type: opType, 
      key: opKey.trim(), 
      value: opType === "insert" ? opVal.trim() : undefined 
    }]);
    setOpKey("");
    setOpVal("");
  };

  const handleClearOperations = () => setOperationsQueue([]);

  // --- 2. Playback Engine Initialization ---
  const handleStartVisualization = () => {
    if (operationsQueue.length === 0) {
      alert("Please add at least one operation to the queue.");
      return;
    }
    const steps = generateHashMapSteps(TABLE_SIZE, operationsQueue);
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

  // --- 3. Time Travel Controls ---
  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const stepForward = () => { if (currentFrame < history.length - 1) setCurrentFrame(prev => prev + 1); };
  const stepBackward = () => { if (currentFrame > 0) setCurrentFrame(prev => prev - 1); };

  // --- 4. The Animation Loop ---
  useEffect(() => {
    const currentDelayMs = 1500 - (speedLevel * 120);

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

  // --- 5. Logging & Completion Tracking ---
  useEffect(() => {
    if (isPlaybackMode && history.length > 0) {
      const frameData = history[currentFrame];
      logger.info(`VISUALIZER RENDER [Frame ${currentFrame}]: ${frameData.logMessage || frameData.description}`);

      if (currentFrame === history.length - 1) {
        markVisualizationComplete(CURRENT_USER_ID, "hashmaps", "hashmap-chaining")
          .catch((err) => {
            logger.error(`UI Point of Failure: Network exception while marking visualization complete.`, err);
          });
      }
    }
  }, [currentFrame, isPlaybackMode, history]);

  // --- 6. Visual Data Resolution ---
  const activeFrame = isPlaybackMode && history.length > 0 ? history[currentFrame] : null;
  const activeDescription = activeFrame ? activeFrame.description : "";
  const stateSnapshot = activeFrame?.snapshot;

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      
      {/* Narrative Text */}
      <div className="h-12 flex items-center justify-center w-full">
        {isPlaybackMode && (
          <p className="text-lg font-medium text-slate-700 bg-slate-100 px-6 py-2 rounded-full border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
            {activeDescription}
          </p>
        )}
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center justify-start w-full max-w-4xl p-8 bg-slate-50 relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 shadow-inner min-h-[500px] transition-all duration-300">
        
        {isPlaybackMode && stateSnapshot ? (
          <div className="w-full flex flex-col items-center animate-in fade-in">
            
            {/* Hash Calculation HUD */}
            <div className="flex items-center space-x-6 mb-12 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Key</span>
                <span className="text-xl font-bold text-slate-800">{stateSnapshot.currentKey || "None"}</span>
              </div>
              <div className="text-slate-300 text-2xl font-light">→</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Raw Hash</span>
                <span className="text-xl font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {stateSnapshot.hashValue !== null ? stateSnapshot.hashValue : "---"}
                </span>
              </div>
              <div className="text-slate-300 text-2xl font-light">→</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Modulo Math</span>
                <span className="text-md font-mono text-slate-600">
                  {stateSnapshot.hashValue !== null ? `${stateSnapshot.hashValue} % ${TABLE_SIZE}` : "---"}
                </span>
              </div>
              <div className="text-slate-300 text-2xl font-light">=</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Bucket Index</span>
                <span className={`text-2xl font-bold rounded-lg px-4 py-1 border-2 
                  ${stateSnapshot.targetBucket !== null ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {stateSnapshot.targetBucket !== null ? stateSnapshot.targetBucket : "-"}
                </span>
              </div>
            </div>

            {/* Buckets & Chains Rendering */}
            <div className="w-full max-w-2xl space-y-4">
              {stateSnapshot.buckets.map((bucket, bIndex) => {
                const isTargetBucket = stateSnapshot.targetBucket === bIndex;
                
                return (
                  <div key={`bucket-${bIndex}`} className={`flex items-center min-h-[60px] p-2 rounded-xl transition-colors duration-300 ${isTargetBucket ? 'bg-amber-50/50' : 'bg-white'}`}>
                    
                    {/* Bucket Header */}
                    <div className={`flex items-center justify-center w-16 h-16 rounded-xl border-2 font-mono text-xl font-bold shadow-sm transition-colors z-10
                      ${isTargetBucket ? 'bg-amber-100 border-amber-500 text-amber-900 scale-105' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                      {bIndex}
                    </div>

                    <div className="w-8 h-1 bg-slate-200 rounded-full mx-2"></div>

                    {/* Separate Chaining Array */}
                    <div className="flex flex-1 items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                      {bucket.length === 0 ? (
                        <span className="text-slate-300 text-sm font-medium italic px-4">empty</span>
                      ) : (
                        bucket.map((node, nIndex) => (
                          <React.Fragment key={node.id}>
                            {nIndex > 0 && <span className="text-slate-300 font-bold text-lg">→</span>}
                            <div className={`flex flex-col items-center justify-center px-4 py-2 border-2 rounded-xl transition-all duration-300 bg-white
                              ${getColorForState(node.state)}`}>
                              <span className="text-sm font-bold truncate max-w-[80px]">{node.key}</span>
                              <span className="text-xs font-mono opacity-80 border-t border-current pt-1 mt-1 w-full text-center truncate max-w-[80px]">{node.value}</span>
                            </div>
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full opacity-60 text-center animate-in zoom-in-95">
             <div className="w-24 h-24 mb-4 text-7xl">🗄️</div>
             <p className="text-slate-500 font-medium text-lg max-w-sm">
               Add operations to the queue below and click Visualize to see how Hash Maps handle keys, hashes, and collisions using Separate Chaining.
             </p>
          </div>
        )}
      </div>

      {/* Dynamic Control Panel */}
      {!isPlaybackMode ? (
        <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
          
          {/* Operation Builder */}
          <div className="flex w-full space-x-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <select
              value={opType}
              onChange={(e) => setOpType(e.target.value as any)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value="insert">Insert</option>
              <option value="search">Search</option>
              <option value="delete">Delete</option>
            </select>
            
            <input 
              type="text" 
              placeholder="Key (e.g. apple)"
              value={opKey}
              onChange={(e) => setOpKey(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
              onKeyDown={(e) => e.key === "Enter" && handleAddOperation()}
            />
            
            <input 
              type="text" 
              placeholder="Value"
              value={opVal}
              disabled={opType !== "insert"}
              onChange={(e) => setOpVal(e.target.value)}
              className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium disabled:opacity-50"
              onKeyDown={(e) => e.key === "Enter" && handleAddOperation()}
            />
            
            <button 
              onClick={handleAddOperation}
              className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors whitespace-nowrap"
            >
              + Queue
            </button>
          </div>

          {/* Queue Viewer & Actions */}
          <div className="w-full flex items-start space-x-6">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[120px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operation Queue</span>
                <button onClick={handleClearOperations} className="text-xs font-bold text-rose-500 hover:text-rose-700 uppercase">Clear All</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {operationsQueue.map((op, i) => (
                  <div key={i} className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border flex items-center space-x-2
                    ${op.type === 'insert' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
                      op.type === 'search' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 
                      'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <span className="uppercase">{op.type}</span>
                    <span className="text-slate-400">|</span>
                    <span>{op.key}</span>
                    {op.type === 'insert' && <><span className="text-slate-400">→</span><span>{op.value}</span></>}
                  </div>
                ))}
                {operationsQueue.length === 0 && <span className="text-slate-400 text-sm italic">Queue is empty...</span>}
              </div>
            </div>

            <button 
              onClick={handleStartVisualization} 
              className="h-[120px] px-8 bg-indigo-600 text-white font-extrabold rounded-2xl shadow hover:bg-indigo-700 hover:shadow-lg transition-all text-lg flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-3xl">▶</span>
              <span>Visualize</span>
            </button>
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