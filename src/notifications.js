import { NativeModules, Platform, AppState } from 'react-native';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';

const { ServiceModule } = NativeModules;
let notificationInitialized = false;
let unsubscribeOnMessage = null;

export const initNotificationService = async () => {
  if (notificationInitialized) return () => {};
  
  // Initialize push notification system
  PushNotification.configure({
    onNotification: notification => {
      console.log('Notification tapped:', notification);
      // Stop ringtone when notification tapped
      if (Platform.OS === 'android' && notification?.userInteraction) {
        ServiceModule.stopRingtone();
      }
      notification.finish(PushNotification?.FetchResult?.NoData);
    },
    // Important: Request permissions through FCM instead
    requestPermissions: false,
  });

  // Handle notifications in foreground state
  unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('Foreground FCM message:', remoteMessage);
    
    // Start ringtone service for foreground notifications
    if (Platform.OS === 'android') {
      ServiceModule.startRingtone();
      
      // Show local notification
      PushNotification.localNotification({
        channelId: 'FIREBASE_RINGTONE_CHANNEL', // Must match Android channel ID
        title: remoteMessage.notification?.title,
        message: remoteMessage.notification?.body,
        playSound: false, // We handle sound via service
        vibrate: false, // We handle vibration via service
        ongoing:true
      });
    }
  });

  // Handle app state changes
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // App came to foreground - check for missed notifications
      PushNotification.getDeliveredNotifications(notifications => {
        if (notifications.length > 0) {
          ServiceModule.startRingtone();
        }
      });
    }
  };

  const appStateSubscription = AppState.addEventListener(
    'change',
    handleAppStateChange
  );

  notificationInitialized = true;

  // Return cleanup function
  return () => {
    if (unsubscribeOnMessage) unsubscribeOnMessage();
    appStateSubscription.remove();
  };
};

export const getFcmToken = async () => {
  return messaging().getToken();
};

// New function to handle background messages
export const setupBackgroundHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background FCM message:', remoteMessage);
    // Background handling is done natively in MyFirebaseMessagingService
  });
};