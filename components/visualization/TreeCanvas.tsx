"use client";

import { useState, useRef } from "react";
import { logger } from "../../lib/logger";

// --- BST Data Structures ---
interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  state: "default" | "active" | "found" | "new";
}

interface Edge {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function TreeCanvas() {
  // --- States ---
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // We keep a flat list of nodes and edges for easy React rendering
  const [renderNodes, setRenderNodes] = useState<TreeNode[]>([]);
  const [renderEdges, setRenderEdges] = useState<Edge[]>([]);

  // --- Helpers ---
  const generateId = () => Math.random().toString(36).substring(2, 9);
  const MAX_DEPTH = 4; // Prevent UI from overflowing horizontally

  // Re-calculates X, Y coordinates and flattens the tree for rendering
  const updateVisuals = (treeRoot: TreeNode | null) => {
    if (!treeRoot) {
      setRenderNodes([]);
      setRenderEdges([]);
      return;
    }

    const nodes: TreeNode[] = [];
    const edges: Edge[] = [];
    
    // Canvas dimensions (virtual)
    const CANVAS_WIDTH = 800;
    const LEVEL_HEIGHT = 70;

    const traverseAndPosition = (node: TreeNode, depth: number, x: number, offset: number) => {
      node.x = x;
      node.y = depth * LEVEL_HEIGHT + 70; // 40px top padding
      nodes.push(node);

      if (node.left) {
        edges.push({ fromX: x, fromY: node.y, toX: x - offset, toY: node.y + LEVEL_HEIGHT });
        traverseAndPosition(node.left, depth + 1, x - offset, offset / 2);
      }
      if (node.right) {
        edges.push({ fromX: x, fromY: node.y, toX: x + offset, toY: node.y + LEVEL_HEIGHT });
        traverseAndPosition(node.right, depth + 1, x + offset, offset / 2);
      }
    };

    traverseAndPosition(treeRoot, 0, CANVAS_WIDTH / 2, CANVAS_WIDTH / 4);
    
    setRenderNodes([...nodes]);
    setRenderEdges([...edges]);
  };

  // Clone tree to mutate it safely without mutating React state directly
  const cloneTree = (node: TreeNode | null): TreeNode | null => {
    if (!node) return null;
    return { ...node, left: cloneTree(node.left), right: cloneTree(node.right) };
  };

