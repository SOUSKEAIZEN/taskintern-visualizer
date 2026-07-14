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
  let dockerImage = "";
  let compileCmd = "";
  let runCmd = "";

  if (language === "python") {
    fileName = "main.py";
    dockerImage = "judge-python:latest";
    runCmd = `python3 /app/main.py < /app/input.txt`;
  } else if (language === "cpp") {
    fileName = "main.cpp";
    dockerImage = "judge-cpp:latest";
    compileCmd = `g++ -O2 -std=c++20 /app/main.cpp -o /app/a.out`;
    runCmd = `/app/a.out < /app/input.txt`;
  } else if (language === "java") {
    fileName = "Main.java";
    dockerImage = "judge-java:latest";
    compileCmd = `javac /app/Main.java`;
    runCmd = `java -cp /app Main < /app/input.txt`;
  } else {
    throw new Error("Unsupported language");
  }

  fs.writeFileSync(path.join(runDir, fileName), code);
  fs.writeFileSync(path.join(runDir, "input.txt"), stdin);

  // We map the user id to 1000 to prevent root execution inside the container
  const dockerRunOptions = `--rm --network none --memory 256m --cpus 0.5 -v ${runDir}:/app`;
  
  const pathExport = `export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:/Users/aizen/.docker/bin:/Applications/Docker.app/Contents/Resources/bin;`;
  
  let finalCmd = "";
  if (compileCmd) {
    finalCmd = `${pathExport} docker run ${dockerRunOptions} ${dockerImage} sh -c "${compileCmd} && ${runCmd}"`;
  } else {
    finalCmd = `${pathExport} docker run ${dockerRunOptions} ${dockerImage} sh -c "${runCmd}"`;
  }

  const startTime = Date.now();
  try {
    // Docker execution with a slight buffer over the timeLimit for container spinup
    const customEnv = { ...process.env, PATH: `${process.env.PATH || ''}:/usr/local/bin:/opt/homebrew/bin:/Users/${process.env.USER}/.docker/bin` };
    const { stdout, stderr } = await execAsync(finalCmd, { 
      timeout: timeLimit * 1000 + 2000,
      env: customEnv
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
