package com.getnotify

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "ServiceModule"

    @ReactMethod
    fun startRingtone() {
        val currentContext = reactApplicationContext
        val intent = Intent(currentContext, RingtoneService::class.java)
         if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            currentContext.startForegroundService(intent)
        } else {
            currentContext.startService(intent)
        }
    }

    @ReactMethod
    fun stopRingtone() {
        val currentContext = reactApplicationContext
        val intent = Intent(currentContext, RingtoneService::class.java)
        currentContext.stopService(intent)
    }
}
