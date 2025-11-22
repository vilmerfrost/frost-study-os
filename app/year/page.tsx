"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import PhaseNavigator from "@/components/PhaseNavigator";
import YearDayCard from "@/components/YearDayCard";
import DayPreviewModal from "@/components/DayPreviewModal";
import { BookOpen } from "lucide-react";

// Mock data - in production, fetch from Supabase
const mockPhases = [
  { phase_number: 1, title: "Foundation", focus_area: "Math & CS Fundamentals", duration_days: 60, start_day: 1, end_day: 60, description: "Build core foundations" },
  { phase_number: 2, title: "Deep Learning", focus_area: "Linear Algebra & Calculus", duration_days: 70, start_day: 61, end_day: 130, description: "Master mathematics" },
  { phase_number: 3, title: "Core ML", focus_area: "Classical Machine Learning", duration_days: 65, start_day: 131, end_day: 195, description: "Traditional ML algorithms" },
  { phase_number: 4, title: "Neural Networks", focus_area: "Deep Learning & PyTorch", duration_days: 60, start_day: 196, end_day: 255, description: "Build neural networks" },
  { phase_number: 5, title: "Advanced Topics", focus_area: "NLP, CV, RL", duration_days: 70, start_day: 256, end_day: 325, description: "Specialize in AI domains" },
  { phase_number: 6, title: "Projects", focus_area: "Real-world Applications", duration_days: 40, start_day: 326, end_day: 365, description: "Build portfolio projects" },
];

const mockYearDays = [
  { day_index: 1, title: "Introduction to Python & Setup", type: "learn", focus_area: "Programming Fundamentals", module_id: "CS-101" },
  { day_index: 2, title: "Variables, Data Types, Control Flow", type: "learn", focus_area: "Python Basics", module_id: "CS-101" },
  { day_index: 3, title: "Practice: Python Exercises", type: "practice", focus_area: "Python Basics", module_id: "CS-101" },
  { day_index: 4, title: "Functions and Modules", type: "learn", focus_area: "Code Organization", module_id: "CS-101" },
  { day_index: 5, title: "Review: Week 1 Concepts", type: "review", focus_area: "Python Basics", module_id: "CS-101" },
  // Add more days as needed
];

export default function YearPage() {
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const currentDay = 42; // TODO: Get from user state

  const phaseDays = mockYearDays.filter(
    (day) => day.day_index >= mockPhases[selectedPhase - 1].start_day &&
      day.day_index <= mockPhases[selectedPhase - 1].end_day
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">YearBrain Curriculum</h1>
            <p className="text-muted-foreground">The 365-day roadmap to ML mastery.</p>
          </div>
        </div>

        {/* Phase Navigator */}
        <PhaseNavigator
          phases={mockPhases}
          currentPhase={selectedPhase}
          onPhaseChange={setSelectedPhase}
        />

        {/* Phase Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{mockPhases[selectedPhase - 1].title}</h2>
              <p className="text-muted-foreground mb-4">{mockPhases[selectedPhase - 1].description}</p>
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  <strong>Focus:</strong> {mockPhases[selectedPhase - 1].focus_area}
                </span>
                <span className="text-muted-foreground">
                  <strong>Duration:</strong> {mockPhases[selectedPhase - 1].duration_days} days
                </span>
                <span className="text-muted-foreground">
                  <strong>Days:</strong> {mockPhases[selectedPhase - 1].start_day}-{mockPhases[selectedPhase - 1].end_day}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Days in Phase {selectedPhase}</h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {phaseDays.length > 0 ? (
              phaseDays.map((day) => (
                <YearDayCard
                  key={day.day_index}
                  day={day}
                  isCompleted={day.day_index < currentDay}
                  isCurrent={day.day_index === currentDay}
                  isLocked={day.day_index > currentDay + 7}
                  onClick={() => setSelectedDay(day)}
                />
              ))
            ) : (
              <div className="col-span-full text-center p-8 text-muted-foreground">
                No days available for this phase. Curriculum data will be loaded from the database.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Preview Modal */}
      {selectedDay && (
        <DayPreviewModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onGenerateDeepDive={() => {
            console.log("Generate deep dive for day", selectedDay.day_index);
          }}
          onMarkComplete={() => {
            console.log("Mark day", selectedDay.day_index, "as complete");
          }}
          onJumpToDay={() => {
            console.log("Jump to day", selectedDay.day_index);
            setSelectedDay(null);
          }}
        />
      )}
    </AppShell>
  );
}
