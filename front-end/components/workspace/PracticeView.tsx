"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

const EditorLoading = () => (
  <div className="h-full w-full flex items-center justify-center bg-bg-main text-text-placeholder">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <span className="text-sm font-mono font-medium">Initializing Editor Engine...</span>
    </div>
  </div>
);

// Mirroring the backend dataset for frontend rendering
const QUESTIONS = [
  { id: "sort-1", category: "Sorting", title: "Bubble Sort Implementation", difficulty: "Easy", description: "Given an array of integers, sort it in ascending order using the Bubble Sort algorithm.", inputFormat: "First line contains N (number of elements). Second line contains N space-separated integers.", outputFormat: "Print the sorted array as space-separated integers.", starterCode: { cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Bubble Sort\n    return 0;\n}", java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Bubble Sort\n    }\n}", python: "def bubble_sort(arr):\n    # Implement Bubble Sort\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    bubble_sort(arr)\n    print(' '.join(map(str, arr)))" } },
  { id: "sort-2", category: "Sorting", title: "Merge Sort Implementation", difficulty: "Medium", description: "Given an array of integers, sort it in ascending order using the Merge Sort algorithm.", inputFormat: "First line contains N. Second line contains N space-separated integers.", outputFormat: "Print the sorted array as space-separated integers.", starterCode: { cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Merge Sort\n    return 0;\n}", java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Merge Sort\n    }\n}", python: "def merge_sort(arr):\n    # Implement Merge Sort\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    merge_sort(arr)\n    print(' '.join(map(str, arr)))" } },
  { id: "search-1", category: "Searching", title: "Linear Search", difficulty: "Easy", description: "Find the index (0-based) of the target element in an array using Linear Search. If not found, print -1.", inputFormat: "First line contains N and Target. Second line contains N integers.", outputFormat: "Print the index of Target, or -1.", starterCode: { cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Linear Search\n    return 0;\n}", java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Linear Search\n    }\n}", python: "def linear_search(arr, target):\n    # Implement Linear Search\n    pass\n\nif __name__ == '__main__':\n    n, target = map(int, input().split())\n    arr = list(map(int, input().split()))\n    print(linear_search(arr, target))" } },
  { id: "search-2", category: "Searching", title: "Binary Search", difficulty: "Medium", description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, print -1.", inputFormat: "First line contains N and Target. Second line contains N sorted integers.", outputFormat: "Print the index of Target, or -1.", starterCode: { cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Binary Search\n    return 0;\n}", java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Binary Search\n    }\n}", python: "def binary_search(arr, target):\n    # Implement Binary Search\n    pass\n\nif __name__ == '__main__':\n    n, target = map(int, input().split())\n    arr = list(map(int, input().split()))\n    print(binary_search(arr, target))" } },
  { id: "graph-1", category: "Graphs", title: "Breadth-First Search", difficulty: "Medium", description: "Given an undirected graph with V vertices and E edges, and a starting node S, print the BFS traversal (space-separated).", inputFormat: "First line contains V, E, S. Next E lines contain pairs (u, v) representing an edge.", outputFormat: "Space separated BFS traversal.", starterCode: { cpp: "// BFS Starter Code", java: "// BFS Starter Code", python: "# BFS Starter Code\npass" } },
  { id: "graph-2", category: "Graphs", title: "Depth-First Search", difficulty: "Medium", description: "Given an undirected graph with V vertices and E edges, and a starting node S, print the DFS traversal.", inputFormat: "First line contains V, E, S. Next E lines contain pairs (u, v).", outputFormat: "Space separated DFS traversal.", starterCode: { cpp: "// DFS Starter Code", java: "// DFS Starter Code", python: "# DFS Starter Code\npass" } }
];

