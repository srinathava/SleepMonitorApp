import React from "react";
import { StyleSheet, Text, Button, View, DeviceEventEmitter, AppState } from "react-native";
import Alarm from './Alarm';
import ScreenLock from './ScreenLock';

export default class AlarmManager  extends React.Component {

    constructor() {
        super();
        this.alarms = [];

        this.currentActiveAlarm = undefined;
        this.state = {txt: ''};

        this.internetConnectionAlarm = this.addAlarm('connection_alarm.mp3');
        this.motionAlarm = this.addAlarm('motion_alarm.mp3');
        this.oximeterConnectionAlarm = this.addAlarm('connection_alarm.mp3');
        this.oximeterAlarm = this.addAlarm('oximeter_alarm.mp3');

        this.keyListener = undefined;

        this.prevState = undefined;
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    addAlarm(mp3) {
        var alarm = new Alarm(mp3);
        this.alarms.push(alarm);
        alarm.mgr = this;
        return alarm;
    }

    handleAppStateChange(nextState) {
        if (nextState === "background") {
            console.log('app going into background');
            if (this.prevState == "active") {
                this.snooze();
            }
        }
        this.prevState = nextState;
    }

    snooze() {
        for (var alarm of this.alarms) {
            alarm.snooze();
        }
        // OXIMETER_ALARM: The oximeter connection alarm is special in that
        // once snoozed, it is suppressed, so that we only warn about an
        // oximeter disconnection once till it is re-enabled.
        this.oximeterConnectionAlarm.suppressed = true;

        this.setActiveAlarm();
    }

    componentDidMount() {
        this.props.bridge.addListener((data) => this.onData(data));
        AppState.addEventListener("change", this.handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    setActiveAlarm() {
        var nextActiveAlarm = undefined;
        for (var alarm of this.alarms) {
            if (alarm.mode === 'active') {
                console.log(`${alarm.name} is active!`);
                nextActiveAlarm = alarm;
            }
        }
        if (this.currentActiveAlarm !== nextActiveAlarm) {
            if (this.currentActiveAlarm !== undefined) {
                this.currentActiveAlarm.audio.stop();
            }
            this.currentActiveAlarm = nextActiveAlarm;
            if (this.currentActiveAlarm !== undefined) {
                this.currentActiveAlarm.audio.setNumberOfLoops(-1);
                this.currentActiveAlarm.audio.play();

                console.log('trying to keep screen awake');
                ScreenLock.acquireScreenLock();

                console.log('setting up key listener');
                this.keyListener = DeviceEventEmitter.addListener("onDispatchKeyEvent", () => {
                    this.snooze();
                });
            } else {
                console.log('letting screen go back to sleep');
                ScreenLock.releaseScreenLock();

                console.log('unsetting key listener');
                if (this.keyListener !== undefined) {
                    this.keyListener.remove();
                }
            }

            var txt = this.currentActiveAlarm !== undefined ? this.currentActiveAlarm.txt : '';
            this.setState({txt: txt});
        }
    }

    onData(data) {
        // console.log(`getting new data SPO2: ${data.SPO2}, BPM: ${data.BPM}, motion: ${data.motion}`);
        if (data.SPO2 == -2) {
            this.internetConnectionAlarm.trigger("Connection to Raspberry failed!");
        } else {
            this.internetConnectionAlarm.dismiss();

            this.refreshOximeterStats(data);

            if (data.motion == 1) {
                this.motionAlarm.trigger("Baby's moving! " + data.motionReason);
            }
        }

        this.setActiveAlarm();
    }

    refreshOximeterStats(data) {
        if (data.SPO2 == -1) {
            this.oximeterConnectionAlarm.trigger(data.oximeterStatus);
        } else {
            // OXIMETER_ALARM: got one good reading. Hence we need to alarm
            // about disconnection again. This way, we only play the
            // oximeter disconnected alarm once per disconnection and not
            // once every so many seconds.
            this.oximeterConnectionAlarm.suppressed = false;
            this.oximeterConnectionAlarm.dismiss();
        }

        if (data.alarm == 1) {
            this.oximeterAlarm.trigger("Oximeter Alarm!");
        } else {
            this.oximeterAlarm.dismiss();
        }
    }

    render() {
        if (this.state.txt === "") {
            return (
                <View style={styles.alarmManager}>
                    <Text>OK</Text>
                </View>
            );
        } else {
            return (
                <View style={styles.alarmManager}>
                    <Text style={{fontSize: 24 }}>{this.state.txt}</Text>
                    <View style={{padding: 5}}>
                        <Button title="Snooze" onPress={()=>this.snooze()} />
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    alarmManager : {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#888",
    },
});
