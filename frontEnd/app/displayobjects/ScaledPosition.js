import Store from '../stores/Store';

//takes in backend coordinates, and translates to canvas coordinates
export default class ScaledPosition extends PIXI.Container {
    constructor(nx,ny){
        super();
        const {width, height} = Store.getState().Renderer;
        this.oWidth = width;
        this.oHeight = height;
        Object.assign(this, {nx,ny});
        this.canvasDimensionsChanged();
        Store.subscribe(this.canvasDimensionsChanged.bind(this));
    }
    canvasDimensionsChanged() {
        const {width, height} = Store.getState().Renderer;
        this.position.set(this.nx*width,this.ny*height);
        const scaleX = width/this.oWidth;
        const scaleY = height/this.oHeight;
        this.scale.set(scaleX, scaleY);
    }
    //public setters
    setX(nx) {
        Object.assign(this, {nx});
        this.canvasDimensionsChanged();
    }
    setY(ny) {
        Object.assign(this, {ny});
        this.canvasDimensionsChanged();
    }
}
