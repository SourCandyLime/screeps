// utils/creepData.ts

export function updateCounts(): void {
  for (const room of Object.keys(Memory.roomData)) {
    Memory.roomData[room].creepsData.HARV.totalCount = countCreeps("HARV", room);
    Memory.roomData[room].creepsData.UP.totalCount = countCreeps("UP", room);
    Memory.roomData[room].creepsData.BILL.totalCount = countCreeps("BILL", room);
    Memory.roomData[room].creepsData.HAUL.totalCount = countCreeps("HAUL", room);
  }
}

export function checkRetire(creep: Creep): void {
  if (creep.memory.role === "RETIRE") return;

  const room = Memory.roomData[creep.memory.room];
  if (!room) return;

  if (room.bootstrap) {
    if (creep.memory.tier !== 0 && creep.memory.role === "HARV") {
      creep.memory.role = "RETIRE";
    }
    return;
  }

  if (creep.memory.role === "HARV") return;

  const roleData = room.creepsData[creep.memory.role];
  if (!roleData) return;

  if (creep.memory.tier !== roleData.tier) {
    creep.memory.role = "RETIRE";
  }
}


export function updateCosts(): void {
  for (const [role, tiers] of Object.entries(Memory.templates)) {
    Memory.costs[role] ??= {};

    for (const [tier, body] of Object.entries(tiers)) {
      Memory.costs[role][Number(tier)] = calculateCost(body);
    }
  }
}

function calculateCost(body: BodyPartConstant[]): number {
  return body.reduce((total, part) => total + BODYPART_COST[part], 0);
}

function countCreeps(role: string, room: string): number {
  const bootstrap = Memory.roomData[room].bootstrap;

  return Object.values(Game.creeps).filter(
    creep =>
      creep.memory.role === role &&
      creep.memory.room === room &&
      (bootstrap || creep.memory.tier > 0 || role === "HARV")
  ).length;
}

