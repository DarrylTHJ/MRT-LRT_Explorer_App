import { KAJANG_LINE, KELANA_JAYA_LINE } from "../app/data/lines";

export interface RouteStep {
  instruction: string;
  timeMins: number;
  type: "walk" | "ride" | "transfer";
}

export interface RouteResult {
  startStation: string;
  endStation: string;
  totalTransitMins: number;
  walkDistanceMeters: number;
  walkTimeMins: number;
  totalTimeMins: number;
  steps: RouteStep[];
}

// Math to calculate straight-line distance on Earth
export function getWalkDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; 
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// The transit pathfinder
export function calculateRoute(
  startStation: string, 
  endStation: string, 
  destLat: number, 
  destLng: number, 
  endStationLat: number, 
  endStationLng: number
): RouteResult {
  
  const getLineInfo = (name: string) => {
    let idx = KAJANG_LINE.findIndex(s => s.name === name);
    if (idx !== -1) return { line: "MRT Kajang", index: idx };
    idx = KELANA_JAYA_LINE.findIndex(s => s.name === name);
    if (idx !== -1) return { line: "LRT Kelana Jaya", index: idx };
    return null;
  };

  const startInfo = getLineInfo(startStation);
  const endInfo = getLineInfo(endStation);
  const steps: RouteStep[] = [];
  let transitMins = 0;

  if (startStation === endStation) {
    // Already there
    transitMins = 0;
  } else if (startInfo?.line === endInfo?.line) {
    // Same Line
    const stops = Math.abs(startInfo!.index - endInfo!.index);
    transitMins = stops * 3;
    steps.push({ instruction: `Board ${startInfo!.line} to ${endStation}`, timeMins: transitMins, type: "ride" });
  } else {
    // Different Lines (Transfer at Pasar Seni)
    const psStart = KAJANG_LINE.findIndex(s => s.name === "Pasar Seni");
    const psEnd = KELANA_JAYA_LINE.findIndex(s => s.name === "Pasar Seni");
    
    // Leg 1
    const stops1 = Math.abs(startInfo!.index - (startInfo!.line === "MRT Kajang" ? psStart : psEnd));
    const time1 = stops1 * 3;
    transitMins += time1;
    steps.push({ instruction: `Board ${startInfo!.line} to Pasar Seni`, timeMins: time1, type: "ride" });
    
    // Transfer
    transitMins += 5;
    steps.push({ instruction: `Transfer at Pasar Seni to ${endInfo!.line}`, timeMins: 5, type: "transfer" });
    
    // Leg 2
    const stops2 = Math.abs(endInfo!.index - (endInfo!.line === "MRT Kajang" ? psStart : psEnd));
    const time2 = stops2 * 3;
    transitMins += time2;
    steps.push({ instruction: `Board ${endInfo!.line} to ${endStation}`, timeMins: time2, type: "ride" });
  }

  // Walk Math (assume 80 meters per minute)
  const walkDistanceMeters = getWalkDistanceMeters(endStationLat, endStationLng, destLat, destLng);
  const walkTimeMins = Math.max(1, Math.round(walkDistanceMeters / 80));
  
  steps.push({ instruction: `Walk to destination (${walkDistanceMeters}m)`, timeMins: walkTimeMins, type: "walk" });

  return {
    startStation,
    endStation,
    totalTransitMins: transitMins,
    walkDistanceMeters,
    walkTimeMins,
    totalTimeMins: transitMins + walkTimeMins,
    steps
  };
}