// taskintern-visualizer/types/dsa.ts

/**
 * VisualState determines the CSS styling and animation applied to an element.
 * default: standard color
 * active: currently selected or iterating over
 * comparing: being compared with another element
 * swapping: mid-animation for a swap operation
 * sorted: confirmed in its final correct position
 * found: target element successfully found (Search)
 * outOfBounds: element no longer in the search space (Binary Search)
 */
export type VisualState = "default" | "active" | "comparing" | "swapping" | "sorted" | "found" | "outOfBounds";

// ---------------------------------------------------------
// Data Structure Interfaces
// ---------------------------------------------------------

export interface ArrayElement {
  id: string; // Unique string (UUID) required for stable React animations
  value: number;
  state: VisualState;
}

export interface LinkedListNode {
  id: string;
  value: number;
  next: string | null; // References the ID of the next node
  state: VisualState;
}

export interface TreeNode {
  id: string;
  value: number;
  left: string | null;
  right: string | null;
  state: VisualState;
}

// ---------------------------------------------------------
// Playback Engine Interfaces
// ---------------------------------------------------------

/**
 * Used to record every single step of an algorithm.
 * This allows the user to "Time Travel" (Play, Pause, Step Back, Step Forward).
 */
export interface AlgorithmStep<T> {
  snapshot: T; // The exact state of the data structure at this moment
  description: string; // Text explaining what is happening (e.g., "Comparing 24 and 45")
  activeIds: string[]; // The specific elements that are interacting right now
  logMessage?: string; // Point of failure tracking log (e.g., "Step 4: Checking if array[mid] === target")
}

// ---------------------------------------------------------
// Searching Specific Interfaces
// ---------------------------------------------------------

/**
 * Tracks the index positions specific to searching algorithms 
 * to render UI pointers beneath the array.
 */
export interface SearchPointers {
  low?: number;     // Used for Binary Search
  high?: number;    // Used for Binary Search
  mid?: number;     // Used for Binary Search
  current?: number; // Used for Linear Search
}

/**
 * The absolute state of the search operation at any given step.
 */
export interface SearchState {
  arraySnapshot: ArrayElement[];
  pointers: SearchPointers;
  target: number;
  foundIndex: number | null;
}

// ---------------------------------------------------------
// Hash Map Specific Interfaces
// ---------------------------------------------------------

export interface HashNode {
  id: string;
  key: string;
  value: string | number;
  state: VisualState;
}

/**
 * The absolute state of the hash map operation at any given step.
 * Uses an array of arrays to visually represent separate chaining for collisions.
 */
export interface HashMapState {
  buckets: HashNode[][];
  currentKey: string | null;
  hashValue: number | null;     // Raw integer from the hash function
  targetBucket: number | null;  // Final index after applying modulo (hashValue % tableSize)
  operation: "insert" | "search" | "delete" | null;
}