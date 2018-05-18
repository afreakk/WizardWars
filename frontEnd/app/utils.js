export const checkScreen = (w, h, cw, ch) => w !== cw || h !== ch;
export const randomRange = (m, x) => Math.random() * (x - m) + m;

export class SocketHelper
{
    constructor(onMessageCallback, onOpenCallback){
        const scheme = document.location.protocol == "https:" ? "wss" : "ws";
        const port = ":5000";
        const connectionUrl = scheme + "://" + document.location.hostname + port + "/ws" ;
        this.socket = new WebSocket(connectionUrl);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.onMessageCallback = onMessageCallback;
        this.onOpenCallback = onOpenCallback;
    }
    sendMessage(txt){
        this.socket.send(txt);
    }
    onOpen(event){
        console.log('opened', event);
        this.onOpenCallback(event);
    }
    onClose(event){
        console.log('closed', event);
    }
    onError(event){
        console.log('error', event);
    }
    onMessage(event){
        console.log('message', event);
        this.onMessageCallback(event);
    }
}
