import { ErrorMapper } from "utils/ErrorMapper";
import { spawner } from "managers/spawnManager";
import { runHarvester } from "roles/harvester";

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
    targetCounts: Record<string, number>;
    templates: Record<string, Record<number, BodyPartConstant[]>>
    room: Room;
    spawn: string;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    source: Id<Source>;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  Memory.targetCounts = {
    HARV: 1,
    UP: 0,
    BOB: 0,
    HAUL: 0,
  }

  Memory.templates = {
    HARV: {
      0: [MOVE, CARRY, WORK]
    }
  }

  Memory.room = Game.rooms["E3S4"]
  Memory.spawn = "S.1"

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  const extensions = Object.values(Game.structures).filter(s => s.structureType === STRUCTURE_EXTENSION);

  Memory.bootstrap = true;

  spawner();

  for (const creep of Object.values(Game.creeps)) {
    if (creep.memory.role === "HARV") {
      runHarvester(creep);
    }
  }

});
