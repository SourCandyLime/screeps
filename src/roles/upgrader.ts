// roles/upgrader.ts

import { move } from "managers/moveManager";
import { getSource } from "managers/sourceManager";

export function runUP(creep: Creep): void {
  if (!creep.memory.source) {
    creep.memory.source = getSource(creep);
  }

  if (!creep.memory.source) return;

  if (Memory.roomData[creep.memory.room].bootstrap) {
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
    const controller = creep.room.controller;
    if (!controller) return;

    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      move(creep, controller.pos, "#00ff94");
    }
  }
}

function nonBootstrap(creep: Creep): void {
  if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0) {
    creep.memory.working = false;
  }

  if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
    creep.memory.working = true;
  }

  if (!creep.memory.working) {
    const containers = creep.room.find(FIND_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_CONTAINER
    });
    if (containers.length === 0) return;

    const container = containers.filter((container) => container.structureType === STRUCTURE_CONTAINER && container.store.getUsedCapacity(RESOURCE_ENERGY) > 0);

    if (container.length === 0) return;

    const target = creep.pos.findClosestByPath(container);

    if (!target) return;

    if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      move(creep, target.pos, "#ff8800");
    }
  } else {
    const controller = creep.room.controller;
    if (!controller) return;

    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      move(creep, controller.pos, "#00ff94");
    }
  }
}
