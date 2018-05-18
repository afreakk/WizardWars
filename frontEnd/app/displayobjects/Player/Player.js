/**
 * A small shape
 *
 * @exports Thingie
 * @extends Sprite
 */

import { Point, Sprite, Texture } from "pixi.js";

import PLAYER from "./5.png";

export default class Player extends Sprite {
    constructor(x, y) {
        const texture = Texture.fromImage(PLAYER);
        super(texture);

        this.speed = 3;
        this.alpha = 1;

        this.position.set(x, y);
    }
}
