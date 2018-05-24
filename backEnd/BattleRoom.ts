import { Room, EntityMap, Client, nosync } from "colyseus";
import * as ShortId from 'shortid';

const MOVE_SPEED = 0.003;
const SPELL_MOVE_SPEED = 0.005;
const SPELL_BASE_RADIUS = 0.02;
const SPELL_MAX_RADIUS = 0.24;
const SPELL_RADIUS_GROWTH_SPEED = 0.005;
const KNOCKBACK_MOVE_SPEED = 0.02;
const SPELL_COOLDOWN = 100;
const SPELL_COOLDOWN_REDUCE_SPEED = 3;
const PLAYER_RADIUS = 0.02;
const PLAYER_COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff];
const PLAYER_STARTING_POS = [{x: 0.3, y: 0.3}, {x: 0.7, y:0.3}, {x: 0.3, y: 0.7}, {x: 0.7, y: 0.7}];
const PLAYER_INDEX = [0,1,2,3];
const getLength = (x1, y1, x2, y2) => {
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
};
export class State {
    players: EntityMap<Player> = {};
    spells: EntityMap<Spell> = {};
    platform: Platform = new Platform();
    @nosync
    playerIndex = [0,1,2,3];

    createPlayer (id: string) {
        const playerIndex = this.playerIndex.pop();
        const player = new Player()
        player.index = playerIndex;
        const position = PLAYER_STARTING_POS[playerIndex];
        player.x = position.x;
        player.y = position.y;
        player.color = PLAYER_COLORS[playerIndex];
        this.players[ id ] = player;
    }

    removePlayer (id: string) {
        this.playerIndex.push(this.players[id].index);
        delete this.players[ id ];
    }

    movePlayer (id: string, movement: Array<string>) {
        this.players[id].movement = movement;
    }
    isOnPlatform(player) {
        const length = getLength(player.x, player.y, this.platform.x, this.platform.y);
        if(length > this.platform.radius+ player.radius){
            return false;
        }
        return true;
    }
    update() {
        //simulate player movement
        for(const id in this.players) {
            const player = this.players[id];
            if(player.dead) {
                continue;
            }
            if(!this.isOnPlatform(player)) {
                player.dead = true;
                continue;
            }
            if(player.cooldown > 0) {
                player.cooldown -= SPELL_COOLDOWN_REDUCE_SPEED;
            }
            if(player.spell && player.cooldown <= 0){
                const spellId = ShortId.generate();
                this.spells[spellId] = new Spell();
                this.spells[spellId].x = player.x
                this.spells[spellId].y = player.y
                this.spells[spellId].targetX = player.spell.target.x;
                this.spells[spellId].targetY = player.spell.target.y;
                player.spell = null;
                player.cooldown = SPELL_COOLDOWN;
            }
            if(player.movement){
                for(const m of player.movement){
                    switch(m){
                        case 'u': player.y -= MOVE_SPEED; break;
                        case 'd': player.y += MOVE_SPEED; break;
                        case 'l': player.x -= MOVE_SPEED; break;
                        case 'r': player.x += MOVE_SPEED; break;
                    }
                }
                player.movement = null;
            }
        }
        //simulate spell movement
        for (const id in this.spells) {
            const spell = this.spells[id];
            const xDistance = spell.targetX - spell.x;
            const yDistance = spell.targetY - spell.y;
            const length = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
            if(length < SPELL_MOVE_SPEED){
                if(spell.radius < SPELL_MAX_RADIUS){
                    spell.radius += SPELL_RADIUS_GROWTH_SPEED;
                    this.pushBackPlayers(spell.x, spell.y, spell.radius);
                }
                else{
                    delete this.spells[ id ];
                }
            }
            else {
                spell.x += (xDistance/length)*SPELL_MOVE_SPEED;
                spell.y += (yDistance/length)*SPELL_MOVE_SPEED;
            }
        }
    }
    pushBackPlayers(x: number, y: number, radius: number) {
        for (const id in this.players) {
            const player = this.players[id];
            const xDistance = player.x - x;
            const yDistance = player.y - y;
            const length = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
            if (length <= radius + player.radius) {
                player.x += (xDistance/length)*KNOCKBACK_MOVE_SPEED;
                player.y += (yDistance/length)*KNOCKBACK_MOVE_SPEED;
            }
        }
    }
    createSpell(id: string, spell: any) {
        this.players[id].spell = spell;
    }
}

export class Player {
    dead = false;
    @nosync
    index;
    x;
    y;
    @nosync
    movement;
    @nosync
    spell;
    cooldown = 0;
    radius = PLAYER_RADIUS;
    color;
}
export class Spell {
    x;
    y;
    radius = SPELL_BASE_RADIUS;
    @nosync
    targetX;
    @nosync
    targetY;
}
export class Platform {
    x=0.5;
    y=0.5;
    radius=0.4;
}

export class BattleRoom extends Room<State> {
    onInit (options) {
        console.log("BattleRoom created!", options);

        this.setState(new State());
        this.setSimulationInterval(this.update.bind(this));
    }
    update() {
        this.state.update();
    }

    onJoin (client) {
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }


    requestJoin (options: any, isNew: boolean) {
        return this.state.playerIndex.length > 0;
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