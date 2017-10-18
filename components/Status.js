import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class Status extends React.Component {
    constructor() {
        super();
        this.state = { spo2: 100, bpm: 100 };
        this.timer = null;
        this.updateStatus = this.updateStatus.bind(this);
    }

    updateStatus() {
        fetch('http://172.28.211.60:8080/status')
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ spo2: responseJson.SPO2, bpm: responseJson.BPM });
            })
            .catch(() => {
                this.setState({spo2: -1, bpm: -1});
            });
    }

    componentDidMount() {
        this.timer = setInterval(this.updateStatus, 2000);
    }

    componentWillUnmount() {
        this.timer.clearInterval();
        this.timer = null;
    }

    render() {
        return (
            <View style={styles.status}>
                <Text style={[styles.statusTxt, { color: "green" }]}>BPM: {this.state.bpm}</Text>
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
        backgroundColor: '#223'
    },
    statusTxt: {
        fontSize: 30,
        textAlign: "right",
    },
});
  