package com.getnotify

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle

class MyFirebaseMessageReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.google.android.c2dm.intent.RECEIVE") {
            val data: Bundle? = intent.extras
            val serviceIntent = Intent(context, RingtoneService::class.java).apply {
                // Extract data from FCM payload
                data?.let {
                    putExtra("title", it.getString("title"))
                    putExtra("body", it.getString("body"))
                    putExtra("wake_screen", it.getString("wake_screen"))
                }
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}