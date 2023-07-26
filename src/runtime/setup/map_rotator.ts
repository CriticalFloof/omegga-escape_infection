import { ILogMinigame } from "omegga";
import { Runtime } from "../core";
import { WorldEventListener } from "../lib/event_tracking";
import { MapLoader } from "../lib/map/loader";
import { PresetHandler } from "../lib/presets";
import { PrettyChat } from "../lib/prettytext";
import { VotingHandler } from "../lib/voting";
import { Log } from "src/lib/console/logging";

export class MapRotator {
    public static currentMap: string = "";
    public static mapSwitchTime: number = 0;
    public static mapStartTime: number = 0;

    private static rtv: {
        needed: number;
        current: string[];
        neededCallback: () => void;
    } = {
        needed: 0,
        current: [],
        neededCallback: () => {
            this.rtv.needed = Math.ceil(Runtime.omegga.players.length * 0.5);
        },
    };

    private static intervalId: NodeJS.Timer = null;
    private static timeoutId: NodeJS.Timeout = null;
    private static voteId: NodeJS.Timeout = null;
    private static currentMinigameRuleset: string = "";

    public static start() {
        this.stop();
        this.initateMapChangeVote(false);
        Runtime.omegga.on("join", this.rtv.neededCallback);
        Runtime.omegga.on("leave", this.rtv.neededCallback);
    }

    public static stop() {
        Runtime.omegga.off("join", this.rtv.neededCallback);
        Runtime.omegga.off("leave", this.rtv.neededCallback);

        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        clearTimeout(this.voteId);
        this.voteId = null;
        clearInterval(this.intervalId);
        this.intervalId = null;

        MapLoader.stop();
        this.currentMinigameRuleset = "";
        this.currentMap = "";
    }

    public static initateMapChangeVote(include_extend: boolean = true) {
        function recursiveVote(choices) {
            VotingHandler.initiateVote(choices, 15000)
                .then((winners) => {
                    // Nobody votes
                    if (winners.length === 0) {
                        PrettyChat.broadcast(`No maps were voted for. Choosing random...`);
                        MapRotator.switchMap(choices[Math.trunc(Math.random() * choices.length)]);
                        return;
                    }

                    // A clear winner was chosen
                    if (winners.length === 1) {
                        MapRotator.switchMap(winners[0]);
                        return;
                    }

                    // A tie occured, however there's only 2 choices, therefore we force a random pick.
                    if (winners.length > 1 && choices.length === 2) {
                        PrettyChat.broadcast(`${winners.length} maps tied! Choosing random...`);
                        MapRotator.switchMap(choices[Math.trunc(Math.random() * choices.length)]);
                        return;
                    }

                    // A tie occured, lets initiate another vote.
                    if (winners.length > 1) {
                        PrettyChat.broadcast(`${winners.length} maps tied!`);
                        recursiveVote(winners);
                        return;
                    }
                })
                .catch((err) => {
                    if (err.message == "vote_is_active") {
                        console.log("Failed to create vote.");
                    }
                });
        }

        WorldEventListener.off("minigame_round_change", this.roundChangeListenerFunction);

        this.rtv.current = [];

        let chosenMaps: string[] = [];

        let availibleMaps = PresetHandler.getAvailibleMaps();
        availibleMaps = availibleMaps.filter((mapName) => {
            return mapName !== this.currentMap;
        });
        const samples = Math.min(availibleMaps.length, 5);

        for (let i = 0; i < samples; i++) {
            const chosenIndex = Math.trunc(Math.random() * availibleMaps.length);
            chosenMaps.push(availibleMaps[chosenIndex]);
            availibleMaps = availibleMaps.filter((v, i) => {
                return i !== chosenIndex;
            });
        }

        if (include_extend == true) {
            chosenMaps.push("extend_map");
        }

        PrettyChat.broadcast(PrettyChat.announcement("Vote for the next map!"));
        recursiveVote(chosenMaps);
    }

    public static getRtv() {
        return this.rtv;
    }

    public static setRtv(val: { needed: number; current: string[]; neededCallback: () => void }) {
        this.rtv = val;
    }

    private static roundChangeListenerFunction(minigames: { [ruleset: string]: number }) {
        const minigameKeys = Object.keys(minigames);
        for (let i = 0; i < minigameKeys.length; i++) {
            const ruleset = minigameKeys[i];

            console.log("object", MapRotator.currentMinigameRuleset);
            console.log("emit", ruleset);

            if (MapRotator.currentMinigameRuleset === ruleset) {
                MapRotator.initateMapChangeVote();
            }
        }
    }

    private static activateMapTimer(time: number) {
        this.mapSwitchTime += time * 60000;

        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        clearInterval(this.intervalId);
        this.intervalId = null;

        //Set a timeout with a 0.01% margin of error, once it's done, start tracking when the time is up.
        //Once time is up, wait until the round is finished, then call the vote.
        this.timeoutId = setTimeout(() => {
            this.intervalId = setInterval(() => {
                if (Date.now() > this.mapSwitchTime) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;

                    WorldEventListener.on("minigame_round_change", this.roundChangeListenerFunction);
                }
            }, 1000);
            this.timeoutId = null;
        }, (this.mapSwitchTime - Date.now()) * 0.99);
    }

    private static switchMap(mapName: string) {
        if (mapName === "extend_map") {
            this.activateMapTimer(Runtime.config["Map Time Length"]);
            PrettyChat.broadcast(`Extending map time for another ${Runtime.config["Map Time Length"]} minutes.`);
            return;
        }

        PrettyChat.broadcast(`Switching map to: "${mapName}"`);
        MapLoader.startSafe(mapName).then((minigame) => {
            if (minigame == undefined || minigame.ruleset == undefined) {
                // If this ever happens, the map rotator is now broken.
                // A fix would be to get all minigames and somehow identify the correct one.
                // Or if that's not feasible, try setting up the gamemode again?
                this.currentMinigameRuleset = "";
                Log.warn("Map rotator couldn't retreive minigame data, and is now stuck. Restart the plugin when possible.");
                return;
            }
            this.currentMinigameRuleset = minigame.ruleset;
            console.log(this.currentMinigameRuleset);
        });

        this.currentMap = mapName;
        this.mapStartTime = Date.now();
        this.mapSwitchTime = Date.now();
        this.activateMapTimer(Runtime.config["Map Time Length"]);
    }
}
