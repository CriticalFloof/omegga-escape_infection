import { MapRotator } from "../setup/map_rotator";

export class EditMode {
    private static enabled: boolean = false;

    public static setEnabled(status: boolean) {
        this.enabled = status;
        if (this.enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }

    public static isEnabled() {
        return this.enabled;
    }

    private static enable() {
        MapRotator.stop();
        //Disable the map rotator.
    }

    private static disable() {
        MapRotator.start();
        //Enable the map rotator.
    }
}
