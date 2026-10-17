
export function updateCount(): void {
  Memory.creepsRoleData.HARV.total = countCreeps("HARV");
  Memory.creepsRoleData.UP.total = countCreeps("UP");
  Memory.creepsRoleData.BILL.total = countCreeps("BILL");
  Memory.creepsRoleData.HAUL.total = countCreeps("HAUL");
}

export function updateCosts(): void {
  for (const [role, teirs] of Object.entries(Memory.templates)) {
    for (const [teir, body] of Object.entries(teirs)) {
      Memory.costs[role][Number(teir)] = calculateCost(Memory.templates[role][Number(teir)]);
    }
  }
}

function calculateCost(body: BodyPartConstant[]): number {
  return body.reduce((total, part) => total + BODYPART_COST[part], 0);
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
