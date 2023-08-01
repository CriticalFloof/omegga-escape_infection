import path from "path";
import { Runtime } from "../core";
import * as fs from "fs";
import { Log } from "src/lib/console/logging";

export class PresetHandler {
    public static checkBrickadiaSaveFileIntegrity() {
        const brPresetPath = Runtime.omegga.presetPath;
        const brSavePath = Runtime.omegga.savePath;
        const brBuildSourcePath = `${brSavePath}/Escape_Infection/Source`;
        const brBuildCompiledPath = `${brSavePath}/Escape_Infection/Compiled`;
        const brMinigamePath = `${brPresetPath}/Minigame`;
        const brEnvironmentPath = `${brPresetPath}/Environment`;

        const pluginPath = `${path.dirname(path.dirname(__filename))}`;
        const pluginGamemodePath = `${pluginPath}/data/gamemodes`;
        const pluginMapsPath = `${pluginPath}/data/maps`;

        // Plugin Gamemode translate over to Brickadia Minigames
        // Plugin Maps environment translates to Brickadia Environment
        // Plugin Maps brs translates to Brickadia Build Compiled
        // Plugin Maps brs raw translates to Brickadia Build Source

        const gamemodes = fs.readdirSync(pluginGamemodePath);
        const maps = fs.readdirSync(pluginMapsPath);

        let minigameQueries: string[] = [];
        for (let i = 0; i < gamemodes.length; i++) {
            const gamemode = gamemodes[i];
            minigameQueries.push(gamemode);
        }

        let environmentQueries: string[] = [];
        let compiledMapQueries: string[] = [];
        let sourceMapQueries: string[] = [];
        for (let i = 0; i < maps.length; i++) {
            const map = maps[i];
            environmentQueries.push(map);
            compiledMapQueries.push(map);
            sourceMapQueries.push(map);
        }

        // NOTE: Because of an issue where presets cannot load inside folders (seriously??).
        // Environments and Minigame presets are set with a prefix "EI_" to differentiate them from other presets.

        let unavailibleFiles = [];

        minigameQueries.forEach((fileName) => {
            if (!fs.existsSync(`${brMinigamePath}/EI_${fileName}.bp`)) {
                unavailibleFiles.push({
                    destinationName: `EI_${fileName}.bp`,
                    sourceName: `${fileName}.bp`,
                    destinationPath: brMinigamePath,
                    sourcePath: `${pluginGamemodePath}/${fileName}`,
                });
            }
        });
        environmentQueries.forEach((fileName) => {
            if (!fs.existsSync(`${brEnvironmentPath}/EI_${fileName}_environment.bp`)) {
                unavailibleFiles.push({
                    destinationName: `EI_${fileName}_environment.bp`,
                    sourceName: `${fileName}_environment.bp`,
                    destinationPath: brEnvironmentPath,
                    sourcePath: `${pluginMapsPath}/${fileName}`,
                });
            }
        });
        compiledMapQueries.forEach((fileName) => {
            if (!fs.existsSync(`${brBuildCompiledPath}/${fileName}.brs`)) {
                unavailibleFiles.push({
                    destinationName: `${fileName}.brs`,
                    sourceName: `${fileName}.brs`,
                    destinationPath: brBuildCompiledPath,
                    sourcePath: `${pluginMapsPath}/${fileName}`,
                });
            }
        });
        sourceMapQueries.forEach((fileName) => {
            if (!fs.existsSync(`${brBuildSourcePath}/${fileName}_source.brs`)) {
                unavailibleFiles.push({
                    destinationName: `${fileName}_source.brs`,
                    sourceName: `${fileName}_source.brs`,
                    destinationPath: brBuildSourcePath,
                    sourcePath: `${pluginMapsPath}/${fileName}/source`,
                });
            }
        });
        return unavailibleFiles;
    }

    public static installUnavailiableFiles(files: { destinationName: string; sourceName: string; destinationPath: string; sourcePath: string }[]) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            Log.info(`Attempting to copy file: "${file.sourceName}" to "${file.destinationPath}"`);

            try {
                fs.mkdirSync(`${file.destinationPath}`, { recursive: true });
            } catch (err) {
                if (err == null) continue; // ??? For some reason this fs call tries to throw a null error, so we ignore it.
                throw new Error("Failed to make directory");
            }

            try {
                fs.copyFileSync(`${file.sourcePath}/${file.sourceName}`, `${file.destinationPath}/${file.destinationName}`);
            } catch (err) {
                if (err.code == "ENOENT") {
                    Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                    continue;
                }
                throw err;
            }
        }
    }

    public static getAvailibleMaps(): string[] {
        const brPresetPath = Runtime.omegga.presetPath;
        const brSavePath = Runtime.omegga.savePath;
        const brBuildCompiledPath = `${brSavePath}/Escape_Infection/Compiled`;
        const brMinigamePath = `${brPresetPath}/Minigame`;
        const brEnvironmentPath = `${brPresetPath}/Environment`;

        const compiledBuilds = fs.readdirSync(brBuildCompiledPath);
        let readyMaps = [];
        for (let i = 0; i < compiledBuilds.length; i++) {
            const mapName = compiledBuilds[i].replace(/\.[^/.]+$/, "");
            const environmentName = `EI_${mapName}_environment.bp`;
            const gamemodeName = `EI_${mapName.replace(/_.+/, "")}.bp`;

            if (!fs.existsSync(`${brMinigamePath}/${gamemodeName}`)) continue;
            if (!fs.existsSync(`${brEnvironmentPath}/${environmentName}`)) continue;
            // File has all nessesary files present and therefore can be listed as a map to pick from. yipee!
            readyMaps.push(mapName);
        }
        return readyMaps;
    }

    public static getEditableMaps(): string[] {
        const brPresetPath = Runtime.omegga.presetPath;
        const brSavePath = Runtime.omegga.savePath;
        const brBuildSourcePath = `${brSavePath}/Escape_Infection/Source`;
        const brEnvironmentPath = `${brPresetPath}/Environment`;

        const sourceBuilds = fs.readdirSync(brBuildSourcePath);
        let readyMaps = [];
        for (let i = 0; i < sourceBuilds.length; i++) {
            const mapName = sourceBuilds[i].replace(/_source\.[^/.]+$/, "");
            const environmentName = `EI_${mapName}_environment.bp`;

            if (!fs.existsSync(`${brEnvironmentPath}/${environmentName}`)) continue;
            readyMaps.push(mapName);
        }
        return readyMaps;
    }

    public static getGamemodes(): string[] {
        const pluginPath = `${path.dirname(path.dirname(__filename))}`;
        const pluginGamemodePath = `${pluginPath}/data/gamemodes`;
        return fs.readdirSync(pluginGamemodePath);
    }
}
