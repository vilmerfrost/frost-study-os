"use client";

import { useState, useEffect } from "react";

interface BlockTimerProps {
  duration: number; // minutes
  onComplete?: () => void;
}

export default function BlockTimer({ duration, onComplete }: BlockTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (secondsLeft === 0) {
                setSecondsLeft(duration * 60);
              }
              setIsRunning(!isRunning);
              setIsPaused(false);
            }}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            {isRunning ? "⏸ Pausa" : "▶ Starta"}
          </button>
          <button
            onClick={() => {
              setSecondsLeft(duration * 60);
              setIsRunning(false);
              setIsPaused(false);
            }}
            className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
          >
            ↻ Reset
          </button>
        </div>
        <span className="text-sm font-mono font-semibold">
          {formatTime(minutes, seconds)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-sky-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

