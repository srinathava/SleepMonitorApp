package com.reactappnative;

import android.util.Log;
import android.content.Context;

import android.content.Intent;
import android.os.PowerManager;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;


import java.util.Map;
import java.util.HashMap; 

import com.reactappnative.MyMessagingService;

public class MyMessagingModule extends ReactContextBaseJavaModule {

    public MyMessagingModule(ReactApplicationContext reactContext) {
        super(reactContext);

        PowerManager pm = (PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
        sWakeLock = pm.newWakeLock(
                PowerManager.SCREEN_DIM_WAKE_LOCK | 
                PowerManager.ACQUIRE_CAUSES_WAKEUP |
                PowerManager.ON_AFTER_RELEASE, 
                "SleepMonitorScreenWakeLock");

        fReactContext = reactContext;
        sInstance = this;
    }

    @Override
    public String getName() {
        return "MyMessagingService";
    }

    @ReactMethod
    public void acquireScreenLock() {
        Log.d(TAG, "acquiring screen lock");
        if (!sWakeLock.isHeld()) {
            sWakeLock.acquire();
        }
    }

    @ReactMethod
    public void releaseScreenLock() {
        Log.d(TAG, "releasing screen lock");
        if (sWakeLock.isHeld()) {
            sWakeLock.release();
        }
    }

    public static MyMessagingModule getInstance() {
        return sInstance;
    }

    public void onDispatchKeyEvent(int keyCode) {
        if (fJSModule == null) {
            fJSModule = fReactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        }
        fJSModule.emit("onDispatchKeyEvent", keyCode);
    }

    private static final String TAG = "MyMessagingService";

    private static MyMessagingModule sInstance = null;

    private PowerManager.WakeLock sWakeLock = null;

    private ReactApplicationContext fReactContext = null;

    private DeviceEventManagerModule.RCTDeviceEventEmitter fJSModule = null;

}

