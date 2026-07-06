"use client";

import { useState } from "react";
import Link from "next/link";
import { logger } from "../../lib/logger";

const MODULES = [
  { id: "arrays", label: "Array Operations", icon: "🚀" },
  { id: "linked-lists", label: "Linked Lists", icon: "🔗" },
  { id: "stacks", label: "Stacks", icon: "🥞" },
  { id: "queues", label: "Queues", icon: "🚶" },
  { id: "trees", label: "Trees & BST", icon: "🌳" },
  { id: "heaps", label: "Heaps", icon: "⛰️" },
  { id: "graphs", label: "Graphs (BFS/DFS)", icon: "🕸️" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    logger.info(`UI Interaction: Sidebar ${!isCollapsed ? "collapsed" : "expanded"} by user.`);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`relative transition-all duration-300 ease-in-out border-r bg-white shadow-inner z-20 flex flex-col ${
        isCollapsed ? "w-20 items-center" : "w-64 px-4"
      }`}
    >
      {/* Collapse/Expand Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-6 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors z-30"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}></path>
        </svg>
      </button>

      <nav className="flex-1 space-y-2 text-sm font-medium pt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2 px-2">
            Learning Modules
          </div>
        )}

        {MODULES.map((mod) => (
          // We use URL query parameters (?module=...) so the main page knows what to load without complex global state
          <Link 
            key={mod.id} 
            href={`/?module=${mod.id}`}
            onClick={() => logger.info(`UI Interaction: User navigated to module [${mod.id}]`)}
          >
            <div 
              className={`flex items-center rounded-xl cursor-pointer transition-all duration-200 group ${
                isCollapsed ? "justify-center p-3 mb-2" : "p-3 mb-1 space-x-3"
              } hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-transparent hover:border-indigo-100`}
              title={isCollapsed ? mod.label : ""}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{mod.icon}</span>
              {!isCollapsed && <span className="whitespace-nowrap">{mod.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom Dashboard Link */}
      <div className={`pt-4 pb-6 mt-2 border-t border-slate-100 flex ${isCollapsed ? 'justify-center' : ''}`}>
        <Link 
          href="/dashboard"
          onClick={() => logger.info("UI Interaction: User navigated to Dashboard")}
        >
          <div className={`p-3 bg-slate-50 text-slate-600 rounded-xl cursor-pointer font-bold hover:bg-indigo-600 hover:text-white hover:shadow-md transition-all flex items-center ${
            isCollapsed ? "justify-center" : "justify-between w-full space-x-2"
          }`}>
            <span className="text-lg">📊</span>
            {!isCollapsed && <span className="whitespace-nowrap flex-1">Dashboard</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}