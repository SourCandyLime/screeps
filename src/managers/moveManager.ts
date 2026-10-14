export function move(creep: Creep, target: RoomPosition, pathColor: string): void {
  creep.moveTo(target, {visualizePathStyle: {stroke: pathColor}});
}
