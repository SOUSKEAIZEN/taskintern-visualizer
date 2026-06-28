"use client";

import { useState, useRef, useEffect } from "react";
import { logger } from "../../lib/logger";

interface LinkedListNode {
  id: string;
  value: number;
  state: "default" | "active" | "found" | "new";
}

export default function LinkedListCanvas() {
  // --- States ---
  const [nodes, setNodes] = useState<LinkedListNode[]>([
    { id: "node-1", value: 14, state: "default" },
    { id: "node-2", value: 85, state: "default" },
    { id: "node-3", value: 33, state: "default" },
  ]);
  const [customValue, setCustomValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const MAX_NODES = 7; // Constraint to prevent UI overflow

  // --- Operations ---
  const handleAppend = () => {
    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot append. Linked List reached max size of ${MAX_NODES}.`);
      return;
    }
    
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: Appending new node with value ${val} to the tail.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [...prev, newNode]);
    setCustomValue("");
    
    // Clear the "new" highlight after a short delay
    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
    }, 1000);
  };

  const handlePrepend = () => {
    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot prepend. Linked List reached max size of ${MAX_NODES}.`);
      return;
    }

    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: Prepending new node with value ${val} to the head. Reassigning head pointer.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [newNode, ...prev]);
    setCustomValue("");

    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
    }, 1000);
  };

  const handlePop = () => {
    if (nodes.length === 0) {
      logger.error("Memory Error: Attempted to pop from an empty Linked List.");
      return;
    }
    logger.info(`Memory Operation: Removing the tail node.`);
    setNodes((prev) => prev.slice(0, -1));
  };

  // --- Traversal Animation Engine ---
  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (isNaN(target) || nodes.length === 0 || isAnimating) return;

    logger.info(`Traversal Engine: Starting linear search for value ${target}.`);
    setIsAnimating(true);
    let currentIndex = 0;

    const interval = setInterval(() => {
      setNodes((prev) => 
        prev.map((node, idx) => {
          if (idx === currentIndex) {
            return node.value === target ? { ...node, state: "found" } : { ...node, state: "active" };
          }
          // Reset previous nodes unless they were the found node
          return node.state === "found" ? node : { ...node, state: "default" };
        })
      );

      if (nodes[currentIndex].value === target) {
        logger.info(`Traversal Engine: Target ${target} found at node index ${currentIndex}. Stopping traversal.`);
        clearInterval(interval);
        setIsAnimating(false);
      } else if (currentIndex === nodes.length - 1) {
        logger.info(`Traversal Engine: Reached null terminator. Target ${target} not found in the list.`);
        clearInterval(interval);
        setTimeout(() => {
          setNodes((prev) => prev.map(n => n.state === "active" ? { ...n, state: "default" } : n));
          setIsAnimating(false);
        }, 1000);
      } else {
        logger.info(`Traversal Engine: Moving pointer to next node.`);
        currentIndex++;
      }
    }, 800);
  };

  const handleResetVisuals = () => {
    logger.info("UI State: Resetting node visual states to default.");
    setNodes((prev) => prev.map(n => ({ ...n, state: "default" })));
    setSearchValue("");
  };

  // --- Graphic Design State Mapping ---
  const getNodeStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-amber-100 border-amber-500 shadow-amber-200 scale-105 z-10 ring-4 ring-amber-100";
      case "found":
        return "bg-emerald-100 border-emerald-500 shadow-emerald-200 scale-110 z-10 ring-4 ring-emerald-100";
      case "new":
        return "bg-indigo-50 border-indigo-500 shadow-indigo-200 animate-in zoom-in duration-300";
      default:
        return "bg-white border-slate-300 shadow-sm hover:border-slate-400";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Singly Linked List</h3>
        <p className="text-sm text-slate-500">Notice how each node points to the next memory address.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[220px] w-full shadow-inner overflow-x-auto custom-scrollbar">
        
        {nodes.length === 0 ? (
          <div className="text-slate-400 font-medium text-lg flex items-center space-x-2">
            <span>Empty List (Head points to Null)</span>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            
            {/* Head Pointer Indicator */}
            <div className="flex flex-col items-center space-y-2 -mt-12">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Head</span>
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>

            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center transition-all duration-500">
                
                {/* Node Box (Data | Next) */}
                <div className={`flex border-2 rounded-xl h-20 transition-all duration-300 ${getNodeStyles(node.state)}`}>
                  
                  {/* Data Field */}
                  <div className="w-16 h-full flex flex-col items-center justify-center border-r-2 border-inherit bg-white/50 rounded-l-lg">
                    <span className="text-xs font-semibold text-slate-400 mb-1">Data</span>
                    <span className="text-2xl font-black text-slate-700">{node.value}</span>
                  </div>
                  
                  {/* Pointer Field */}
                  <div className="w-10 h-full flex flex-col items-center justify-center bg-slate-100/50 rounded-r-lg relative">
                    <span className="text-[10px] font-bold text-slate-400 mb-1">Next</span>
                    <div className="w-3 h-3 rounded-full bg-slate-400 mt-1"></div>
                  </div>
                </div>

                {/* The Arrow (Pointer) connecting to the next node */}
                <div className="flex items-center px-2">
                  <div className="w-8 h-1 bg-slate-400 rounded-full"></div>
                  <svg className="w-4 h-4 text-slate-400 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}

            {/* Null Terminator */}
            <div className="flex flex-col items-center justify-center h-20 px-4 border-2 border-dashed border-rose-300 bg-rose-50 rounded-xl">
              <span className="text-rose-500 font-bold font-mono">null</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        
        {/* Row 1: Insertions */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
          <input 
            type="number" 
            placeholder="Node Value (e.g. 42)"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-48 px-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 text-slate-700 font-medium transition-colors"
          />
          <button 
            onClick={handlePrepend} disabled={isAnimating}
            className="px-5 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            Insert Head
          </button>
          <button 
            onClick={handleAppend} disabled={isAnimating}
            className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Insert Tail
          </button>
          <button 
            onClick={handlePop} disabled={isAnimating}
            className="px-5 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50 ml-auto"
          >
            Delete Tail
          </button>
        </div>

        {/* Row 2: Traversal Engine */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-lg w-full">
          <span className="text-slate-300 font-semibold px-2">Traversal Engine:</span>
          <input 
            type="number" 
            placeholder="Search Target..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isAnimating}
            className="w-40 px-4 py-2 bg-slate-800 border-2 border-slate-600 rounded-xl outline-none focus:border-emerald-400 text-white font-medium transition-colors placeholder:text-slate-500"
          />
          <button 
            onClick={handleSearch} 
            disabled={isAnimating || !searchValue}
            className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            ▶ Animate Search
          </button>
          <button 
            onClick={handleResetVisuals} 
            disabled={isAnimating}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Reset Colors
          </button>
        </div>

      </div>
    </div>
  );
}