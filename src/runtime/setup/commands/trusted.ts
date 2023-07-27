import { EditMode } from "src/runtime/lib/edit_mode";
import { Command, TrustLevel } from "../../lib/commands";
import { PrettyChat } from "../../lib/prettytext";
import { VotingHandler } from "../../lib/voting";
import { MapRotator } from "../map_rotator";

new Command("force_vote", TrustLevel.Trusted, (speaker: string, voteNumberStr: string) => {
    if (VotingHandler.getVotingChoices().length === 0) {
        PrettyChat.whisper(speaker, `There is no ongoing vote.`);
        return;
    }
    if (!voteNumberStr) {
        VotingHandler.endVote().then(() => {
            PrettyChat.broadcast(`${speaker} forced the vote to end.`);
        });
    } else {
        const voteNumber = parseInt(voteNumberStr);
        if (!Number.isInteger(voteNumber)) {
            PrettyChat.whisper(speaker, `${voteNumber} is not a number.`);
            return;
        }
        VotingHandler.endVote(voteNumber)
            .then(() => {
                PrettyChat.broadcast(`${speaker} forced option ${voteNumber}.`);
            })
            .catch((err: Error) => {
                if (err.message === "out_of_range") {
                    PrettyChat.whisper(speaker, `Pick a number between 1 and ${VotingHandler.getVotingChoices().length}.`);
                    return;
                }
            });
    }
});

new Command("force_rtv", TrustLevel.Trusted, (speaker: string) => {
    if (!MapRotator.isEnabled()) {
        PrettyChat.whisper(speaker, `Map rotator is disabled`);
        return;
    }
    if (VotingHandler.getVotingChoices().length !== 0) {
        PrettyChat.whisper(speaker, `There is an ongoing vote.`);
        return;
    }
    PrettyChat.broadcast(`${speaker} forced rtv!`);
    MapRotator.initateMapChangeVote(false);
});
