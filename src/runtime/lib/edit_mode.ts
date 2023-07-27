export class EditMode {
    private static enabled: boolean = false;

    public static setEnabled(status: boolean) {
        this.enabled = status;
    }

    public static isEnabled() {
        return this.enabled;
    }
}
