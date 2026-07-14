import { runInDocker } from "../docker/runner";

export const executeCode = async (language: string, code: string, stdin: string) => {
  const { stdout, stderr, executionTime } = await runInDocker(language, code, stdin);
  
  let status = "Success";
  if (stderr.includes("Time Limit Exceeded")) status = "Time Limit Exceeded";
  else if (stderr) status = "Runtime Error";

  return {
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    executionTime,
    memory: "N/A", // Docker limits to 256m, tracking exact bytes requires advanced cgroup parsing
    status
  };
};
