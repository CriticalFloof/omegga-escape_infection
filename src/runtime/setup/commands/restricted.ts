import { Command, TrustLevel } from "../../lib/commands";
import { PrettyChat } from "../../lib/prettytext";
import { VotingHandler } from "../../lib/voting";
import { MapRotator } from "../map_rotator";

const yesAliases = ["yes", "y"];
for (let i = 0; i < yesAliases.length; i++) {
    const yesName = yesAliases[i];
    new Command(yesName, TrustLevel.Restricted, (speaker: string) => {
        if (!Command.hasPendingDefer(speaker)) {
            PrettyChat.whisper(speaker, "You don't have any commands to respond to.");
            return;
        }
        Command.resolveDefer(speaker);
    });
}

const noAliases = ["no", "n"];
for (let i = 0; i < noAliases.length; i++) {
    const noName = noAliases[i];
    new Command(noName, TrustLevel.Restricted, (speaker: string) => {
        if (!Command.hasPendingDefer(speaker)) {
            PrettyChat.whisper(speaker, "You don't have any commands to respond to.");
            return;
        }
        Command.rejectDefer(speaker);
    });
}

new Command("respond", TrustLevel.Restricted, (speaker: string, ...responce: string[]) => {
    if (!Command.hasPendingDefer(speaker)) {
        PrettyChat.whisper(speaker, "You don't have any commands to respond to.");
        return;
    }
    Command.resolveDefer(speaker, responce);
});

new Command("map_time", TrustLevel.Restricted, (speaker: string) => {
    let timeLeft = new Date(MapRotator.mapSwitchTime - Date.now());
    if (timeLeft.getTime() > 86400000) {
        // One day in miliseconds
        PrettyChat.whisper(`The map is NOT switching anytime soon buddy.`);
        return;
    }
    if (timeLeft.getTime() > 3600000) {
        // One hour in miliseconds
        PrettyChat.whisper(speaker, `The map will switch in ${timeLeft.getHours()}:${timeLeft.getMinutes()}:${timeLeft.getSeconds()} seconds`);
        return;
    }
    if (timeLeft.getTime() > 60000) {
        // One minute in miliseconds
        PrettyChat.whisper(speaker, `The map will switch in ${timeLeft.getMinutes()}:${timeLeft.getSeconds()} seconds`);
        return;
    }
    if (timeLeft.getTime() > 1000) {
        // You get the idea.
        PrettyChat.whisper(speaker, `The map will switch in ${timeLeft.getSeconds()} seconds.`);
        return;
    }
    PrettyChat.whisper(speaker, `The map will switch any moment now.`);
});

new Command("vote", TrustLevel.Restricted, (speaker: string, voteNumberStr: string) => {
    if (VotingHandler.getVotingChoices().length === 0) {
        PrettyChat.whisper(speaker, `There is no ongoing vote.`);
        return;
    }
    if (!voteNumberStr) {
        PrettyChat.whisper(speaker, `Please provide a number.`);
        return;
    }
    const voteNumber = parseInt(voteNumberStr);
    if (!Number.isInteger(voteNumber)) {
        PrettyChat.whisper(speaker, `${voteNumber} is not a number.`);
        return;
    }
    VotingHandler.castVote(speaker, voteNumber - 1)
        .then(() => {
            PrettyChat.whisper(speaker, `You voted for ${voteNumber}.`);
        })
        .catch((err: Error) => {
            if (err.message === "out_of_range") {
                PrettyChat.whisper(speaker, `Pick a number between 1 and ${VotingHandler.getVotingChoices().length}.`);
                return;
            }
        });
});

new Command("rtv", TrustLevel.Restricted, (speaker: string) => {
    if (!MapRotator.isEnabled()) {
        PrettyChat.whisper(speaker, `Map rotator is disabled`);
        return;
    }
    if (VotingHandler.getVotingChoices().length !== 0) {
        PrettyChat.whisper(speaker, `There is an ongoing vote.`);
        return;
    }
    let rtv = MapRotator.getRtv();
    if (rtv.current.includes(speaker)) {
        PrettyChat.whisper(speaker, `You already used rtv.`);
        return;
    }
    rtv.current.push(speaker);
    const votesNeeded = rtv.needed - rtv.current.length;
    if (votesNeeded > 0) {
        PrettyChat.broadcast(`${speaker} wants to rock the vote! ${votesNeeded} more votes needed!`);
        return;
    } else {
        PrettyChat.broadcast(`${speaker} wants to rock the vote!`);
    }
    MapRotator.initateMapChangeVote(false);
});
