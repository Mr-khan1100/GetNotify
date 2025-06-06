package com.getnotify

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import android.util.Log

class MyFirebaseMessagingService : FirebaseMessagingService() {
    companion object {
        const val TAG = "MyFMService"
        const val CHANNEL_ID = "FIREBASE_RINGTONE_CHANNEL"
        const val NOTIF_ID = 999
        const val ACTION_STOP = "com.getnotify.STOP_RINGTONE"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "Service created")
    }


    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // 1) Extract title/body/sound from data payload
        val data = remoteMessage.data
        val title = data["title"] ?: "🔔 Alert"
        val body  = data["body"]  ?: "Tap to stop ringtone"
        val wakeScreen = data["wake_screen"] ?: "default"
        
        // 2) Start RingtoneService (looping custom_sound.mp3)
        val serviceIntent = Intent(this, RingtoneService::class.java).apply {
            putExtra("WAKE_SCREEN", wakeScreen)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent)
        } else {
            startService(serviceIntent)
        }

        // 3) Build & show a notification on channel "FIREBASE_RINGTONE_CHANNEL"
        val stopIntent = Intent(this, NotificationTapReceiver::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            this, 0, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.mipmap.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setOngoing(true)
            .setAutoCancel(false)
            .addAction(R.drawable.ic_stop, "Stop", stopPendingIntent)
            .build()

        val mgr = getSystemService(NotificationManager::class.java)!!
        mgr.notify(NOTIF_ID, notification)
    }


    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "FCM new token: $token")
        // (Optionally) send this new token to your server
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Ringtone Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel for Firebase-triggered ringtone service"
                setSound(null, null) // Disable default sound
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(true)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}