"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AlgorithmStep, HashMapState, VisualState, HashNode } from '../../types/dsa';
import { logger } from '../../lib/logger';
import { markVisualizationComplete } from '../../lib/actions/progress';
import { generateHashMapSteps, HashOperation } from '../../lib/algorithms/hashmaps';

const getColorForState = (state: VisualState) => {
  switch (state) {
    case "active": 
      return "bg-primary/10 border-primary text-primary shadow-premium scale-105 z-10";
    case "found": 
      return "bg-green-100 border-green-500 text-green-900 shadow-premium scale-105 z-10";
    default: 
      return "bg-bg-card border-border-default text-text-heading hover:border-slate-400";
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
          <p className="text-lg font-medium text-text-heading bg-bg-main px-6 py-2 rounded-full border border-border-default animate-in fade-in slide-in-from-bottom-2">
            {activeDescription}
          </p>
        )}
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center justify-start w-full max-w-4xl p-8 bg-bg-main relative overflow-hidden rounded-card border-2 border-dashed border-border-default shadow-inner min-h-[500px] transition-all duration-300">
        
        {isPlaybackMode && stateSnapshot ? (
          <div className="w-full flex flex-col items-center animate-in fade-in">
            
            {/* Hash Calculation HUD */}
            <div className="flex items-center space-x-6 mb-12 bg-bg-card p-4 rounded-card shadow-sm border border-border-default">
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-text-placeholder uppercase tracking-widest mb-1">Current Key</span>
                <span className="text-xl font-bold text-text-heading">{stateSnapshot.currentKey || "None"}</span>
              </div>
              <div className="text-text-secondary text-2xl font-light">→</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-text-placeholder uppercase tracking-widest mb-1">Raw Hash</span>
                <span className="text-xl font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-btn">
                  {stateSnapshot.hashValue !== null ? stateSnapshot.hashValue : "---"}
                </span>
              </div>
              <div className="text-text-secondary text-2xl font-light">→</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-text-placeholder uppercase tracking-widest mb-1">Modulo Math</span>
                <span className="text-md font-mono text-text-secondary">
                  {stateSnapshot.hashValue !== null ? `${stateSnapshot.hashValue} % ${TABLE_SIZE}` : "---"}
                </span>
              </div>
              <div className="text-text-secondary text-2xl font-light">=</div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-text-placeholder uppercase tracking-widest mb-1">Bucket Index</span>
                <span className={`text-2xl font-bold rounded-btn px-4 py-1 border-2 
                  ${stateSnapshot.targetBucket !== null ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-bg-main border-border-default text-text-placeholder'}`}>
                  {stateSnapshot.targetBucket !== null ? stateSnapshot.targetBucket : "-"}
                </span>
              </div>
            </div>

            {/* Buckets & Chains Rendering */}
            <div className="w-full max-w-2xl space-y-4">
              {stateSnapshot.buckets.map((bucket, bIndex) => {
                const isTargetBucket = stateSnapshot.targetBucket === bIndex;
                
                return (
                  <div key={`bucket-${bIndex}`} className={`flex items-center min-h-[60px] p-2 rounded-btn transition-colors duration-300 ${isTargetBucket ? 'bg-amber-50/50' : 'bg-bg-card'}`}>
                    
                    {/* Bucket Header */}
                    <div className={`flex items-center justify-center w-16 h-16 rounded-btn border-2 font-mono text-xl font-bold shadow-sm transition-colors z-10
                      ${isTargetBucket ? 'bg-amber-100 border-amber-500 text-amber-900 scale-105' : 'bg-bg-main border-border-default text-text-secondary'}`}>
                      {bIndex}
                    </div>

                    <div className="w-8 h-1 bg-slate-200 rounded-full mx-2"></div>

                    {/* Separate Chaining Array */}
                    <div className="flex flex-1 items-center space-x-3 overflow-x-auto pb-2 custom-scrollbar">
                      {bucket.length === 0 ? (
                        <span className="text-text-secondary text-sm font-medium italic px-4">empty</span>
                      ) : (
                        bucket.map((node, nIndex) => (
                          <React.Fragment key={node.id}>
                            {nIndex > 0 && <span className="text-text-secondary font-bold text-lg">→</span>}
                            <div className={`flex flex-col items-center justify-center px-4 py-2 border-2 rounded-btn transition-all duration-300 bg-bg-card
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
             <p className="text-text-secondary font-medium text-lg max-w-sm">
               Add operations to the queue below and click Visualize to see how Hash Maps handle keys, hashes, and collisions using Separate Chaining.
             </p>
          </div>
        )}
      </div>

      {/* Dynamic Control Panel */}
      {!isPlaybackMode ? (
        <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
          
          {/* Operation Builder */}
          <div className="flex w-full space-x-3 bg-bg-card p-3 rounded-card border border-border-default shadow-sm">
            <select
              value={opType}
              onChange={(e) => setOpType(e.target.value as any)}
              className="px-4 py-2 bg-bg-main border border-border-default rounded-btn text-text-heading font-bold outline-none cursor-pointer"
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
              className="flex-1 px-4 py-2 bg-bg-main border border-border-default rounded-btn outline-none text-text-heading font-medium"
              onKeyDown={(e) => e.key === "Enter" && handleAddOperation()}
            />
            
            <input 
              type="text" 
              placeholder="Value"
              value={opVal}
              disabled={opType !== "insert"}
              onChange={(e) => setOpVal(e.target.value)}
              className="w-32 px-4 py-2 bg-bg-main border border-border-default rounded-btn outline-none text-text-heading font-medium disabled:opacity-50"
              onKeyDown={(e) => e.key === "Enter" && handleAddOperation()}
            />
            
            <button 
              onClick={handleAddOperation}
              className="px-6 py-2 bg-bg-main text-white font-bold rounded-btn hover:bg-bg-card transition-colors whitespace-nowrap"
            >
              + Queue
            </button>
          </div>

          {/* Queue Viewer & Actions */}
          <div className="w-full flex items-start space-x-6">
            <div className="flex-1 bg-bg-main border border-border-default rounded-card p-4 min-h-[120px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-text-placeholder uppercase tracking-widest">Operation Queue</span>
                <button onClick={handleClearOperations} className="text-xs font-bold text-rose-500 hover:text-rose-700 uppercase">Clear All</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {operationsQueue.map((op, i) => (
                  <div key={i} className={`text-xs font-mono font-bold px-3 py-1.5 rounded-btn border flex items-center space-x-2
                    ${op.type === 'insert' ? 'bg-accent-success/10 border-emerald-200 text-emerald-800' : 
                      op.type === 'search' ? 'bg-primary/10 border-primary/20 text-primary' : 
                      'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <span className="uppercase">{op.type}</span>
                    <span className="text-text-placeholder">|</span>
                    <span>{op.key}</span>
                    {op.type === 'insert' && <><span className="text-text-placeholder">→</span><span>{op.value}</span></>}
                  </div>
                ))}
                {operationsQueue.length === 0 && <span className="text-text-placeholder text-sm italic">Queue is empty...</span>}
              </div>
            </div>

            <button 
              onClick={handleStartVisualization} 
              className="h-[120px] px-8 bg-primary text-white font-extrabold rounded-card shadow hover:bg-primary-hover hover:shadow-premium transition-all text-lg flex flex-col items-center justify-center space-y-2"
            >
              <span className="text-3xl">▶</span>
              <span>Visualize</span>
            </button>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Media Player Controls */}
          <div className="flex items-center space-x-4 bg-bg-card p-2 rounded-card shadow-premium border border-border-default">
            <button onClick={handleReset} className="px-4 py-2 text-rose-400 hover:bg-bg-main rounded-btn font-medium transition-colors">Stop</button>
            <div className="w-px h-6 bg-slate-700 mx-2"></div>
            <button onClick={stepBackward} disabled={currentFrame === 0} className="px-4 py-2 text-text-secondary hover:bg-bg-main disabled:opacity-50 rounded-btn transition-colors">⏮ Prev</button>
            <button onClick={togglePlayPause} className="px-6 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary transition-colors w-24">
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button onClick={stepForward} disabled={currentFrame >= history.length - 1} className="px-4 py-2 text-text-secondary hover:bg-bg-main disabled:opacity-50 rounded-btn transition-colors">Next ⏭</button>
          </div>

          {/* Animation Speed Slider */}
          <div className="flex items-center space-x-4 text-sm font-semibold text-text-secondary bg-bg-card px-6 py-2 border border-border-default rounded-full shadow-sm">
            <span>Slow</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={speedLevel} 
              onChange={(e) => setSpeedLevel(Number(e.target.value))}
              className="w-32 accent-primary cursor-pointer"
            />
            <span>Fast</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isPlaybackMode && (
        <div className="w-full max-w-2xl bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
          <div 
            className="bg-primary h-full transition-all duration-300" 
            style={{ width: `${((currentFrame + 1) / history.length) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}