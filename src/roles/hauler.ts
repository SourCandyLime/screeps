import { move } from "managers/moveManager";

export function runHAUL(creep: Creep): void {
  if (creep.memory.working && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0 )) {
    creep.memory.working = true;
  }

  if (creep.memory.working) {
    deliver(creep);
  } else {
    collect(creep);
  }
}

function collect(creep: Creep): void {
  const containers = creep.room.find(FIND_STRUCTURES, {
    filter: (structure): structure is StructureContainer =>
      structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });

  const tombstones = creep.room.find(FIND_TOMBSTONES, {
    filter: tombstone => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });

  const ruins = creep.room.find(FIND_RUINS, {
    filter: ruin => ruin.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  });

  if ((containers.length === 0) && (tombstones.length === 0) && (ruins.length === 0)) {
    if (!Game.flags["HAUL-DOCK"]) return;
    move(creep, Game.flags["HAUL-DOCK"].pos, "#ff0000");
    return;
  }

  const selectedContainer = creep.pos.findClosestByPath(containers);
  const selectedTombstone = creep.pos.findClosestByPath(tombstones);
  const selectedRuin = creep.pos.findClosestByPath(ruins);

  if (selectedTombstone) {
    if (creep.withdraw(selectedTombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      move(creep, selectedTombstone.pos, "#ff8800");
    }
  } else if (selectedRuin) {
    if (creep.withdraw(selectedRuin, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      move(creep, selectedRuin.pos, "#ff8800");
    }
  } else if (selectedContainer) {
    if (creep.withdraw(selectedContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      move(creep, selectedContainer.pos, "#ff8800");
    }
  }
}

function deliver(creep: Creep): void {
  const targets = creep.room.find(FIND_MY_STRUCTURES, {
    filter: (structure): structure is StructureSpawn | StructureExtension =>
      (structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_STORAGE) &&
      structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
  });

  if (targets.length === 0) {
    const dock = Game.flags["HAUL-DOCK"];

    if (dock && !creep.pos.isEqualTo(dock.pos)) {
      move(creep, dock.pos, "#ff0000");
    }

    return;
  }

  const target = creep.pos.findClosestByPath(targets);
  if (!target) {
    const flag = Game.flags["HAUL-DOCK"];
    if (flag) {
      move(creep, flag.pos, "#ff8800");
    }
    return;
  };

  const result = creep.transfer(target, RESOURCE_ENERGY);

  if (result === ERR_NOT_IN_RANGE) {
    move(creep, target.pos, "#ffee00");
  }
}

function checkContainers(creep: Creep): boolean {
  const containers = creep.room.find(FIND_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0});
  return containers.length === 0;
}
