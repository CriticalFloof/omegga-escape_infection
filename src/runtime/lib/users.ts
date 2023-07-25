import { IPlayerPositions, OmeggaPlayer, Vector } from "omegga";
import { Runtime } from "../core";
import { TrustLevel } from "./commands";
import { Log } from "src/lib/console/logging";

type NetworkStat = "Online" | "Away" | "Offline"

export class UserHandler {

    public static registerUser(name: string) {
        Runtime.liveStore.users[name] = new User(name);
    }

    public static hydrateUser(user: User) {
        Runtime.liveStore.users[user.name] = new User(user.name, true);
    }

    public static readyUser(name: string) {
        if(Runtime.liveStore.users[name] == undefined) {
            UserHandler.registerUser(name)
        } else {
            try {
                Runtime.liveStore.users[name].isHydrated()
            } catch (error) {
                //User is missing all functionality, they must be hydrated now
                UserHandler.hydrateUser(Runtime.liveStore.users[name])
            }
        }
    }

    public static getUserByName(name: string) {
        if(Runtime.liveStore.users[name] == undefined) {
            this.registerUser(name);
            Log.verb(`User ${name} has been forcefully registered.`)
        }
        return Runtime.liveStore.users[name]
    }

    public static isUserTrustworthy(user : User, trust_level: TrustLevel) {

        if(user.omegga_player.isHost()) return TrustLevel.Developer;

        let roles = user.omegga_player.getRoles()
        let trustTier = TrustLevel.Default
        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];
            if(Runtime.config["Developer Role"] === role && trustTier < TrustLevel.Developer) trustTier = TrustLevel.Developer;
            if(Runtime.config["Trusted Role"] === role && trustTier < TrustLevel.Trusted) trustTier = TrustLevel.Trusted;
            if(Runtime.config["Restricted Role"] === role && trustTier < TrustLevel.Trusted) trustTier = TrustLevel.Restricted;
        }

        return (trustTier >= trust_level)
    }
}

export class User {
    name: string
    network_status: NetworkStat
    omegga_player: OmeggaPlayer
    last_position: Vector

    constructor(name: string, hydrate: boolean = false) {
        // A note for the future, the idea behind hydrate is to allow persistent player data to be kept while also generating a new template with all the methods.
        this.name = name;
        this.network_status = (Runtime.omegga.getPlayer(name) !== null) ? "Online" : "Offline";
        this.omegga_player = Runtime.omegga.getPlayer(name)

        Runtime.omegga.getAllPlayerPositions().then((val) => {
            this.last_position = val.find((user) => {
                return user.player.name === this.name
            }).pos as Vector
        })
    }

    isHydrated(){
        // The point of this method is to see if the user has been taken from storage.
        // A fresh user has their methods/functionality, while ones that are taken from storage, does not.
        return true
    }
}