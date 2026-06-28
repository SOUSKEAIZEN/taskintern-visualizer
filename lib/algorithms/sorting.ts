// taskintern-visualizer/lib/algorithms/sorting.ts

import { AlgorithmStep, ArrayElement } from "../../types/dsa";
import { logger } from "../logger";

// Helper to generate simple unique IDs without external libraries
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to deep clone the array state for our history snapshots
// This ensures our "video frames" don't accidentally overwrite each other
const cloneState = (arr: ArrayElement[]): ArrayElement[] =>
  arr.map((item) => ({ ...item }));

export const generateBubbleSortSteps = (initialValues: number[]): AlgorithmStep<ArrayElement[]>[] => {
  logger.info(`Algorithm Engine: Initializing Bubble Sort for array of length ${initialValues.length}.`);

  const history: AlgorithmStep<ArrayElement[]>[] = [];

  // Step 1: Initialize the array elements with UUIDs and a default visual state
  let currentArray: ArrayElement[] = initialValues.map((val) => ({
    id: generateId(),
    value: val,
    state: "default",
  }));

  // Save the very first frame
  history.push({
    snapshot: cloneState(currentArray),
    description: "Starting Bubble Sort.",
    activeIds: [],
  });

  const n = currentArray.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Frame: Highlight elements being compared
      currentArray[j].state = "comparing";
      currentArray[j + 1].state = "comparing";

      history.push({
        snapshot: cloneState(currentArray),
        description: `Comparing ${currentArray[j].value} and ${currentArray[j + 1].value}.`,
        activeIds: [currentArray[j].id, currentArray[j + 1].id],
      });

      if (currentArray[j].value > currentArray[j + 1].value) {
        // Frame: Highlight elements preparing to swap
        currentArray[j].state = "swapping";
        currentArray[j + 1].state = "swapping";

        history.push({
          snapshot: cloneState(currentArray),
          description: `${currentArray[j].value} is greater than ${currentArray[j + 1].value}. Swapping!`,
          activeIds: [currentArray[j].id, currentArray[j + 1].id],
        });

        // Perform the actual data swap
        const temp = currentArray[j];
        currentArray[j] = currentArray[j + 1];
        currentArray[j + 1] = temp;

        // Frame: Show the result of the swap
        history.push({
          snapshot: cloneState(currentArray),
          description: `Swapped ${currentArray[j].value} and ${currentArray[j + 1].value}.`,
          activeIds: [currentArray[j].id, currentArray[j + 1].id],
        });
      }

      // Reset states back to default before moving to the next pair
      currentArray[j].state = "default";
      currentArray[j + 1].state = "default";
    }

      // At the end of each full pass, the last element is mathematically in its final sorted position
      currentArray[n - i - 1].state = "sorted";
      history.push({
        snapshot: cloneState(currentArray),
        description: `${currentArray[n - i - 1].value} is now in its final sorted position.`,
        activeIds: [currentArray[n - i - 1].id],
      });
  }

  logger.info(`Algorithm Engine: Bubble Sort complete. Generated ${history.length} video frames.`);

  // Final safeguard frame: Mark everything as sorted
  currentArray = currentArray.map(el => ({ ...el, state: "sorted" }));
  history.push({
    snapshot: cloneState(currentArray),
    description: "Array is fully sorted! Algorithm complete.",
    activeIds: [],
  });

  return history;
};