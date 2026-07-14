import { AlgorithmStep, HashMapState, HashNode } from '../../types/dsa';

/**
 * Helper function to generate a random string ID without external dependencies.
 */
const generateId = () => Math.random().toString(36).substring(2, 15);

/**
 * Deep copies the bucket arrays to prevent reference mutation during time travel.
 */
const cloneBuckets = (buckets: HashNode[][]): HashNode[][] => 
  buckets.map(bucket => bucket.map(node => ({ ...node })));

export interface HashOperation {
  type: "insert" | "search" | "delete";
  key: string;
  value?: string | number;
}

/**
 * A basic string hashing function that sums the ASCII values of the characters.
 * This is used because it is visually easy to explain to users.
 */
const calculateHash = (key: string): number => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i);
  }
  return hash;
};

/**
 * Generates the step-by-step state for Hash Map operations.
 */
export const generateHashMapSteps = (
  tableSize: number,
  operations: HashOperation[]
): AlgorithmStep<HashMapState>[] => {
  const steps: AlgorithmStep<HashMapState>[] = [];
  const buckets: HashNode[][] = Array.from({ length: tableSize }, () => []);

  steps.push({
    snapshot: { buckets: cloneBuckets(buckets), currentKey: null, hashValue: null, targetBucket: null, operation: null },
    description: `Initialized an empty Hash Map with ${tableSize} buckets.`,
    activeIds: [],
    logMessage: `INIT: Created a hash table array of length ${tableSize}.`
  });

  for (const op of operations) {
    const { type, key, value } = op;
    
    // 1. Operation Start
    steps.push({
      snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: null, targetBucket: null, operation: type },
      description: `Starting ${type.toUpperCase()} operation for key: "${key}".`,
      activeIds: [],
      logMessage: `OP_START: Type=${type}, Key="${key}", Value=${value ?? 'N/A'}.`
    });

    // 2. Hash Calculation
    const rawHash = calculateHash(key);
    steps.push({
      snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket: null, operation: type },
      description: `Calculated raw hash for "${key}" by summing character ASCII values: ${rawHash}.`,
      activeIds: [],
      logMessage: `CALC_HASH: Summed ASCII codes for key "${key}" resulting in raw hash = ${rawHash}.`
    });

    // 3. Bucket Resolution (Modulo)
    const targetBucket = rawHash % tableSize;
    steps.push({
      snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
      description: `Applied modulo (${rawHash} % ${tableSize}) to find the target bucket index: ${targetBucket}.`,
      activeIds: [],
      logMessage: `CALC_BUCKET: Math calculation ${rawHash} % ${tableSize} = ${targetBucket}. Target bucket is ${targetBucket}.`
    });

    // 4. Execute Operation with Chaining Logic
    let foundNodeIndex = -1;
    const currentBucket = buckets[targetBucket];

    // Traverse the chain in the current bucket
    for (let i = 0; i < currentBucket.length; i++) {
      currentBucket[i].state = "active";
      steps.push({
        snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
        description: `Checking existing node in bucket ${targetBucket} with key "${currentBucket[i].key}".`,
        activeIds: [currentBucket[i].id],
        logMessage: `TRAVERSE: Comparing chain node key "${currentBucket[i].key}" === "${key}".`
      });

      if (currentBucket[i].key === key) {
        foundNodeIndex = i;
        currentBucket[i].state = "found";
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Match found for key "${key}"!`,
          activeIds: [currentBucket[i].id],
          logMessage: `TRAVERSE_MATCH: Key "${key}" successfully matched at bucket ${targetBucket}, chain index ${i}.`
        });
        break;
      } else {
        currentBucket[i].state = "default"; 
      }
    }

    if (type === "insert") {
      if (foundNodeIndex !== -1) {
        // Update existing node
        currentBucket[foundNodeIndex].value = value!;
        currentBucket[foundNodeIndex].state = "active";
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Updated existing value for key "${key}" to ${value}.`,
          activeIds: [currentBucket[foundNodeIndex].id],
          logMessage: `UPDATE: Mutated existing node value to ${value}.`
        });
        currentBucket[foundNodeIndex].state = "default";
      } else {
        // Append new node to the chain
        const newNode: HashNode = { id: generateId(), key, value: value!, state: "active" };
        currentBucket.push(newNode);
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Key "${key}" not found in chain. Inserted new node into bucket ${targetBucket}.`,
          activeIds: [newNode.id],
          logMessage: `INSERT: Appended new HashNode (Key="${key}", Value="${value}") to bucket ${targetBucket}.`
        });
        newNode.state = "default";
      }
    } else if (type === "search") {
      if (foundNodeIndex === -1) {
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Reached end of chain. Key "${key}" does not exist in the map.`,
          activeIds: [],
          logMessage: `SEARCH_FAIL: Key "${key}" was not found in the table.`
        });
      }
      if (foundNodeIndex !== -1) currentBucket[foundNodeIndex].state = "default";
    } else if (type === "delete") {
      if (foundNodeIndex !== -1) {
        currentBucket.splice(foundNodeIndex, 1);
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Successfully deleted key "${key}" from bucket ${targetBucket}.`,
          activeIds: [],
          logMessage: `DELETE_SUCCESS: Spliced node with key "${key}" out of bucket ${targetBucket} array.`
        });
      } else {
        steps.push({
          snapshot: { buckets: cloneBuckets(buckets), currentKey: key, hashValue: rawHash, targetBucket, operation: type },
          description: `Cannot delete. Key "${key}" does not exist.`,
          activeIds: [],
          logMessage: `DELETE_FAIL: Attempted deletion for missing key "${key}".`
        });
      }
    }

    // Reset visual states between operations
    buckets.forEach(bucket => bucket.forEach(node => node.state = "default"));
  }

  steps.push({
    snapshot: { buckets: cloneBuckets(buckets), currentKey: null, hashValue: null, targetBucket: null, operation: null },
    description: `Sequence completed.`,
    activeIds: [],
    logMessage: `END: All requested operations executed.`
  });

  return steps;
};