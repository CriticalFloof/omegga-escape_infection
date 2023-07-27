import { EditMode } from "src/runtime/lib/edit_mode";
import { Command, TrustLevel } from "../../lib/commands";
import { ColorsHex, PrettyChat } from "src/runtime/lib/prettytext";
import { MapLoader } from "src/runtime/lib/map/loader";
import { PresetHandler } from "src/runtime/lib/presets";

new Command("enable_edit_mode", TrustLevel.Developer, (speaker: string) => {
    let currentMode = EditMode.isEnabled();
    EditMode.setEnabled(!currentMode);
    PrettyChat.whisper(speaker, `Edit mode is now <b><color="${ColorsHex.red}">${!currentMode ? "enabled" : "disabled"}</></>!`);
});

new Command("load_map", TrustLevel.Developer, (speaker: string, map_name: string) => {
    if (!EditMode.isEnabled()) {
        PrettyChat.whisper(speaker, `Edit mode isn't enabled!`);
        return;
    }

    if (map_name == undefined) {
        PrettyChat.whisper(speaker, `Please enter a map name.`);
        return;
    }

    const modifiableMaps = PresetHandler.getEditableMaps();

    if (!modifiableMaps.includes(`${map_name}`)) {
        PrettyChat.whisper(speaker, `'${map_name}' doesn't exist!`);
        return;
    }

    MapLoader.safeLoadSource(map_name);
});
