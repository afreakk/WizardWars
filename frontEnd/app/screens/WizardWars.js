import {
    Container,
    Point
} from 'pixi.js';
import { AnimationStore } from '../stores/Store';
import Store from '../stores/Store';
import {Client} from 'colyseus.js';
import Player from '../displayobjects/Player/Player';
import {KeyboardMovements} from '../utils';
import Spell from '../displayobjects/Spell';
import Background from '../displayobjects/Background';
import Platform from '../displayobjects/Platform';

export default class WizardWars extends Container {
    constructor() {
        super();
        this.keyboardMovements = new KeyboardMovements();
        this.bg = new Background();
        this.addChild(this.bg);
        this.interactive = true;
        this.players = {};
        this.spells = {};
        AnimationStore.subscribe(this.animationUpdate.bind(this));
        //todo get now mousepos
        this.mousepos = new Point(0, 0);
        //ws stuff
        this.client = new Client("ws://localhost:9100");
        this.room = this.client.join("battle");
        this.room.registerPlaceholder(":radius", /radius/);
        this.room.registerPlaceholder(":cooldown", /cooldown/);
        this.room.registerPlaceholder(":platform", /platform/);
        this.room.registerPlaceholder(":dead", /dead/);
        this.room.listen(":platform", this.addPlatform.bind(this));
        this.room.listen("players/:id", this.playerAddOrRemoved.bind(this));
        this.room.listen("players/:id/:axis", this.playerAxisChanged.bind(this));
        this.room.listen("spells/:id", this.spellAddOrRemoved.bind(this));
        this.room.listen("spells/:id/:axis", this.spellAxisChanged.bind(this));
        this.room.listen("spells/:id/:radius", this.spellRadiusChanged.bind(this));
        this.room.listen("players/:id/:cooldown", this.playerCooldownChanged.bind(this));
        this.room.listen("players/:id/:dead", this.playerDied.bind(this));
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    playerDied(change) {
        if(change.value){
            this.players[change.path.id].setDead();
        }
    }
    animationUpdate() {
        this.bg.update();
        for(const spell of Object.values(this.spells)){
            spell.update();
        }
        for(const player of Object.values(this.players)){
            player.update();
        }
        const activeMovements = this.keyboardMovements.getMovement();
        if(activeMovements){
            this.room.send({move: activeMovements});
        }
    }
    addPlatform(change) {
        this.platform = new Platform(change.value.x, change.value.y, change.value.radius);
        this.addChildAt(this.platform,1);
    }
    playerCooldownChanged(change) {
        this.players[change.path.id].setCooldown(change.value);
    }
    spellRadiusChanged(change) {
        this.spells[change.path.id].scaleRadius(change.value);
    }
    spellAxisChanged(change) {
        this.spells[change.path.id]['set'+change.path.axis.toUpperCase()](change.value);
    }
    spellAddOrRemoved(change) {
        if(change.operation === 'add'){
            this.spells[change.path.id] = new Spell(change.value.x, change.value.y, change.value.radius);
            this.addChild(this.spells[change.path.id]);
        }
        if(change.operation === 'remove'){
            this.removeChild(this.spells[change.path.id]);
            delete this.spells[change.path.id];
        }
    }
    playerAxisChanged(change) {
        this.players[change.path.id]['set'+change.path.axis.toUpperCase()](change.value);
    }
    playerAddOrRemoved(change) {
        if(change.operation === 'add'){
            this.players[change.path.id] = new Player(change.value.x,change.value.y,change.value.radius,change.value.color);
            this.addChild(this.players[change.path.id]);
        }
        if(change.operation === 'remove'){
            this.removeChild(this.players[change.path.id]);
            delete this.players[change.path.id];
        }
    }
    mousemove(e) {
        const {
            x,
            y
        } = e.data.getLocalPosition(this);
        this.mousepos.set(x, y);
    }
    mousedown() {
        this.room.send({
            spell: {
                type: 'force',
                target: {
                    x: this.mousepos.x/this.renderer.view.width,
                    y: this.mousepos.y/this.renderer.view.height
                },
            }
        });
    }
}
