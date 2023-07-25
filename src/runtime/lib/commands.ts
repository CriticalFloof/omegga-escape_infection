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

    public name: string;
    public trust_level: TrustLevel;
    public listener: Function;

    constructor(
        name: string,
        trust_level: TrustLevel,
        listener: (speaker: string, ...commandArgs: string[]) => void
    ) {
        this.name = name;
        this.trust_level = trust_level;
        this.listener = listener;

        if (name.match(/"|'/)) {
            throw new Error(
                `Command ${name} contains an erroneous character. Commands cannot contain ' or " in their name.`
            );
        }

        Runtime.omegga.on(
            `cmd:${name}`,
            (speaker: string, ...args: string[]) => {
                let user = UserHandler.getUserByName(speaker);
                if (!UserHandler.isUserTrustworthy(user, this.trust_level)) {
                    PrettyChat.whisper(
                        speaker,
                        "You do not have permission to use this command."
                    );
                    return;
                }
                listener(speaker, ...args);
            }
        );
        Command.command_list.push(name);
    }

    public static getList(): string[] {
        return Command.command_list;
    }
}
