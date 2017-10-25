import React from "react";
import { StyleSheet, Text, Button, View, WebView, AppState } from "react-native";
import Status from './components/Status';
import Sound from 'react-native-sound';

import Zeroconf from "react-native-zeroconf";

const zeroconf = new Zeroconf();

class WaitForServer extends React.Component {
    constructor() {
        super();
    }

    componentWillUnmount() {
        zeroconf.stop();
    }

    componentDidMount() {
        zeroconf.scan("http", "tcp", "local.");
        zeroconf.on('start', () => {
            console.log('starting zeroconf scan');
        });

        zeroconf.on('error', () => {
            console.log('error during zeroconf scan');
        });

        zeroconf.on("resolved", (service) => {
            console.log(`found service with name ${service.name}`);
            if (service.name === "Raspberry Pi Sleep Monitor") {
                var uri = `http://${service.addresses[0]}:${service.port}`;
                this.props.found(uri);
            }
        });
    }

    render() {
        return (<Text>Waiting for server...</Text>);
    }
}

class AlarmManager extends React.Component {

    render() {
        return (
            <View style={styles.alarmManager}>
                <Text style={{fontSize: 24 }}>Baby's moving</Text>
                <View style={{padding: 5}}>
                    <Button title="Dismiss" onPress={()=>{}} />
                </View>
            </View>
        );
    }
}

class MainPage extends React.Component {

    constructor() {
        super();
    }

    _handleAppStateChange = (nextState) => {
        console.log(`current state = ${AppState.currentState}, nextState = ${nextState}`);
    }

    componentWillUnmount() {
        console.log("unmounting main page");
        AppState.removeEventListener("change", this._handleAppStateChange);
    }

    componentDidMount() {
        AppState.addEventListener("change", this._handleAppStateChange);
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    <WebView
                        source={{ uri: `${this.props.uri}/minimal.html` }}
                        style={{ flex: 1 }}
                    />
                    <Status uri = {this.props.uri} />
                    <AlarmManager />
                </View>
            </View>
        );
    }
}

export default class App extends React.Component {
    constructor() {
        super();
        this.state = { serverUri: 'http://192.168.1.13' };
    }

    render() {
        if (this.state.serverUri === '') {
            return (<WaitForServer found={(uri) => this.setState({ serverUri: uri })} />);
        } else {
            return (<MainPage uri={this.state.serverUri} />);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    alarmManager : {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#888",
    },
});
