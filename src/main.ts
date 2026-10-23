// main.ts

import { ErrorMapper } from "utils/ErrorMapper";
import { updateCounts, updateCosts, checkRetire } from "utils/creepData";
import { runSpawners } from "managers/spawnManager";
import { bootstrapManager } from "managers/bootstrapManager";
import { runHARV } from "roles/harvester";
import { runBILL } from "roles/builder";
import { runUP } from "roles/upgrader";
import { runRETIRE } from "roles/retire";
import { updateTargetCounts } from "managers/countManager";
import { runHAUL } from "roles/hauler";
import { updateTiers } from "managers/tierManager";

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
    templates: Record<string, Record<number, BodyPartConstant[]>>;
    costs: Record<string, Record<number, number>>;
    spawn: string;
    lastTemplates?: string;
    priorities: string[];
    roomData: Record<string, RoomData>;
    nameCounters: Record<string, number>;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    tier: number;
    source?: Id<Source>;
  }

  interface RoomData {
    bootstrap: boolean;
    creepsData: Record<string, CreepsData>;
    spawns: string[];
    sources?: Record<Id<Source>, sourceData>;
    lastBoostrap: boolean;
  }

  interface sourceData {
    tiles: tile[];
    openSpace: boolean;
    openTiles: tile[];
    creeps: Record<string, tile>;
  }

  interface tile {
    x: number;
    y: number;
    type: number;
  }

  interface CreepsData {
    targetCount: number;
    totalCount: number;
    tier: number;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
};

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

Memory.templates ??= {
  HARV: {
    0: [MOVE, CARRY, WORK, WORK],
    1: [MOVE, WORK, WORK, WORK, WORK, WORK],
  },
  UP: {
    0: [MOVE, MOVE, CARRY, WORK],
    1: [MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
  },
  BILL: {
    0: [MOVE, CARRY, WORK, WORK],
    1: [MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
  },
  HAUL: {
    0: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
    1: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY]
  }
};

Memory.costs ??= {};

Memory.roomData ??= {
  W6S28: {
    bootstrap: true,
    creepsData: {
      HARV: {
        targetCount: 1,
        totalCount: 0,
        tier: 0
      },
      UP: {
        targetCount: 1,
        totalCount: 0,
        tier: 0
      },
      BILL: {
        targetCount: 1,
        totalCount: 0,
        tier: 0
      },
      HAUL: {
        targetCount: 1,
        totalCount: 0,
        tier: 0
      }
    },
    spawns: ["S1"],
    lastBoostrap: true,
  }
};

Memory.priorities ??= ["HARV", "UP", "BILL", "HAUL"];



export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  // Get names of creeps currently spawning
  const spawningNames = new Set(
    Object.values(Game.spawns)
      .filter(spawn => spawn.spawning !== null)
      .map(spawn => spawn.spawning!.name)
  );

  // Delete memory only for genuinely missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps) && !(spawningNames.has(name))) {
      delete Memory.creeps[name];
    }
  }

  const currentTemplates = JSON.stringify(Memory.templates);

  if (Memory.lastTemplates !== currentTemplates) {
    updateCosts();
    Memory.lastTemplates = currentTemplates;
  }

  bootstrapManager();
  updateCounts();
  updateTiers();

  for (const creep of Object.values(Game.creeps)) {
    checkRetire(creep);
  }

  updateCounts();
  updateTargetCounts();
  runSpawners();

  for (const creep of Object.values(Game.creeps)) {
    if (!creep.memory.role) {
      creep.suicide();
    }

    if (creep.memory.role === "HARV") {
      runHARV(creep);
    } else if (creep.memory.role === "UP") {
      runUP(creep);
    } else if (creep.memory.role === "BILL") {
      runBILL(creep);
    } else if (creep.memory.role === "HAUL") {
      runHAUL(creep);
    } else if (creep.memory.role === "RETIRE") {
      runRETIRE(creep);
    }
  }

  for (const room of Object.values(Memory.roomData)) {
    if (room.bootstrap !== room.lastBoostrap) {
      room.lastBoostrap = room.bootstrap;
    }
  }
});

