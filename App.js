import React from "react";
import { StyleSheet, View, WebView } from "react-native";
import Status from './components/Status';
import { Constants } from 'expo';

export default class App extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1, top: Constants.statusBarHeight }}>
                    <WebView
                        source={{ uri: 'http://savadhan-deb8-64.dhcp.mathworks.com/tmp/test.html' }}
                        style={{ flex: 1 }}
                    />
                    <Status />
                </View>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
});
