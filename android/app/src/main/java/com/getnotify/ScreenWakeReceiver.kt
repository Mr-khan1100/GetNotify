package com.getnotify

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

class ScreenWakeReceiver : BroadcastReceiver() {
    private var wakeLock: PowerManager.WakeLock? = null
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_SCREEN_OFF -> {
                Log.d("ScreenWake", "Screen turned off")
                acquireWakeLock(context)
            }
            Intent.ACTION_BOOT_COMPLETED -> {
                Log.d("ScreenWake", "Device booted")
                // Initialize any necessary services
            }
        }
    }
    
    private fun acquireWakeLock(context: Context) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or
            PowerManager.ACQUIRE_CAUSES_WAKEUP or
            PowerManager.ON_AFTER_RELEASE,
            "getnotify::ScreenWakeLock"
        )
        wakeLock?.acquire(10 * 60 * 1000L /*10 minutes*/)
        Log.d("ScreenWake", "Wake lock acquired")
    }
    
    fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
                Log.d("ScreenWake", "Wake lock released")
            }
        }
        wakeLock = null
    }
}