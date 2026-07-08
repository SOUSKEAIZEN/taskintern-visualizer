"use client";

import { useEffect, useState, useRef } from "react";
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
  const CURRENT_USER_ID = "placeholder-student-id-123";

  useEffect(() => {
    logger.info(`UI Mount Step 1: Initializing TheoryPanel for topic: ${topicId}`);
    
    // Route to the correct imported JSON data based on the active module
    if (topicId === "arrays") {
      setData(arrayData as ModuleData);
    } else if (topicId === "searching") {
      setData(searchingData as ModuleData);
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
  }, [topicId]);

  // Intersection Observer Effect for tracking reading completion
  useEffect(() => {
    if (!data || !bottomRef.current) return;

    logger.info(`UI Mount Step 2: Setting up IntersectionObserver for ${topicId} theory content.`);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          logger.info(`UI Action Step 1: User reached the bottom of ${topicId} theory. Firing completion event...`);
          
          markTheoryComplete(CURRENT_USER_ID, topicId)
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
  }, [data, topicId]);

  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white border-r border-slate-200">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Loading educational content...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-white border-r border-slate-200 p-8 custom-scrollbar relative">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
            {data.difficulty}
          </span>
          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Module {data.moduleId}
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          {data.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {data.description}
        </p>
      </div>

      <hr className="border-slate-100 mb-8" />

      {/* Dynamic Text Sections */}
      <div className="space-y-8 mb-12">
        {data.sections.map((section) => (
          <section key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800 mb-3 flex items-center">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
              {section.title}
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      {/* Graphic Design: Time Complexity Table */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
        <div className="bg-slate-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>⚡</span>
            <span>Algorithmic Complexities</span>
          </h3>
        </div>
        
        <div className="p-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50">
                <th className="py-3 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 rounded-tl-xl">Operation</th>
                <th className="py-3 px-5 text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-slate-200">Best</th>
                <th className="py-3 px-5 text-xs font-bold text-amber-600 uppercase tracking-wider border-b border-slate-200">Average</th>
                <th className="py-3 px-5 text-xs font-bold text-rose-600 uppercase tracking-wider border-b border-slate-200 rounded-tr-xl">Worst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {["access", "search", "insertion", "deletion"].map((op) => {
                const metric = data.complexities[op] as any;
                if (!metric) return null;
                return (
                  <tr key={op} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-700 capitalize">{op}</td>
                    <td className="py-3 px-5 font-mono text-sm font-medium text-emerald-700 bg-emerald-50/30">{metric.best}</td>
                    <td className="py-3 px-5 font-mono text-sm font-medium text-amber-700 bg-amber-50/30">{metric.average}</td>
                    <td className="py-3 px-5 font-mono text-sm font-medium text-rose-700 bg-rose-50/30">{metric.worst}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Space Complexity Footer */}
        <div className="bg-slate-100/50 px-6 py-3 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
          <span className="text-sm font-bold text-slate-600">Space Complexity</span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-mono text-sm font-bold rounded-lg border border-indigo-200">
            {data.complexities.space as string}
          </span>
        </div>
      </div>

      {/* Invisible Trigger for Intersection Observer */}
      <div ref={bottomRef} className="h-4 w-full" aria-hidden="true" />
    </div>
  );
}