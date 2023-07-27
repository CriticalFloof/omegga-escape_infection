export class CommandInitalizatior {
    public static run() {
        require("./restricted");
        require("./default");
        require("./trusted");
        require("./developer");
    }
}
