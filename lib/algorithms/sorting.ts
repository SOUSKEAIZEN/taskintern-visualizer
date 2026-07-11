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

// =========================================================
// 4. MERGE SORT
// =========================================================
export const generateMergeSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Merge Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];
  let currentArray: ArrayElement[] = initialValues.map((val) => ({ id: generateId(), value: val, state: "default" }));

  history.push({ snapshot: cloneState(currentArray), description: "Starting Merge Sort.", activeIds: [] });

  const mergeSortHelper = (arr: ArrayElement[], l: number, r: number) => {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    
    // Highlight division
    for(let i = l; i <= r; i++) arr[i].state = "active";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Dividing array from index ${l} to ${r} into two halves.`,
      activeIds: arr.slice(l, r + 1).map(x => x.id),
    });
    for(let i = l; i <= r; i++) arr[i].state = "default";

    mergeSortHelper(arr, l, m);
    mergeSortHelper(arr, m + 1, r);
    merge(arr, l, m, r);
  };

  const merge = (arr: ArrayElement[], l: number, m: number, r: number) => {
    const left = arr.slice(l, m + 1).map(x => ({...x}));
    const right = arr.slice(m + 1, r + 1).map(x => ({...x}));
    
    let i = 0, j = 0, k = l;
    
    while (i < left.length && j < right.length) {
      left[i].state = "comparing";
      right[j].state = "comparing";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Comparing ${left[i].value} and ${right[j].value}.`,
        activeIds: [left[i].id, right[j].id],
      });
      
      if (left[i].value <= right[j].value) {
        arr[k] = { ...left[i], state: "swapping" };
        i++;
      } else {
        arr[k] = { ...right[j], state: "swapping" };
        j++;
      }
      history.push({
        snapshot: cloneState(currentArray),
        description: `Placed ${arr[k].value} into the merged array.`,
        activeIds: [arr[k].id],
      });
      arr[k].state = "default";
      k++;
    }
    
    while (i < left.length) {
      arr[k] = { ...left[i], state: "swapping" };
      history.push({
        snapshot: cloneState(currentArray),
        description: `Copying remaining element ${arr[k].value} from left half.`,
        activeIds: [arr[k].id],
      });
      arr[k].state = "default";
      i++;
      k++;
    }
    
    while (j < right.length) {
      arr[k] = { ...right[j], state: "swapping" };
      history.push({
        snapshot: cloneState(currentArray),
        description: `Copying remaining element ${arr[k].value} from right half.`,
        activeIds: [arr[k].id],
      });
      arr[k].state = "default";
      j++;
      k++;
    }
    
    for(let x = l; x <= r; x++) arr[x].state = "sorted";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Merged subarray from index ${l} to ${r}.`,
      activeIds: arr.slice(l, r + 1).map(x => x.id),
    });
    for(let x = l; x <= r; x++) arr[x].state = "default";
  };

  mergeSortHelper(currentArray, 0, currentArray.length - 1);

  logger.info(`Algorithm Engine: Merge Sort complete. Generated ${history.length} video frames.`);
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({ snapshot: cloneState(currentArray), description: "Array is fully sorted!", activeIds: [] });

  return history;
};

// =========================================================
// 5. QUICK SORT
// =========================================================
export const generateQuickSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Quick Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];
  let currentArray: ArrayElement[] = initialValues.map((val) => ({ id: generateId(), value: val, state: "default" }));

  history.push({ snapshot: cloneState(currentArray), description: "Starting Quick Sort.", activeIds: [] });

  const partition = (arr: ArrayElement[], low: number, high: number): number => {
    const pivot = arr[high];
    pivot.state = "active";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Choosing ${pivot.value} as the pivot.`,
      activeIds: [pivot.id],
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      arr[j].state = "comparing";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Comparing ${arr[j].value} with pivot ${pivot.value}.`,
        activeIds: [arr[j].id, pivot.id],
      });

      if (arr[j].value < pivot.value) {
        i++;
        if (i !== j) {
           arr[i].state = "swapping";
           arr[j].state = "swapping";
           history.push({
             snapshot: cloneState(currentArray),
             description: `${arr[j].value} < ${pivot.value}. Swapping ${arr[i].value} and ${arr[j].value}.`,
             activeIds: [arr[i].id, arr[j].id],
           });
           const temp = arr[i];
           arr[i] = arr[j];
           arr[j] = temp;
           arr[i].state = "default";
        }
      }
      if (i > -1 && i !== j) arr[i].state = "default";
      arr[j].state = "default";
    }

    arr[i + 1].state = "swapping";
    pivot.state = "swapping";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Moving pivot ${pivot.value} to its correct position. Swapping with ${arr[i + 1].value}.`,
      activeIds: [arr[i + 1].id, pivot.id],
    });

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    arr[i + 1].state = "sorted";
    history.push({
      snapshot: cloneState(currentArray),
      description: `Pivot ${arr[i + 1].value} is now in its sorted position.`,
      activeIds: [arr[i + 1].id],
    });

    return i + 1;
  };

  const quickSortHelper = (arr: ArrayElement[], low: number, high: number) => {
    if (low < high) {
      const pi = partition(arr, low, high);
      quickSortHelper(arr, low, pi - 1);
      quickSortHelper(arr, pi + 1, high);
    } else if (low === high) {
      arr[low].state = "sorted";
      history.push({
        snapshot: cloneState(currentArray),
        description: `Element ${arr[low].value} is sorted trivially.`,
        activeIds: [arr[low].id],
      });
    }
  };

  quickSortHelper(currentArray, 0, currentArray.length - 1);

  logger.info(`Algorithm Engine: Quick Sort complete. Generated ${history.length} video frames.`);
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({ snapshot: cloneState(currentArray), description: "Array is fully sorted!", activeIds: [] });

  return history;
};