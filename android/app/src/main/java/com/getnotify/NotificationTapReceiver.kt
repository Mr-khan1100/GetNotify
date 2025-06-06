package com.getnotify

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationTapReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == MyFirebaseMessagingService.ACTION_STOP) {
            Log.d("NotificationTapReceiver", "Stop action tapped")
          
            val stopIntent = Intent(context, RingtoneService::class.java)
            context.stopService(stopIntent)
       
            val mgr = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
            mgr.cancel(MyFirebaseMessagingService.NOTIF_ID)
        }
    }
}
