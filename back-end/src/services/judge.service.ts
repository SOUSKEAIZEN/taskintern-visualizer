import { runInDocker } from "../docker/runner";
import { evaluateSubmission } from "../judge/evaluator";
import { questions } from "../questions/dataset";

export const judgeSubmission = async (language: string, code: string, questionId: string) => {
  const question = questions.find((q) => q.id === questionId);
  if (!question) throw new Error("Question not found");

  const allTestcases = [...question.visibleTestcases, ...question.hiddenTestcases];
  
  let passed = 0;
  let executionTimeSum = 0;
  let finalStatus = "Accepted";
  
  const testcaseResults = [];

  for (let i = 0; i < allTestcases.length; i++) {
    const tc = allTestcases[i];
    const { stdout, stderr, executionTime } = await runInDocker(language, code, tc.input, question.timeLimit);
    
    executionTimeSum += executionTime;

    if (stderr) {
      if (stderr.includes("Time Limit Exceeded")) finalStatus = "Time Limit Exceeded";
      else finalStatus = "Runtime Error";
      
      testcaseResults.push({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: stderr.trim(),
        status: finalStatus,
        passed: false
      });
      break;
    }

    const { passed: isPassed, expectedOutput, actualOutput } = evaluateSubmission(tc.expectedOutput, stdout);
    
    testcaseResults.push({
      input: tc.input,
      expected: expectedOutput,
      actual: actualOutput,
      status: isPassed ? "Accepted" : "Wrong Answer",
      passed: isPassed
    });

    if (isPassed) {
      passed++;
    } else {
      finalStatus = "Wrong Answer";
      break;
    }
  }

  return {
    status: finalStatus,
    passed,
    total: allTestcases.length,
    testcases: testcaseResults,
    executionTime: executionTimeSum,
    memory: "N/A"
  };
};
