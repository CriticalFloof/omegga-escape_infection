import { ILogMinigame } from "omegga";
import { Runtime } from "src/runtime/core";
import { Gamemode } from "./minigame";

export class MapLoader {
    public static async start(mapName: string): Promise<ILogMinigame> {
        const mapLoadPath = `Escape_Infection/Compiled/${mapName}`;
        Runtime.omegga.loadBricks(mapLoadPath, { quiet: false });

        const environmentName = `EI_${mapName}_environment`;
        Runtime.omegga.loadEnvironment(environmentName);

        const gamemodeName = `${mapName.replace(/_.+/, "")}`;
        return await Gamemode.startSafe(gamemodeName);
    }
    public static stop() {
        Runtime.omegga.clearAllBricks();
        Runtime.omegga.resetEnvironment();
        Gamemode.stop();
    }

    public static async startSafe(mapName: string): Promise<ILogMinigame> {
        //Safely unloads old map data and starts a new map.
        if (mapName == null) {
            return;
        }
        this.stop();
        return this.start(mapName);
    }
}
