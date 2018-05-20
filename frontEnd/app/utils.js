export const checkScreen = (w, h, cw, ch) => w !== cw || h !== ch;
export const randomRange = (m, x) => Math.random() * (x - m) + m;

const getLength = (p1, p2) => {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt(a * a + b * b);
};

export class KeyboardMovements {
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
