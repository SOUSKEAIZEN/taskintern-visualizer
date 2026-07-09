"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

const SUPPORTED_LANGUAGES = [
  { id: "cpp", label: "C++ (GCC 20)" },
  { id: "java", label: "Java (OpenJDK)" },
  { id: "python", label: "Python (3.11)" },
];

const DEFAULT_CODE: Record<string, string> = {
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World!\" << endl;\n    return 0;\n}",
  java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n}",
  python: "print(\"Hello World!\")",
};

export default function CompilerView() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [stdin, setStdin] = useState("");
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const handleRun = async () => {
    setIsCompiling(true);
    setStdout("");
    setStderr("");
    setExecutionTime(null);

    try {
      const response = await fetch("http://localhost:5005/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      const data = await response.json();
      
      if (data.stdout) setStdout(data.stdout);
      if (data.stderr) setStderr(data.stderr);
      if (data.executionTime !== undefined) setExecutionTime(data.executionTime);
    } catch (err) {
      setStderr("Error connecting to compilation server. Make sure the taskintern-judge backend is running on port 5005.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleClear = () => {
    setStdout("");
    setStderr("");
    setExecutionTime(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-slate-800">Online Compiler</h2>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleRun} 
          disabled={isCompiling}
          className={`px-6 py-2 rounded-lg font-bold text-white transition-all flex items-center space-x-2 ${isCompiling ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {isCompiling ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <span>▶ Run Code</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Section */}
        <div className="w-2/3 border-r border-slate-200">
          <Editor
            height="100%"
            language={language}
            theme="vs-light"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
        </div>

        {/* I/O Section */}
        <div className="w-1/3 flex flex-col bg-white">
          <div className="flex-1 border-b border-slate-200 flex flex-col">
            <div className="p-2 bg-slate-100 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">Input (stdin)</div>
            <textarea
              className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-slate-700"
              placeholder="Enter input here..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="p-2 bg-slate-100 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 flex justify-between items-center">
              <span>Output Console</span>
              <button onClick={handleClear} className="text-slate-400 hover:text-rose-500">Clear</button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-900 text-slate-300 font-mono text-sm whitespace-pre-wrap">
              {stdout && <div className="text-emerald-400 mb-2">{stdout}</div>}
              {stderr && <div className="text-rose-400">{stderr}</div>}
              {!stdout && !stderr && <div className="text-slate-600 italic">No output yet...</div>}
            </div>
            {executionTime !== null && (
              <div className="p-2 bg-slate-800 text-slate-400 text-xs border-t border-slate-700">
                Execution Time: {executionTime}ms | Limits: 3.0s, 256MB
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
