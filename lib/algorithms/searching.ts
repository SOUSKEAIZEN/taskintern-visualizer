import { ArrayElement, AlgorithmStep, SearchState } from '../../types/dsa';

/**
 * Helper function to generate a random string ID without external dependencies.
 */
const generateId = () => Math.random().toString(36).substring(2, 15);

/**
 * Helper function to deep copy the array state at each step.
 * Prevents reference mutation so the UI can safely travel backward and forward.
 */
const cloneArray = (arr: ArrayElement[]): ArrayElement[] => 
  arr.map(item => ({ ...item }));

/**
 * Generates the step-by-step state for Linear Search.
 * Time Complexity: O(n)
 */
export const generateLinearSearchSteps = (
  initialArray: number[],
  target: number
): AlgorithmStep<SearchState>[] => {
  const steps: AlgorithmStep<SearchState>[] = [];
  const array: ArrayElement[] = initialArray.map(val => ({
    id: generateId(),
    value: val,
    state: "default"
  }));

  steps.push({
    snapshot: { arraySnapshot: cloneArray(array), pointers: {}, target, foundIndex: null },
    description: `Starting Linear Search for target: ${target}`,
    activeIds: [],
    logMessage: `INIT: Searching for target=${target} in an array of length ${array.length}.`
  });

  let foundIndex: number | null = null;

  for (let i = 0; i < array.length; i++) {
    array[i].state = "active";
    
    steps.push({
      snapshot: { arraySnapshot: cloneArray(array), pointers: { current: i }, target, foundIndex: null },
      description: `Checking index ${i} with value ${array[i].value}.`,
      activeIds: [array[i].id],
      logMessage: `STEP: Loop iteration i=${i}. Checking if array[${i}] (${array[i].value}) === ${target}.`
    });

    if (array[i].value === target) {
      array[i].state = "found";
      foundIndex = i;
      
      steps.push({
        snapshot: { arraySnapshot: cloneArray(array), pointers: { current: i }, target, foundIndex },
        description: `Target ${target} found at index ${i}!`,
        activeIds: [array[i].id],
        logMessage: `SUCCESS: Target ${target} matches array[${i}]. Search complete.`
      });
      break;
    } else {
      array[i].state = "outOfBounds"; // Mark as checked/discarded
      
      steps.push({
        snapshot: { arraySnapshot: cloneArray(array), pointers: { current: i }, target, foundIndex: null },
        description: `Value ${array[i].value} is not the target. Moving forward.`,
        activeIds: [],
        logMessage: `FAIL: array[${i}] !== target. Discarding index ${i} and moving to i=${i + 1}.`
      });
    }
  }

  if (foundIndex === null) {
    steps.push({
      snapshot: { arraySnapshot: cloneArray(array), pointers: {}, target, foundIndex: null },
      description: `Target ${target} not found in the array.`,
      activeIds: [],
      logMessage: `END: Loop exhausted. Target ${target} was not found.`
    });
  }

  return steps;
};

/**
 * Generates the step-by-step state for Binary Search.
 * Time Complexity: O(log n)
 * Note: Assumes the input array is already sorted.
 */
export const generateBinarySearchSteps = (
  initialArray: number[],
  target: number
): AlgorithmStep<SearchState>[] => {
  const steps: AlgorithmStep<SearchState>[] = [];
  const array: ArrayElement[] = initialArray.map(val => ({
    id: generateId(),
    value: val,
    state: "default"
  }));

  let low = 0;
  let high = array.length - 1;

  steps.push({
    snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high }, target, foundIndex: null },
    description: `Starting Binary Search for target: ${target}. Array must be sorted.`,
    activeIds: [],
    logMessage: `INIT: Set low=${low}, high=${high}. Target=${target}.`
  });

  let foundIndex: number | null = null;

  while (low <= high) {
    steps.push({
      snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high }, target, foundIndex: null },
      description: `Current search boundaries: low is ${low}, high is ${high}.`,
      activeIds: [],
      logMessage: `STEP: Loop constraint met (low ${low} <= high ${high}). Proceeding.`
    });

    const mid = Math.floor((low + high) / 2);
    array[mid].state = "active";

    steps.push({
      snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high, mid }, target, foundIndex: null },
      description: `Calculated mid index is ${mid}. Checking value ${array[mid].value}.`,
      activeIds: [array[mid].id],
      logMessage: `CALC: mid = Math.floor((${low} + ${high}) / 2) = ${mid}. Active element array[${mid}] = ${array[mid].value}.`
    });

    if (array[mid].value === target) {
      array[mid].state = "found";
      foundIndex = mid;
      
      steps.push({
        snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high, mid }, target, foundIndex },
        description: `Target ${target} found at index ${mid}!`,
        activeIds: [array[mid].id],
        logMessage: `SUCCESS: array[${mid}] === ${target}. Found index ${mid}. Terminating loop.`
      });
      break;
    } else if (array[mid].value < target) {
      const oldLow = low;
      // Visually discard the left half by setting state to outOfBounds
      for (let i = low; i <= mid; i++) array[i].state = "outOfBounds";
      low = mid + 1;
      
      steps.push({
        snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high }, target, foundIndex: null },
        description: `${array[mid].value} is less than ${target}. Discarding left half.`,
        activeIds: [],
        logMessage: `SHIFT: array[${mid}] (${array[mid].value}) < ${target}. low shifts from ${oldLow} to ${low}. Discarding indices ${oldLow} to ${mid}.`
      });
    } else {
      const oldHigh = high;
      // Visually discard the right half by setting state to outOfBounds
      for (let i = mid; i <= high; i++) array[i].state = "outOfBounds";
      high = mid - 1;
      
      steps.push({
        snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high }, target, foundIndex: null },
        description: `${array[mid].value} is greater than ${target}. Discarding right half.`,
        activeIds: [],
        logMessage: `SHIFT: array[${mid}] (${array[mid].value}) > ${target}. high shifts from ${oldHigh} to ${high}. Discarding indices ${mid} to ${oldHigh}.`
      });
    }
  }

  if (foundIndex === null) {
    steps.push({
      snapshot: { arraySnapshot: cloneArray(array), pointers: { low, high }, target, foundIndex: null },
      description: `Target ${target} not found. Search space exhausted.`,
      activeIds: [],
      logMessage: `END: Loop terminated because low (${low}) > high (${high}). Target not found.`
    });
  }

  return steps;
};