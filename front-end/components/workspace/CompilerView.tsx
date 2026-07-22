"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const EditorLoading = () => (
  <div className="h-full w-full flex items-center justify-center bg-bg-main text-text-placeholder">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <span className="text-sm font-mono font-medium">Initializing Editor Engine...</span>
    </div>
  </div>
);

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <EditorLoading /> });

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full w-full bg-bg-main border border-border-default rounded-card overflow-hidden shadow-card"
    >
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

      <div className="flex flex-1 overflow-hidden relative">
        {/* Fake File Explorer Sidebar */}
        <div className="w-48 bg-bg-sidebar border-r border-border-default hidden md:flex flex-col z-10 shadow-sm shrink-0">
          <div className="px-4 py-3 text-[11px] font-heading font-bold text-text-placeholder uppercase tracking-widest border-b border-border-default">
            Explorer
          </div>
          <div className="p-2 flex flex-col space-y-1">
            {SUPPORTED_LANGUAGES.map(lang => (
              <div 
                key={lang.id} 
                onClick={() => {
                  setLanguage(lang.id);
                  setCode(DEFAULT_CODE[lang.id]);
                }}
                className={`flex items-center px-3 py-1.5 rounded-tag cursor-pointer text-[13px] font-mono transition-colors ${language === lang.id ? 'bg-primary/10 text-primary font-bold' : 'text-text-secondary hover:bg-bg-main'}`}
              >
                <span className="mr-2 opacity-60">📄</span>
                main.{lang.id === 'python' ? 'py' : lang.id}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex flex-col flex-1 overflow-hidden relative bg-[#1e1e1e]">
          {/* Fake Tabs */}
          <div className="flex items-center bg-bg-main border-b border-border-default h-10 shrink-0 shadow-sm">
            <div className="flex items-center px-4 h-full bg-bg-card border-r border-border-default border-t-2 border-t-primary text-text-heading text-[13px] font-mono font-bold cursor-default shadow-[0_2px_4px_rgba(0,0,0,0.02)] relative z-10">
              <span className="mr-2 opacity-60">📄</span>
              main.{language === 'python' ? 'py' : language}
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <Editor
              height="100%"
              language={language}
              theme={editorTheme}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 14, 
                padding: { top: 16 },
                cursorBlinking: "smooth",
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on"
              }}
            />
          </div>
        </div>
      </div>

      {/* I/O Section (Bottom) */}
      <div className="h-48 xl:h-64 flex flex-col md:flex-row bg-bg-card border-t border-border-default shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 shrink-0">
        
        {/* Stdin (Left) */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border-default flex flex-col bg-bg-main">
          <div className="px-4 py-2 bg-bg-card border-b border-border-default text-xs font-bold text-text-secondary uppercase flex items-center space-x-2">
            <span>⌨️</span><span>Input (stdin)</span>
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none outline-none font-mono text-sm text-text-heading bg-transparent transition-colors focus:bg-white dark:focus:bg-[#0b0f19] shadow-inner"
            placeholder="Enter input here..."
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
          />
        </div>
        
        {/* Output (Right) Terminal Style */}
        <div className="w-full md:w-2/3 flex flex-col bg-slate-900 flex-1 min-h-0 border-l border-slate-800 shadow-inner relative">
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-2">
              <span>🖥️</span><span>Terminal Output</span>
            </div>
            <button onClick={handleClear} className="text-slate-500 hover:text-white transition-colors">Clear</button>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-[13px] whitespace-pre-wrap custom-scrollbar">
            {stdout && <div className="text-emerald-400">{stdout}</div>}
            {stderr && <div className="text-rose-400">{stderr}</div>}
            {!stdout && !stderr && <div className="text-slate-600 flex items-center h-full">user@taskintern:~$ _</div>}
          </div>
          {executionTime !== null && (
            <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] font-bold text-slate-500 flex justify-between uppercase tracking-widest">
              <span>Time: {executionTime}ms</span>
              <span>Memory: 256MB</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
