import { Deferred } from "src/lib/deferred";
import { Runtime } from "../core";
import { PrettyChat } from "./prettytext";
import { UserHandler } from "./users";

export enum TrustLevel {
    "Restricted",
    "Default",
    "Trusted",
    "Developer",
}

export class Command {
    private static command_list: string[] = [];
    private static commandDefers: { [username: string]: { deferred: Deferred<any>; lifetime: number } } = {};

    public name: string;
    public trust_level: TrustLevel;
    public listener: (speaker: string, ...commandArgs: string[]) => void;

    constructor(name: string, trust_level: TrustLevel, listener: (speaker: string, ...commandArgs: string[]) => void) {
        this.name = name;
        this.trust_level = trust_level;
        this.listener = listener;

        if (name.match(/"|'/)) {
            throw new Error(`Command ${name} contains an erroneous character. Commands cannot contain ' or " in their name.`);
        }

        Runtime.omegga.on(`cmd:${name}`, (speaker: string, ...args: string[]) => {
            let user = UserHandler.getUserByName(speaker);
            if (!UserHandler.isUserTrustworthy(user, trust_level)) {
                PrettyChat.whisper(speaker, "You do not have permission to use this command.");
                return;
            }
            listener(speaker, ...args);

            if (!(speaker in Command.commandDefers)) return;
            if (Command.commandDefers[speaker].lifetime > 0) {
                Command.commandDefers[speaker].lifetime -= 1;
                return;
            }
            Command.rejectDefer(speaker, "unfocused");
            delete Command.commandDefers[speaker];
        });
        Command.command_list.push(name);
    }

    public static getList(): string[] {
        return Command.command_list;
    }

    public static defer(username: string, deferred_object: Deferred<any>) {
        if (this.hasPendingDefer(username)) this.rejectDefer(username);
        Command.commandDefers[username] = { deferred: deferred_object, lifetime: 1 };
    }

    public static resolveDefer(username: string, value?: unknown) {
        Command.commandDefers[username].deferred.resolve(value);
    }

    public static rejectDefer(username: string, reason?: any) {
        Command.commandDefers[username].deferred.reject(reason);
    }

    public static hasPendingDefer(username: string): boolean {
        return username in Command.commandDefers;
    }
}
