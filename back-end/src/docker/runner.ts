import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import util from "util";

const execAsync = util.promisify(exec);

const TEMP_DIR = path.join(__dirname, "../../temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const runInDocker = async (
  language: string,
  code: string,
  stdin: string,
  timeLimit: number = 3
): Promise<{ stdout: string; stderr: string; executionTime: number }> => {
  const runId = uuidv4();
  const runDir = path.join(TEMP_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  let fileName = "";
  let compileCmd = "";
  let runCmd = "";

  if (language === "python") {
    fileName = "main.py";
    runCmd = `python3 ${path.join(runDir, fileName)} < ${path.join(runDir, "input.txt")}`;
  } else if (language === "cpp") {
    fileName = "main.cpp";
    compileCmd = `g++ -O2 -std=c++20 ${path.join(runDir, fileName)} -o ${path.join(runDir, "a.out")}`;
    runCmd = `${path.join(runDir, "a.out")} < ${path.join(runDir, "input.txt")}`;
  } else if (language === "java") {
    fileName = "Main.java";
    compileCmd = `javac ${path.join(runDir, fileName)}`;
    runCmd = `java -cp ${runDir} Main < ${path.join(runDir, "input.txt")}`;
  } else {
    throw new Error("Unsupported language");
  }

  fs.writeFileSync(path.join(runDir, fileName), code);
  fs.writeFileSync(path.join(runDir, "input.txt"), stdin);

  const startTime = Date.now();
  let actualTimeout = timeLimit * 1000;
  if (language === "java") {
    actualTimeout += 2000; // JVM cold start penalty
  }

  try {
    // 1. Compile Phase (if needed)
    if (compileCmd) {
      try {
        await execAsync(compileCmd, { timeout: 10000 }); // 10s for compilation
      } catch (compileErr: any) {
        let errMsg = compileErr.stderr || compileErr.message || "Compilation Error";
        if (errMsg.includes("javac: command not found") || errMsg.includes("Unable to locate a Java Runtime")) {
           errMsg = "Java compiler (javac) is not installed on the server environment. Please install the JDK.";
        }
        return { stdout: "", stderr: errMsg, executionTime: Date.now() - startTime };
      }
    }

    // 2. Execution Phase
    const { stdout, stderr } = await execAsync(runCmd, { 
      timeout: actualTimeout
    });
    const executionTime = Date.now() - startTime;
    return { stdout, stderr, executionTime };
  } catch (err: any) {
    const executionTime = Date.now() - startTime;
    let errorMsg = err.stderr || err.message;
    if (err.killed) {
      errorMsg = "Time Limit Exceeded";
    }
    return { stdout: err.stdout || "", stderr: errorMsg, executionTime };
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
};
