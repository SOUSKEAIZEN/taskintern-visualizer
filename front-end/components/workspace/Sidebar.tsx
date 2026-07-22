"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const searchParams = useSearchParams();
  const currentModule = searchParams.get("module") || (mode === "learn" ? "arrays" : "compiler");

  const toggleSidebar = () => {
    logger.info(`UI Interaction: Sidebar ${!isCollapsed ? "collapsed" : "expanded"} by user.`);
    setIsCollapsed(!isCollapsed);
  };

  const modules = mode === "learn" ? LEARN_MODULES : PRACTICE_MODULES;
  const basePath = mode === "learn" ? "/learn" : "/practice";

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="relative border-r border-border-default bg-bg-sidebar z-20 flex flex-col shrink-0 overflow-visible h-full"
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

      <nav className={`flex-1 space-y-2 text-[14px] font-heading font-bold pt-4 overflow-y-auto overflow-x-hidden custom-scrollbar ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 mt-2"
            >
              {/* Search Bar */}
              <div className="relative mb-6">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
                <input 
                  type="text"
                  placeholder="Search modules..."
                  className="w-full bg-bg-main border border-border-default rounded-input py-2 pl-9 pr-3 text-[13px] font-body text-text-heading placeholder:text-text-placeholder focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                />
              </div>

              <div className="text-[12px] font-heading font-extrabold text-text-placeholder uppercase tracking-widest px-2 whitespace-nowrap">
                {mode === "learn" ? "Learning Modules" : "Practice Hub"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {modules.map((mod) => {
          const isActive = currentModule === mod.id;
          return (
            <Link 
              key={mod.id} 
              href={`${basePath}?module=${mod.id}`}
              onClick={() => logger.info(`UI Interaction: User navigated to module [${mod.id}]`)}
              className="block relative"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div 
                className={`flex items-center rounded-btn cursor-pointer transition-all duration-300 group ${
                  isCollapsed ? "justify-center p-3 mb-2" : "p-3.5 mb-2 ml-2 space-x-3"
                } ${isActive ? 'bg-primary-soft text-primary shadow-sm border border-primary/20' : 'hover:bg-primary-soft/50 hover:text-primary text-text-secondary border border-transparent'}`}
                title={isCollapsed ? mod.label : ""}
              >
                <span className={`text-xl transition-all duration-300 block ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:-rotate-3'}`}>{mod.icon}</span>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`whitespace-nowrap tracking-wide block flex-1 ${isActive ? 'font-extrabold' : ''}`}
                    >
                      {mod.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Links */}
      <div className={`pt-4 pb-6 mt-2 border-t border-border-default flex flex-col gap-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <Link 
          href="/portal"
          onClick={() => logger.info("UI Interaction: User navigated back to Portal")}
          className="block w-full"
        >
          <div className={`p-3 bg-bg-main border border-border-default text-text-secondary rounded-btn cursor-pointer font-heading font-bold hover:bg-primary-soft hover:border-primary-soft hover:text-primary shadow-sm transition-all flex items-center ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}>
            <span className="text-lg block">🚪</span>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap flex-1 tracking-wide block"
                >
                  Back to Portal
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className={`p-3 bg-bg-main border border-border-default text-text-secondary rounded-btn cursor-pointer font-heading font-bold hover:bg-accent-error/10 hover:border-accent-error/20 hover:text-accent-error shadow-sm transition-all flex items-center w-full ${
            isCollapsed ? "justify-center" : "space-x-3"
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className="text-lg block">⏏️</span>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap flex-1 tracking-wide text-left block"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}