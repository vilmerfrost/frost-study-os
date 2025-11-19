import type { DayType } from "@/lib/plan/types";

export function determineDayType(
  energy: number,
  previousDays: DayType[] = [],
  consecutiveBeastDays: number = 0
): DayType {
  if (consecutiveBeastDays >= 3) {
    return "minimum";
  }

  const recentLowEnergy = previousDays.slice(-3).filter(
    (d) => d === "minimum" || d === "recovery"
  ).length;
  if (recentLowEnergy >= 3 && energy <= 2) {
    return "recovery";
  }

  if (energy <= 2) return "minimum";
  if (energy === 3) return "normal";
  if (energy >= 4) return "beast";
  return "normal";
}

export function getTimeBlockForDayType(dayType: DayType, baseTime: number): number {
  switch (dayType) {
    case "minimum":
      return Math.min(60, baseTime * 0.5);
    case "recovery":
      return Math.min(60, baseTime * 0.4);
    case "normal":
      return Math.min(180, baseTime * 1.0);
    case "beast":
      return Math.min(300, baseTime * 1.5);
    default:
      return baseTime;
  }
}

