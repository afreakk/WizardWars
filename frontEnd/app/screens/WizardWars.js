import {
    Container,
    Point
} from 'pixi.js';
import { AnimationStore } from '../stores/Store';
import Store from '../stores/Store';
import {Client} from 'colyseus.js';
import Player from '../displayobjects/Player/Player';

const getLength = (p1, p2) => {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt(a * a + b * b);
};

const getBackground = (width, height) => {
    const bg = new PIXI.Graphics()
        .beginFill(0x112211)
        .drawRect(0,0, width, height);
    return bg;
};

const spellFilter = new PIXI.filters.BlurFilter();
spellFilter.blur = 3;
const createSpell = (x,y,radius) => {
    const spell = new PIXI.Graphics()
        .beginFill(0x00ff00)
        .drawCircle(0,0,radius);
    // Add a blur filter
    spell.filters = [spellFilter];
    spell.position.set(x,y);
    return spell;
};

const playerFilter = new PIXI.filters.BlurFilter();
playerFilter.blur = 1;
const createPlayer = (x,y) => {
    const player = new Player()
        .beginFill(0x0000ff)
        .drawCircle(0,0,10);
    player.filters = [playerFilter];
    player.position.set(x,y);
    player.createCooldownBar();
    return player;
};

class KeyboardMovements {
    constructor() {
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        this.activeMovements = [];
        this.speed = 1;
    }
    onKeyDown(e) {
        const move = this.keyToMovement(e.key);
        if(!move) return;
        if (this.activeMovements.indexOf(move) !== -1) {
            return;
        }
        this.activeMovements.push(move);
    }
    onKeyUp(e) {
        const move = this.keyToMovement(e.key);
        if(!move) return;
        this.activeMovements = this.activeMovements.filter(k => k !== move);
    }
    keyToMovement(key){
        switch (key) {
            case "w": return 'u';
            case "s": return 'd';
            case "a": return 'l';
            case "d": return 'r';
        }
    }
    getMovement(){
        if(this.activeMovements.length){
            return this.activeMovements;
        }
    }
}

export default class WizardWars extends Container {
    constructor(...args) {
        super(...args);
        this.keyboardMovements = new KeyboardMovements();
        const {canvasWidth, canvasHeight} = Store.getState().Renderer;
        this.bg = getBackground(canvasWidth, canvasHeight);
        this.addChild(this.bg);
        this.interactive = true;
        this.mousepos = new Point(500, 500);
        this.client = new Client("ws://localhost:9100");
        this.room = this.client.join("battle");
        this.room.registerPlaceholder(":radius", /radius/);
        this.room.registerPlaceholder(":cooldown", /cooldown/);
        this.room.listen("players/:id", this.playerChange.bind(this));
        this.room.listen("players/:id/:axis", this.playerAxisChanged.bind(this));
        this.room.listen("spells/:id", this.spellChanged.bind(this));
        this.room.listen("spells/:id/:axis", this.spellChangedPosition.bind(this));
        this.room.listen("spells/:id/:radius", this.spellChangedRadius.bind(this));
        this.room.listen("players/:id/:cooldown", this.cooldownChanged.bind(this));
        this.players = {};
        this.spells = {};
        AnimationStore.subscribe(this.animationUpdate.bind(this));
        Store.subscribe(this.combiStoreChanged.bind(this));
    }
    combiStoreChanged() {
        const {canvasWidth, canvasHeight} = Store.getState().Renderer;
        this.bg.width = canvasWidth;
        this.bg.height = canvasHeight;
    }
    setRenderer(renderer) {
        this.renderer = renderer;
    }
    animationUpdate() {
        const activeMovements = this.keyboardMovements.getMovement();
        if(activeMovements){
            this.room.send({move: activeMovements});
        }
        /* debug coordinates
        for(const p of Object.values(this.players)) {
            console.log(p.position.x, p.position.y);
        }
        */
    }
    cooldownChanged(change) {
        this.players[change.path.id].setCooldown(change.value);
    }
    spellChangedRadius(change) {
        this.spells[change.path.id].width = change.value*this.renderer.view.width;
        this.spells[change.path.id].height = change.value*this.renderer.view.height;
    }
    changeToCanvasValue(change) {
        if(change.path.axis === 'x') {
            return change.value*this.renderer.view.width;
        }
        else {
            return change.value*this.renderer.view.height;
        }
    }
    spellChangedPosition(change) {
        this.spells[change.path.id].position[change.path.axis] = this.changeToCanvasValue(change);
    }
    playerAxisChanged(change) {
        this.players[change.path.id].position[change.path.axis] = this.changeToCanvasValue(change);
    }
    spellChanged(change) {
        if(change.operation === 'add'){
            const x = change.value.x*this.renderer.view.width;
            const y = change.value.y*this.renderer.view.height;
            const radius = change.value.radius*this.renderer.view.width;
            this.spells[change.path.id] = createSpell(x,y,radius);
            this.addChild(this.spells[change.path.id]);
        }
        if(change.operation === 'remove'){
            this.removeChild(this.spells[change.path.id]);
            delete this.spells[change.path.id];
        }
    }
    playerChange(change) {
        if(change.operation === 'add'){
            const x = change.value.x*this.renderer.view.width;
            const y = change.value.y*this.renderer.view.height;
            this.players[change.path.id] = createPlayer(x,y);
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
