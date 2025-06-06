package com.getnotify

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.Handler
import android.os.Looper
import androidx.core.app.NotificationCompat
import android.util.Log
import android.content.res.AssetFileDescriptor

class RingtoneService : Service() {
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private val CHANNEL_ID = "FIREBASE_RINGTONE_CHANNEL"
    private val NOTIFICATION_ID = 101
    
    // Audio focus handling
    private val audioManager: AudioManager by lazy {
        getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }
    private var originalVolume = 0

    override fun onCreate() {
        super.onCreate()
        Log.d("RingtoneService", "Service created")
        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("RingtoneService", "Service starting command received")

        val title = intent?.getStringExtra("title") ?: "🔔 Alert"
        val body  = intent?.getStringExtra("body") ?: "New notification"

        // 2) Build the ongoing notification once, then call startForeground()
        val notification = createNotification(title, body)
        startForeground(NOTIFICATION_ID, notification)
        // Handle potential restart after being killed
        if (mediaPlayer?.isPlaying == true) {
            Log.d("RingtoneService", "Service already running")
            return START_STICKY
        }

        // Increase volume to max
        originalVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM)
        audioManager.setStreamVolume(
            AudioManager.STREAM_ALARM,
            audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM),
            0
        )

        try {
            // Initialize media player with proper audio attributes
            val afd: AssetFileDescriptor = resources.openRawResourceFd(R.raw.notification_tone)
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                prepare()
                isLooping = true
                start()
                
                setOnErrorListener { _, what, extra ->
                    Log.e("RingtoneService", "MediaPlayer error: $what, $extra")
                    stopSelf()
                    true
                }
            }
            Log.d("RingtoneService", "MediaPlayer started looping")
        } catch (e: Exception) {
            Log.e("RingtoneService", "MediaPlayer initialization failed", e)
            stopSelf()
            return START_NOT_STICKY
        }

        // Start vibration pattern
        startVibration()

        return START_STICKY
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or
            PowerManager.ACQUIRE_CAUSES_WAKEUP or
            PowerManager.ON_AFTER_RELEASE,
            "getnotify::RingtoneWakeLock"
        )
        wakeLock?.acquire(10 * 60 * 1000L /*10 minutes*/)
        Log.d("RingtoneService", "Wake lock acquired")
    }

    private fun startVibration() {
        try {
            vibrator = getSystemService(Vibrator::class.java)
            val pattern = longArrayOf(0, 1000, 1000) // Wait 0, vibrate 1000ms, pause 1000ms
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(
                    VibrationEffect.createWaveform(pattern, 0),
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
            } else {
                vibrator?.vibrate(pattern, 0)
            }
        } catch (e: Exception) {
            Log.e("RingtoneService", "Vibration failed", e)
        }
    }

    private fun createNotification(title: String, body: String): Notification {
        // Intent to open app when notification is tapped
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val contentIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        // Stop action intent
        val stopIntent = Intent(this, NotificationTapReceiver::class.java).apply {
            action = MyFirebaseMessagingService.ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getBroadcast(
            this,
            0,
            stopIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.mipmap.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(contentIntent)
            .addAction(
                R.drawable.ic_stop, 
                "Stop",
                stopPendingIntent
            )
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(contentIntent, true)
            .build()
    }

    override fun onDestroy() {
        Log.d("RingtoneService", "Service stopping")
        
        // Clean up media player
        mediaPlayer?.let {
            try {
                if (it.isPlaying) it.stop()
                it.release()
            } catch (e: Exception) {
                Log.e("RingtoneService", "MediaPlayer release error", e)
            }
        }
        mediaPlayer = null
        
        // Stop vibration
        vibrator?.cancel()
        
        // Release wake lock
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
                Log.d("RingtoneService", "Wake lock released")
            }
        }
        wakeLock = null
        
        // Restore original volume
        audioManager.setStreamVolume(
            AudioManager.STREAM_ALARM,
            originalVolume,
            0
        )
        
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Ringtone Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Channel for playing looping ringtone"
                setSound(null, null)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                enableVibration(false)
            }
            
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}