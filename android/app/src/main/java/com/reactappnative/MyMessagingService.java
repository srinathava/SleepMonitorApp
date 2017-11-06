package com.reactappnative;

import java.util.Map;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import android.os.PowerManager;
import android.os.PowerManager.WakeLock;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import com.reactappnative.MainActivity;

public class MyMessagingService extends FirebaseMessagingService {

    private static final String TAG = "SleepMonitorMessagingService";

    @Override
    public void onCreate() {
        Log.d(TAG, "messaging service started");
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "Remote message received");

        Intent startIntent = new Intent(getApplicationContext(), MainActivity.class);
        startIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT); // You need this if starting
        startIntent.setAction(Intent.ACTION_MAIN);
        startIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        startActivity(startIntent);
    }
}
