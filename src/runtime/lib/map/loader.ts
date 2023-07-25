import { Runtime } from "src/runtime/core";
import { Gamemode } from "src/runtime/setup/minigame";

export class MapLoader {

    public static start(mapName: string) {
        const mapLoadPath = `Escape_Infection/Compiled/${mapName}`
        Runtime.omegga.loadBricks(mapLoadPath, {quiet: false})

        const environmentName = `EI_${mapName}_environment`
        Runtime.omegga.loadEnvironment(environmentName)

        const gamemodeName = `${mapName.replace(/_.+/, "")}`
        Gamemode.startSafe(gamemodeName)
    }
    public static stop() {
        Runtime.omegga.clearAllBricks()
        Runtime.omegga.resetEnvironment()
        Gamemode.stop()
    }

    public static startSafe(mapName: string) {
        //Safely unloads old map data and starts a new map.
        if(mapName == null) {
            return
        }
        this.stop()
        this.start(mapName)
    }
}