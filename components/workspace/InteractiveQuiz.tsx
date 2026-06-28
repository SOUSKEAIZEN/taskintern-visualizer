"use client";

import { useState } from "react";
import { logger } from "../../lib/logger";
import { submitQuizScore, updateModuleProgress } from "../../lib/actions/progress";

// In a full production build, these would be fetched from the database or a JSON file.
// We are using a localized constant to demonstrate the UI and Backend wiring.
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

interface InteractiveQuizProps {
  topicId: string;
  userId: string; // Passed down from the user session in a real app
}

export default function InteractiveQuiz({ topicId, userId }: InteractiveQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerClick = (selectedIndex: number, isCorrect: boolean) => {
    logger.info(`Quiz Interaction: User selected option ${selectedIndex} on question ${currentQuestion}. Correct: ${isCorrect}`);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < ARRAY_QUESTIONS.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      logger.info(`Quiz State: User finished the quiz. Final local score: ${score + (isCorrect ? 1 : 0)}/${ARRAY_QUESTIONS.length}`);
      setIsFinished(true);
    }
  };

  const handleSaveResults = async () => {
    setIsSubmitting(true);
    logger.info(`Quiz State: Initiating backend save for Topic ${topicId}`);

    try {
      // 1. Save the numerical quiz score
      const scoreResult = await submitQuizScore(userId, topicId, score, ARRAY_QUESTIONS.length);
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
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Module Complete!</h2>
        <div className="text-6xl font-black text-indigo-600 mb-6">
          {score} / {ARRAY_QUESTIONS.length}
        </div>
        <p className="text-slate-500 mb-8">You have successfully completed the {topicId} quiz.</p>
        
        <button 
          onClick={handleSaveResults}
          disabled={isSubmitting}
          className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "Saving to Database..." : "Save Score & Complete Module"}
        </button>
      </div>
    );
  }

  const activeQ = ARRAY_QUESTIONS[currentQuestion];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm">Knowledge Check</span>
        </h3>
        <span className="text-sm font-semibold text-slate-400">
          Question {currentQuestion + 1} of {ARRAY_QUESTIONS.length}
        </span>
      </div>

      <div className="mb-8">
        <h4 className="text-2xl font-medium text-slate-700 leading-snug">
          {activeQ.question}
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeQ.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswerClick(idx, idx === activeQ.correctIndex)}
            className="w-full text-left p-4 rounded-xl border-2 border-slate-100 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 font-medium text-slate-600 transition-all active:scale-[0.98]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}