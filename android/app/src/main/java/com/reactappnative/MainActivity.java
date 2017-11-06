package com.reactappnative;

import com.facebook.react.ReactActivity;

import android.util.Log;
import android.os.Bundle;
import android.view.WindowManager;

import android.support.annotation.NonNull;
import android.view.KeyEvent;

public class MainActivity extends ReactActivity {

    private static final String TAG = "SleepMonitorMain";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "onCreate");

        getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | 
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | 
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
                WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
                );

        super.onCreate(savedInstanceState);
        
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ReactAppNative";
    }

    @Override
    public boolean dispatchKeyEvent(@NonNull KeyEvent event) {
        MyMessagingModule.getInstance().onDispatchKeyEvent(event.getKeyCode());
        return true;
    }
}
