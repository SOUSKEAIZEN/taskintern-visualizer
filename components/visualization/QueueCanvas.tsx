"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";

interface QueueElement {
  id: string;
  value: number;
  state: "default" | "active" | "new" | "peeking";
}

export default function QueueCanvas() {
  // --- States ---
  const [queue, setQueue] = useState<QueueElement[]>([
    { id: "elem-1", value: 12, state: "default" }, // Front
    { id: "elem-2", value: 45, state: "default" },
    { id: "elem-3", value: 88, state: "default" }, // Rear
  ]);
  const [customValue, setCustomValue] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const MAX_QUEUE_SIZE = 10; 

  // --- FIFO Operations ---
  const handleEnqueue = () => {
    if (queue.length >= MAX_QUEUE_SIZE) {
      logger.warn(`Constraint Hit: Queue Overflow prevented. Reached max capacity of ${MAX_QUEUE_SIZE}.`);
      alert("Queue Overflow! The queue is at maximum capacity.");
      return;
    }
    
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`Memory Operation: ENQUEUE - Adding value ${val} to the Rear of the queue.`);
    const newElement: QueueElement = { id: generateId(), value: val, state: "new" };
    
    setQueue((prev) => [...prev, newElement]);
    setCustomValue("");
    
    setTimeout(() => {
      setQueue((prev) => prev.map(el => el.id === newElement.id ? { ...el, state: "default" } : el));
    }, 800);
  };

  const handleDequeue = () => {
    if (queue.length === 0) {
      logger.error("Memory Error: Queue Underflow. Attempted to DEQUEUE from an empty queue.");
      alert("Queue Underflow! Cannot dequeue from an empty queue.");
      return;
    }

    const frontElement = queue[0];
    logger.info(`Memory Operation: DEQUEUE - Removing value ${frontElement.value} from the Front of the queue.`);
    
    setIsAnimating(true);
    setQueue((prev) => prev.map((el, idx) => idx === 0 ? { ...el, state: "active" } : el));

    setTimeout(() => {
      setQueue((prev) => prev.slice(1)); 
      setIsAnimating(false);
    }, 600);
  };

  const handlePeek = () => {
    if (queue.length === 0) {
      logger.warn("Memory Warning: Attempted to PEEK into an empty queue.");
      return;
    }

    const frontElement = queue[0];
    logger.info(`Memory Operation: PEEK - Inspecting the Front value (${frontElement.value}) without removing it.`);
    
    setIsAnimating(true);
    setQueue((prev) => prev.map((el, idx) => idx === 0 ? { ...el, state: "peeking" } : el));

    setTimeout(() => {
      setQueue((prev) => prev.map((el, idx) => idx === 0 ? { ...el, state: "default" } : el));
      setIsAnimating(false);
    }, 1200);
  };

  const handleClear = () => {
    logger.info("UI State: User cleared the entire queue.");
    setQueue([]);
  };

  // --- Graphic Design State Mapping ---
  const getElementStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-rose-500 text-white border-rose-600 shadow-rose-200 scale-105 z-10 -translate-x-4 opacity-50"; 
      case "peeking":
        return "bg-emerald-400 text-emerald-950 border-emerald-500 shadow-emerald-200 scale-110 z-10 ring-4 ring-emerald-100";
      case "new":
        return "bg-primary text-white border-primary shadow-primary/20 animate-in slide-in-from-right-8 duration-300";
      default:
        return "bg-bg-card text-text-heading border-border-default shadow-sm hover:border-primary hover:text-primary hover:shadow-premium";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-text-heading">FIFO Memory Queue</h3>
        <p className="text-sm text-text-secondary">First-In, First-Out. Elements enqueue at the rear and dequeue from the front.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex items-center justify-center p-4 md:p-8 bg-bg-main border-2 border-dashed border-border-default rounded-card w-full min-h-[420px] shrink-0 shadow-inner">
        
        {/* Layout Wrapper to prevent overlap */}
        <div className="flex items-center justify-between w-full max-w-5xl space-x-2 md:space-x-4">
          
          {/* Front Indicator (Left) - Using shrink-0 to prevent squishing */}
          <div className="flex flex-col items-center text-rose-500 font-bold tracking-widest text-xs uppercase z-20 shrink-0">
            <span>Front</span>
            <span className="hidden md:inline">(Dequeue)</span>
            <svg className="w-5 h-5 mt-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </div>

          {/* The Queue "Tube" Container */}
          <div className="relative flex-1 h-36 border-y-8 border-border-default bg-bg-main flex items-center px-4 shadow-inner overflow-x-auto custom-scrollbar">
            {queue.length === 0 ? (
              <div className="w-full flex items-center justify-center text-text-placeholder font-bold uppercase tracking-widest text-sm">
                Queue is Empty
              </div>
            ) : (
              <div className="flex items-center space-x-3 transition-all duration-500">
                {queue.map((element) => (
                  <div 
                    key={element.id} 
                    className={`w-16 h-16 shrink-0 flex items-center justify-center border-2 rounded-btn text-2xl font-black transition-all duration-300 ${getElementStyles(element.state)}`}
                  >
                    {element.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rear Indicator (Right) - Using shrink-0 to prevent squishing */}
          <div className="flex flex-col items-center text-primary font-bold tracking-widest text-xs uppercase z-20 shrink-0">
            <span>Rear</span>
            <span className="hidden md:inline">(Enqueue)</span>
            <svg className="w-5 h-5 mt-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>

        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
        
        {/* Data Input & Primary Operations */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-sm w-full">
          <input 
            type="number" 
            placeholder={`Value (Max ${MAX_QUEUE_SIZE})`}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-40 px-4 py-2 border-2 border-border-default rounded-btn outline-none focus:border-primary text-text-heading font-medium transition-colors"
          />
          <button 
            onClick={handleEnqueue} 
            disabled={isAnimating}
            className="px-8 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            Enqueue (Rear)
          </button>
          <button 
            onClick={handleDequeue} 
            disabled={isAnimating || queue.length === 0}
            className="px-8 py-2 bg-rose-50 text-rose-600 font-bold rounded-btn hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            Dequeue (Front)
          </button>
        </div>

        {/* Secondary Operations */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full">
          <button 
            onClick={handlePeek} 
            disabled={isAnimating || queue.length === 0}
            className="px-8 py-2 bg-accent-success/10 text-accent-success font-bold rounded-btn hover:bg-accent-success/10 transition-colors disabled:opacity-50 shadow-sm"
          >
            👀 Peek at Front
          </button>
          <button 
            onClick={handleClear} 
            disabled={isAnimating || queue.length === 0}
            className="px-6 py-2 text-text-secondary font-medium hover:text-text-heading transition-colors"
          >
            Clear Queue
          </button>
        </div>

      </div>
    </div>
  );
}