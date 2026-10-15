// managers/sourceManager.ts

export function getSource(creep: Creep): Id<Source> {
  return creep.room.find(FIND_SOURCES)[0].id;
}
