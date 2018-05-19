
import {
    Container,
    Point
} from 'pixi.js';

export default class Player extends PIXI.Graphics {
    constructor(...args){
        super(...args);
    }
    createCooldownBar(){
        //Create the health bar
        const healthBar = new PIXI.Container();
        healthBar.position.set(-this.width/2, 4)
        this.addChild(healthBar);

        //Create the black background rectangle
        let innerBar = new PIXI.Graphics();
        innerBar.beginFill(0x00ff00);
        innerBar.drawRect(0, 0, this.width, 8);
        innerBar.endFill();
        healthBar.addChild(innerBar);

        //Create the front red rectangle
        let outerBar = new PIXI.Graphics();
        outerBar.beginFill(0xFF3300);
        outerBar.drawRect(0, 0, this.width/2, 8);
        outerBar.endFill();
        healthBar.addChild(outerBar);

        this.cooldownBar = outerBar;
    }
    //from 0 - 100
    setCooldown(value) {
        value = value / 100;
        this.cooldownBar.width = value*this.width;
    }
}
