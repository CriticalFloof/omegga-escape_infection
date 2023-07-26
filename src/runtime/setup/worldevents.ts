import { Runtime } from "../core";
import { WorldEventSignal } from "../lib/event_tracking";

export class WorldEventBaseSignalsInitalizatior {
    public static run() {
        new WorldEventSignal("player_move", 5000, () => {
            return new Promise(async (resolve, reject) => {
                const positions = await Runtime.omegga.getAllPlayerPositions();
                let playersWhoMoved = {};
                let sortedPositions = {};
                let sortedPositionsKeys: string[] = [];
                for (let i = 0; i < positions.length; i++) {
                    sortedPositions[positions[i].player.name] = positions[i].pos;
                    sortedPositionsKeys.push(positions[i].player.name);
                }
                for (let i = 0; i < sortedPositionsKeys.length; i++) {
                    const name = sortedPositionsKeys[i];
                    if (
                        Runtime.liveStore.users[name].last_position[0] !== sortedPositions[name][0] ||
                        Runtime.liveStore.users[name].last_position[1] !== sortedPositions[name][1] ||
                        Runtime.liveStore.users[name].last_position[2] !== sortedPositions[name][2]
                    ) {
                        playersWhoMoved[name] = sortedPositions[name];
                    }
                    Runtime.liveStore.users[name].last_position = sortedPositions[name];
                }
                if (Object.keys(playersWhoMoved).length === 0) reject(null);

                resolve(playersWhoMoved);
            });
        }).start();

        new WorldEventSignal(
            "minigame_round_change",
            5000,
            (state: {
                previousMinigameRounds: {
                    [ruleset: string]: number;
                };
            }) => {
                return new Promise(async (resolve, reject) => {
                    if (state.previousMinigameRounds == undefined) state.previousMinigameRounds = {};
                    const currentRoundRegexp =
                        /^(?<index>\d+)\) BP_Ruleset_C (.+):PersistentLevel.(?<ruleset>BP_Ruleset_C_\d+)\.CurrentRound = (?<currentRound>\d+)$/;

                    const currentRoundMatches = await Runtime.omegga.watchLogChunk<RegExpMatchArray>(
                        "GetAll BP_Ruleset_C CurrentRound",
                        currentRoundRegexp,
                        {
                            first: "index",
                            timeoutDelay: 5000,
                            afterMatchDelay: 100,
                        }
                    );

                    let currentMinigameRounds = {};
                    let changedMinigames = {};
                    for (let i = 0; i < currentRoundMatches.length; i++) {
                        const currentRoundMatch = currentRoundMatches[i];
                        const ruleset = currentRoundMatch.groups["ruleset"];
                        const round = parseInt(currentRoundMatch.groups["currentRound"]);
                        currentMinigameRounds[ruleset] = round;

                        if (state.previousMinigameRounds[ruleset] != undefined && state.previousMinigameRounds[ruleset] < round) {
                            changedMinigames[ruleset] = round;
                        }
                    }
                    state.previousMinigameRounds = currentMinigameRounds;

                    if (Object.keys(changedMinigames).length === 0) reject(null);
                    resolve(changedMinigames);
                });
            }
        ).start();
    }
}
