export function updateTargetCounts() {
  for (const [roomName, data] of Object.entries(Memory.roomData)) {
    const creeps = data.creepsData;
    const room = Game.rooms[roomName];
    if (data.bootstrap) {
      creeps.HARV.targetCount = 1;
      creeps.BILL.targetCount = 1;
      creeps.UP.targetCount = 1;
      creeps.HAUL.targetCount = bootstrapHaulers(room);
    } else {
      creeps.HARV.targetCount = room.find(FIND_SOURCES).length;
      creeps.BILL.targetCount = 2;
      creeps.UP.targetCount = 2;
      creeps.HAUL.targetCount = room.find(FIND_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_CONTAINER}).length;
    }
  }
}

function bootstrapHaulers(room: Room): number {
  return (room.find(FIND_RUINS, { filter: ruin => ruin.store.getUsedCapacity(RESOURCE_ENERGY) >= 300 }).length + room.find(FIND_TOMBSTONES, { filter: tomb => tomb.store.getUsedCapacity(RESOURCE_ENERGY) >= 300 }).length > 0) ? 1 : 0;
}
