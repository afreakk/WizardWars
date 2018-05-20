
import ScaledPosition from './ScaledPosition';


const spellBlurFilter = new PIXI.filters.BlurFilter();
spellBlurFilter.blur = 3;

export default class Spell extends ScaledPosition {
    constructor(nx,ny,radius){
        super(nx,ny);
        this.spellBody = new PIXI.Graphics();
        this.spellBody.beginFill(0x778833);
        const spellWidth = radius*this.oWidth*2;
        const spellHeight = radius*this.oHeight*2;
        this.spellBody.drawEllipse(0,0,spellWidth/2,spellHeight/2);
        this.spellNoiseFilter = new PIXI.filters.NoiseFilter();
        this.spellBody.filters = [spellBlurFilter, this.spellNoiseFilter];
        this.addChild(this.spellBody);
        this.initialRadius = radius;
    }
    scaleRadius(radius){
        const scale = radius/this.initialRadius;
        this.scale.set(scale, scale);
    }
    update(){
        this.spellNoiseFilter += 0.0000002;
    }
}
