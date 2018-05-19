import { Room, EntityMap, Client, nosync } from "colyseus";
import * as ShortId from 'shortid';

const MOVE_SPEED = 0.003;
const SPELL_MOVE_SPEED = 0.004;
const SPELL_BASE_RADIUS = 0.02;
const SPELL_MAX_RADIUS = 0.1;
const SPELL_RADIUS_GROWTH_SPEED = 0.01;
const KNOCKBACK_MOVE_SPEED = 0.02;
const SPELL_COOLDOWN = 100;
const SPELL_COOLDOWN_REDUCE_SPEED = 2;
export class State {
    players: EntityMap<Player> = {};
    spells: EntityMap<Spell> = {};

    createPlayer (id: string) {
        this.players[ id ] = new Player();
    }

    removePlayer (id: string) {
        delete this.players[ id ];
        delete this.spells[ id ];
    }

    movePlayer (id: string, movement: Array<string>) {
        this.players[id].movement = movement;
    }
    update() {
        //simulate player movement
        for(const id in this.players) {
            const player = this.players[id];
            if(player.cooldown > 0) {
                player.cooldown -= SPELL_COOLDOWN_REDUCE_SPEED;
            }
            if(this.players[id].spell){
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
            if (length <= radius) {
                player.x += (xDistance/length)*KNOCKBACK_MOVE_SPEED;
                player.y += (yDistance/length)*KNOCKBACK_MOVE_SPEED;
            }
        }
    }
    createSpell(id: string, spell: any) {
        if (this.players[id].cooldown <= 0) {
            this.players[id].spell = spell;
        }
    }
}

export class Player {
    x = Math.random();
    y = Math.random();
    @nosync
    movement;
    @nosync
    spell;
    cooldown = 0;
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