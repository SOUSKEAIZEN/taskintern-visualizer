"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";

interface StackElement {
  id: string;
  value: number;
  state: "default" | "active" | "new" | "peeking";
}

export default function StackCanvas() {
  // --- States ---
  // Initializing with a few elements so the user sees the LIFO structure immediately
  const [stack, setStack] = useState<StackElement[]>([
    { id: "elem-1", value: 42, state: "default" },
    { id: "elem-2", value: 17, state: "default" },
    { id: "elem-3", value: 99, state: "default" },
  ]);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const MAX_STACK_SIZE = 10; // Constraint to prevent UI overflow vertically

  // --- LIFO Operations ---
  const handlePush = () => {
    if (stack.length >= MAX_STACK_SIZE) {
      logger.warn(`Constraint Hit: Stack Overflow prevented. Reached max capacity of ${MAX_STACK_SIZE}.`);
      alert("Stack Overflow! The stack is at maximum capacity.");
      return;
    }
    
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: PUSH - Adding value ${val} to the top of the stack.`);
    const newElement: StackElement = { id: generateId(), value: val, state: "new" };
    
    // Pushing to the end of the array (which will be rendered at the top visually)
    setStack((prev) => [...prev, newElement]);
    setCustomValue("");
    
    // Reset the "new" animation highlight after a short delay
    setTimeout(() => {
      setStack((prev) => prev.map(el => el.id === newElement.id ? { ...el, state: "default" } : el));
    }, 800);
  };

  const handlePop = () => {
    if (stack.length === 0) {
      logger.error("Memory Error: Stack Underflow. Attempted to POP from an empty stack.");
      alert("Stack Underflow! Cannot pop from an empty stack.");
      return;
    }

    const topElement = stack[stack.length - 1];
    logger.info(`Memory Operation: POP - Removing value ${topElement.value} from the top of the stack.`);
    
    // Highlight the element before removing it for visual clarity
    setIsAnimating(true);
    setStack((prev) => prev.map((el, idx) => idx === prev.length - 1 ? { ...el, state: "active" } : el));

    setTimeout(() => {
      setStack((prev) => prev.slice(0, -1));
      setIsAnimating(false);
    }, 600);
  };

  const handlePeek = () => {
    if (stack.length === 0) {
      logger.warn("Memory Warning: Attempted to PEEK into an empty stack.");
      return;
    }

    const topElement = stack[stack.length - 1];
    logger.info(`Memory Operation: PEEK - Inspecting the top value (${topElement.value}) without removing it.`);
    
    setIsAnimating(true);
    setStack((prev) => prev.map((el, idx) => idx === prev.length - 1 ? { ...el, state: "peeking" } : el));

    // Remove the peek highlight after a brief moment
    setTimeout(() => {
      setStack((prev) => prev.map((el, idx) => idx === prev.length - 1 ? { ...el, state: "default" } : el));
      setIsAnimating(false);
    }, 1200);
  };

  const handleClear = () => {
    logger.info("UI State: User cleared the entire stack.");
    setStack([]);
  };

  // --- Graphic Design State Mapping ---
  const getElementStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-rose-500 text-white border-rose-600 shadow-rose-200 scale-105 z-10 translate-x-4"; // Pops out slightly
      case "peeking":
        return "bg-emerald-400 text-emerald-950 border-emerald-500 shadow-emerald-200 scale-110 z-10 ring-4 ring-emerald-100";
      case "new":
        return "bg-indigo-500 text-white border-indigo-600 shadow-indigo-200 animate-in slide-in-from-top-8 duration-300";
      default:
        return "bg-white text-slate-700 border-slate-300 shadow-sm hover:border-indigo-400 hover:text-indigo-700 hover:shadow-md";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">LIFO Memory Stack</h3>
        <p className="text-sm text-slate-500">Last-In, First-Out. Elements are pushed and popped exclusively from the top.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl w-full min-h-[450px] shadow-inner">
        
        {/* The Stack "Bucket" Container */}
        <div className="relative w-64 h-[350px] border-x-8 border-b-8 border-slate-300 rounded-b-2xl bg-slate-100 flex flex-col-reverse justify-start p-2 shadow-inner">
          
          {/* Top of Stack Indicator (Only shows if stack isn't empty) */}
          {stack.length > 0 && (
            <div className="absolute -left-20 top-0 h-full flex flex-col-reverse p-2 pointer-events-none">
              <div 
                className="flex items-center space-x-2 text-indigo-500 font-bold tracking-widest text-xs uppercase transition-all duration-300"
                style={{ marginBottom: `${(stack.length - 1) * 3.5}rem` }} // Dynamically moves up with the stack
              >
                <span>Top</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            </div>
          )}

          {stack.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-sm">
              Stack is Empty
            </div>
          ) : (
            stack.map((element, index) => (
              <div 
                key={element.id} 
                className={`w-full h-12 flex items-center justify-center border-2 rounded-lg text-2xl font-black mb-2 transition-all duration-300 ${getElementStyles(element.state)}`}
              >
                {element.value}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
        
        {/* Data Input & Primary Operations */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full">
          <input 
            type="number" 
            placeholder={`Value (Max ${MAX_STACK_SIZE})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-40 px-4 py-2 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-400 text-slate-700 font-medium transition-colors"
          />
          <button 
            onClick={handlePush} 
            disabled={isAnimating}
            className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Push (Top)
          </button>
          <button 
            onClick={handlePop} 
            disabled={isAnimating || stack.length === 0}
            className="px-8 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            Pop (Top)
          </button>
        </div>

        {/* Secondary Operations */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <button 
            onClick={handlePeek} 
            disabled={isAnimating || stack.length === 0}
            className="px-8 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors disabled:opacity-50 shadow-sm"
          >
            👀 Peek at Top Element
          </button>
          <button 
            onClick={handleClear} 
            disabled={isAnimating || stack.length === 0}
            className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800 transition-colors"
          >
            Clear Stack
          </button>
        </div>

      </div>
    </div>
  );
}