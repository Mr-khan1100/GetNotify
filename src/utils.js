
//utils.js
import { PermissionsAndroid, Platform } from "react-native";

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Check if the user has already seen the request during this session
      //const hasAskedBefore = await AsyncStorage.getItem('hasAskedNotificationPermission');

      // if (hasAskedBefore === 'true') {
      //   console.log('User has already been asked for notification permission.');
      //   return;
      // }
      if (Platform.Version >= 33) {
      
      const permissionGranted = await PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS');
      
      if (!permissionGranted) {
        try {
          const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (permission === PermissionsAndroid.RESULTS.GRANTED) {
            return true
          } else {
            return false
          }
        } catch (err) {
          return false
        }
         // await AsyncStorage.setItem('hasAskedNotificationPermission', 'true');
        }
      else if(permissionGranted){
        return true
      }
    }
    else{
      return true
    }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  }
  else if (Platform.OS === 'ios') {
    return true
  }
};