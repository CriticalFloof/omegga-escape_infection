import { Runtime } from "../core";

export class Gamemode { 

    public static async startSafe(game_type: string) {
        await this.stop()
        setImmediate(()=>{
            this.start(game_type)
        })
    }

    public static start(game_type: string) {
        Runtime.omegga.loadMinigame(`EI_${game_type}`)
    }

    public static async stop() {
        let minigames = await Runtime.omegga.getMinigames()
        for (let i = 0; i < minigames.length; i++) {
            const minigame = minigames[i];
            if(minigame.index === -1) continue;
            Runtime.omegga.deleteMinigame(minigame.index)
        }
    }
}