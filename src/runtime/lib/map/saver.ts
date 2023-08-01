import { copyFileSync, mkdirSync } from "fs";
import { WriteSaveObject } from "omegga";
import path from "path";
import { Log } from "src/lib/console/logging";
import { Runtime } from "src/runtime/core";

export class MapSaver {
    public static async create(map_name: string) {
        const pluginPath = `${path.dirname(path.dirname(__filename))}`;

        try {
            mkdirSync(`${pluginPath}/data/maps/${map_name}/source`, { recursive: true });
        } catch (err) {
            if (err == null) return; // ??? For some reason this fs call tries to throw a null error, so we ignore it.
            throw new Error("Failed to make directory");
        }

        const saveInfo = await Runtime.omegga.getSaveData();
        if (saveInfo != undefined) {
            this.save(map_name);
            return;
        }

        const mapSavePath = `${Runtime.omegga.savePath}/Escape_Infection/Source/${map_name}_source`;
        try {
            copyFileSync(`${pluginPath}/data/placeholder/placeholder.brs`, `${mapSavePath}.brs`);
            copyFileSync(`${pluginPath}/data/placeholder/placeholder.brs`, `${pluginPath}/data/maps/${map_name}/source/${map_name}_source.brs`);
        } catch (err) {
            if (err.code == "ENOENT") {
                Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                return;
            }
            throw err;
        }

        const environmentName = `EI_${map_name}_environment`;
        Runtime.omegga.saveEnvironment(environmentName);
        const environmentFullName = `${Runtime.omegga.presetPath}/Environment/${environmentName}`;
        try {
            copyFileSync(`${environmentFullName}.bp`, `${pluginPath}/data/maps/${map_name}/${map_name}_environment.bp`);
        } catch (err) {
            if (err.code == "ENOENT") {
                Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                return;
            }
            throw err;
        }
    }

    public static save(map_name: string) {
        const pluginPath = `${path.dirname(path.dirname(__filename))}`;

        try {
            mkdirSync(`${pluginPath}/data/maps/${map_name}/source`, { recursive: true });
        } catch (err) {
            if (err == null) return; // ??? For some reason this fs call tries to throw a null error, so we ignore it.
            throw new Error("Failed to make directory");
        }

        const mapSaveName = `Escape_Infection/Source/${map_name}_source`;
        Runtime.omegga.saveBricks(mapSaveName);
        const mapSaveFullName = `${Runtime.omegga.savePath}/${mapSaveName}`;
        try {
            copyFileSync(`${mapSaveFullName}.brs`, `${pluginPath}/data/maps/${map_name}/source/${map_name}_source.brs`);
        } catch (err) {
            if (err.code == "ENOENT") {
                Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                return;
            }
            throw err;
        }

        const environmentName = `EI_${map_name}_environment`;
        Runtime.omegga.saveEnvironment(environmentName);
        const environmentFullName = `${Runtime.omegga.presetPath}/Environment/${environmentName}`;
        try {
            copyFileSync(`${environmentFullName}.bp`, `${pluginPath}/data/maps/${map_name}/${map_name}_environment.bp`);
        } catch (err) {
            if (err.code == "ENOENT") {
                Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                return;
            }
            throw err;
        }
    }

    public static compile(map_name: string) {
        const pluginPath = `${path.dirname(path.dirname(__filename))}`;

        const mapSaveSourcePath = `Escape_Infection/Source/${map_name}_source`;
        let sourceBrickadiaSaveData: WriteSaveObject;

        sourceBrickadiaSaveData = Runtime.omegga.readSaveData(mapSaveSourcePath);

        //Turn source into compiled
        let compiledBrickadiaSaveData = sourceBrickadiaSaveData;
        //

        const mapSaveName = `Escape_Infection/Compiled/${map_name}`;

        Runtime.omegga.writeSaveData(mapSaveName, compiledBrickadiaSaveData);

        Runtime.omegga.saveBricks(mapSaveName);
        const mapSaveFullName = `${Runtime.omegga.savePath}/${mapSaveName}`;
        try {
            copyFileSync(`${mapSaveFullName}.brs`, `${pluginPath}/data/maps/${map_name}/${map_name}.brs`);
        } catch (err) {
            if (err.code == "ENOENT") {
                Log.warn(`Failed to copy file to brickadia, File doesn't exist at path:'${err.path}'`);
                return;
            }
            throw err;
        }
    }

    public static build(map_name: string) {
        this.save(map_name);
        this.compile(map_name);
    }
}
