// roles/harvester.ts

import { move } from "managers/moveManager";
import { getSource } from "managers/sourceManager";

export function runHARV(creep: Creep): void {
  if (!creep.memory.source) {
    creep.memory.source = getSource(creep);
  }

  if (!creep.memory.source) return;

  if (Memory.roomData[creep.memory.room].bootstrap) {
    bootstrap(creep);
  } else if (creep.memory.tier === 0) {
    bootstrap(creep);
  } else {
    if (Memory.roomData[creep.memory.room].lastBoostrap) {
      creep.memory.source = getSource(creep);
    }
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
  if (creep.memory.source && !(creep.memory.tier === 0)) {
    const source = Game.getObjectById(creep.memory.source);
    if (!source) return;

    const target = Memory.roomData[creep.memory.room].sources?.[creep.memory.source!]?.creeps[creep.name];

    if (target) {
      const targetPos = new RoomPosition(target.x, target.y, creep.memory.room);
      if (!creep.pos.isEqualTo(targetPos)) {
        move(creep, targetPos, "#ff0000");
        return;
      }

      const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (structure): structure is StructureContainer =>
          structure.structureType === STRUCTURE_CONTAINER && structure.pos.isEqualTo(targetPos)
      });

      if (containers.length === 0) return;

      const miningPower = creep.getActiveBodyparts(WORK) * HARVEST_POWER;
      const availableEnergy = Math.min(source.energy, miningPower);

      if (containers[0].store.getFreeCapacity(RESOURCE_ENERGY) >= availableEnergy) {
        creep.harvest(source);
      }
    } else {
      creep.memory.source = getSource(creep);
    }
  }
}
