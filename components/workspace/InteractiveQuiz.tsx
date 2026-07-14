"use client";

import { useState, useEffect } from "react";
import { logger } from "../../lib/logger";
import { submitQuizScore, updateModuleProgress } from "../../lib/actions/progress";

// --- Question Banks ---
const ARRAY_QUESTIONS = [
  {
    question: "What is the time complexity of accessing an element in an array by its index?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctIndex: 0,
  },
  {
    question: "In the Bubble Sort algorithm, what visual state indicates two elements are being evaluated?",
    options: ["Sorted", "Swapping", "Comparing", "Default"],
    correctIndex: 2,
  },
  {
    question: "What happens when you try to 'Pop' an element from an empty array?",
    options: ["The array size becomes -1", "An error occurs (Underflow)", "A null element is added", "The array resets"],
    correctIndex: 1,
  }
];

const LINKED_LIST_QUESTIONS = [
  {
    question: "What is the main advantage of a Linked List over an Array?",
    options: ["Instant access by index", "Contiguous memory allocation", "Dynamic memory allocation", "Built-in sorting"],
    correctIndex: 2,
  },
  {
    question: "What does the final node in a Singly Linked List point to?",
    options: ["The first node (Head)", "A random memory address", "null", "Itself"],
    correctIndex: 2,
  },
  {
    question: "What is the time complexity of searching for a specific value in a Singly Linked List?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctIndex: 1,
  }
];

const QUESTIONS_MAP: Record<string, typeof ARRAY_QUESTIONS> = {
  "arrays": ARRAY_QUESTIONS,
  "linked-lists": LINKED_LIST_QUESTIONS,
};

interface InteractiveQuizProps {
  topicId: string;
  userId: string; // Passed down from the user session in a real app
}

export default function InteractiveQuiz({ topicId, userId }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeQuestions = QUESTIONS_MAP[topicId] || ARRAY_QUESTIONS;

  // Reset the quiz state if the user switches modules
  useEffect(() => {
    setCurrentQuestion(0);
    setScore(0);
    setIsFinished(false);
    setIsSubmitting(false);
    logger.info(`Quiz State: Reset quiz engine for new module -> ${topicId}`);
  }, [topicId]);

  const handleAnswerClick = (selectedIndex: number, isCorrect: boolean) => {
    logger.info(`Quiz Interaction: User selected option ${selectedIndex} on question ${currentQuestion}. Correct: ${isCorrect}`);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < activeQuestions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      logger.info(`Quiz State: User finished the quiz. Final local score: ${score + (isCorrect ? 1 : 0)}/${activeQuestions.length}`);
      setIsFinished(true);
    }
  };

  const handleSaveResults = async () => {
    setIsSubmitting(true);
    logger.info(`Quiz State: Initiating backend save for Topic ${topicId}`);

    try {
      // 1. Save the numerical quiz score
      const scoreResult = await submitQuizScore(userId, topicId, score, activeQuestions.length);
      if (!scoreResult.success) throw new Error(scoreResult.error);

      // 2. Mark the overall module as completed
      const progressResult = await updateModuleProgress(userId, topicId, true);
      if (!progressResult.success) throw new Error(progressResult.error);

      logger.info("Quiz State: Successfully synchronized results with PostgreSQL backend.");
      setIsSubmitting(false);
      
    } catch (error) {
      logger.error("Quiz Error: Failed to save results to backend.", error);
      setIsSubmitting(false);
      alert("Failed to save results. Please check the console logs.");
    }
  };

  if (isFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-bg-card p-8 rounded-card shadow-sm border border-border-default text-center animate-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-extrabold text-text-heading mb-4">Module Complete!</h2>
        <div className="text-6xl font-black text-primary mb-6">
          {score} / {activeQuestions.length}
        </div>
        <p className="text-text-secondary mb-8">You have successfully completed the {topicId} quiz.</p>
        
        <button 
          onClick={handleSaveResults}
          disabled={isSubmitting}
          className="px-8 py-3 bg-accent-success text-white font-bold rounded-btn shadow-premium hover:bg-accent-success transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Saving to Database..." : "Save Score & Complete Module"}
        </button>
      </div>
    );
  }

  const activeQ = activeQuestions[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto bg-bg-card p-8 rounded-card shadow-sm border border-border-default">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-text-heading flex items-center gap-2">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-btn text-sm uppercase tracking-wider font-bold">
            {topicId.replace("-", " ")} Knowledge Check
          </span>
        </h3>
        <span className="text-sm font-semibold text-text-placeholder">
          Question {currentQuestion + 1} of {activeQuestions.length}
        </span>
      </div>

      <div className="mb-8">
        <h4 className="text-2xl font-medium text-text-heading leading-snug">
          {activeQ.question}
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeQ.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswerClick(idx, idx === activeQ.correctIndex)}
            className="w-full text-left p-4 rounded-btn border-2 border-border-default bg-bg-main hover:border-primary hover:bg-primary/10 hover:text-primary font-medium text-text-secondary transition-all active:scale-[0.98]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}