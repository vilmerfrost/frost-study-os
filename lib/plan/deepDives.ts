import { deepDiveConfigs, type DeepDiveDayConfig } from "@/lib/config/deepDives";

export function findDeepDiveDayConfig(
  topic: string,
  phase: number,
  deepDiveTopic?: string,
  day?: number
): DeepDiveDayConfig | undefined {
  const key = deepDiveTopic || topic;
  const config = deepDiveConfigs[key];
  if (!config) return undefined;
  if (config.phase !== phase) return undefined;

  const list = config.days;
  if (!list.length) return undefined;

  if (!day) return list[0];
  return list.find((d) => d.day === day);
}

