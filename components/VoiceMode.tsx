"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export interface VoiceModeProps {
    text: string;
    lang?: string;
}

export default function VoiceMode({ text, lang = "sv-SE" }: VoiceModeProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    }, []);

    const handleToggleSpeech = () => {
        if (!isSupported) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={handleToggleSpeech}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${isSpeaking
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
            title={isSpeaking ? "Stop reading" : "Read aloud"}
        >
            {isSpeaking ? (
                <>
                    <VolumeX className="h-4 w-4" />
                    <span>Stop</span>
                </>
            ) : (
                <>
                    <Volume2 className="h-4 w-4" />
                    <span>Listen</span>
                </>
            )}
        </button>
    );
}
