// roles/harvester.ts

import { move } from "managers/moveManager"
import { getSource } from "managers/sourceManager";

export function runHARV(creep: Creep): void {
  if (!creep.memory.source) {
    creep.memory.source = getSource(creep);
  }

  if (!creep.memory.source) return;

  if (Memory.bootstrap) {
    bootstrap(creep);
  } else {
    nonBootstrap(creep);
  }
}

function bootstrap(creep: Creep): void {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.working = true;
  }

  if (!creep.memory.working) {
    const source = Game.getObjectById(creep.memory.source!);
    if (!source) return;

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      move(creep, source.pos, "#ff8800");
    }
  } else {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: structure =>
        (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    if (targets.length > 0) {
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        move(creep, targets[0].pos, "#FFee00");
      }
    } else {
      const dock = Game.flags["HARV-DOCK"];
      if (dock && !creep.pos.isEqualTo(dock.pos)) {
        move(creep, dock.pos, "#FF0000");
      }
    }
  }
}

function nonBootstrap(creep: Creep): void {
  if (creep.memory.source) {
    const source = Game.getObjectById(creep.memory.source);
    if (!source) return;

    const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (structure): structure is StructureContainer => structure.structureType === STRUCTURE_CONTAINER
    });

    if (containers.length === 0) return;

    const container = containers[0];

    if (!creep.pos.isEqualTo(container.pos)) {
      move(creep, container.pos, "#ff0000");
      return;
    }

    const miningPower = creep.getActiveBodyparts(WORK) * HARVEST_POWER;
    const availableEnergy = Math.min(source.energy, miningPower);

    if (container.store.getFreeCapacity(RESOURCE_ENERGY) >= availableEnergy) {
      creep.harvest(source);
    }
  }
}
