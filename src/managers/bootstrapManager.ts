// managers/bootstrapManager.ts

export function bootstrapManager() {
  for (const room of Object.keys(Memory.roomData)) {
    const data = Game.rooms[room];
    if (!data) continue;
    const goodSources = data.find(FIND_SOURCES, {
      filter: source => source.pos.findInRange(FIND_STRUCTURES,1, {
        filter: structure => structure.structureType === STRUCTURE_CONTAINER
      }).length > 0
    });
    const extentions = data.find(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_EXTENSION
    });
    Memory.roomData[room].bootstrap = !((extentions.length >= 5) && (goodSources.length > 0));
  }
}
