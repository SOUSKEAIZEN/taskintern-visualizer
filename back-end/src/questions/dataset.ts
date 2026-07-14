export interface Question {
  id: string;
  category: "Sorting" | "Searching" | "Graphs";
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  inputFormat: string;
  outputFormat: string;
  starterCode: {
    cpp: string;
    java: string;
    python: string;
  };
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
  visibleTestcases: Testcase[];
  hiddenTestcases: Testcase[];
}

export interface Testcase {
  input: string;
  expectedOutput: string;
}

export const questions: Question[] = [
  {
    id: "sort-1",
    category: "Sorting",
    title: "Bubble Sort Implementation",
    difficulty: "Easy",
    description: "Given an array of integers, sort it in ascending order using the Bubble Sort algorithm.",
    inputFormat: "First line contains N (number of elements). Second line contains N space-separated integers.",
    outputFormat: "Print the sorted array as space-separated integers.",
    timeLimit: 1,
    memoryLimit: 256,
    starterCode: {
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    // Implement Bubble Sort\n    \n    for(int i = 0; i < n; i++) cout << arr[i] << (i == n-1 ? \"\" : \" \");\n    cout << endl;\n    return 0;\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int[] arr = new int[n];\n        for (int i = 0; i < n; i++) {\n            arr[i] = scanner.nextInt();\n        }\n        // Implement Bubble Sort\n        \n        for (int i = 0; i < n; i++) {\n            System.out.print(arr[i] + (i == n - 1 ? \"\" : \" \"));\n        }\n        System.out.println();\n    }\n}",
      python: "def bubble_sort(arr):\n    # Implement Bubble Sort\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    bubble_sort(arr)\n    print(' '.join(map(str, arr)))"
    },
    visibleTestcases: [
      { input: "5\n4 1 3 9 7", expectedOutput: "1 3 4 7 9" }
    ],
    hiddenTestcases: [
      { input: "10\n10 9 8 7 6 5 4 3 2 1", expectedOutput: "1 2 3 4 5 6 7 8 9 10" },
      { input: "3\n1 1 1", expectedOutput: "1 1 1" }
    ]
  },
  {
    id: "sort-2",
    category: "Sorting",
    title: "Merge Sort Implementation",
    difficulty: "Medium",
    description: "Given an array of integers, sort it in ascending order using the Merge Sort algorithm.",
    inputFormat: "First line contains N. Second line contains N space-separated integers.",
    outputFormat: "Print the sorted array as space-separated integers.",
    timeLimit: 1,
    memoryLimit: 256,
    starterCode: {
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Merge Sort\n    return 0;\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Merge Sort\n    }\n}",
      python: "def merge_sort(arr):\n    # Implement Merge Sort\n    pass\n\nif __name__ == '__main__':\n    n = int(input())\n    arr = list(map(int, input().split()))\n    merge_sort(arr)\n    print(' '.join(map(str, arr)))"
    },
    visibleTestcases: [
      { input: "5\n12 11 13 5 6", expectedOutput: "5 6 11 12 13" }
    ],
    hiddenTestcases: [
      { input: "6\n-1 -5 -10 0 100 2", expectedOutput: "-10 -5 -1 0 2 100" }
    ]
  },
  {
    id: "search-1",
    category: "Searching",
    title: "Linear Search",
    difficulty: "Easy",
    description: "Find the index (0-based) of the target element in an array using Linear Search. If not found, print -1.",
    inputFormat: "First line contains N and Target. Second line contains N integers.",
    outputFormat: "Print the index of Target, or -1.",
    timeLimit: 1,
    memoryLimit: 256,
    starterCode: {
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, target;\n    cin >> n >> target;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) cin >> arr[i];\n    // Implement Linear Search\n    return 0;\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Linear Search\n    }\n}",
      python: "def linear_search(arr, target):\n    # Implement Linear Search\n    pass\n\nif __name__ == '__main__':\n    n, target = map(int, input().split())\n    arr = list(map(int, input().split()))\n    print(linear_search(arr, target))"
    },
    visibleTestcases: [
      { input: "5 9\n4 1 3 9 7", expectedOutput: "3" },
      { input: "5 10\n4 1 3 9 7", expectedOutput: "-1" }
    ],
    hiddenTestcases: [
      { input: "3 1\n1 2 3", expectedOutput: "0" }
    ]
  },
  {
    id: "search-2",
    category: "Searching",
    title: "Binary Search",
    difficulty: "Medium",
    description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, print -1.",
    inputFormat: "First line contains N and Target. Second line contains N sorted integers.",
    outputFormat: "Print the index of Target, or -1.",
    timeLimit: 1,
    memoryLimit: 256,
    starterCode: {
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Implement Binary Search\n    return 0;\n}",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Implement Binary Search\n    }\n}",
      python: "def binary_search(arr, target):\n    # Implement Binary Search\n    pass\n\nif __name__ == '__main__':\n    n, target = map(int, input().split())\n    arr = list(map(int, input().split()))\n    print(binary_search(arr, target))"
    },
    visibleTestcases: [
      { input: "6 5\n1 3 5 7 9 11", expectedOutput: "2" }
    ],
    hiddenTestcases: [
      { input: "2 10\n1 5", expectedOutput: "-1" }
    ]
  },
  {
    id: "graph-1",
    category: "Graphs",
    title: "Breadth-First Search",
    difficulty: "Medium",
    description: "Given an undirected graph with V vertices and E edges, and a starting node S, print the BFS traversal (space-separated).",
    inputFormat: "First line contains V, E, S. Next E lines contain pairs (u, v) representing an edge.",
    outputFormat: "Space separated BFS traversal.",
    timeLimit: 2,
    memoryLimit: 256,
    starterCode: {
      cpp: "// BFS Starter Code",
      java: "// BFS Starter Code",
      python: "# BFS Starter Code\npass"
    },
    visibleTestcases: [
      { input: "5 4 0\n0 1\n0 2\n1 3\n2 4", expectedOutput: "0 1 2 3 4" }
    ],
    hiddenTestcases: [
      { input: "3 2 0\n0 1\n1 2", expectedOutput: "0 1 2" }
    ]
  },
  {
    id: "graph-2",
    category: "Graphs",
    title: "Depth-First Search",
    difficulty: "Medium",
    description: "Given an undirected graph with V vertices and E edges, and a starting node S, print the DFS traversal.",
    inputFormat: "First line contains V, E, S. Next E lines contain pairs (u, v).",
    outputFormat: "Space separated DFS traversal.",
    timeLimit: 2,
    memoryLimit: 256,
    starterCode: {
      cpp: "// DFS Starter Code",
      java: "// DFS Starter Code",
      python: "# DFS Starter Code\npass"
    },
    visibleTestcases: [
      { input: "5 4 0\n0 1\n0 2\n1 3\n2 4", expectedOutput: "0 1 3 2 4" }
    ],
    hiddenTestcases: [
      { input: "3 2 0\n0 1\n1 2", expectedOutput: "0 1 2" }
    ]
  }
];
