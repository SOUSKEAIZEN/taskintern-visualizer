// taskintern-visualizer/lib/algorithms/sorting.ts

import { AlgorithmStep, ArrayElement } from "../../types/dsa";
import { logger } from "../logger";

// Helper to generate simple unique IDs without external libraries
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to deep clone the array state for our history snapshots
const cloneState = (arr: ArrayElement[]): ArrayElement[] =>
  arr.map((item) => ({ ...item }));

// =========================================================
// 1. BUBBLE SORT
// =========================================================
export const generateBubbleSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Bubble Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];
  let currentArray: ArrayElement[] = initialValues.map((val) => ({ id: generateId(), value: val, state: "default" }));

  history.push({ snapshot: cloneState(currentArray), description: "Starting Bubble Sort.", activeIds: [] });
  const n = currentArray.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      currentArray[j].state = "comparing";
      currentArray[j + 1].state = "comparing";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Comparing ${currentArray[j].value} and ${currentArray[j + 1].value}.`,
        activeIds: [currentArray[j].id, currentArray[j + 1].id],
      });

      if (currentArray[j].value > currentArray[j + 1].value) {
        currentArray[j].state = "swapping";
        currentArray[j + 1].state = "swapping";
        history.push({
          snapshot: cloneState(currentArray),
          description: `${currentArray[j].value} > ${currentArray[j + 1].value}. Swapping!`,
          activeIds: [currentArray[j].id, currentArray[j + 1].id],
        });

        const temp = currentArray[j];
        currentArray[j] = currentArray[j + 1];
        currentArray[j + 1] = temp;

        history.push({
          snapshot: cloneState(currentArray),
          description: `Swapped ${currentArray[j].value} and ${currentArray[j + 1].value}.`,
          activeIds: [currentArray[j].id, currentArray[j + 1].id],
        });
      }
      currentArray[j].state = "default";
      currentArray[j + 1].state = "default";
    }
    currentArray[n - i - 1].state = "sorted";
    history.push({
      snapshot: cloneState(currentArray),
      description: `${currentArray[n - i - 1].value} is locked in its final position.`,
      activeIds: [currentArray[n - i - 1].id],
    });
  }

  logger.info(`Algorithm Engine: Bubble Sort complete. Generated ${history.length} video frames.`);
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({ snapshot: cloneState(currentArray), description: "Array is fully sorted!", activeIds: [] });

  return history;
};

// =========================================================
// 2. SELECTION SORT
// =========================================================
export const generateSelectionSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Selection Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];
  let currentArray: ArrayElement[] = initialValues.map((val) => ({ id: generateId(), value: val, state: "default" }));

  history.push({ snapshot: cloneState(currentArray), description: "Starting Selection Sort.", activeIds: [] });
  const n = currentArray.length;

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    currentArray[minIdx].state = "active"; // Highlight the assumed minimum
    
    history.push({
      snapshot: cloneState(currentArray),
      description: `Assuming ${currentArray[minIdx].value} is the minimum in the unsorted portion.`,
      activeIds: [currentArray[minIdx].id],
    });

    for (let j = i + 1; j < n; j++) {
      currentArray[j].state = "comparing";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Comparing current min (${currentArray[minIdx].value}) with ${currentArray[j].value}.`,
        activeIds: [currentArray[minIdx].id, currentArray[j].id],
      });

      if (currentArray[j].value < currentArray[minIdx].value) {
        currentArray[minIdx].state = "default"; // Remove old min highlight
        minIdx = j;
        currentArray[minIdx].state = "active"; // Highlight new min
        
        history.push({
          snapshot: cloneState(currentArray),
          description: `Found a new minimum: ${currentArray[minIdx].value}.`,
          activeIds: [currentArray[minIdx].id],
        });
      } else {
        currentArray[j].state = "default"; // Reset if not a new minimum
      }
    }

    if (minIdx !== i) {
      currentArray[i].state = "swapping";
      currentArray[minIdx].state = "swapping";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Swapping ${currentArray[i].value} with the minimum ${currentArray[minIdx].value}.`,
        activeIds: [currentArray[i].id, currentArray[minIdx].id],
      });

      const temp = currentArray[i];
      currentArray[i] = currentArray[minIdx];
      currentArray[minIdx] = temp;
    }

    // Reset states and mark the current index as sorted
    currentArray[i].state = "sorted";
    if (minIdx !== i) currentArray[minIdx].state = "default";

    history.push({
      snapshot: cloneState(currentArray),
      description: `${currentArray[i].value} is now in its correct sorted position.`,
      activeIds: [currentArray[i].id],
    });
  }

  logger.info(`Algorithm Engine: Selection Sort complete. Generated ${history.length} video frames.`);
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({ snapshot: cloneState(currentArray), description: "Array is fully sorted!", activeIds: [] });

  return history;
};

// =========================================================
// 3. INSERTION SORT
// =========================================================
export const generateInsertionSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Insertion Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];
  let currentArray: ArrayElement[] = initialValues.map((val) => ({ id: generateId(), value: val, state: "default" }));

  history.push({ snapshot: cloneState(currentArray), description: "Starting Insertion Sort.", activeIds: [] });
  const n = currentArray.length;

  // The first element is conceptually "sorted" in a sub-array of 1
  currentArray[0].state = "sorted";
  history.push({
    snapshot: cloneState(currentArray),
    description: `The first element (${currentArray[0].value}) is considered trivially sorted.`,
    activeIds: [currentArray[0].id],
  });

  for (let i = 1; i < n; i++) {
    let j = i;
    
    currentArray[j].state = "active";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Evaluating ${currentArray[j].value} to insert into the sorted portion.`,
      activeIds: [currentArray[j].id],
    });

    while (j > 0 && currentArray[j - 1].value > currentArray[j].value) {
      currentArray[j].state = "swapping";
      currentArray[j - 1].state = "swapping";
      
      history.push({
        snapshot: cloneState(currentArray),
        description: `${currentArray[j].value} is less than ${currentArray[j - 1].value}. Swapping backwards.`,
        activeIds: [currentArray[j].id, currentArray[j - 1].id],
      });

      const temp = currentArray[j];
      currentArray[j] = currentArray[j - 1];
      currentArray[j - 1] = temp;

      // Ensure the boundary keeps its conceptual sorted color temporarily while moving
      currentArray[j].state = "sorted";
      currentArray[j - 1].state = "active";

      history.push({
        snapshot: cloneState(currentArray),
        description: `Moved ${currentArray[j - 1].value} backwards.`,
        activeIds: [currentArray[j - 1].id],
      });

      j--;
    }

    currentArray[j].state = "sorted";
    history.push({
      snapshot: cloneState(currentArray),
      description: `${currentArray[j].value} has found its correct relative position.`,
      activeIds: [currentArray[j].id],
    });
  }

  logger.info(`Algorithm Engine: Insertion Sort complete. Generated ${history.length} video frames.`);
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({ snapshot: cloneState(currentArray), description: "Array is fully sorted!", activeIds: [] });

  return history;
};