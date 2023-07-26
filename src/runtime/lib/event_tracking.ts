export class WorldEventListener {
    private static subscribers: { [index: string]: Array<(...data: any) => void> } = {};

    public static on(event: string, listener: (...data: any[]) => void) {
        if (this.subscribers[event] == undefined) this.subscribers[event] = [];

        this.subscribers[event].push(listener);
        console.log(this.subscribers[event]);
    }

    public static off(event: string, listener: (...data: any[]) => void) {
        if (this.subscribers[event] == undefined) return;

        this.subscribers[event] = this.subscribers[event].filter((val) => {
            return val != listener;
        });

        console.log(this.subscribers[event]);

        if (this.subscribers[event].length === 0) delete this.subscribers[event];
    }

    public static emit(event: string, ...parameters: any[]) {
        if (this.subscribers[event] == undefined) return;
        for (let i = 0; i < this.subscribers[event].length; i++) {
            setImmediate(() => {
                this.subscribers[event][i](...parameters);
            });
        }
    }

    public static getListeners(event: string) {
        return this.subscribers[event] != undefined ? this.subscribers[event] : [];
    }
}

export class WorldEventSignal {
    public eventName: string;
    public interval: number;

    private intervalId: NodeJS.Timer = null;
    private callback: (state: { [index: string]: any }) => Promise<{ [index: string]: any } | void>;
    private state: { [index: string]: any } = {};

    constructor(
        event_name: string,
        checking_interval: number,
        callback: (state: { [index: string]: any }) => Promise<{ [index: string]: any } | void>
    ) {
        this.eventName = event_name;
        this.interval = checking_interval;
        this.callback = callback;
    }

    public start() {
        this.intervalId = setInterval(() => {
            if (WorldEventListener.getListeners(this.eventName).length === 0) {
                // Nobody is listening to this event anyway, do nothing and save resources.
                return;
            }
            this.callback(this.state)
                .then((data) => {
                    if (data != undefined) {
                        WorldEventListener.emit(this.eventName, data);
                    } else {
                        WorldEventListener.emit(this.eventName);
                    }
                })
                .catch((err) => {
                    if (err == null) return; // Callback didn't error, but also didn't find anything to emit.

                    throw new Error(`WorldEvent callback throwed an error: ${err}`);
                });
        }, this.interval);
    }

    public stop() {
        clearInterval(this.intervalId);
    }
}
