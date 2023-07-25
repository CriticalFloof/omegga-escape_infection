import { OmeggaPlayer } from "omegga"
import { UserHandler } from "../lib/users"
import { Runtime } from "../core"
import { Log } from "src/lib/console/logging"

export class UserInitalizatior { 

    public static run(){
        // Going to move this to another file related to user initalization.
        Runtime.omegga.on("join", (player: OmeggaPlayer)=> {
            let loopID = setInterval(()=>{
                try {
                    UserHandler.readyUser(player.name)
                    clearInterval(loopID)
                } catch (error) {
                    Log.verb(`Player '${player.name}' hasn't loaded in yet...`)
                }
            },1000)
        })

        setImmediate(()=>{
            for (let i = 0; i < Runtime.omegga.players.length; i++) {
                UserHandler.readyUser(Runtime.omegga.players[i].name)
            }
        })
    }
}