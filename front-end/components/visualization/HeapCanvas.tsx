"use client";

import { useState } from "react";
import { getSession } from "next-auth/react";
import { logger } from "../../lib/logger";
import { markVisualizationComplete } from "../../lib/actions/progress";

interface HeapElement {
  id: string;
  value: number;
  state: "default" | "active" | "swapping" | "new";
}

export default function HeapCanvas() {
  // --- States ---
  // Initializing with a valid Max-Heap
  const [heap, setHeap] = useState<HeapElement[]>([
    { id: "h-1", value: 90, state: "default" },
    { id: "h-2", value: 85, state: "default" },
    { id: "h-3", value: 70, state: "default" },
    { id: "h-4", value: 60, state: "default" },
    { id: "h-5", value: 45, state: "default" },
  ]);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const MAX_SIZE = 15; // Max depth of 4 levels (1, 2, 4, 8 nodes) to prevent overflow
  const CANVAS_WIDTH = 800;
  const LEVEL_HEIGHT = 80;

  // Mathematically calculate Tree coordinates based on Array Index
  const getCoords = (index: number) => {
    if (index === 0) return { x: CANVAS_WIDTH / 2, y: 70 };
    
    const level = Math.floor(Math.log2(index + 1));
    const nodesInLevel = Math.pow(2, level);
    const posInLevel = index - (nodesInLevel - 1);
    
    const spacing = CANVAS_WIDTH / nodesInLevel;
    const x = (posInLevel + 0.5) * spacing;
    const y = level * LEVEL_HEIGHT + 70;
    
    return { x, y };
  };

  // Animation Engine Executor
  const runFrames = (frames: HeapElement[][], delay: number = 600) => {
    let frameIdx = 0;
    const interval = setInterval(() => {
      if (frameIdx < frames.length) {
        setHeap(frames[frameIdx]);
        frameIdx++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, delay);
  };

  // --- Core Operations ---
  const handleInsert = () => {
    if (heap.length >= MAX_SIZE) {
      logger.warn(`Constraint Hit: Max Heap size of ${MAX_SIZE} reached.`);
      alert("Heap is full! Maximum depth reached.");
      return;
    }

    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Heap Engine: INSERT operation for value ${val}. Appending to array.`);
    setIsAnimating(true);
    setCustomValue("");

    const frames: HeapElement[][] = [];
    const workingHeap: HeapElement[] = heap.map(el => ({ ...el, state: "default" }));
    
    // Step 1: Add to end
    const newNode: HeapElement = { id: generateId(), value: val, state: "new" };
    workingHeap.push(newNode);
    frames.push(JSON.parse(JSON.stringify(workingHeap))); // Snapshot

    // Step 2: Bubble Up
    let currentIndex = workingHeap.length - 1;
    
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      
      // Highlight comparison
      workingHeap[currentIndex].state = "active";
      workingHeap[parentIndex].state = "active";
      frames.push(JSON.parse(JSON.stringify(workingHeap)));
      
      if (workingHeap[currentIndex].value > workingHeap[parentIndex].value) {
        logger.info(`Heap Engine: Bubble Up! Swapping ${workingHeap[currentIndex].value} with parent ${workingHeap[parentIndex].value}.`);
        
        // Highlight swap intent
        workingHeap[currentIndex].state = "swapping";
        workingHeap[parentIndex].state = "swapping";
        frames.push(JSON.parse(JSON.stringify(workingHeap)));
        
        // Perform Swap
        const temp = workingHeap[currentIndex];
        workingHeap[currentIndex] = workingHeap[parentIndex];
        workingHeap[parentIndex] = temp;
        
        // Reset states after swap
        workingHeap[currentIndex].state = "default";
        workingHeap[parentIndex].state = "new";
        frames.push(JSON.parse(JSON.stringify(workingHeap)));
        
        currentIndex = parentIndex;
      } else {
        logger.info(`Heap Engine: Heap property satisfied. Bubble Up complete.`);
        workingHeap[currentIndex].state = "default";
        workingHeap[parentIndex].state = "default";
        break;
      }
    }
    
    workingHeap.forEach(el => el.state = "default");
    frames.push(JSON.parse(JSON.stringify(workingHeap)));
    
    runFrames(frames);
  };

  const handleExtractMax = () => {
    if (heap.length === 0) return;
    
    getSession().then((session) => {
      if (session?.user?.id) {
        markVisualizationComplete(session.user.id, "heaps", "extract").catch(logger.error);
      }
    });
    
    logger.info(`Heap Engine: EXTRACT MAX operation. Removing Root (${heap[0].value}).`);
    setIsAnimating(true);
    
    const frames: HeapElement[][] = [];
    const workingHeap: HeapElement[] = heap.map(el => ({ ...el, state: "default" }));
    
    // Highlight Root
    workingHeap[0].state = "swapping";
    frames.push(JSON.parse(JSON.stringify(workingHeap)));

    if (workingHeap.length === 1) {
      frames.push([]);
      runFrames(frames);
      return;
    }

    // Step 1: Move last element to root
    const lastElement = workingHeap.pop()!;
    workingHeap[0] = { ...lastElement, state: "new" };
    frames.push(JSON.parse(JSON.stringify(workingHeap)));

    // Step 2: Bubble Down (Heapify)
    let currentIndex = 0;
    
    while (true) {
      const leftIndex = 2 * currentIndex + 1;
      const rightIndex = 2 * currentIndex + 2;
      let largestIndex = currentIndex;

      if (leftIndex < workingHeap.length && workingHeap[leftIndex].value > workingHeap[largestIndex].value) {
        largestIndex = leftIndex;
      }
      if (rightIndex < workingHeap.length && workingHeap[rightIndex].value > workingHeap[largestIndex].value) {
        largestIndex = rightIndex;
      }

      if (largestIndex !== currentIndex) {
        logger.info(`Heap Engine: Heapify Down! Swapping ${workingHeap[currentIndex].value} with larger child ${workingHeap[largestIndex].value}.`);
        
        // Highlight comparison
        workingHeap[currentIndex].state = "active";
        workingHeap[largestIndex].state = "active";
        frames.push(JSON.parse(JSON.stringify(workingHeap)));
        
        // Highlight swap
        workingHeap[currentIndex].state = "swapping";
        workingHeap[largestIndex].state = "swapping";
        frames.push(JSON.parse(JSON.stringify(workingHeap)));

        // Perform Swap
        const temp = workingHeap[currentIndex];
        workingHeap[currentIndex] = workingHeap[largestIndex];
        workingHeap[largestIndex] = temp;

        workingHeap[currentIndex].state = "default";
        workingHeap[largestIndex].state = "new";
        frames.push(JSON.parse(JSON.stringify(workingHeap)));

        currentIndex = largestIndex;
      } else {
        logger.info(`Heap Engine: Heap property satisfied. Heapify complete.`);
        break;
      }
    }

    workingHeap.forEach(el => el.state = "default");
    frames.push(JSON.parse(JSON.stringify(workingHeap)));
    
    runFrames(frames, 800); // Slightly slower for bubble down readability
  };

  const handleClear = () => {
    logger.info("UI State: User cleared the Heap.");
    setHeap([]);
  };

  // --- Graphic Design State Mapping ---
  const getNodeStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-amber-100 border-amber-500 shadow-amber-200 scale-110 z-20 ring-4 ring-amber-100 text-amber-900";
      case "swapping":
        return "bg-rose-500 border-rose-600 shadow-rose-200 scale-110 z-20 ring-4 ring-rose-200 text-white";
      case "new":
        return "bg-primary border-primary shadow-sm animate-in zoom-in duration-300 text-white z-10";
      default:
        return "bg-bg-card border-border-default shadow-sm hover:border-primary hover:text-primary hover:shadow-premium text-text-heading";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-text-heading">Max-Heap Visualizer</h3>
        <p className="text-sm text-text-secondary">Notice how the flat Array below maps perfectly to the Complete Binary Tree above.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center w-full bg-bg-main border-2 border-dashed border-border-default rounded-card shadow-inner overflow-hidden">
        
        {/* Top Section: The Tree Representation (Wrapped in scrollable container) */}
        <div className="w-full overflow-x-auto custom-scrollbar border-b-2 border-border-default bg-bg-card/50">
          <div className="relative w-[800px] mx-auto h-[420px] shrink-0">
            
            {/* Background Label */}
            <span className="absolute top-4 left-6 text-sm font-bold text-text-placeholder uppercase tracking-widest z-10">
              Logical Representation (Tree)
            </span>

            {heap.length > 0 && (
              <>
                {/* SVG Edge Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {heap.map((_, i) => {
                    if (i === 0) return null;
                    const parentIdx = Math.floor((i - 1) / 2);
                    const childCoords = getCoords(i);
                    const parentCoords = getCoords(parentIdx);
                    return (
                      <line 
                        key={`edge-${i}`} 
                        x1={parentCoords.x} y1={parentCoords.y} 
                        x2={childCoords.x} y2={childCoords.y} 
                        stroke="#cbd5e1" // slate-300
                        strokeWidth="3"
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </svg>

                {/* HTML Node Layer */}
                {heap.map((node, i) => {
                  const { x, y } = getCoords(i);
                  return (
                    <div 
                      key={node.id}
                      className={`absolute w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center font-black transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 cursor-default ${getNodeStyles(node.state)}`}
                      style={{ left: `${x}px`, top: `${y}px` }}
                    >
                      <span className="text-lg leading-none">{node.value}</span>
                      <span className="text-[10px] font-semibold opacity-60">[{i}]</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Bottom Section: The Array Representation */}
        <div className="w-full p-8 flex flex-col items-center overflow-x-auto custom-scrollbar">
          <span className="text-sm font-bold text-text-placeholder uppercase tracking-widest mb-4">
            Physical Representation (Array)
          </span>
          
          <div className="flex items-center space-x-2">
            {heap.length === 0 ? (
              <span className="text-text-placeholder font-medium">Heap is Empty</span>
            ) : (
              heap.map((node, i) => (
                <div key={`arr-${node.id}`} className="flex flex-col items-center space-y-2 shrink-0">
                  <span className="text-xs font-bold text-text-placeholder">[{i}]</span>
                  <div className={`w-14 h-14 border-2 rounded-btn flex items-center justify-center text-xl font-bold transition-all duration-300 ${getNodeStyles(node.state)}`}>
                    {node.value}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-sm w-full">
          <input 
            type="number" 
            placeholder={`Value (Max ${MAX_SIZE})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-48 px-4 py-2 border-2 border-border-default rounded-btn outline-none focus:border-primary text-text-heading font-medium transition-colors"
          />
          <button 
            onClick={handleInsert} disabled={isAnimating}
            className="px-8 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            Insert & Bubble Up
          </button>
          <button 
            onClick={handleExtractMax} disabled={isAnimating || heap.length === 0}
            className="px-8 py-2 bg-rose-50 text-rose-600 font-bold rounded-btn hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            Extract Max & Heapify
          </button>
          <button 
            onClick={handleClear} disabled={isAnimating || heap.length === 0}
            className="px-4 py-2 text-text-placeholder hover:text-text-heading transition-colors disabled:opacity-50 ml-auto"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}