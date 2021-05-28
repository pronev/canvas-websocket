interface Room {
  connections: any[];
  drawData: string[];
}

interface Rooms {
  [roomId: string]: Room;
}

export { Rooms }