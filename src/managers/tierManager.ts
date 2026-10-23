export function updateTiers(): void {
  for (const room of Object.keys(Memory.roomData)) {
    for (const [role, data] of Object.entries(Memory.roomData[room].creepsData)) {
      for (const [tier, body] of Object.entries(Memory.templates[role])) {
        if (Game.rooms[room].energyCapacityAvailable >= Memory.costs[role][Number(tier)]) {
          data.tier = Number(tier);
        }
      }
      if (role === "HARV") {
        if (
          (data.totalCount === 0 &&
          Game.rooms[room].energyAvailable < Memory.costs[role][data.tier]) ||
            Game.rooms[room].find(FIND_STRUCTURES, {
              filter: structure => structure.structureType === STRUCTURE_CONTAINER
            }).length === 0
        ) {
          data.tier = 0;
        }
      } else if (role === "HAUL") {
        if (data.totalCount === 0 && Game.rooms[room].energyCapacityAvailable < Memory.costs[role][data.tier]) {
          data.tier = 0;
        }
      }
    }
  }
}
