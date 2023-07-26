import OmeggaPlugin, { OL, PS, PC } from "omegga";
import { Config } from "src/runtime/lib/config";
import { Storage } from "src/runtime/lib/store";
import { Runtime } from "src/runtime/core";

export default class Plugin implements OmeggaPlugin<Config, Storage> {
    omegga: OL;
    config: PC<Config>;
    store: PS<Storage>;

    constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
        this.omegga = omegga;
        this.config = config;
        this.store = store;
    }

    async init(): Promise<{ registeredCommands: string[] }> {
        return Runtime.start(this.omegga, this.config, this.store);
    }

    async stop() {
        await Runtime.stop();
    }
}
