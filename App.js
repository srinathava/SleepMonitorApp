import React from "react";
import { StyleSheet, Text, View, WebView } from "react-native";
import Status from './components/Status';
import AlarmManager from './AlarmManager';

import Zeroconf from "react-native-zeroconf";

import FCM from 'react-native-fcm';

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

class Bridge {
    constructor() {
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notify(data) {
        for (var listener of this.listeners) {
            listener(data);
        }
    }
}

class MainPage extends React.Component {

    constructor() {
        super();

        this.bridge = new Bridge();
        this.bridge.addListener((status) => this.onStatus(status));

        this.state = {'cacheBust': Date.now()};
        this.prevReading = undefined;
    }

    componentWillUnmount() {
        console.log("unmounting main page");
    }

    onStatus(status) {
        if (this.prevReading === -2 && status.SPO2 !== -2) {
            this.setState({'cacheBust': Date.now()});
        }
        this.prevReading = status.SPO2;
    }

    sendTokenToServer(token) {
        var baseUri = this.props.uri.replace(/:\d+$/, '');
        var uri = baseUri + ":4000/registerToken";
        console.log(`Sending token ${token} to ${uri}`);

        fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: token
            })
        }).catch((err) => {
            console.log('Error sending token to server', err);
        });
    }

    componentDidMount() {
        // iOS: show permission prompt for the first call. later just check
        // permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions()
            .then(()=> {
                console.log('granted');
            })
            .catch(()=>{
                console.log('notification permission rejected');
            });

        FCM.getFCMToken().then(token => this.sendTokenToServer(token));
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    <WebView
                        source={{ uri: `${this.props.uri}/minimal.html?cacheBust=${this.state.cacheBust}` }}
                        style={{ flex: 1 }}
                    />
                    <Status uri = {this.props.uri} bridge={this.bridge} />
                    <AlarmManager bridge={this.bridge} />
                </View>
            </View>
        );
    }
}

export default class App extends React.Component {
    constructor() {
        super();
        // this.state = { serverUri: 'http://192.168.1.18' };
        this.state = { serverUri: '' };
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
