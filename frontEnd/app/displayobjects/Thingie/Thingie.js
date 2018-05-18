/**
 * A small shape
 *
 * @exports Thingie
 * @extends Sprite
 */

import {Point, Sprite, Texture} from 'pixi.js';

import ONE from './1.png';
import TWO from './2.png';
import FOUR from './4.png';
import FIVE from './5.png';

const assets = [ONE, TWO, FOUR, FIVE];

export default class Thingie extends Sprite {
    constructor(x,y) {
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const texture = Texture.fromImage(asset);
        super(texture);
        this.speed = Math.random() / 2 + 0.25;
        this.targetPosition = new Point(x, y);
        this.originPosition = new Point(x, y);
        this.alpha = 0.9;
    }

    setInitialPoint(x, y) {
        this.position.set(x, y);
        this.originPosition.set(x, y);
    }
    setTargetPos(x,y) {
        this.targetPosition.set(x,y);
    }

    update(mousepos) {
        const xMove = Math.min(Math.max(this.targetPosition.x - this.position.x, -1), 1);
        const yMove = Math.min(Math.max(this.targetPosition.y - this.position.y, -1), 1);
        this.position.set(
            this.position.x + xMove,
            this.position.y + yMove
        );
        /*
        const {x, y} = mousepos;
        const x1 = this.position.x;
        const y1 = this.position.y;
        const xDist = Math.min(Math.max(x1 - x, -1), 1);
        const yDist = Math.min(Math.max(y1 - y, -1), 1);
        */
        /*
        const dist = Math.sqrt(xDist * xDist + yDist * yDist);
            const angle = Math.atan2(yDist, xDist);
            const xaDist = Math.cos(angle) * dist;
            const yaDist = Math.sin(angle) * dist;
            this.targetOffset.set(xaDist, yaDist);
        this.offset.x += (this.targetOffset.x - this.offset.x) * 0.01;
        this.offset.y += (this.targetOffset.y - this.offset.y) * 0.01;
        */
       /*
        this.position.set(
            this.position.x - xDist,
            this.position.y - yDist);
            */
    }
}
