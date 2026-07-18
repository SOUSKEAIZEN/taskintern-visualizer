"use client";

import { useState, useEffect } from "react";
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
  const [editorTheme, setEditorTheme] = useState("vs-light");

  useEffect(() => {
    const checkTheme = () => {
      if (document.documentElement.classList.contains("dark")) {
        setEditorTheme("vs-dark");
      } else {
        setEditorTheme("vs-light");
      }
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
      const response = await fetch(`${apiUrl}/api/run`, {
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
    <div className="flex flex-col h-full w-full bg-bg-main border border-border-default rounded-card overflow-hidden shadow-sm">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-3 bg-bg-card border-b border-border-default shrink-0">
        <h2 className="text-xl font-bold text-text-heading ml-2">Online Compiler</h2>
        <div className="flex items-center space-x-3">
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="px-3 py-1.5 border border-border-default rounded-btn text-sm font-semibold text-text-heading outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
          <button 
            onClick={handleRun} 
            disabled={isCompiling}
            className={`px-6 py-1.5 rounded-btn font-bold text-white transition-all flex items-center space-x-2 text-sm ${isCompiling ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
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
      </div>

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Editor Section (Top) */}
        <div className="flex-1 min-h-[50%]">
          <Editor
            height="100%"
            language={language}
            theme={editorTheme}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
          />
        </div>

        {/* I/O Section (Bottom) */}
        <div className="h-64 flex bg-bg-card border-t-2 border-border-default shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
          
          {/* Stdin (Left) */}
          <div className="w-1/3 border-r border-border-default flex flex-col bg-bg-main">
            <div className="px-4 py-2 bg-bg-card border-b border-border-default text-xs font-bold text-text-secondary uppercase flex items-center space-x-2">
              <span>⌨️</span><span>Input (stdin)</span>
            </div>
            <textarea
              className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-text-heading bg-transparent"
              placeholder="Enter input here..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
          
          {/* Output (Right) */}
          <div className="w-2/3 flex flex-col bg-bg-card">
            <div className="px-4 py-2 bg-bg-card border-b border-border-default text-xs font-bold text-text-secondary uppercase flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>🖥️</span><span>Output Console</span>
              </div>
              <button onClick={handleClear} className="text-text-placeholder hover:text-rose-500 transition-colors">Clear</button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap custom-scrollbar">
              {stdout && <div className="text-accent-success bg-accent-success/10 p-3 rounded-btn border border-emerald-100 mb-2">{stdout}</div>}
              {stderr && <div className="text-rose-700 bg-rose-50 p-3 rounded-btn border border-rose-100">{stderr}</div>}
              {!stdout && !stderr && <div className="text-text-placeholder italic flex items-center justify-center h-full">No output yet...</div>}
            </div>
            {executionTime !== null && (
              <div className="px-4 py-2 bg-bg-main border-t border-border-default text-xs font-bold text-text-secondary flex justify-between">
                <span>Execution Time: {executionTime}ms</span>
                <span>Limits: 3.0s, 256MB</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
