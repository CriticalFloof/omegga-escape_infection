export class WorldEventListener {

    private static subscribers : {[index:string]: Function[]} = {}

    public static on(event : string, listener : Function) {
        if(this.subscribers[event] == undefined) this.subscribers[event] = []

        this.subscribers[event].push(listener)
    }

    public static off(event : string, listener : Function) {
        if(this.subscribers[event] == undefined) this.subscribers[event] = []

        this.subscribers[event] = this.subscribers[event].filter((val)=>{val != listener})

        if(this.subscribers[event].length === 0) delete this.subscribers[event]
    }

    public static emit(event : string, ...parameters : any[]) {
        if(this.subscribers[event] == undefined) return;
        for (let i = 0; i < this.subscribers[event].length; i++) {
            this.subscribers[event][i](...parameters)
        }
    }

}

export class WorldEventSignal {

    public eventName: string
    public interval: number

    private intervalId: NodeJS.Timer = null;
    private callback: () => Promise<{[index:string]:any} | void>
    

    constructor(event_name: string, checking_interval: number, callback: () => Promise<{[index:string]:any} | void>) {
        this.eventName = event_name;
        this.interval = checking_interval;
        this.callback = callback;
    }

    public start() {
        this.intervalId = setInterval(()=>{
            this.callback().then((data)=>{
                if(data != undefined){
                    WorldEventListener.emit(this.eventName, data)
                }
            }).catch((err)=>{
                throw new Error(`WorldEvent callback throwed an error: ${err}`)
            })
        }, this.interval)
    }

    public stop() {
        clearInterval(this.intervalId)
    }
}