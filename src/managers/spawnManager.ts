// managers/spawnManager.ts

export function spawner(): void {
  const spawn = Game.spawns[Memory.spawn];

  if (!spawn || spawn.spawning) return;

  for (const role of Memory.priorities) {
    if (attemptSpawn(spawn, role)) return;
  }
}

function attemptSpawn(spawn: StructureSpawn, role: string): boolean {
  if (Memory.creepsRoleData[role].targetCount <= Memory.creepsRoleData[role].total) {
    return false;
  }

  const result = spawnROLE(spawn, role);

  if (result !== OK && result !== ERR_NOT_ENOUGH_ENERGY) {
    console.log(`Spawning ${role} failed: ${result}`);
  }

  return result === OK;
}

function spawnROLE(spawn: StructureSpawn, role: string): ScreepsReturnCode {
  const tier = Memory.creepsRoleData[role].tier;

  const body = Memory.templates[role]?.[tier];

  if (!body) {
    console.log(`Missing template for ${role} tier ${tier}`);
    return ERR_INVALID_ARGS;
  }

  return spawn.spawnCreep(body, role + Game.time.toString(), {
    memory: { role, room: spawn.room.name, working: false, tier }
  });

}
