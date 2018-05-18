import { Server } from "colyseus";
import { createServer } from "http";
import {BattleRoom} from './BattleRoom';

const gameServer = new Server({
  server: createServer()
});

gameServer.register("battle", BattleRoom).
  on("create", (room) => console.log("room created:", room.roomId)).
  on("dispose", (room) => console.log("room disposed:", room.roomId)).
  on("join", (room, client) => console.log(client.id, "joined", room.roomId)).
  on("leave", (room, client) => console.log(client.id, "left", room.roomId));


const port = 9100;
gameServer.listen(port);
console.log(`Listening on http://localhost:${ port }`);