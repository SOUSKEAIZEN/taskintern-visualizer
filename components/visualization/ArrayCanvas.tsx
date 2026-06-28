"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";

interface ArrayCanvasProps {
  initialData?: number[];
}

export default function ArrayCanvas({ initialData = [10, 24, 45, 7, 92] }: ArrayCanvasProps) {
  const [array, setArray] = useState<number[]>(initialData);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleElementClick = (index: number) => {
    logger.info(`Interaction: Clicked element at index ${index} (Value: ${array[index]})`);
    setActiveIndex(index);
  };

  const handleAddElement = () => {
    if (array.length >= 10) {
      logger.warn("Constraint Hit: Prevented adding element. Array reached maximum display size (10).");
      return;
    }
    const newValue = Math.floor(Math.random() * 100);
    logger.info(`State Update: Pushed new value ${newValue} to array.`);
    setArray((prev) => [...prev, newValue]);
  };

  const handleRemoveElement = () => {
    if (array.length === 0) {
      logger.error("Operation Failed: Attempted to pop from an empty array.");
      return;
    }
    logger.info(`State Update: Popped last element. Remaining length: ${array.length - 1}`);
    setArray((prev) => prev.slice(0, -1));
    if (activeIndex === array.length - 1) setActiveIndex(null);
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* The Visual Canvas */}
      <div className="flex flex-wrap justify-center gap-4 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl min-h-[180px] w-full max-w-2xl relative shadow-inner">
        {array.length === 0 ? (
          <span className="text-slate-400 font-semibold my-auto">Array is currently empty</span>
        ) : (
          array.map((num, idx) => (
            <div
              key={`${idx}-${num}`}
              onClick={() => handleElementClick(idx)}
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                activeIndex === idx
                  ? "bg-indigo-600 text-white border-2 border-indigo-700 shadow-lg shadow-indigo-200 scale-110"
                  : "bg-white text-blue-700 border-2 border-blue-400 shadow-sm hover:shadow-md hover:border-blue-500"
              }`}
            >
              {num}
            </div>
          ))
        )}
      </div>

      {/* Array Controls */}
      <div className="flex space-x-4">
        <button
          onClick={handleAddElement}
          disabled={array.length >= 10}
          className="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          Push Element
        </button>
        <button
          onClick={handleRemoveElement}
          disabled={array.length === 0}
          className="px-6 py-2.5 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          Pop Element
        </button>
      </div>

      <div className="w-full max-w-2xl bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-sm shadow-md overflow-hidden">
        <span className="text-slate-400">// Live Array State</span>
        <br />
        const array = [{array.join(", ")}];
        <br />
        const length = {array.length};
      </div>
    </div>
  );
}