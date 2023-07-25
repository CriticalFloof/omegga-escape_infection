import { Runtime } from "../core"
import { WorldEventSignal } from "../lib/event_tracking"

export class WorldEventBaseSignalsInitalizatior { 

    public static run() {
        new WorldEventSignal("player_moved", 5000, async ()=>{
            const positions = await Runtime.omegga.getAllPlayerPositions()
            let playersWhoMoved = {}
            let sortedPositions = {}
            let sortedPositionsKeys : string[] = []
            for (let i = 0; i < positions.length; i++) {
                sortedPositions[positions[i].player.name] = positions[i].pos
                sortedPositionsKeys.push(positions[i].player.name)
            }
            for (let i = 0; i < sortedPositionsKeys.length; i++) {
                const name = sortedPositionsKeys[i];
                if(
                    Runtime.liveStore.users[name].last_position[0] !== sortedPositions[name][0] ||
                    Runtime.liveStore.users[name].last_position[1] !== sortedPositions[name][1] ||
                    Runtime.liveStore.users[name].last_position[2] !== sortedPositions[name][2]
                ){
                    playersWhoMoved[name] = sortedPositions[name]
                }
                Runtime.liveStore.users[name].last_position = sortedPositions[name]
            }
            if(Object.keys(playersWhoMoved).length === 0) return null;
            
            return playersWhoMoved
        }).start()

        
    }
}

