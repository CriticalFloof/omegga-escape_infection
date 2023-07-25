import { Log } from "src/lib/console/logging";
import { Runtime } from "../core";
import { User } from "./users";


export type Storage = { users: {[index: string]: User}};

export class AutoStorage {

    private static intervalId : NodeJS.Timer = null

    public static wipe() {
        Runtime.store.wipe()
    }

    public static async start() {
        await this.load()
        this.intervalId = setInterval(()=>{
            this.save()
        }, Runtime.config["Autosave Interval"]*60000)
        return
    }

    public static stop() {
        clearInterval(this.intervalId)
        this.save()
    }

    private static async save() {
        Log.verb("Starting autosave...")
        let liveStoreKeys = Object.keys(Runtime.liveStore)

        for (let i = 0; i < liveStoreKeys.length; i++) {
            const propertyKey = liveStoreKeys[i] as keyof Storage;
            if(Runtime.liveStore[propertyKey] === null) continue;
            Runtime.store.set(propertyKey, Runtime.liveStore[propertyKey])
        }
        Log.verb("Autosave complete.")
    }

    private static async load() {
        Log.verb("Livestore is loading from Store...")
        let keys = await Runtime.store.keys()

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            Runtime.store.get(key).then((val) => {
                Runtime.liveStore[key] = val
            })
        }
        Log.verb("Livestore loading complete.")
    }
}

export class EmptyLiveStore implements Storage {
    public users: { [index: string]: User; } = {};
}