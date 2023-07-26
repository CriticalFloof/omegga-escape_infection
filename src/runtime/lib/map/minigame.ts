import { ILogMinigame } from "omegga";
import { Runtime } from "../../core";

export class Gamemode {
    public static async startSafe(game_type: string): Promise<ILogMinigame> {
        await this.stop();

        return this.start(game_type);
    }

    public static async start(game_type: string): Promise<ILogMinigame> {
        Runtime.omegga.loadMinigame(`EI_${game_type}`);
        await new Promise((r) => setTimeout(r, 200));
        let minigames = await Runtime.omegga.getMinigames();
        return minigames[minigames.length - 1];
    }

    public static async stop() {
        // Got to update this to only delete relevant minigames, not just all minigames.
        let minigames = await Runtime.omegga.getMinigames();
        for (let i = 0; i < minigames.length; i++) {
            const minigame = minigames[i];
            if (minigame.index === -1) continue;
            Runtime.omegga.deleteMinigame(minigame.index);
        }
    }
}
