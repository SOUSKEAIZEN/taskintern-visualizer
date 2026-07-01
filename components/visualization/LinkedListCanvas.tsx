"use client";

import { useState, useRef, useEffect } from "react";
import { logger } from "../../lib/logger";

interface LinkedListNode {
  id: string;
  value: number;
  state: "default" | "active" | "found" | "new";
}

type ListType = "singly" | "doubly" | "circular";

export default function LinkedListCanvas() {
  // --- States ---
  const [listType, setListType] = useState<ListType>("singly");
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
  const MAX_NODES = 20; // Constraint to prevent UI overflow

  const handleTypeChange = (type: ListType) => {
    logger.info(`UI State: User toggled Linked List architecture to ${type.toUpperCase()}`);
    setListType(type);
  };

  // --- Operations ---
  const handleAppend = () => {
    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot append. ${listType.toUpperCase()} List reached max size of ${MAX_NODES}.`);
      return;
    }
    
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: Appending new node with value ${val} to the tail of the ${listType} list.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [...prev, newNode]);
    setCustomValue("");
    
    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
    }, 1000);
  };

  const handlePrepend = () => {
    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot prepend. ${listType.toUpperCase()} List reached max size of ${MAX_NODES}.`);
      return;
    }

    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: Prepending new node with value ${val} to the head of the ${listType} list.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [newNode, ...prev]);
    setCustomValue("");

    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
    }, 1000);
  };

  const handlePop = () => {
    if (nodes.length === 0) {
      logger.error(`Memory Error: Attempted to pop from an empty ${listType} Linked List.`);
      return;
    }
    logger.info(`Memory Operation: Removing the tail node from the ${listType} list.`);
    setNodes((prev) => prev.slice(0, -1));
  };

  // --- Traversal Animation Engine ---
  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (isNaN(target) || nodes.length === 0 || isAnimating) return;

    logger.info(`Traversal Engine: Starting linear search in ${listType} list for value ${target}.`);
    setIsAnimating(true);
    let currentIndex = 0;

    const interval = setInterval(() => {
      setNodes((prev) => 
        prev.map((node, idx) => {
          if (idx === currentIndex) {
            return node.value === target ? { ...node, state: "found" } : { ...node, state: "active" };
          }
          return node.state === "found" ? node : { ...node, state: "default" };
        })
      );

      if (nodes[currentIndex].value === target) {
        logger.info(`Traversal Engine: Target ${target} found at node index ${currentIndex}. Stopping traversal.`);
        clearInterval(interval);
        setIsAnimating(false);
      } else if (currentIndex === nodes.length - 1) {
        logger.info(`Traversal Engine: Reached tail pointer. Target ${target} not found.`);
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
    <div className="flex flex-col items-center w-full space-y-8">
      
      {/* Educational Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-800 capitalize">{listType} Linked List</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {listType === "singly" && "Each node points only to the next memory address in sequence."}
          {listType === "doubly" && "Nodes contain pointers to both the Next and Previous memory addresses."}
          {listType === "circular" && "The Tail node's Next pointer loops directly back to the Head node."}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-slate-200/50 p-1 rounded-xl w-full max-w-md mx-auto relative z-10 border border-slate-200 shadow-inner">
        {(["singly", "doubly", "circular"] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            disabled={isAnimating}
            className={`flex-1 py-2 text-sm font-bold capitalize rounded-lg transition-all duration-300 ${
              listType === type 
                ? "bg-white text-indigo-700 shadow border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/80 disabled:opacity-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* The Visual Canvas */}
      <div className="flex items-start justify-start p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[260px] w-full shadow-inner overflow-x-auto custom-scrollbar">
        
        {nodes.length === 0 ? (
          <div className="w-full flex justify-center text-slate-400 font-medium text-lg mt-10">
            <span>Empty List (Head points to Null)</span>
          </div>
        ) : (
          <div className="flex items-start min-w-max pb-4 px-4">
            
            {nodes.map((node, index) => (
              <div key={node.id} className="flex flex-col items-center transition-all duration-500">
                
                {/* Structural Spacer for Head Pointer */}
                <div className="h-14 flex flex-col items-center justify-end pb-2">
                  {index === 0 && (
                    <div className="flex flex-col items-center text-indigo-500 animate-in fade-in slide-in-from-top-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Head</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  {/* Node Box */}
                  <div className={`flex border-2 rounded-xl h-20 transition-all duration-300 ${getNodeStyles(node.state)}`}>
                    
                    {/* Prev Field (Doubly Only) */}
                    {listType === "doubly" && (
                      <div className="w-10 h-full flex flex-col items-center justify-center bg-slate-100/50 rounded-l-lg border-r-2 border-inherit relative">
                        <span className="text-[10px] font-bold text-slate-400 mb-1">Prev</span>
                        <div className="w-3 h-3 rounded-full bg-slate-400 mt-1"></div>
                      </div>
                    )}

                    {/* Data Field */}
                    <div className={`w-16 h-full flex flex-col items-center justify-center border-r-2 border-inherit bg-white/50 ${listType !== 'doubly' ? 'rounded-l-lg' : ''}`}>
                      <span className="text-xs font-semibold text-slate-400 mb-1">Data</span>
                      <span className="text-2xl font-black text-slate-700">{node.value}</span>
                    </div>
                    
                    {/* Next Pointer Field */}
                    <div className="w-10 h-full flex flex-col items-center justify-center bg-slate-100/50 rounded-r-lg relative">
                      <span className="text-[10px] font-bold text-slate-400 mb-1">Next</span>
                      <div className="w-3 h-3 rounded-full bg-slate-400 mt-1"></div>
                    </div>
                  </div>

                  {/* Connecting Arrow */}
                  <div className="flex items-center px-2">
                    {listType === "doubly" ? (
                      // Bidirectional Arrow
                      <div className="flex items-center text-slate-400">
                        <svg className="w-4 h-4 -mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <div className="w-6 h-1 bg-slate-400"></div>
                        <svg className="w-4 h-4 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    ) : (
                      // Unidirectional Arrow
                      <div className="flex items-center text-slate-400">
                        <div className="w-8 h-1 bg-slate-400 rounded-full"></div>
                        <svg className="w-4 h-4 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Terminator Block */}
            {listType === "circular" ? (
              <div className="flex flex-col items-center justify-center h-20 px-4 border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-xl mt-14 shadow-sm animate-in fade-in">
                <span className="text-indigo-600 font-bold text-xs uppercase tracking-wider flex flex-col items-center space-y-1">
                  <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Loops to Head</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 px-4 border-2 border-dashed border-rose-300 bg-rose-50 rounded-xl mt-14 animate-in fade-in">
                <span className="text-rose-500 font-bold font-mono">null</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        
        {/* Row 1: Insertions */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
          <input 
            type="number" 
            placeholder={`Node Value (Max ${MAX_NODES})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-48 px-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 text-slate-700 font-medium transition-colors"
          />
          <button 
            onClick={handlePrepend} disabled={isAnimating}
            className="px-5 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Insert Head
          </button>
          <button 
            onClick={handleAppend} disabled={isAnimating}
            className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Insert Tail
          </button>
          <button 
            onClick={handlePop} disabled={isAnimating}
            className="px-5 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50 ml-auto whitespace-nowrap"
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
            className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            ▶ Animate Search
          </button>
          <button 
            onClick={handleResetVisuals} 
            disabled={isAnimating}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors whitespace-nowrap"
          >
            Reset Colors
          </button>
        </div>

      </div>
    </div>
  );
}