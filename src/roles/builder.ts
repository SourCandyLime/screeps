// roles/builder.ts

import { move } from "managers/moveManager";
import { getSource } from "managers/sourceManager";
1
export function runBILL(creep: Creep): void {
  if (!creep.memory.source) {
    creep.memory.source = getSource(creep);
  }

  if (!creep.memory.source) return;

  if (Memory.roomData[creep.room.name].bootstrap) {
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
    build(creep);
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

    const container = containers.filter(
      container =>
        container.structureType === STRUCTURE_CONTAINER && container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    );

    if (container.length === 0) return;

    const target = creep.pos.findClosestByPath(container);

    if (!target) return;

    if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      move(creep, target.pos, "#ff8800");
    }
  } else {
    build(creep);
  }
}

function build(creep: Creep): void {
  const builds = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
  if (builds.length > 0) {
    if (creep.build(builds[0]) === ERR_NOT_IN_RANGE) {
      move(creep, builds[0].pos, "#00ff94");
    }
  } else {
    if (creep.pos.findInRange(FIND_SOURCES, 1).length > 0) {
      const dock = Game.flags["BILL-DOCK"];
      if (dock && !creep.pos.isEqualTo(dock.pos)) {
        move(creep, dock.pos, "#ff8800");
      }
    }
    const repairs = creep.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits !== undefined && structure.hits < structure.hitsMax
    });
    if (repairs.length > 0) {
      if (creep.repair(repairs[0]) === ERR_NOT_IN_RANGE) {
        move(creep, repairs[0].pos, "#ff8800");
      }
    } else {
      const dock = Game.flags["BILL-DOCK"];
      if (dock && !creep.pos.isEqualTo(dock.pos)) {
        move(creep, dock.pos, "#ff8800");
      }
    }
  }
}
