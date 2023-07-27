import { ILogMinigame } from "omegga";
import { Runtime } from "src/runtime/core";
import { Gamemode } from "./minigame";

export class MapLoader {
    public static clear() {
        Runtime.omegga.clearAllBricks(true);
        Runtime.omegga.resetEnvironment();
        Gamemode.stop();
    }

    public static async loadCompiled(map_name: string): Promise<ILogMinigame> {
        const mapLoadPath = `Escape_Infection/Compiled/${map_name}`;
        Runtime.omegga.loadBricks(mapLoadPath, { quiet: true });

        const environmentName = `EI_${map_name}_environment`;
        Runtime.omegga.loadEnvironment(environmentName);

        const gamemodeName = `${map_name.replace(/_.+/, "")}`;
        return await Gamemode.startSafe(gamemodeName);
    }

    public static async safeLoadCompiled(map_name: string): Promise<ILogMinigame> {
        //Safely unloads old map data and starts a new map.
        if (map_name == null) {
            return;
        }
        this.clear();
        return this.loadCompiled(map_name);
    }

    public static loadSource(map_name: string): void {
        const mapLoadPath = `Escape_Infection/Source/${map_name}_source`;
        Runtime.omegga.loadBricks(mapLoadPath, { quiet: true });

        const environmentName = `EI_${map_name}_environment`;
        Runtime.omegga.loadEnvironment(environmentName);
    }

    public static safeLoadSource(map_name: string): void {
        if (map_name == null) {
            return;
        }
        this.clear();

        this.loadSource(map_name);
    }
}
