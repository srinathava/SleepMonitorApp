import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default class Status extends React.Component {
    constructor() {
        super();

        this.state = { 
            SPO2: 100, 
            BPM: 100, 
            motion: 0, 
            alarm: 0, 
            oximeterStatus: "",
            motionReason: "",
            readTime: ""
        };

        this.timer = null;
        this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidMount() {
        this.startTimer();
    }

    startTimer() {
        if (this.timer !== null) {
            return;
        }
        console.log('Starting status timer');
        this.timer = setInterval(() => {
            this.updateStatus(`${this.props.uri}/status`);
        }, 2000);
    }

    stopTimer() {
        if (this.timer !== null) {
            console.log('Stopping status timer');
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    componentWillUnmount() {
        this.stopTimer();
    }

    setStateAndNotify(partialState) {
        var nextState = Object.assign(this.state, partialState);
        this.props.bridge.notify(nextState);
        this.setState(partialState);
    }

    updateStatus(uri) {
        fetch(uri)
            .then((response) => response.json())
            .then((json) => {
                this.setStateAndNotify(json);
            })
            .catch((err) => {
                console.log("Error updating status", err);
                this.setStateAndNotify({SPO2: -2, BPM: -2});
            });
    }

    render() {
        return (
            <View style={styles.status}>
                <Text style={[styles.statusTxt, { color: "green" }]}>{this.state.BPM} <Text style={{fontSize: 16}}>(BPM)</Text></Text>
                <Text style={[styles.statusTxt, { color: "red" }]}>{this.state.SPO2} <Text style={{fontSize: 16}}>(SPO2)</Text></Text>
                <Text style={[styles.statusTxt, { color: "white", fontSize: 16 }]}>{this.state.readTime}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    status: {
        position: "absolute",
        top: 0,
        right: 0,
        minWidth: 200,
        backgroundColor: "#223"
    },
    statusTxt: {
        fontSize: 30,
        textAlign: "right",
    },
});
  
