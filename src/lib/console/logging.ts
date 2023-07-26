import { Runtime } from "src/runtime/core";

export class Log {
    public static info(message?, ...optionalParams) {
        console.info(message, ...optionalParams);
    }

    public static warn(message?, ...optionalParams) {
        console.warn(message, ...optionalParams);
    }

    public static verb(message?, ...optionalParams) {
        if (!Runtime.config["Verbose Logging"]) return;
        console.log(message, ...optionalParams);
    }
}
