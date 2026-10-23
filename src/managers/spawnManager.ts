// managers/spawnManager.ts

import { advanceCreepName, getCreepName } from "./nameManager";

export function runSpawners(): void {
  for (const room of Object.keys(Memory.roomData)) {
    const spawn = Game.spawns[Memory.roomData[room].spawns[0]];

    if (!spawn || spawn.spawning) continue;

    for (const role of Memory.priorities) {
      if (attemptSpawn(spawn, role)) {
        advanceCreepName(role);
        break;
      }
    }
  }
}

function attemptSpawn(spawn: StructureSpawn, role: string): boolean {
  if (Memory.roomData[spawn.room.name].creepsData[role].targetCount <= Memory.roomData[spawn.room.name].creepsData[role].totalCount) {
    return false;
  }

  const result = spawnROLE(spawn, role);

  if (result !== OK && result !== ERR_NOT_ENOUGH_ENERGY) {
    console.log(`Spawning ${role} failed: ${result}`);
  }

  return result === OK;
}

function spawnROLE(spawn: StructureSpawn, role: string): ScreepsReturnCode {
  const tier = Memory.roomData[spawn.room.name].creepsData[role].tier;
  const body = Memory.templates[role]?.[tier];

  if (!body) {
    console.log(`Missing template for ${role} tier ${tier}`);
    return ERR_INVALID_ARGS;
  }

  const name = getCreepName(role);

  return spawn.spawnCreep(body, "T" + String(tier) + " " + name, {
    memory: { role, room: spawn.room.name, working: false, tier }
  });

}
