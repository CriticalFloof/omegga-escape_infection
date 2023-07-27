import { OmeggaLike, PC, PS } from "omegga";
import { Config } from "./lib/config";
import { AutoStorage, EmptyLiveStore, Storage } from "./lib/store";
import { Command } from "./lib/commands";
import { UserInitalizatior } from "./setup/init_user";
import { WorldEventBaseSignalsInitalizatior } from "./setup/worldevents";
import { CommandInitalizatior } from "./setup/commands/index";
import { PresetHandler } from "./lib/presets";
import { MapLoader } from "./lib/map/loader";
import { MapRotator } from "./setup/map_rotator";

export class Runtime {
    static omegga: OmeggaLike;
    static config: PC<Config>;
    static store: PS<Storage>;
    static liveStore: Storage;

    static async start(omegga: OmeggaLike, config: PC<Config>, store: PS<Storage>): Promise<{ registeredCommands: string[] }> {
        this.omegga = omegga;
        this.config = config;
        this.store = store;
        this.liveStore = new EmptyLiveStore();

        PresetHandler.installUnavailiableFiles(PresetHandler.checkBrickadiaSaveFileIntegrity());

        await AutoStorage.start();

        UserInitalizatior.run();
        WorldEventBaseSignalsInitalizatior.run();
        CommandInitalizatior.run();

        MapRotator.start();

        return { registeredCommands: Command.getList() };
    }

    static stop() {
        MapLoader.stop();
    }
}
