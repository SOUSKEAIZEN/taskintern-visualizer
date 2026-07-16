"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "../../lib/logger";
import { markVisualizationComplete } from "../../lib/actions/progress";
import { getSession } from "next-auth/react";
import { ArrayElement, AlgorithmStep } from "../../types/dsa";
import { 
  generateBubbleSortSteps, 
  generateSelectionSortSteps, 
  generateInsertionSortSteps,
  generateMergeSortSteps,
  generateQuickSortSteps
} from "../../lib/algorithms/sorting";

interface ArrayCanvasProps {
  initialData?: number[];
}

type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick";

export default function ArrayCanvas({ initialData = [45, 10, 24, 92, 7] }: ArrayCanvasProps) {
  // --- States ---
  // Manual Interaction State
  const [baseArray, setBaseArray] = useState<number[]>(initialData);
  const [customInput, setCustomInput] = useState<string>("");
  const [activeAlgorithm, setActiveAlgorithm] = useState<AlgorithmType>("bubble");

  // Video Playback Engine State
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [history, setHistory] = useState<AlgorithmStep<ArrayElement[]>[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Speed Control (Scale 1 to 10, where 10 is fastest)
  const [speedLevel, setSpeedLevel] = useState<number>(3); 

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const CURRENT_USER_ID = "placeholder-student-id-123";
  const MAX_ELEMENTS = 20;

  // --- 1. Manual Controls & Custom Input ---
  const handleAddElement = () => {
    if (baseArray.length >= MAX_ELEMENTS) {
      logger.warn(`Constraint Hit: Prevented adding element. Array reached maximum size (${MAX_ELEMENTS}).`);
      return;
    }
    const newValue = Math.floor(Math.random() * 100);
    logger.info(`Manual State: Pushed new random value ${newValue}`);
    setBaseArray((prev) => [...prev, newValue]);
  };

  const handleRemoveElement = () => {
    if (baseArray.length === 0) return;
    logger.info(`Manual State: Popped last element.`);
    setBaseArray((prev) => prev.slice(0, -1));
  };

  const handleApplyCustomInput = () => {
    if (!customInput.trim()) return;
    
    const parsedArray = customInput
      .split(",")
      .map((str) => parseInt(str.trim(), 10))
      .filter((num) => !isNaN(num));

    if (parsedArray.length === 0) {
      logger.warn(`Custom Input Failed: Could not parse valid numbers from "${customInput}"`);
      alert("Please enter valid comma-separated numbers (e.g., 5, 12, 8, 99)");
      return;
    }

    if (parsedArray.length > MAX_ELEMENTS) {
      logger.warn(`Custom Input Trimmed: User entered ${parsedArray.length} items. Trimmed to ${MAX_ELEMENTS}.`);
      parsedArray.length = MAX_ELEMENTS;
    }

    logger.info(`Custom Input Applied: Set base array to [${parsedArray.join(", ")}]`);
    setBaseArray(parsedArray);
    setCustomInput("");
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as AlgorithmType;
    logger.info(`UI Interaction: User changed active algorithm to ${selected.toUpperCase()} Sort.`);
    setActiveAlgorithm(selected);
  };

  // --- 2. Playback Engine Initialization ---
  const handleStartSorting = () => {
    logger.info(`Playback Engine: Initializing ${activeAlgorithm.toUpperCase()} Sort for ${baseArray.length} elements.`);
    
    let steps: AlgorithmStep<ArrayElement[]>[] = [];
    
    // Route to the correct mathematical generator
    switch (activeAlgorithm) {
      case "bubble":
        steps = generateBubbleSortSteps(baseArray);
        break;
      case "selection":
        steps = generateSelectionSortSteps(baseArray);
        break;
      case "insertion":
        steps = generateInsertionSortSteps(baseArray);
        break;
      case "merge":
        steps = generateMergeSortSteps(baseArray);
        break;
      case "quick":
        steps = generateQuickSortSteps(baseArray);
        break;
    }

    setHistory(steps);
    setCurrentFrame(0);
    setIsPlaybackMode(true);
    setIsPlaying(true);
    
    getSession().then((session) => {
      if (session?.user?.id) {
        markVisualizationComplete(session.user.id, "arrays", activeAlgorithm).catch(logger.error);
      }
    });
  };

  const handleReset = () => {
    logger.info("Playback Engine: Resetting to manual mode.");
    setIsPlaybackMode(false);
    setIsPlaying(false);
    setHistory([]);
    setCurrentFrame(0);
  };

  // --- 3. Time Travel & Speed Controls ---
  const togglePlayPause = () => {
    logger.info(`Playback Engine: Toggled to ${!isPlaying ? 'Playing' : 'Paused'}`);
    setIsPlaying(!isPlaying);
  };

  const stepForward = () => {
    if (currentFrame < history.length - 1) {
      logger.info(`Playback Engine: Manual step forward to frame ${currentFrame + 1}`);
      setCurrentFrame((prev) => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentFrame > 0) {
      logger.info(`Playback Engine: Manual step backward to frame ${currentFrame - 1}`);
      setCurrentFrame((prev) => prev - 1);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeedLevel(Number(e.target.value));
  };

  const handleSpeedLog = () => {
    logger.info(`Playback State: Adjusted speed level to ${speedLevel}/10.`);
  };

  // --- 4. The Animation Loop ---
  useEffect(() => {
    const currentDelayMs = 1100 - (speedLevel * 100);

    if (isPlaying && currentFrame < history.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentFrame((prev) => prev + 1);
      }, currentDelayMs); 
    } else if (currentFrame >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentFrame, history.length, speedLevel]);

  // --- 5. Interactive Completion Tracking ---
  useEffect(() => {
    // Only fire if we are actively visualizing and have reached the final frame
    if (isPlaybackMode && history.length > 0 && currentFrame === history.length - 1) {
      const visualizationId = `array-${activeAlgorithm}`;
      logger.info(`UI Action Step 1: Animation complete. Firing progress event for ${visualizationId}...`);
      
      markVisualizationComplete(CURRENT_USER_ID, "arrays", visualizationId)
        .then((res) => {
          if (res.success) {
            logger.info(`UI Action Step 2: Successfully registered ${visualizationId} completion in database.`);
          } else {
            logger.error(`UI Point of Failure: Server rejected visualization completion. Error: ${res.error}`);
          }
        })
        .catch((err) => {
          logger.error(`UI Point of Failure: Network exception while marking visualization complete.`, err);
        });
    }
  }, [currentFrame, history.length, isPlaybackMode, activeAlgorithm]);

  // --- 6. Visual Rendering Helpers ---
  const activeFrame = isPlaybackMode && history.length > 0 ? history[currentFrame].snapshot : null;
  const activeDescription = isPlaybackMode && history.length > 0 ? history[currentFrame].description : "";

  const getStyleForState = (state?: string) => {
    switch (state) {
      case "comparing":
        return "bg-amber-400 text-amber-900 border-amber-500 shadow-amber-200 scale-110 z-10";
      case "swapping":
        return "bg-rose-500 text-white border-rose-600 shadow-rose-200 scale-110 -rotate-6 z-10";
      case "active":
        return "bg-purple-500 text-white border-purple-600 shadow-purple-200 scale-110 z-10 ring-4 ring-purple-100";
      case "sorted":
        return "bg-accent-success text-white border-emerald-600 shadow-emerald-200";
      default: 
        return "bg-bg-card text-blue-700 border-blue-400 shadow-sm hover:border-blue-500";
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      
      {/* Dynamic Narrative Text */}
      <div className="h-12 flex items-center justify-center w-full">
        {isPlaybackMode && (
          <p className="text-lg font-medium text-text-heading bg-bg-main px-6 py-2 rounded-full border border-border-default animate-in fade-in slide-in-from-bottom-2">
            {activeDescription}
          </p>
        )}
      </div>

      {/* The Visual Canvas */}
      <div className="flex flex-wrap justify-center gap-4 p-8 bg-bg-main border-2 border-dashed border-border-default rounded-card min-h-[180px] w-full max-w-4xl shadow-inner relative transition-all duration-300">
        {!isPlaybackMode ? (
          baseArray.map((num, idx) => (
            <div key={`manual-${idx}`} className={`w-16 h-16 border-2 rounded-btn flex items-center justify-center text-2xl font-bold transition-all duration-300 ${getStyleForState("default")}`}>
              {num}
            </div>
          ))
        ) : (
          activeFrame?.map((element, idx) => (
            <div key={`${element.id}-${idx}`} className={`w-16 h-16 border-2 rounded-btn flex items-center justify-center text-2xl font-bold transition-all duration-300 ${getStyleForState(element.state)}`}>
              {element.value}
            </div>
          ))
        )}
      </div>

      {/* Dynamic Control Panel */}
      {!isPlaybackMode ? (
        <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
          
          {/* Custom Input Field */}
          <div className="flex items-center space-x-2 bg-bg-card p-2 rounded-btn border border-border-default shadow-sm w-full">
            <input 
              type="text" 
              placeholder={`e.g. 5, 24, 8, 99 (Max ${MAX_ELEMENTS} elements)`}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-4 py-2 outline-none text-text-heading font-medium bg-transparent"
              onKeyDown={(e) => e.key === "Enter" && handleApplyCustomInput()}
            />
            <button 
              onClick={handleApplyCustomInput}
              className="btn-secondary"
            >
              Apply Array
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full">
            <button onClick={handleAddElement} className="btn-secondary">Add Random</button>
            <button onClick={handleRemoveElement} className="btn-secondary">Remove</button>
            
            {/* Algorithm Selector & Visualize Button */}
            <div className="flex bg-primary/10 p-1 rounded-btn border border-primary/10 shadow-sm">
              <select
                value={activeAlgorithm}
                onChange={handleAlgorithmChange}
                className="bg-transparent px-4 py-2 text-primary font-bold outline-none cursor-pointer"
              >
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="quick">Quick Sort</option>
              </select>
              <button 
                onClick={handleStartSorting} 
                className="px-6 py-2 bg-primary text-white font-bold rounded-btn shadow hover:bg-primary-hover transition-colors whitespace-nowrap"
              >
                ▶ Visualize
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 w-full">
          {/* Media Player Controls */}
          <div className="flex items-center space-x-4 bg-bg-card p-2 rounded-card shadow-premium border border-border-default">
            <button onClick={handleReset} className="px-4 py-2 text-rose-400 hover:bg-bg-main rounded-btn font-medium transition-colors">Stop</button>
            <div className="w-px h-6 bg-border-default mx-2"></div>
            <button onClick={stepBackward} disabled={currentFrame === 0} className="px-4 py-2 text-text-secondary hover:bg-bg-main disabled:opacity-50 rounded-btn transition-colors">⏮ Prev</button>
            <button onClick={togglePlayPause} className="px-6 py-2 bg-primary text-white font-bold rounded-btn shadow-premium hover:bg-primary transition-colors w-24">
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button onClick={stepForward} disabled={currentFrame >= history.length - 1} className="px-4 py-2 text-text-secondary hover:bg-bg-main disabled:opacity-50 rounded-btn transition-colors">Next ⏭</button>
          </div>

          {/* Animation Speed Slider */}
          <div className="flex items-center space-x-4 text-sm font-semibold text-text-secondary bg-bg-card px-6 py-2 border border-border-default rounded-full shadow-sm">
            <span>Slow</span>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={speedLevel} 
              onChange={handleSpeedChange}
              onMouseUp={handleSpeedLog}
              onTouchEnd={handleSpeedLog}
              className="w-32 accent-primary cursor-pointer"
            />
            <span>Fast</span>
          </div>
        </div>
      )}

      {/* Progress Bar (Visible only during playback) */}
      {isPlaybackMode && (
        <div className="w-full max-w-2xl bg-bg-card h-2 border border-border-default rounded-full overflow-hidden mt-4">
          <div 
            className="bg-primary h-full transition-all duration-300" 
            style={{ width: `${((currentFrame + 1) / history.length) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}