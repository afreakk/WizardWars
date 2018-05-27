
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
        //actually just scale the spellbody, but i guess its 1 to begin with
        const scale = radius/this.initialRadius;
        this.spellBody.scale.set(scale, scale);
        this.radius = radius;
    }
    update(){
        if(this.radius > this.initialRadius){
            this.spellNoiseFilter.seed += 0.1;
            this.spellNoiseFilter.noise += 0.1;
        }
        else {
            this.spellNoiseFilter.seed += 0.0003;
        }
    }
}
