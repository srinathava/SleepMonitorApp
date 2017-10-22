import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Zeroconf from "react-native-zeroconf";

const zeroconf = new Zeroconf();

export default class Status extends React.Component {
    constructor() {
        super();
        this.state = { spo2: 100, bpm: 100, alarm: 0 };
        this.timer = null;
        this.updateStatus = this.updateStatus.bind(this);
    }

    componentWillUnmount() {
        zeroconf.stop();

        this.timer.clearInterval();
        this.timer = null;

    }

    componentDidMount() {
        zeroconf.scan("http", "tcp", "local.");

        zeroconf.on("resolved", (service) => {
            console.log(`found new service "${service.name}" at ${service.addresses[0]}:${service.port}`);

            var uri = `http://${service.addresses[0]}:${service.port}`;
            this.timer = setInterval(() => this.updateStatus(uri), 2000);
        });
    }

    updateStatus(uri) {
        fetch(uri)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ spo2: responseJson.SPO2, bpm: responseJson.BPM });
            })
            .catch(() => {
                this.setState({spo2: -1, bpm: -1});
            });
    }

    render() {
        return (
            <View style={styles.status}>
                <Text style={[styles.statusTxt, { color: "green" }]}>BPM2: {this.state.bpm}</Text>
                <Text style={[styles.statusTxt, { color: "red" }]}>SPO2: {this.state.spo2}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    status: {
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#223"
    },
    statusTxt: {
        fontSize: 30,
        textAlign: "right",
    },
});
  
