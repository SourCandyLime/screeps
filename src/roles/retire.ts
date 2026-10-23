import { move } from "managers/moveManager";

export function runRETIRE(creep: Creep): void {
  const flag = Game.flags.RETIRE;

  if (!flag) {
    creep.suicide();
    return;
  }

  if (creep.pos.isEqualTo(flag.pos)) {
    creep.suicide();
  } else {
    move(creep, flag.pos, "#ff0000");
  }
}
