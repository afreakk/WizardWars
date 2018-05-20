
import ScaledPosition from '../ScaledPosition';


const playerFilter = new PIXI.filters.BlurFilter();
playerFilter.blur = 0.6;

export default class Player extends ScaledPosition {
    constructor(nx,ny,radius, color){
        super(nx,ny);
        this.playerBody = new PIXI.Graphics();
        this.playerBody.beginFill(color);
        const playerWidth = radius*this.oWidth*2;
        const playerHeight = radius*this.oHeight*2;
        this.playerBody.drawEllipse(0,0,playerWidth/2,playerHeight/2);
        this.playerBody.filters = [playerFilter];
        this.addChild(this.playerBody);
        this.createCooldownBar(-playerWidth/2, - playerHeight, playerWidth, playerHeight/6);
        this.wizzardHat = new PIXI.Graphics();
        this.wizzardHat.beginFill(0x222222);
        this.wizzardHat.drawEllipse(0,0,playerWidth/4, playerHeight/4)
        this.playerBody.addChild(this.wizzardHat);
    }
    setDead(){
        this.dead = true;
        this.shrinkWidthSpeed = this.width/90;
        this.shrinkHeightSpeed = this.height/90;
    }
    fallingAnimation(){
        if(this.width > 0){
            this.width -= this.shrinkWidthSpeed;
        }
        if(this.height > 0){
            this.height -= this.shrinkHeightSpeed;
        }
    }
    update(){
        if(this.dead) {
            this.fallingAnimation();
        }
    }
    createCooldownBar(x, y, width, height){
        //Create the bar container
        const barContainer = new PIXI.Container();
        barContainer.position.set(x, y)
        this.playerBody.addChild(barContainer);

        //Create the green background rectangle
        const innerBar = new PIXI.Graphics();
        innerBar.beginFill(0x00ff00);
        innerBar.drawRect(0, 0, width, height);
        innerBar.endFill();
        barContainer.addChild(innerBar);

        //Create the front red rectangle
        const outerBar = new PIXI.Graphics();
        outerBar.beginFill(0x888888);
        outerBar.drawRect(0, 0, width, height);
        outerBar.endFill();
        barContainer.addChild(outerBar);

        this.cooldownBar = outerBar;
        this.cooldownBarWidth = width;
    }
    //from 0 - 100
    setCooldown(value) {
        value = value / 100;
        this.cooldownBar.width = value*this.cooldownBarWidth;
    }
}
