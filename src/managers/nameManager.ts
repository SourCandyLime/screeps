const names: Record<string, string[]> = {
  HARV: ["Drill", "Pick", "Crack", "Crunch", "Punch"],
  UP: ["Newton", "Sage", "Daedalus", "Einstein", "Tesla"],
  BILL: ["Mason", "Forge", "Bob", "Nail", "Hammer"],
  HAUL: ["Atlas", "Porter", "Sisyphus", "Karry", "Cargo"]
};

export function getCreepName(role: string): string {
  Memory.nameCounters ??= {};

  const pool = names[role] ?? [role];
  const counter = Memory.nameCounters[role] ?? 0;

  const index = counter % pool.length;
  const generation = Math.floor(counter / pool.length) + 1;

  return `${pool[index]} ${toRoman(generation)}`;
}

export function advanceCreepName(role: string): void {
  Memory.nameCounters ??= {};
  Memory.nameCounters[role] = (Memory.nameCounters[role] ?? 0) + 1;
}

function toRoman(count: number): string {
  const numerals: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];

  let result = "";

  for (const [value, numeral] of numerals) {
    while (count >= value) {
      result += numeral;
      count -= value;
    }
  }

  return result;
}
