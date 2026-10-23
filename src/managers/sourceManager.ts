
export function getSource(creep: Creep): Id<Source> | undefined {
  const roomName = creep.memory.room;
  const room = Game.rooms[roomName];
  const roomData = Memory.roomData[roomName];

  if (!room || !roomData) return undefined;

  roomData.sources ??= {};

  const sources = room.find(FIND_SOURCES);

  // Discover and cache sources.
  for (const source of sources) {
    if (!roomData.sources[source.id]) {
      storeSource(source);
    }
  }

  // Remove assignments belonging to dead creeps.
  for (const data of Object.values(roomData.sources)) {
    for (const name of Object.keys(data.creeps)) {
      if (!Game.creeps[name] && !Memory.creeps[name]) {
        delete data.creeps[name];
      }
    }

    updateOpenSpace(data);
  }

  const requiresContainer =
    !roomData.bootstrap &&
    creep.memory.role === "HARV" &&
    creep.memory.tier > 0;

  // Check existing assignment.
  for (const source of sources) {
    const data = roomData.sources[source.id];
    const assigned = data.creeps[creep.name];

    if (!assigned) continue;

    if (
      !requiresContainer ||
      isContainerTile(source, assigned)
    ) {
      return source.id;
    }

    // The assignment is no longer suitable.
    delete data.creeps[creep.name];
    updateOpenSpace(data);
  }

  let bestSource: Source | undefined;
  let bestTiles: tile[] = [];

  // Find the source with the most available valid positions.
  for (const source of sources) {
    const data = roomData.sources[source.id];

    const validTiles = requiresContainer
      ? getContainerTiles(source, data)
      : data.openTiles;

    const available = validTiles.filter(
      position => !isAssigned(data, position)
    );

    if (available.length > bestTiles.length) {
      bestSource = source;
      bestTiles = available;
    }
  }

  if (!bestSource || bestTiles.length === 0) {
    return undefined;
  }

  // Choose the closest available position.
  const selected = bestTiles.reduce((closest, current) => {
    const currentDistance =
      creep.pos.getRangeTo(current.x, current.y);

    const closestDistance =
      creep.pos.getRangeTo(closest.x, closest.y);

    return currentDistance < closestDistance
      ? current
      : closest;
  });

  const data = roomData.sources[bestSource.id];

  data.creeps[creep.name] = selected;
  updateOpenSpace(data);

  return bestSource.id;
}

function storeSource(source: Source): void {
  const roomName = source.room.name;
  const roomData = Memory.roomData[roomName];

  roomData.sources ??= {};

  const terrain = Game.map.getRoomTerrain(roomName);

  const tiles: tile[] = [];
  const openTiles: tile[] = [];

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;

      const x = source.pos.x + dx;
      const y = source.pos.y + dy;

      if (x < 0 || x > 49 || y < 0 || y > 49) continue;

      const type = terrain.get(x, y);
      const position: tile = { x, y, type };

      tiles.push(position);

      if ((type & TERRAIN_MASK_WALL) === 0) {
        openTiles.push(position);
      }
    }
  }

  roomData.sources[source.id] = {
    tiles,
    openSpace: openTiles.length > 0,
    openTiles,
    creeps: {}
  };
}

function getContainerTiles(
  source: Source,
  data: sourceData
): tile[] {
  const containers = source.pos.findInRange(
    FIND_STRUCTURES,
    1,
    {
      filter: (structure): structure is StructureContainer =>
        structure.structureType === STRUCTURE_CONTAINER
    }
  );

  return data.openTiles.filter(position =>
    containers.some(container =>
      container.pos.x === position.x &&
      container.pos.y === position.y
    )
  );
}

function isContainerTile(
  source: Source,
  position: tile
): boolean {
  const containers = source.pos.findInRange(
    FIND_STRUCTURES,
    1,
    {
      filter: (structure): structure is StructureContainer =>
        structure.structureType === STRUCTURE_CONTAINER
    }
  );

  return containers.some(container =>
    container.pos.x === position.x &&
    container.pos.y === position.y
  );
}

function isAssigned(
  data: sourceData,
  position: tile
): boolean {
  return Object.values(data.creeps).some(
    assigned =>
      assigned.x === position.x &&
      assigned.y === position.y
  );
}

function updateOpenSpace(data: sourceData): void {
  data.openSpace = data.openTiles.some(
    position => !isAssigned(data, position)
  );
}
