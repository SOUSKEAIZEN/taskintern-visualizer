"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
  state: "default" | "active" | "visited";
}

interface GraphEdge {
  source: number;
  target: number;
}

export default function GraphCanvas() {
  // --- Standard Graph Topology ---
  // We use a fixed, aesthetically pleasing graph layout with a cycle (4-5) to demonstrate traversal properly.
  const initialNodes: GraphNode[] = [
    { id: 0, label: "0", x: 400, y: 60, state: "default" },
    { id: 1, label: "1", x: 250, y: 160, state: "default" },
    { id: 2, label: "2", x: 550, y: 160, state: "default" },
    { id: 3, label: "3", x: 150, y: 280, state: "default" },
    { id: 4, label: "4", x: 350, y: 280, state: "default" },
    { id: 5, label: "5", x: 450, y: 280, state: "default" },
    { id: 6, label: "6", x: 650, y: 280, state: "default" },
  ];

  const edges: GraphEdge[] = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 4 },
    { source: 2, target: 5 },
    { source: 2, target: 6 },
    { source: 4, target: 5 }, // This edge creates a cycle (1 -> 4 -> 5 -> 2 -> 0 -> 1)
  ];

  // Adjacency List for algorithmic processing
  const adjacencyList: Record<number, number[]> = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 5, 6],
    3: [1],
    4: [1, 5],
    5: [2, 4],
    6: [2],
  };

  // --- States ---
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Animation Engine ---
  const runFrames = (frames: GraphNode[][], delay: number = 800) => {
    let frameIdx = 0;
    const interval = setInterval(() => {
      if (frameIdx < frames.length) {
        setNodes(frames[frameIdx]);
        frameIdx++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        logger.info("Graph Engine: Traversal animation complete.");
      }
    }, delay);
  };

  // --- Traversal Algorithms ---
  const handleBFS = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    logger.info("Graph Engine: Initiating Breadth-First Search (BFS) starting at Node 0.");

    const frames: GraphNode[][] = [];
    const workingNodes: GraphNode[] = initialNodes.map(n => ({ ...n, state: "default" }));
    
    const queue: number[] = [0];
    const visited = new Set<number>([0]);
    
    // Initial State Frame
    frames.push(JSON.parse(JSON.stringify(workingNodes)));

    while (queue.length > 0) {
      const current = queue.shift()!;
      logger.info(`BFS Traversal: Dequeued Node ${current}. Marking as Active.`);
      
      // Highlight current node
      workingNodes[current].state = "active";
      frames.push(JSON.parse(JSON.stringify(workingNodes)));

      const neighbors = adjacencyList[current];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          logger.info(`BFS Traversal: Discovered unvisited neighbor Node ${neighbor}. Enqueueing.`);
          visited.add(neighbor);
          queue.push(neighbor);
        } else {
          logger.info(`BFS Traversal: Neighbor Node ${neighbor} already visited. Skipping.`);
        }
      }

      // Mark current node as fully visited
      workingNodes[current].state = "visited";
      frames.push(JSON.parse(JSON.stringify(workingNodes)));
    }

    runFrames(frames);
  };

  const handleDFS = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    logger.info("Graph Engine: Initiating Depth-First Search (DFS) starting at Node 0.");

    const frames: GraphNode[][] = [];
    const workingNodes: GraphNode[] = initialNodes.map(n => ({ ...n, state: "default" }));
    const visited = new Set<number>();

    // Using recursion for DFS to cleanly generate frames
    const dfsRecursive = (current: number) => {
      logger.info(`DFS Traversal: Plunging into Node ${current}.`);
      visited.add(current);
      
      workingNodes[current].state = "active";
      frames.push(JSON.parse(JSON.stringify(workingNodes)));

      const neighbors = adjacencyList[current];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          logger.info(`DFS Traversal: Exploring branch to neighbor Node ${neighbor}.`);
          dfsRecursive(neighbor);
        } else {
          logger.info(`DFS Traversal: Neighbor Node ${neighbor} already visited. Backtracking/Skipping.`);
        }
      }

      logger.info(`DFS Traversal: Finished exploring all branches for Node ${current}. Marking visited.`);
      workingNodes[current].state = "visited";
      frames.push(JSON.parse(JSON.stringify(workingNodes)));
    };

    dfsRecursive(0);
    runFrames(frames);
  };

  const handleReset = () => {
    logger.info("UI State: Resetting Graph visualizer to default state.");
    setNodes(initialNodes);
  };

  // --- Graphic Design Helpers ---
  const getNodeStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-amber-100 border-amber-500 shadow-amber-200 scale-125 z-20 ring-4 ring-amber-100 text-amber-900";
      case "visited":
        return "bg-indigo-500 border-indigo-600 shadow-indigo-200 scale-110 z-10 text-white";
      default:
        return "bg-white border-slate-300 shadow-sm text-slate-700";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-800">Graph Traversal (BFS & DFS)</h3>
        <p className="text-sm text-slate-500">Watch how Breadth-First expands radially, while Depth-First plunges into branches.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl w-full shadow-inner overflow-x-auto custom-scrollbar relative">
        
        <div className="relative min-w-[800px] h-[360px]">
          
          {/* SVG Edge Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {edges.map((edge, i) => {
              const sourceNode = nodes.find(n => n.id === edge.source)!;
              const targetNode = nodes.find(n => n.id === edge.target)!;
              
              // If both connected nodes are visited or active, highlight the edge
              const isEdgeActive = 
                (sourceNode.state === "visited" || sourceNode.state === "active") && 
                (targetNode.state === "visited" || targetNode.state === "active");

              return (
                <line 
                  key={i} 
                  x1={sourceNode.x} y1={sourceNode.y} 
                  x2={targetNode.x} y2={targetNode.y} 
                  stroke={isEdgeActive ? "#6366f1" : "#cbd5e1"} 
                  strokeWidth={isEdgeActive ? "4" : "3"}
                  className="transition-colors duration-500"
                />
              );
            })}
          </svg>

          {/* HTML Node Layer */}
          {nodes.map((node) => (
            <div 
              key={node.id}
              className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-black transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 cursor-default ${getNodeStyles(node.state)}`}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              {node.label}
            </div>
          ))}
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-lg w-full">
          <span className="text-slate-300 font-semibold px-2">Traversal Engine:</span>
          <button 
            onClick={handleBFS} 
            disabled={isAnimating}
            className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            ▶ Run BFS (Level Order)
          </button>
          <button 
            onClick={handleDFS} 
            disabled={isAnimating}
            className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl shadow hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            ▶ Run DFS (Depth First)
          </button>
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button 
            onClick={handleReset} 
            disabled={isAnimating}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Reset Graph
          </button>
        </div>
      </div>
    </div>
  );
}