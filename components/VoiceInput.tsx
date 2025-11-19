"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
}

/**
 * Voice input component using Web Speech API.
 * Allows users to quickly create sessions via voice commands.
 * 
 * Example commands:
 * - "45 minutes probability distributions, energy 4"
 * - "60 min linear algebra, energy 3"
 */
export default function VoiceInput({ onResult, onError }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "sv-SE"; // Swedish

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      onError?.(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      onError?.("Could not start voice recognition");
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // Note: Browser will auto-stop after silence, but we can force stop if needed
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-slate-400">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={isListening ? stopListening : startListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-xl border transition-all ${
          isListening
            ? "border-red-500 bg-red-500/20 text-red-300 animate-pulse"
            : "border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
        }`}
      >
        {isListening ? "🛑 Stoppa" : "🎤 Röst"}
      </motion.button>
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-cyan-300"
          >
            Lyssnar...
          </motion.div>
        )}
        {transcript && !isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-slate-400 max-w-xs truncate"
            title={transcript}
          >
            "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

