import React from "react";
import { StyleSheet, Text, View, WebView, AppState } from "react-native";
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
    }

    componentWillUnmount() {
        console.log("unmounting main page");
    }

    componentDidMount() {
        // iOS: show permission prompt for the first call. later just check
        // permission in user settings
        // Android: check permission in user settings
        FCM.requestPermissions()
        .then(()=> {
            console.log('granted')
        })
        .catch(()=>{
            console.log('notification permission rejected')
        });

        FCM.getFCMToken().then(token => {
            console.log(token);
            // store fcm token in your server
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }}>
                    <WebView
                        source={{ uri: `${this.props.uri}/minimal.html` }}
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
        this.state = { serverUri: 'http://192.168.1.18' };
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
