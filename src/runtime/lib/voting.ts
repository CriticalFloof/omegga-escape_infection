import { Runtime } from "../core";
import { ColorsHex, PrettyChat } from "./prettytext";

export class VotingHandler {
    private static currentVotingChoices: string[] = [];
    private static votes: string[][] = [];

    private static endVotePromise: (value: string[] | PromiseLike<string[]>) => void = null;

    public static getVotingChoices(): string[] {
        return this.currentVotingChoices;
    }

    public static getVotes(): number[] {
        let results: number[] = [];
        for (let i = 0; i < this.votes.length; i++) {
            const category = this.votes[i];
            results[i] = category.length;
        }
        return results;
    }

    public static castVote(id: string, choice: number): Promise<void> {
        return new Promise((res, rej) => {
            if (VotingHandler.currentVotingChoices.length === 0) {
                let err = new Error("vote_not_active");
                rej(err);
            }

            if (choice >= VotingHandler.currentVotingChoices.length || choice < 0) {
                let err = new Error("out_of_range");
                rej(err);
            }

            for (let i = 0; i < VotingHandler.votes.length; i++) {
                VotingHandler.votes[i] = VotingHandler.votes[i].filter((val) => {
                    return val !== id;
                });
            }

            VotingHandler.votes[choice].push(id);

            res();
        });
    }

    public static async initiateVote(choices: string[], ms: number): Promise<string[]> {
        let votePromise: Promise<string[]> = new Promise(async (res, rej) => {
            this.endVotePromise = res;

            if (this.currentVotingChoices.length !== 0) {
                rej(new Error("vote_is_active"));
            }

            this.currentVotingChoices = choices;
            this.votes = Array.from({ length: choices.length }, (v) => {
                return [];
            });

            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i];
                PrettyChat.broadcast(`${PrettyChat.cmd("/Vote")} <color="${ColorsHex.green}">${i + 1}</> <color="${ColorsHex.black}">|</> ${choice}`);
            }

            setTimeout(() => {
                res(this.getVoteResults());
            }, ms);
        });

        return votePromise;
    }

    public static endVote(overrule?: number): Promise<void> {
        return new Promise(async (res, rej) => {
            if (overrule != null) {
                VotingHandler.votes = Array.from({ length: this.currentVotingChoices.length }, () => {
                    return [];
                });
                await VotingHandler.castVote(".", overrule - 1).catch((err) => {
                    rej(err);
                });
            }

            VotingHandler.endVotePromise(this.getVoteResults());
            VotingHandler.endVotePromise = null;

            res();
        });
    }

    private static getVoteResults(): string[] {
        let highestVote = 0;
        let winnersIndex: number[] = [];
        for (let i = 0; i < this.votes.length; i++) {
            const categoryVotes = this.votes[i].length;
            if (categoryVotes > highestVote) {
                winnersIndex = [i];
                highestVote = categoryVotes;
            } else if (categoryVotes === highestVote) {
                winnersIndex.push(i);
            }
        }

        let winners: string[] = [];
        for (let i = 0; i < winnersIndex.length; i++) {
            const index = winnersIndex[i];
            winners.push(this.currentVotingChoices[index]);
        }

        this.votes = [];
        this.currentVotingChoices = [];
        return highestVote !== 0 ? winners : [];
    }
}
