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

        this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidMount() {
        this.timer = setInterval(() => {
            this.updateStatus(`${this.props.uri}/status`);
        }, 2000);
    }

    componentWillUnmount() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateStatus(uri) {
        fetch(uri)
            .then((response) => response.json())
            .then((json) => {
                this.setState(json);
            })
            .catch(() => {
                this.setState({SPO2: -1, BPM: -1});
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
  
