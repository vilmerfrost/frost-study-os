"use client";

import { useState, useEffect } from "react";
import { Play, Pause, CheckCircle, Clock } from "lucide-react";
import { supabaseServer } from "@/lib/supabaseServer";

export interface SessionPlayerProps {
    planId: string;
    blocks: {
        type: string;
        duration: number;
        description: string;
        tasks: string[];
    }[];
    onComplete: () => void;
}

export default function SessionPlayer({ planId, blocks, onComplete }: SessionPlayerProps) {
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(blocks[0]?.duration * 60 || 0);
    const [completedBlocks, setCompletedBlocks] = useState<number[]>([]);

    const currentBlock = blocks[currentBlockIndex];

    useEffect(() => {
        if (!isRunning || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleBlockComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, timeRemaining]);

    const handleBlockComplete = () => {
        setCompletedBlocks([...completedBlocks, currentBlockIndex]);

        if (currentBlockIndex < blocks.length - 1) {
            // Move to next block
            setCurrentBlockIndex(currentBlockIndex + 1);
            setTimeRemaining(blocks[currentBlockIndex + 1].duration * 60);
            setIsRunning(false);
        } else {
            // Session complete
            onComplete();
        }
    };

    const handleSkipBlock = () => {
        if (currentBlockIndex < blocks.length - 1) {
            setCurrentBlockIndex(currentBlockIndex + 1);
            setTimeRemaining(blocks[currentBlockIndex + 1].duration * 60);
            setIsRunning(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = currentBlock
        ? ((currentBlock.duration * 60 - timeRemaining) / (currentBlock.duration * 60)) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Current Block Display */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {currentBlock?.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                Block {currentBlockIndex + 1} of {blocks.length}
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold">{currentBlock?.description}</h3>
                    </div>
                    <div className="text-4xl font-mono font-bold">{formatTime(timeRemaining)}</div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Tasks:</p>
                    <ul className="space-y-1">
                        {currentBlock?.tasks.map((task, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 pt-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                    >
                        {isRunning ? (
                            <>
                                <Pause className="mr-2 h-4 w-4" /> Pause
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" /> {timeRemaining === currentBlock.duration * 60 ? "Start" : "Resume"}
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleBlockComplete}
                        className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" /> Complete Block
                    </button>
                    {currentBlockIndex < blocks.length - 1 && (
                        <button
                            onClick={handleSkipBlock}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Skip →
                        </button>
                    )}
                </div>
            </div>

            {/* Block List */}
            <div className="space-y-2">
                {blocks.map((block, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between rounded-lg border p-3 transition-all ${i === currentBlockIndex
                                ? "border-primary bg-primary/5"
                                : completedBlocks.includes(i)
                                    ? "border-green-500/50 bg-green-500/5"
                                    : "border-border bg-card/50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {completedBlocks.includes(i) ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : i === currentBlockIndex ? (
                                <Clock className="h-5 w-5 text-primary" />
                            ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted" />
                            )}
                            <div>
                                <p className="text-sm font-medium">{block.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {block.type} • {block.duration} min
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
