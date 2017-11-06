import Sound from 'react-native-sound';

export default class Alarm {

    constructor(mp3) {
        this.name = mp3;
        this.mode = 'inactive';
        this.snoozeTime = 0;

        this.suppressed = false;
        this.mgr = undefined;

        this.txt = "";

        this.audio = new Sound(mp3, Sound.MAIN_BUNDLE);
    }

    snooze() {
        if (this.mode != 'active') {
            return;
        }

        this.mode = 'snoozed';
        this.snoozeTime = Date.now();
    }

    trigger(txt) {
        if (this.suppressed || this.mode === 'active') {
            return;
        }

        if (Date.now() - this.snoozeTime < 60*1000) {
            return;
        }

        this.mode = 'active';
        this.txt = txt;
    }

    dismiss() {
        this.snoozeTime = 0;
        this.mode = 'inactive';
    }
}
