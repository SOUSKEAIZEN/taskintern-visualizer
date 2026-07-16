"use client";

import { useEffect, useState, useRef } from "react";
import { getSession } from "next-auth/react";
import { logger } from "../../lib/logger";
import { markTheoryComplete } from "../../lib/actions/progress";
import arrayData from "../../content/modules/arrays.json";
import linkedListData from "../../content/modules/linkedlists.json";
import stackData from "../../content/modules/stacks.json";
import queueData from "../../content/modules/queues.json";
import treeData from "../../content/modules/trees.json";
import heapData from "../../content/modules/heaps.json";
import graphData from "../../content/modules/graphs.json";
import searchingData from "../../content/modules/searching.json";
// 1. Import the newly created Hash Map data
import hashMapData from "../../content/modules/hashmaps.json";

interface TheorySection {
  id: string;
  title: string;
  content: string;
}

interface Complexities {
  [key: string]: {
    best?: string;
    average?: string;
    worst?: string;
  } | string;
}

interface ModuleData {
  moduleId: string;
  title: string;
  difficulty: string;
  description: string;
  sections: TheorySection[];
  complexities: Complexities;
}

export default function TheoryPanel({ topicId = "arrays" }: { topicId?: string }) {
  const [data, setData] = useState<ModuleData | null>(null);
  
  // Ref for the bottom of the theory content
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    });
  }, []);

  useEffect(() => {
    logger.info(`UI Mount Step 1: Initializing TheoryPanel for topic: ${topicId}`);
    
    try {
      // 2. Route to the correct imported JSON data based on the active module
      if (topicId === "arrays") {
        setData(arrayData as ModuleData);
      } else if (topicId === "searching") {
        setData(searchingData as ModuleData);
      } else if (topicId === "hashmaps") { // Add routing for Hash Maps
        setData(hashMapData as ModuleData);
      } else if (topicId === "linked-lists") {
        setData(linkedListData as ModuleData);
      } else if (topicId === "stacks") {
        setData(stackData as ModuleData);
      } else if (topicId === "queues") {
        setData(queueData as ModuleData);
      } else if (topicId === "trees") {
        setData(treeData as ModuleData);
      } else if (topicId === "heaps") {
        setData(heapData as ModuleData);
      } else if (topicId === "graphs") {
        setData(graphData as ModuleData);
      } else {
        logger.warn(`UI Point of Failure: Attempted to load unknown topic ID: ${topicId}`);
        setData(null);
      }
    } catch (error) {
      logger.error(`UI Point of Failure: Failed to parse JSON data for topic: ${topicId}`, error);
      setData(null);
    }
  }, [topicId]);

  // Intersection Observer Effect for tracking reading completion
  useEffect(() => {
    if (!data || !bottomRef.current) return;

    logger.info(`UI Mount Step 2: Setting up IntersectionObserver for ${topicId} theory content.`);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && userId) {
          logger.info(`UI Action Step 1: User reached the bottom of ${topicId} theory. Firing completion event...`);
          
          markTheoryComplete(userId, topicId)
            .then((res) => {
              if (res.success) {
                logger.info(`UI Action Step 2: Successfully registered theory completion for ${topicId} in database.`);
              } else {
                logger.error(`UI Point of Failure: Server rejected theory completion for ${topicId}. Error: ${res.error}`);
              }
            })
            .catch((err) => {
              logger.error(`UI Point of Failure: Network exception while marking theory complete.`, err);
            });

          // Disconnect immediately after firing to prevent spamming the server
          observer.disconnect();
          logger.info(`UI Action Step 3: IntersectionObserver disconnected for ${topicId}.`);
        }
      },
      {
        root: null, // Observe relative to the viewport
        threshold: 0.1, // Trigger when 10% of the target is visible
      }
    );

    observer.observe(bottomRef.current);

    // Cleanup function
    return () => {
      observer.disconnect();
    };
  }, [data, topicId, userId]);

  // Helper function to render basic Markdown and LaTeX variables
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Handle Headings
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-bold text-text-heading mt-6 mb-2 border-b border-border-default pb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('|') || line.startsWith(':-')) return null; // Very basic table skip to avoid clutter if used outside complexities

      // Handle bold and math text
      const parts = line.split(/(\*\*.*?\*\*|\$.*?\$)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-text-heading">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <span key={i} className="font-mono text-primary bg-primary/10 px-1 rounded mx-0.5">{part.slice(1, -1)}</span>;
        }
        return part;
      });

      return <p key={index} className="mb-3">{parts}</p>;
    });
  };

  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-bg-card border-r border-border-default">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary font-medium">Loading educational content...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-bg-card border-r border-border-default p-8 custom-scrollbar relative">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <span className="px-3 py-1 bg-accent-success/10 text-accent-success text-xs font-bold uppercase tracking-wider rounded-full">
            {data.difficulty}
          </span>
          <span className="text-sm font-semibold text-text-placeholder uppercase tracking-wide">
            Module {data.moduleId}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-text-heading tracking-tight mb-4">
          {data.title}
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          {data.description}
        </p>
      </div>

      <hr className="border-border-default mb-8" />

      {/* Dynamic Text Sections */}
      <div className="space-y-8 mb-12">
        {data.sections.map((section) => (
          <section key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-text-heading mb-3 flex items-center">
              <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
              {section.title}
            </h2>
            <div className="text-text-secondary leading-relaxed">
              {renderFormattedText(section.content)}
            </div>
          </section>
        ))}
      </div>

      {/* Graphic Design: Time Complexity Table */}
      <div className="bg-bg-main rounded-card border border-border-default overflow-hidden shadow-sm mb-6">
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>⚡</span>
            <span>Algorithmic Complexities</span>
          </h3>
        </div>
        
        <div className="p-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main/50">
                <th className="py-3 px-5 text-[13px] font-heading font-bold text-text-secondary uppercase tracking-widest border-b border-border-default rounded-tl-xl">Operation</th>
                <th className="py-3 px-5 text-[13px] font-heading font-bold text-accent-success uppercase tracking-widest border-b border-border-default">Best</th>
                <th className="py-3 px-5 text-[13px] font-heading font-bold text-accent-warning uppercase tracking-widest border-b border-border-default">Average</th>
                <th className="py-3 px-5 text-[13px] font-heading font-bold text-accent-error uppercase tracking-widest border-b border-border-default rounded-tr-xl">Worst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default bg-bg-card">
              {["access", "search", "insertion", "deletion"].map((op) => {
                const metric = data.complexities[op] as any;
                if (!metric) return null;
                return (
                  <tr key={op} className="hover:bg-bg-main/50 transition-colors">
                    <td className="py-3 px-5 font-semibold text-text-heading capitalize">{op}</td>
                    <td className="py-3 px-5 font-mono text-[14px] font-bold text-accent-success bg-accent-success/5">{metric.best}</td>
                    <td className="py-3 px-5 font-mono text-[14px] font-bold text-accent-warning bg-accent-warning/5">{metric.average}</td>
                    <td className="py-3 px-5 font-mono text-[14px] font-bold text-accent-error bg-accent-error/5">{metric.worst}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Space Complexity Footer */}
        <div className="bg-bg-main/50 px-6 py-3 border-t border-border-default flex justify-between items-center rounded-b-2xl">
          <span className="text-sm font-bold text-text-secondary">Space Complexity</span>
          <span className="px-3 py-1 bg-primary/10 text-primary font-mono text-sm font-bold rounded-btn border border-primary/20">
            {data.complexities.space as string}
          </span>
        </div>
      </div>

      {/* Invisible Trigger for Intersection Observer */}
      <div ref={bottomRef} className="h-4 w-full" aria-hidden="true" />
    </div>
  );
}