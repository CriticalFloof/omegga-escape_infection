import { EditMode } from "src/runtime/lib/edit_mode";
import { Command, TrustLevel } from "../../lib/commands";
import { ColorsHex, PrettyChat } from "src/runtime/lib/prettytext";
import { MapLoader } from "src/runtime/lib/map/loader";
import { PresetHandler } from "src/runtime/lib/presets";
import { MapSaver } from "src/runtime/lib/map/saver";
import { Deferred } from "src/lib/deferred";

new Command("enable_edit_mode", TrustLevel.Developer, (speaker: string) => {
    let currentMode = EditMode.isEnabled();
    EditMode.setEnabled(!currentMode);
    PrettyChat.whisper(speaker, `Edit mode is now <b><color="${ColorsHex.red}">${!currentMode ? "enabled" : "disabled"}</></>!`);
});

new Command("list_maps", TrustLevel.Developer, (speaker: string, filter: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();
    let listMaps: string[] = [];
    for (let i = 0; i < modifiableMaps.length; i++) {
        const mapName = modifiableMaps[i];
        listMaps.push(`<color="00ff00">${mapName}</>`);
    }

    if (filter) {
        listMaps = listMaps.filter((map) => map.includes(filter));
    }

    PrettyChat.whisper(speaker, "Editable Maps:", ...listMaps);
});

new Command("load_map", TrustLevel.Developer, (speaker: string, map_name: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();

    if (map_name == undefined) {
        let listMaps = [];
        for (let i = 0; i < modifiableMaps.length; i++) {
            const mapName = modifiableMaps[i];
            listMaps.push(`<color="00ff00">${mapName}</>`);
        }

        PrettyChat.whisper(speaker, `Please enter a map name.`, ...listMaps);
        return;
    }

    if (!modifiableMaps.includes(`${map_name}`)) {
        PrettyChat.whisper(speaker, `'${map_name}' doesn't exist!`);
        return;
    }

    MapLoader.safeLoadSource(map_name);
});

new Command("create_map", TrustLevel.Developer, async (speaker: string) => {
    async function query<T>(question: string[], single_return: boolean = true): Promise<T> {
        return new Promise((resolve, reject) => {
            PrettyChat.whisper(speaker, ...question);
            const defer = new Deferred<T>();
            Command.defer(speaker, defer);
            defer
                .then((responce) => {
                    if (responce == undefined) {
                        return reject();
                    }
                    if (single_return) {
                        resolve(responce[0]);
                    } else {
                        resolve(responce);
                    }
                })
                .catch(() => {
                    return reject();
                });
        });
    }

    async function validGamemodeEnforcer(gamemode_string: string): Promise<string> {
        if (gamemodes.includes(gamemode_string)) return gamemode_string;
        const responce = await query<string>([`${gamemode_string} is not a valid gamemode, use one from the list below:`, ...gamemodes]);
        return validGamemodeEnforcer(responce);
    }

    async function validMapNameEnforcer(map_name: string): Promise<string> {
        if (!gamemodeMaps.includes(map_name)) return map_name;
        const responce = await query<string>([`${map_name} is already taken, try another name.`]);
        return validMapNameEnforcer(responce);
    }

    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const gamemodes = PresetHandler.getGamemodes();
    const fullMapNames = PresetHandler.getEditableMaps();
    let gamemodeMaps = [];

    let gamemodeResponse: string;
    let mapNameResponse: string;

    try {
        gamemodeResponse = await validGamemodeEnforcer(await query<string>([`What gamemode do you want the map to be?`, ...gamemodes]));
    } catch {
        PrettyChat.whisper(speaker, `Cancelled map creation.`);
        return;
    }

    for (let i = 0; i < fullMapNames.length; i++) {
        const fullMapName = fullMapNames[i];
        const gamemodeRegexp = new RegExp(`${gamemodeResponse}_(?=.+)`);
        if (!gamemodeRegexp.test(fullMapName)) continue;
        gamemodeMaps.push(fullMapName.replace(gamemodeRegexp, ""));
    }

    try {
        mapNameResponse = await validMapNameEnforcer(await query<string>([`What name is your map?`]));
    } catch {
        PrettyChat.whisper(speaker, `Cancelled map creation.`);
        return;
    }

    //Finished
    PrettyChat.whisper(speaker, `${gamemodeResponse}_${mapNameResponse}`);
    MapSaver.create(`${gamemodeResponse}_${mapNameResponse}`);
});

new Command("save_map", TrustLevel.Developer, (speaker: string, map_name: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();
    if (map_name == undefined) {
        let listMaps = [];
        for (let i = 0; i < modifiableMaps.length; i++) {
            const mapName = modifiableMaps[i];
            listMaps.push(`<color="00ff00">${mapName}</>`);
        }

        PrettyChat.whisper(
            speaker,
            `Please enter a map name.`,
            `Use ${PrettyChat.cmd("/list_maps")} to show existing maps`,
            `To create a new map, save with an unused map name`
        );
        return;
    }

    if (!modifiableMaps.includes(`${map_name}`)) return;
    let defer = new Deferred();

    PrettyChat.whisper(speaker, `Do you want to overwrite map ''${map_name}''?`);
    defer
        .then(() => {
            PrettyChat.whisper(speaker, `Saved map ''${map_name}''.`);
            MapSaver.save(map_name);
        })
        .catch(() => {
            PrettyChat.whisper(speaker, `Cancelled map save.`);
        });

    Command.defer(speaker, defer);
});

new Command("compile_map", TrustLevel.Developer, (speaker: string, map_name: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();

    if (map_name == undefined) {
        let listMaps = [];
        for (let i = 0; i < modifiableMaps.length; i++) {
            const mapName = modifiableMaps[i];
            listMaps.push(`<color="00ff00">${mapName}</>`);
        }

        PrettyChat.whisper(
            speaker,
            `Please enter a map name.`,
            `Use ${PrettyChat.cmd("/list_maps")} to show existing maps`,
            `To create a new map, save with an unused map name`
        );
        return;
    }

    MapSaver.compile(map_name);
});

new Command("build_map", TrustLevel.Developer, (speaker: string, map_name: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();
    if (map_name == undefined) {
        let listMaps = [];
        for (let i = 0; i < modifiableMaps.length; i++) {
            const mapName = modifiableMaps[i];
            listMaps.push(`<color="00ff00">${mapName}</>`);
        }

        PrettyChat.whisper(
            speaker,
            `Please enter a map name.`,
            `Use ${PrettyChat.cmd("/list_maps")} to show existing maps`,
            `To create a new map, save with an unused map name`
        );
        return;
    }

    if (!modifiableMaps.includes(`${map_name}`)) return;
    let defer = new Deferred();

    PrettyChat.whisper(speaker, `Do you want to overwrite map ''${map_name}''?`);
    defer
        .then(() => {
            PrettyChat.whisper(speaker, `Saved and Compiled map ''${map_name}''.`);
            MapSaver.build(map_name);
        })
        .catch(() => {
            PrettyChat.whisper(speaker, `Cancelled map build.`);
        });

    Command.defer(speaker, defer);
});
