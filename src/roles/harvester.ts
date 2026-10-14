import { move } from "managers/moveManager"

export function runHarvester(creep: Creep): void {
  if (Memory.bootstrap) {
    bootstrap(creep);
  } else {
    nonBootstrap(creep);
  }
}

function bootstrap(creep: Creep): void {
  if(creep.store.getFreeCapacity() > 0) {
    const sources = creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
      move(creep, sources[0].pos, "#ff8800");
    }
  } else {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    if (targets.length > 0) {
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        move(creep, targets[0].pos, "#FFee00");
      }
    }
  }
}

function nonBootstrap(creep: Creep): void {
  const sources = creep.room.find(FIND_SOURCES);
  const containers = creep.pos.findInRange(FIND_STRUCTURES, 1, {
    filter: structure => {
      return (structure.structureType === STRUCTURE_CONTAINER) && (structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
    }
  })
  if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
    move(creep, sources[0].pos, "#ff0000");
  }
  if (containers.length > 0) {
    creep.transfer(containers[0], RESOURCE_ENERGY);
  }
}