  // --- Core Operations ---
  const handleInsert = () => {
    const val = customValue ? parseInt(customValue) : Math.floor(Math.random() * 100);
    if (isNaN(val)) return;

    logger.info(`BST Engine: Initiating INSERT operation for value ${val}.`);
    if (isAnimating) return;
    setIsAnimating(true);

    let newRoot = cloneTree(root);
    
    if (!newRoot) {
      logger.info(`BST Engine: Tree is empty. Setting ${val} as Root.`);
      newRoot = { id: generateId(), value: val, left: null, right: null, x: 0, y: 0, state: "new" };
      setRoot(newRoot);
      updateVisuals(newRoot);
      setCustomValue("");
      
      setTimeout(() => {
        newRoot!.state = "default";
        updateVisuals(newRoot);
        setIsAnimating(false);
      }, 800);
      return;
    }

    // Interactive Insertion Traversal
    const path: TreeNode[] = [];
    let current = newRoot;
    let depth = 0;
    
    while (current) {
      path.push(current);
      if (val === current.value) {
        logger.warn(`BST Engine: Value ${val} already exists in the tree. Aborting insertion.`);
        alert("Value already exists in the BST!");
        setIsAnimating(false);
        return;
      }
      if (depth >= MAX_DEPTH) {
        logger.warn(`Constraint Hit: Max tree depth of ${MAX_DEPTH} reached. Cannot insert ${val}.`);
        alert(`Cannot insert! Maximum tree depth (${MAX_DEPTH}) reached to prevent UI overflow.`);
        setIsAnimating(false);
        return;
      }
      
      if (val < current.value) {
        if (!current.left) break;
        current = current.left;
      } else {
        if (!current.right) break;
        current = current.right;
      }
      depth++;
    }

    // Animate the traversal path
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        logger.info(`BST Traversal: Evaluating node ${path[step].value}...`);
        path.forEach(n => n.state = "default"); // Reset others
        path[step].state = "active";
        updateVisuals(newRoot);
        step++;
      } else {
        clearInterval(interval);
        
        // Final insertion step
        const newNode: TreeNode = { id: generateId(), value: val, left: null, right: null, x: 0, y: 0, state: "new" };
        logger.info(`BST Engine: Reached leaf. Inserting ${val}.`);
        
        if (val < current.value) current.left = newNode;
        else current.right = newNode;
        
        path.forEach(n => n.state = "default");
        setRoot(newRoot);
        updateVisuals(newRoot);
        setCustomValue("");

        setTimeout(() => {
          newNode.state = "default";
          updateVisuals(newRoot);
          setIsAnimating(false);
        }, 1000);
      }
    }, 600);
  };

  const handleSearch = () => {
    const target = parseInt(searchValue);
    if (isNaN(target) || !root || isAnimating) return;

    logger.info(`BST Engine: Initiating SEARCH operation for value ${target}.`);
    setIsAnimating(true);
    
    const workingTree = cloneTree(root);
    const path: TreeNode[] = [];
    let current = workingTree;
    
    while (current) {
      path.push(current);
      if (target === current.value) break;
      if (target < current.value) current = current.left;
      else current = current.right;
    }

    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length) {
        logger.info(`BST Traversal: Checking node ${path[step].value}.`);
        
        // Reset all to default, highlight current
        const resetTree = (n: TreeNode | null) => {
          if (!n) return;
          n.state = "default";
          resetTree(n.left);
          resetTree(n.right);
        };
        resetTree(workingTree);
        
        const currentNode = path[step];
        currentNode.state = currentNode.value === target ? "found" : "active";
        
        updateVisuals(workingTree);
        
        if (currentNode.value === target) {
          logger.info(`BST Engine: Target ${target} FOUND! O(log n) efficiency demonstrated.`);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 1500);
          return;
        }
        step++;
      } else {
        logger.info(`BST Engine: Reached leaf. Target ${target} NOT FOUND.`);
        clearInterval(interval);
        setTimeout(() => {
          const resetTree = (n: TreeNode | null) => { if (n) { n.state = "default"; resetTree(n.left); resetTree(n.right); } };
          resetTree(workingTree);
          updateVisuals(workingTree);
          setIsAnimating(false);
        }, 1000);
      }
    }, 800);
  };

  const handleClear = () => {
    logger.info("UI State: User cleared the BST.");
    setRoot(null);
    updateVisuals(null);
  };

  // --- Graphic Design State Mapping ---
  const getNodeStyles = (state: string) => {
    switch (state) {
      case "active":
        return "bg-amber-100 border-amber-500 shadow-amber-200 scale-125 z-20 ring-4 ring-amber-100 text-amber-900";
      case "found":
        return "bg-accent-success border-emerald-600 shadow-emerald-200 scale-125 z-20 ring-4 ring-emerald-200 text-white";
      case "new":
        return "bg-primary border-primary shadow-primary/20 animate-in zoom-in duration-300 text-white z-10";
      default:
        return "bg-bg-card border-border-default shadow-sm hover:border-primary hover:text-primary hover:shadow-premium text-text-heading";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      
      {/* Educational Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-text-heading">Binary Search Tree (BST)</h3>
        <p className="text-sm text-text-secondary">O(log n) structure. Left children are smaller, right children are larger.</p>
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-col items-center justify-center p-4 bg-bg-main border-2 border-dashed border-border-default rounded-card w-full shadow-inner overflow-x-auto custom-scrollbar">
        
        {renderNodes.length === 0 ? (
          <div className="text-text-placeholder font-medium text-lg min-h-[300px] flex items-center">
            <span>Empty Tree (Root is Null)</span>
          </div>
        ) : (
          <div className="relative min-w-[800px] h-[420px] shrink-0">
            
            {/* SVG Edge Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {renderEdges.map((edge, i) => (
                <line 
                  key={i} 
                  x1={edge.fromX} y1={edge.fromY} 
                  x2={edge.toX} y2={edge.toY} 
                  stroke="#cbd5e1" // slate-300
                  strokeWidth="3"
                  className="animate-in fade-in duration-500"
                />
              ))}
            </svg>

            {/* HTML Node Layer */}
            {renderNodes.map((node) => (
              <div 
                key={node.id}
                className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-black transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2 cursor-default ${getNodeStyles(node.state)}`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                title={`Node Memory Address: ${node.id}`}
              >
                {node.value}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col items-center space-y-6 w-full max-w-3xl">
        
        {/* Row 1: Insertions */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-sm w-full">
          <input 
            type="number" 
            placeholder="Node Value (e.g. 50)"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            disabled={isAnimating}
            className="w-48 px-4 py-2 border-2 border-border-default rounded-btn outline-none focus:border-primary text-text-heading font-medium transition-colors"
          />
          <button 
            onClick={handleInsert} disabled={isAnimating}
            className="px-8 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            Insert Node
          </button>
          <button 
            onClick={handleClear} disabled={isAnimating || !root}
            className="px-6 py-2 bg-rose-50 text-rose-600 font-bold rounded-btn hover:bg-rose-100 transition-colors disabled:opacity-50 ml-auto"
          >
            Clear Tree
          </button>
        </div>

        {/* Row 2: Search Traversal Engine */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-bg-card p-4 rounded-card border border-border-default shadow-premium w-full">
          <span className="text-text-secondary font-semibold px-2">Logarithmic Search:</span>
          <input 
            type="number" 
            placeholder="Find Target..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isAnimating}
            className="w-40 px-4 py-2 bg-bg-main border-2 border-slate-600 rounded-btn outline-none focus:border-emerald-400 text-white font-medium transition-colors placeholder:text-text-secondary"
          />
          <button 
            onClick={handleSearch} 
            disabled={isAnimating || !searchValue || !root}
            className="px-6 py-2 bg-accent-success text-white font-bold rounded-btn shadow hover:bg-accent-success transition-colors disabled:opacity-50"
          >
            ▶ Animate O(log n)
          </button>
        </div>

      </div>
    </div>
  );
}