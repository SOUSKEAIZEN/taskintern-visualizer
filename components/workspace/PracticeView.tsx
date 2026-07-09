"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

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

  const handleSelect = (q: any) => {
    setSelectedQuestion(q);
    setCode(q.starterCode[language]);
    setResult(null);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "cpp" | "java" | "python";
    setLanguage(newLang);
    setCode(selectedQuestion.starterCode[newLang]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5005/api/submit", {
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

  return (
    <div className="flex h-full w-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar List */}
      <div className="w-1/4 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 bg-slate-100 font-bold text-slate-700 uppercase text-sm sticky top-0">Questions</div>
        {QUESTIONS.map(q => (
          <div 
            key={q.id} 
            onClick={() => handleSelect(q)}
            className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedQuestion.id === q.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
          >
            <div className="text-xs font-bold text-slate-400 uppercase mb-1">{q.category}</div>
            <div className="font-semibold text-slate-800">{q.title}</div>
            <div className={`text-xs font-bold mt-2 ${q.difficulty === 'Easy' ? 'text-emerald-500' : 'text-amber-500'}`}>{q.difficulty}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-3/4 flex flex-col relative">
        <div className="flex flex-1 overflow-hidden">
          {/* Question Details */}
          <div className="w-1/2 overflow-y-auto p-6 border-r border-slate-200 bg-white">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{selectedQuestion.title}</h1>
            <div className={`text-sm font-bold uppercase tracking-wider mb-6 ${selectedQuestion.difficulty === 'Easy' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {selectedQuestion.difficulty}
            </div>
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-700 mb-6 leading-relaxed">{selectedQuestion.description}</p>
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Input Format</h3>
            <p className="text-slate-700 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedQuestion.inputFormat}</p>
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Output Format</h3>
            <p className="text-slate-700 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedQuestion.outputFormat}</p>
          </div>
          
          {/* Editor Area */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between p-3 bg-slate-100 border-b border-slate-200">
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="cpp">C++ (GCC 20)</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="python">Python (3.11)</option>
              </select>
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={`px-4 py-1.5 rounded-lg font-bold text-white transition-all text-sm ${isSubmitting ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Code'}
              </button>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language}
                theme="vs-light"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{ minimap: { enabled: false }, fontSize: 14 }}
              />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="h-64 border-t border-slate-200 bg-white flex flex-col shadow-inner shrink-0">
            <div className={`p-3 font-bold text-white ${result.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'} flex justify-between`}>
              <span>Status: {result.status}</span>
              {result.total !== undefined && <span>Testcases: {result.passed} / {result.total} Passed</span>}
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-900 text-sm font-mono space-y-4">
              {result.failedCase && (
                <div>
                  <div className="text-slate-400 font-bold mb-1">Failed on Input:</div>
                  <div className="bg-slate-800 p-2 rounded text-slate-200 whitespace-pre-wrap">{result.failedCase}</div>
                </div>
              )}
              {result.expected && (
                <div>
                  <div className="text-slate-400 font-bold mb-1">Expected Output:</div>
                  <div className="bg-slate-800 p-2 rounded text-emerald-400 whitespace-pre-wrap">{result.expected}</div>
                </div>
              )}
              {result.received && (
                <div>
                  <div className="text-slate-400 font-bold mb-1">Your Output / Error:</div>
                  <div className="bg-slate-800 p-2 rounded text-rose-400 whitespace-pre-wrap">{result.received}</div>
                </div>
              )}
              <div className="text-slate-500 pt-2 border-t border-slate-800">
                Execution Time: {result.executionTime}ms | Memory: {result.memory}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
