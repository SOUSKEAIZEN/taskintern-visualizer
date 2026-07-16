"use client";

import { useState, useRef, useEffect } from "react";
import { getSession } from "next-auth/react";
import { logger } from "../../lib/logger";
import { markVisualizationComplete } from "../../lib/actions/progress";

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
    if (!customValue || isAnimating) return;
    setIsAnimating(true);
    logger.info(`Linked List Engine: Appending value ${customValue}`);
    
    getSession().then((session) => {
      if (session?.user?.id) {
        markVisualizationComplete(session.user.id, "linked-lists", "append").catch(logger.error);
      }
    });

    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot append. ${listType.toUpperCase()} List reached max size of ${MAX_NODES}.`);
      setIsAnimating(false);
      return;
    }
    
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) { setIsAnimating(false); return; }

    logger.info(`Memory Operation: Appending new node with value ${val} to the tail of the ${listType} list.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [...prev, newNode]);
    setCustomValue("");
    
    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
      setIsAnimating(false);
    }, 1000);
  };

  const handlePrepend = () => {
    if (!customValue || isAnimating) return;
    setIsAnimating(true);
    logger.info(`Linked List Engine: Prepending value ${customValue}`);
    
    getSession().then((session) => {
      if (session?.user?.id) {
        markVisualizationComplete(session.user.id, "linked-lists", "prepend").catch(logger.error);
      }
    });

    if (nodes.length >= MAX_NODES) {
      logger.warn(`Constraint Hit: Cannot prepend. ${listType.toUpperCase()} List reached max size of ${MAX_NODES}.`);
      setIsAnimating(false);
      return;
    }

    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) { setIsAnimating(false); return; }

    logger.info(`Memory Operation: Prepending new node with value ${val} to the head of the ${listType} list.`);
    const newNode: LinkedListNode = { id: generateId(), value: val, state: "new" };
    
    setNodes((prev) => [newNode, ...prev]);
    setCustomValue("");

    setTimeout(() => {
      setNodes((prev) => prev.map(n => n.id === newNode.id ? { ...n, state: "default" } : n));
      setIsAnimating(false);
    }, 1000);
  };

  const handlePop = () => {
    if (nodes.length === 0 || isAnimating) return;
    setIsAnimating(true);
    logger.info(`Linked List Engine: Popping end node.`);
    
    getSession().then((session) => {
      if (session?.user?.id) {
        markVisualizationComplete(session.user.id, "linked-lists", "pop").catch(logger.error);
      }
    });

    logger.info(`Memory Operation: Removing the tail node from the ${listType} list.`);
    setNodes((prev) => prev.slice(0, -1));
    setIsAnimating(false);
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
        return "bg-accent-success/10 border-emerald-500 shadow-emerald-200 scale-110 z-10 ring-4 ring-emerald-100";
      case "new":
        return "bg-primary/10 border-primary shadow-sm animate-in zoom-in duration-300";
      default:
        return "bg-bg-card border-border-default shadow-sm hover:border-slate-400";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      
      {/* Educational Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-text-heading capitalize">{listType} Linked List</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          {listType === "singly" && "Each node points only to the next memory address in sequence."}
          {listType === "doubly" && "Nodes contain pointers to both the Next and Previous memory addresses."}
          {listType === "circular" && "The Tail node's Next pointer loops directly back to the Head node."}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-border-default/50 p-1 rounded-btn w-full max-w-md mx-auto relative z-10 border border-border-default shadow-inner">
        {(["singly", "doubly", "circular"] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            disabled={isAnimating}
            className={`flex-1 py-2 text-sm font-bold capitalize rounded-btn transition-all duration-300 ${
              listType === type 
                ? "bg-bg-card text-primary shadow border border-border-default/50" 
                : "text-text-secondary hover:text-text-heading hover:bg-border-default/80 disabled:opacity-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* The Visual Canvas */}
      <div className="flex items-start justify-start p-8 bg-bg-main border-2 border-dashed border-border-default rounded-card min-h-[260px] w-full shadow-inner overflow-x-auto custom-scrollbar">
        
        {nodes.length === 0 ? (
          <div className="w-full flex justify-center text-text-placeholder font-medium text-lg mt-10">
            <span>Empty List (Head points to Null)</span>
          </div>
        ) : (
          <div className="flex items-start min-w-max pb-4 px-4">
            
            {nodes.map((node, index) => (
              <div key={node.id} className="flex flex-col items-center transition-all duration-500">
                
                {/* Structural Spacer for Head Pointer */}
                <div className="h-14 flex flex-col items-center justify-end pb-2">
                  {index === 0 && (
                    <div className="flex flex-col items-center text-primary animate-in fade-in slide-in-from-top-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Head</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  {/* Node Box */}
                  <div className={`flex border-2 rounded-btn h-20 transition-all duration-300 ${getNodeStyles(node.state)}`}>
                    
                    {/* Prev Field (Doubly Only) */}
                    {listType === "doubly" && (
                      <div className="w-10 h-full flex flex-col items-center justify-center bg-bg-main/50 rounded-l-lg border-r-2 border-inherit relative">
                        <span className="text-[10px] font-bold text-text-placeholder mb-1">Prev</span>
                        <div className="w-3 h-3 rounded-full bg-text-muted mt-1"></div>
                      </div>
                    )}

                    {/* Data Field */}
                    <div className={`w-16 h-full flex flex-col items-center justify-center border-r-2 border-inherit bg-bg-card/50 ${listType !== 'doubly' ? 'rounded-l-lg' : ''}`}>
                      <span className="text-xs font-semibold text-text-placeholder mb-1">Data</span>
                      <span className="text-2xl font-black text-text-heading">{node.value}</span>
                    </div>
                    
                    {/* Next Pointer Field */}
                    <div className="w-10 h-full flex flex-col items-center justify-center bg-bg-main/50 rounded-r-lg relative">
                      <span className="text-[10px] font-bold text-text-placeholder mb-1">Next</span>
                      <div className="w-3 h-3 rounded-full bg-text-muted mt-1"></div>
                    </div>
                  </div>

                  {/* Connecting Arrow */}
                  <div className="flex items-center px-2">
                    {listType === "doubly" ? (
                      // Bidirectional Arrow
                      <div className="flex items-center text-text-placeholder">
                        <svg className="w-4 h-4 -mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <div className="w-6 h-1 bg-text-muted"></div>
                        <svg className="w-4 h-4 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                      </div>
                    ) : (
                      // Unidirectional Arrow
                      <div className="flex items-center text-text-placeholder">
                        <div className="w-8 h-1 bg-text-muted rounded-full"></div>
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
              <div className="flex flex-col items-center justify-center h-20 px-4 border-2 border-dashed border-primary bg-primary/10 rounded-btn mt-14 shadow-sm animate-in fade-in">
                <span className="text-primary font-bold text-xs uppercase tracking-wider flex flex-col items-center space-y-1">
                  <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span>Loops to Head</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 px-4 border-2 border-dashed border-rose-300 bg-rose-50 rounded-btn mt-14 animate-in fade-in">
                <span className="text-rose-500 font-bold font-mono">null</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        
        {/* Row 1: Insertions */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-sm w-full">
          <input 
            type="number" 
            placeholder={`Node Value (Max ${MAX_NODES})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-48 px-4 py-2 border-2 border-border-default rounded-btn outline-none focus:border-primary text-text-heading font-medium transition-colors"
          />
          <button 
            onClick={handlePrepend} disabled={isAnimating}
            className="px-5 py-2 bg-primary/10 text-primary font-bold rounded-btn hover:bg-primary/10 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Insert Head
          </button>
          <button 
            onClick={handleAppend} disabled={isAnimating}
            className="px-5 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            Insert Tail
          </button>
          <button 
            onClick={handlePop} disabled={isAnimating}
            className="px-5 py-2 bg-rose-50 text-rose-600 font-bold rounded-btn hover:bg-rose-100 transition-colors disabled:opacity-50 ml-auto whitespace-nowrap"
          >
            Delete Tail
          </button>
        </div>

        {/* Row 2: Traversal Engine */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-premium w-full">
          <span className="text-text-secondary font-semibold px-2">Traversal Engine:</span>
          <input 
            type="number" 
            placeholder="Search Target..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isAnimating}
            className="w-40 px-4 py-2 bg-bg-main border-2 border-slate-600 rounded-btn outline-none focus:border-emerald-400 text-white font-medium transition-colors placeholder:text-text-secondary"
          />
          <button 
            onClick={handleSearch} 
            disabled={isAnimating || !searchValue}
            className="px-6 py-2 bg-accent-success text-white font-bold rounded-btn shadow hover:bg-accent-success transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            ▶ Animate Search
          </button>
          <button 
            onClick={handleResetVisuals} 
            disabled={isAnimating}
            className="px-4 py-2 text-text-placeholder hover:text-primary transition-colors whitespace-nowrap font-bold"
          >
            Reset Colors
          </button>
        </div>

      </div>
    </div>
  );
}