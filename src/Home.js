// src/Home.js
import React, { useEffect } from "react";
import { View, Text, Alert, Platform, StyleSheet } from "react-native";
// import PushNotification from "react-native-push-notification";
import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import DeviceInfo from "react-native-device-info";
import { requestNotificationPermission } from "./utils";
import { getFcmToken } from "./notifications";

const Home = () => {
    useEffect(() => {
    const setupDevice = async () => {
      try {
        const token = await getFcmToken();
        let deviceId;
        try {
          deviceId = await DeviceInfo.getUniqueId();
          console.log("Device ID:", deviceId);
        } catch (deviceIdError) {
          console.error("Failed to get device ID:", deviceIdError);
          deviceId = `fallback-${Date.now()}`;
        }

        await firestore()
          .collection("deviceTokens")
          .doc(deviceId)
          .set(
            {
              fcmToken: token,
              updatedAt: firestore.FieldValue.serverTimestamp(),
              platform: Platform.OS,
            },
            { merge: true }
          );
        
        await messaging().subscribeToTopic("dailyUpdates");
        console.log("Subscribed to dailyUpdates");
      } catch (err) {
        console.error("Setup error:", err);
      }
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission needed",
          "We need notifications to send you updates."
        );
        return;
      }

    };

    setupDevice();
  }, []);
//   useEffect(() => {
//     async function setupNotifications() {

//         const token = await messaging().getToken();
//         console.log("FCM Token:", token);
//         const deviceId = await DeviceInfo.getUniqueId();
//         console.log("Device ID:", deviceId);

//       try {
//         await firestore()
//           .collection("deviceTokens")
//           .doc(deviceId)
//           .set(
//             {
//               fcmToken: token,
//               updatedAt: firestore.FieldValue.serverTimestamp(),
//               platform: Platform.OS,
//             },
//             { merge: true }
//           );
//         console.log("FCM token saved under doc:", deviceId);
//       } catch (err) {
//         console.error("Error saving token:", err);
//       }

//         try {
//             await messaging().subscribeToTopic("dailyUpdates");
//             console.log("Subscribed to topic: dailyUpdates");
//         } catch (err) {
//             console.error("Error subscribing to topic:", err);
//         }

//       const hasPermission = await requestNotificationPermission();
//       if (!hasPermission) {
//         Alert.alert(
//           "Permission needed",
//           "We need notifications to send you updates."
//         );
//         return;
//       }

//       if (Platform.OS === "android") {
//         PushNotification.createChannel(
//           {
//             channelId: "fcm_default_channel",
//             channelName: "Default Channel",
//             soundName: 'default',
//             importance: 4,
//             vibrate: true,
//           },
//           created => console.log(`Channel created? ${created}`)
//         );
//       }


//     }

//     setupNotifications();

//     // Handle cold start from a tapped notification
//     const initialNotification = PushNotification.popInitialNotification();
//     if (initialNotification) {
//       console.log("Opened from notification:", initialNotification);
//     }

//   }, []);

  return (
    <View style={styles.container}>
        <Text style={styles.headerText}>
        Daily Health Reminder! 💪
        </Text>
        <Text style={styles.infoText}>
        You will receive daily tips and updates to support your well‐being.
        </Text>
        <Text style={styles.noteText}>
        Please give notification permission to recieve messages.
        </Text>
    </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "700",
    color: "black",
  },
  infoText: {
    fontSize: 16,
    color: "grey",
    textAlign: "center",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "grey",
    fontStyle: "italic",
    textAlign: "center",
  },
});
export default Home;
