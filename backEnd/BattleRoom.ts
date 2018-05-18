import { Room, EntityMap, Client, nosync } from "colyseus";

const MOVE_SPEED = 0.003;
export class State {
    players: EntityMap<Player> = {};
    spells: EntityMap<Spell> = {};

    @nosync
    something = "This attribute won't be sent to the client-side";

    createPlayer (id: string) {
        this.players[ id ] = new Player();
    }

    removePlayer (id: string) {
        delete this.players[ id ];
    }

    movePlayer (id: string, movement: any) {
        for(const m of movement){
            switch(m){
                case 'u': this.players[id].y -= MOVE_SPEED; break;
                case 'd': this.players[id].y += MOVE_SPEED; break;
                case 'l': this.players[id].x -= MOVE_SPEED; break;
                case 'r': this.players[id].x += MOVE_SPEED; break;
            }
        }
    }
    createSpell(id: string, spellData: any) {
        this.spells[id] = new Spell();
        this.spells[id].x = this.players[id].x
        this.spells[id].y = this.players[id].y
        this.spells[id].targetX = spellData.target.x;
        this.spells[id].targetY = spellData.target.y;
    }
}

export class Player {
    x = Math.random();
    y = Math.random();
}
export class Spell {
    x;
    y;
    @nosync
    targetX;
    @nosync
    targetY;
}

export class BattleRoom extends Room<State> {
    onInit (options) {
        console.log("BattleRoom created!", options);

        this.setState(new State());
    }

    onJoin (client) {
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        console.log("BattleRoom received message from", client.sessionId, ":", data);
        if(data.move){
            this.state.movePlayer(client.sessionId, data.move);
        }
        else if(data.spell){
            this.state.createSpell(client.sessionId, data.spell);
        }
    }

    onDispose () {
        console.log("Dispose BattleRoom");
    }

}