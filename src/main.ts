// main.ts

import { ErrorMapper } from "utils/ErrorMapper";
import { updateCount, updateCosts } from "utils/creepData";
import { spawner } from "managers/spawnManager";
import { runHARV } from "roles/harvester";
import { runUP } from "./roles/upgrader";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    bootstrap: boolean;
    creepsRoleData: Record<string, Record<string, number>>;
    templates: Record<string, Record<number, BodyPartConstant[]>>;
    costs: Record<string, Record<number, number>>;
    spawn: string;
    lastTemplates?: string;
    priorities: string[];
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    tier: number;
    source?: Id<Source>;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

Memory.creepsRoleData ??= {
  HARV: { targetCount: 1, total: 0, tier: 0 },
  UP: { targetCount: 1, total: 0, tier: 0 },
  BILL: { targetCount: 0, total: 0, tier: 0 },
  HAUL: { targetCount: 0, total: 0, tier: 0 },
};

Memory.templates ??= {
  HARV: {
    0: [MOVE, CARRY, WORK],
    1: [MOVE, WORK, WORK]
  },
  UP: {
    0: [MOVE, CARRY, WORK],
    1: [MOVE, MOVE, CARRY, WORK]
  },
  BILL: {
    0: [MOVE, CARRY, WORK],
    1: [MOVE, MOVE, CARRY, WORK]
  },
  HAUL: {
    0: [MOVE, MOVE, CARRY, CARRY],
    1: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY]
  }
};

Memory.costs ??= {};

Memory.spawn ??= "S1";

Memory.bootstrap ??= true;

Memory.priorities ??= ["HARV", "UP", "BILL", "HAUL"];


export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  updateCount();

  const currentTemplates = JSON.stringify(Memory.templates);

  if (Memory.lastTemplates !== currentTemplates) {
    updateCosts();
    Memory.lastTemplates = currentTemplates;
  }

  spawner();

  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.role === "HARV") {
      runHARV(creep);
    } else if (creep.memory.role === "UP") {
      runUP(creep);
    }
  }

});

