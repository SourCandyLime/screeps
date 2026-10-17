// managers/spawnManager.ts

export function spawner(): void {
  // sudo code: spawn needed creeps

  const spawn = Game.spawns[Memory.spawn];

  if (spawn.spawning) return;

  if (Memory.creepsRoleData.HARV.targetCount > Memory.creepsRoleData.HARV.total) {
    spawnHARV(spawn);
  }
  if (Memory.creepsRoleData.UP.targetCount > Memory.creepsRoleData.UP.total) {
    spawnUP(spawn);
  }
  if (Memory.creepsRoleData.BILL.targetCount > Memory.creepsRoleData.BILL.total) {
    spawnBILL(spawn);
  }
  if (Memory.creepsRoleData.HAUL.targetCount > Memory.creepsRoleData.HAUL.total) {
    spawnHAUL(spawn);
  }
}

function spawnHARV(spawn: StructureSpawn): void {
  spawn.spawnCreep(Memory.templates.HARV[0], "HARV" + Game.time.toString(), {
    memory: {role: "HARV", room: spawn.room.name, working: false}
  });
}

function spawnBILL(spawn: StructureSpawn): void {
  spawn.spawnCreep(Memory.templates.BILL[0], "BILL" + Game.time.toString(), {
    memory: { role: "BILL", room: spawn.room.name, working: false }
  });
}

function spawnUP(spawn: StructureSpawn): void {
  spawn.spawnCreep(Memory.templates.UP[0], "UP" + Game.time.toString(), {
    memory: { role: "UP", room: spawn.room.name, working: false }
  });
}

function spawnHAUL(spawn: StructureSpawn): void {
  spawn.spawnCreep(Memory.templates.HAUL[0], "HAUL" + Game.time.toString(), {
    memory: { role: "HAUL", room: spawn.room.name, working: false }
  });
}