export default function PracticeView() {
  const [selectedQuestion, setSelectedQuestion] = useState(QUESTIONS[0]);
  const [language, setLanguage] = useState<"cpp" | "java" | "python">("python");
  const [code, setCode] = useState(QUESTIONS[0].starterCode["python"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
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
  const [activeTab, setActiveTab] = useState(0);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const q = QUESTIONS.find(q => q.id === e.target.value) || QUESTIONS[0];
    setSelectedQuestion(q);
    setCode(q.starterCode[language]);
    setResult(null);
    setActiveTab(0);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "cpp" | "java" | "python";
    setLanguage(newLang);
    setCode(selectedQuestion.starterCode[newLang]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);
    setActiveTab(0);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
      const response = await fetch(`${apiUrl}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, questionId: selectedQuestion.id }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ status: "Connection Error", received: "Ensure backend is running." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentTestcase = result?.testcases?.[activeTab];

  return (
    <div className="flex flex-col h-full w-full bg-bg-main border border-border-default rounded-card overflow-hidden shadow-sm">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-3 bg-bg-card border-b border-border-default shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-bg-main px-3 py-1.5 rounded-btn border border-border-default">
            <span className="text-sm font-bold text-text-secondary uppercase">Problem:</span>
            <select 
              value={selectedQuestion.id}
              onChange={handleSelect}
              className="bg-transparent text-sm font-bold text-text-heading outline-none cursor-pointer"
            >
              {QUESTIONS.map(q => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="px-3 py-1.5 border border-border-default rounded-btn text-sm font-semibold text-text-heading outline-none cursor-pointer"
          >
            <option value="cpp">C++ (GCC 20)</option>
            <option value="java">Java (OpenJDK)</option>
            <option value="python">Python (3.11)</option>
          </select>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={`px-6 py-1.5 rounded-btn font-bold text-white transition-all text-sm flex items-center space-x-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-accent-success hover:bg-emerald-700'}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Judging...</span>
              </>
            ) : (
              <>
                <span>☁️ Submit Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Pane Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Pane: Question Details */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-border-default bg-bg-card flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-2xl font-extrabold text-text-heading">{selectedQuestion.title}</h1>
            <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${selectedQuestion.difficulty === 'Easy' ? 'bg-accent-success/10 text-accent-success' : 'bg-amber-100 text-amber-700'}`}>
              {selectedQuestion.difficulty}
            </span>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-text-heading mb-6 leading-relaxed text-sm md:text-base">{selectedQuestion.description}</p>
            
            <h3 className="text-sm font-bold text-text-placeholder uppercase tracking-wider mb-2">Input Format</h3>
            <p className="text-text-heading mb-6 bg-bg-main p-4 rounded-btn border border-border-default font-mono text-sm">{selectedQuestion.inputFormat}</p>
            
            <h3 className="text-sm font-bold text-text-placeholder uppercase tracking-wider mb-2">Output Format</h3>
            <p className="text-text-heading mb-6 bg-bg-main p-4 rounded-btn border border-border-default font-mono text-sm">{selectedQuestion.outputFormat}</p>
          </div>
        </div>
        
        {/* Right Pane: Editor & Results */}
        <div className="w-1/2 flex flex-col bg-bg-main relative">
          {/* Editor Area */}
          <div className={`flex flex-col transition-all duration-300 ${result ? 'h-1/2' : 'h-full'}`}>
            <Editor
              height="100%"
              language={language}
              theme={editorTheme}
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
              loading={<EditorLoading />}
            />
          </div>

          {/* Results Area (slides up when result exists) */}
          {result && (
            <div className="h-1/2 border-t-2 border-border-default bg-bg-card flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              
              {/* Status Header */}
              <div className={`px-4 py-2 font-bold text-white flex justify-between items-center ${result.status === 'Accepted' ? 'bg-accent-success' : result.status === 'Connection Error' ? 'bg-slate-500' : 'bg-rose-500'}`}>
                <span className="flex items-center space-x-2">
                  {result.status === 'Accepted' ? <span>✅</span> : result.status === 'Connection Error' ? <span>🔌</span> : <span>❌</span>}
                  <span>{result.status}</span>
                </span>
                {result.total !== undefined && <span>{result.passed} / {result.total} Testcases Passed</span>}
              </div>

              {/* Testcase Tabs */}
              {result.testcases && result.testcases.length > 0 && (
                <div className="flex bg-bg-main border-b border-border-default overflow-x-auto custom-scrollbar">
                  {result.testcases.map((tc: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap flex items-center space-x-2 border-r border-border-default ${activeTab === idx ? 'bg-bg-card text-primary border-b-2 border-b-indigo-600' : 'text-text-secondary hover:bg-slate-200'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${tc.passed ? 'bg-accent-success' : 'bg-rose-500'}`}></span>
                      <span>Case {idx + 1}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Testcase Details */}
              <div className="flex-1 overflow-y-auto bg-bg-card p-4 custom-scrollbar">
                {currentTestcase ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-text-placeholder uppercase mb-1">Input</div>
                      <div className="bg-bg-main p-3 rounded-btn border border-border-default font-mono text-sm text-text-heading whitespace-pre-wrap">{currentTestcase.input}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-placeholder uppercase mb-1">Expected Output</div>
                      <div className="bg-bg-main p-3 rounded-btn border border-border-default font-mono text-sm text-text-heading whitespace-pre-wrap">{currentTestcase.expected}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-placeholder uppercase mb-1">Actual Output / Error</div>
                      <div className={`p-3 rounded-btn border font-mono text-sm whitespace-pre-wrap ${currentTestcase.passed ? 'bg-accent-success/10 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                        {currentTestcase.actual || <span className="italic text-text-placeholder">No output</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-text-placeholder font-bold text-sm">
                    {result.received || "No testcase data available."}
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              {result.executionTime !== undefined && (
                <div className="px-4 py-2 bg-bg-main border-t border-border-default text-xs font-bold text-text-secondary flex justify-between">
                  <span>Execution Time: {result.executionTime}ms</span>
                  <span>Memory: {result.memory}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
