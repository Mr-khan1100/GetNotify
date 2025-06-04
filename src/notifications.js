//notification.js
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

// Configure push notification
PushNotification.configure({
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    // Handle notification click
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

// Create notification channel (Android)
PushNotification.createChannel(
  {
    channelId: 'fcm_default_channel',
    channelName: 'Default Channel',
    channelDescription: 'A channel for notifications',
    soundName: 'default',
    importance: 4, // IMPORTANCE_HIGH
    vibrate: true,
  },
  created => console.log(`Channel created: ${created}`)
);

// Firebase message handlers
messaging().onMessage(remoteMessage => {
  console.log('Foreground FCM:', remoteMessage);
  
  PushNotification.localNotification({
    channelId: 'fcm_default_channel',
    title: remoteMessage.notification?.title,
    message: remoteMessage.notification?.body,
    userInfo: remoteMessage.data,
  });
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background FCM:', remoteMessage);
  // Show a local notification using the push-notification library
  PushNotification.localNotification({
    channelId: 'fcm_default_channel',
    title: remoteMessage.data?.title ?? remoteMessage.notification?.title,
    message: remoteMessage.data?.body ?? remoteMessage.notification?.body,
    userInfo: remoteMessage.data,
  });
});

// Get FCM token
export const getFcmToken = async () => {
  return await messaging().getToken();
};

// Request permissions
export const requestNotificationPermission = async () => {
    console.log('here')
  const authStatus = await messaging().requestPermission();
  console.log(authStatus, 'AUTHSTATUS')
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED || 
         authStatus === messaging.AuthorizationStatus.PROVISIONAL;
};