// src/Home.js
import React, { useEffect } from "react";
import { View, Text, Alert, Platform } from "react-native";
import PushNotification from "react-native-push-notification";
import messaging from "@react-native-firebase/messaging";
import firestore from "@react-native-firebase/firestore";
import DeviceInfo from "react-native-device-info";
import { requestNotificationPermission } from "./utils";

const Home = () => {
  useEffect(() => {
    async function setupNotifications() {

      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission needed",
          "We need notifications to send you updates."
        );
        return;
      }

      if (Platform.OS === "android") {
        PushNotification.createChannel(
          {
            channelId: "fcm_default_channel",
            channelName: "Default Channel",
            importance: 4,
          },
          created => console.log(`Channel created? ${created}`)
        );
      }

      const token = await messaging().getToken();
      console.log("FCM Token:", token);
      const deviceId = await DeviceInfo.getUniqueId();
      console.log("Device ID:", deviceId);

      try {
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
        console.log("FCM token saved under doc:", deviceId);
      } catch (err) {
        console.error("Error saving token:", err);
      }

        try {
            await messaging().subscribeToTopic("dailyUpdates");
            console.log("Subscribed to topic: dailyUpdates");
        } catch (err) {
            console.error("Error subscribing to topic:", err);
        }
    }

    setupNotifications();

    // Handle cold start from a tapped notification
    const initialNotification = PushNotification.popInitialNotification();
    if (initialNotification) {
      console.log("Opened from notification:", initialNotification);
    }

    // Debug: see which channels exist
    PushNotification.getChannels(channels => {
      console.log("Notification channels:", channels);
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Welcome to GetNotify!
      </Text>
      <Text>Please allow notifications to get updates.</Text>
    </View>
  );
};

export default Home;
