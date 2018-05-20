
import ScaledPosition from './ScaledPosition';


export default class Background extends ScaledPosition {
    constructor(){
        super(0,0);
        const bg = new PIXI.Graphics();
        bg.beginFill(0x443344)
        bg.drawRect(0,0, this.oWidth, this.oHeight);
        this.bgFilter = new PIXI.filters.NoiseFilter();
        bg.filters = [this.bgFilter];
        this.addChild(bg);
    }
    update(){
        this.bgFilter.seed += 0.00000002;
    }
}
