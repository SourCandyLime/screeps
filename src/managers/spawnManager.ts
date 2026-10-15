// managers/spawnManager.ts

export function spawner(): void {
  // sudo code: spawn needed creeps

  const spawn = Game.spawns[Memory.spawn];

  if (spawn.spawning) return;

  // count rolls of all creeps
  const harvs = countCreeps("HARV");
  const ups = countCreeps("UP");
  const bobs = countCreeps("BOB");
  const hauls = countCreeps("HAUL");

  if (Memory.targetCounts["HARV"] > harvs) {
    spawnHarvester(spawn);
  }
  if (Memory.targetCounts["UP"] > ups) {
    spawnUpgrader(spawn);
  }
  if (Memory.targetCounts["BOB"] > bobs) {
    spawnBuilder(spawn);
  }
  if (Memory.targetCounts["HAUL"] > hauls) {
    spawnHauler(spawn);
  }

}

function spawnHarvester(spawn: StructureSpawn): void {
}

function spawnBuilder(spawn: StructureSpawn): void {
}

function spawnUpgrader(spawn: StructureSpawn): void {
}

function spawnHauler(spawn: StructureSpawn): void {
}

function countCreeps(creepRole: string): number {
  let count = 0;
  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.role === creepRole) {
      count += 1;
    }
  }
  return count;
}
