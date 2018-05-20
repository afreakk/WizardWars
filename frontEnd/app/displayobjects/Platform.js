import ScaledPosition from './ScaledPosition';

export default class Platform extends ScaledPosition {
    constructor(nx,ny,radius){
        super(nx,ny);
        this.platformBody = new PIXI.Graphics();
        this.platformBody.beginFill(0x353535);
        const platformWidth = radius*this.oWidth*2;
        const platformHeight = radius*this.oHeight*2;
        this.platformBody.drawEllipse(0,0,platformWidth/2,platformHeight/2);
        this.addChild(this.platformBody);
        this.initialRadius = radius;
    }
}
