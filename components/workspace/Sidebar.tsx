"use client";

import { useState } from "react";
import Link from "next/link";
import { logger } from "../../lib/logger";

const LEARN_MODULES = [
  { id: "arrays", label: "Array Operations", icon: "🚀" },
  { id: "searching", label: "Searching Algorithms", icon: "🔍" },
  { id: "hashmaps", label: "Hash Maps", icon: "🗄️" },
  { id: "linked-lists", label: "Linked Lists", icon: "🔗" },
  { id: "stacks", label: "Stacks", icon: "🥞" },
  { id: "queues", label: "Queues", icon: "🚶" },
  { id: "trees", label: "Trees & BST", icon: "🌳" },
  { id: "heaps", label: "Heaps", icon: "⛰️" },
  { id: "graphs", label: "Graphs (BFS/DFS)", icon: "🕸️" },
];

const PRACTICE_MODULES = [
  { id: "compiler", label: "Online Compiler", icon: "🖥️" },
  { id: "practice", label: "Practice Questions", icon: "📝" },
];

interface SidebarProps {
  mode: "learn" | "practice";
}

export default function Sidebar({ mode }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    logger.info(`UI Interaction: Sidebar ${!isCollapsed ? "collapsed" : "expanded"} by user.`);
    setIsCollapsed(!isCollapsed);
  };

  const modules = mode === "learn" ? LEARN_MODULES : PRACTICE_MODULES;
  const basePath = mode === "learn" ? "/learn" : "/practice";

  return (
    <aside 
      className={`relative transition-all duration-300 ease-in-out border-r border-border-default bg-bg-sidebar z-20 flex flex-col ${
        isCollapsed ? "w-20 items-center" : "w-64 px-4"
      }`}
    >
      {/* Collapse/Expand Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-6 bg-bg-card border border-border-default rounded-full p-1.5 shadow-sm text-text-placeholder hover:text-primary hover:border-primary transition-colors z-30 focus:outline-none"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}></path>
        </svg>
      </button>

      <nav className="flex-1 space-y-1 text-[14px] font-heading font-bold pt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {!isCollapsed && (
          <div className="text-[12px] font-heading font-extrabold text-text-placeholder uppercase tracking-widest mb-4 mt-2 px-2">
            {mode === "learn" ? "Learning Modules" : "Practice Hub"}
          </div>
        )}

        {modules.map((mod) => (
          <Link 
            key={mod.id} 
            href={`${basePath}?module=${mod.id}`}
            onClick={() => logger.info(`UI Interaction: User navigated to module [${mod.id}]`)}
          >
            <div 
              className={`flex items-center rounded-btn cursor-pointer transition-colors duration-200 group ${
                isCollapsed ? "justify-center p-3 mb-2" : "p-3 mb-1 space-x-3"
              } hover:bg-primary/10 hover:text-primary text-text-secondary border border-transparent`}
              title={isCollapsed ? mod.label : ""}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{mod.icon}</span>
              {!isCollapsed && <span className="whitespace-nowrap tracking-wide">{mod.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom Links */}
      <div className={`pt-4 pb-6 mt-2 border-t border-border-default flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
        <Link 
          href="/portal"
          onClick={() => logger.info("UI Interaction: User navigated back to Portal")}
        >
          <div className={`p-3 bg-bg-main border border-border-default text-text-secondary rounded-btn cursor-pointer font-heading font-bold hover:bg-primary/10 hover:border-primary/20 hover:text-primary shadow-sm transition-all flex items-center ${
            isCollapsed ? "justify-center" : "justify-between w-full space-x-2"
          }`}>
            <span className="text-lg">🚪</span>
            {!isCollapsed && <span className="whitespace-nowrap flex-1 tracking-wide">Back to Portal</span>}
          </div>
        </Link>
        <Link 
          href="/dashboard"
          onClick={() => logger.info("UI Interaction: User navigated to Dashboard")}
        >
          <div className={`p-3 bg-bg-main border border-border-default text-text-secondary rounded-btn cursor-pointer font-heading font-bold hover:bg-primary/10 hover:border-primary/20 hover:text-primary shadow-sm transition-all flex items-center ${
            isCollapsed ? "justify-center" : "justify-between w-full space-x-2"
          }`}>
            <span className="text-lg">📊</span>
            {!isCollapsed && <span className="whitespace-nowrap flex-1 tracking-wide">Dashboard</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}