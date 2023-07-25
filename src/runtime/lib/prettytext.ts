import { Runtime } from "../core";

export class ColorsHex {
    public static red = "FF0000";
    public static yellow = "FFFF00";
    public static green = "00FF00";
    public static cyan = "00FFFF";
    public static blue = "0000FF";
    public static magenta = "FF00FF";
    public static black = "000000";
}

export class PrettyChat {
    private static pluginIndicatior: string = `<size="14"><color="${ColorsHex.cyan}">\>\></></> `;

    public static whisper(player_name: string, ...messages: string[]) {
        Runtime.omegga.whisper(
            player_name,
            ...messages.map((msg) => {
                return this.pluginIndicatior + msg;
            })
        );
    }

    public static broadcast(...messages: string[]) {
        Runtime.omegga.broadcast(
            ...messages.map((msg) => {
                return this.pluginIndicatior + msg;
            })
        );
    }

    public static cmd(text: string) {
        return `<color="${ColorsHex.yellow}">${text}</>`;
    }

    public static announcement(text: string) {
        return `<size="28"><color="${ColorsHex.red}">${text}</></>`;
    }
}
