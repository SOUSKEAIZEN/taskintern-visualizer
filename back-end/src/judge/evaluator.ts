export const evaluateSubmission = (expected: string, actual: string) => {
  // Normalize line endings and trim whitespace
  const normExpected = expected.replace(/\r\n/g, "\n").trim();
  const normActual = actual.replace(/\r\n/g, "\n").trim();
  
  return {
    passed: normExpected === normActual,
    expectedOutput: normExpected,
    actualOutput: normActual
  };
};
