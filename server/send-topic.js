//
// send-via-admin.js
//
// This script initializes the Firebase Admin SDK using a Service Account JSON
// (provided via a base64-encoded GitHub secret), then sends a notification to
// the “dailyUpdates” topic.
//

const admin = require("firebase-admin");

async function main() {
  // 1) Decode the base64 Service Account JSON from environment
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var");
    process.exit(1);
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  let serviceAccountJson;
  try {
    const jsonString = Buffer.from(base64, "base64").toString("utf8");
    serviceAccountJson = JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse Service Account JSON:", err);
    process.exit(1);
  }

  // 2) Initialize the Admin SDK
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });
  } catch (err) {
    console.error("Firebase Admin init error:", err);
    process.exit(1);
  }

    const healthReminderMessages = [
      "🕒 Time to stand up and stretch your legs! 🚶‍♂️",
      "💧 Take a moment to drink a glass of water and stay hydrated.",
      "🧘‍♀️ Pause for a quick deep‐breath stretch—reach for the ceiling!",
      "👟 Let’s do a short walk around the room or hallway.",
      "🍎 Have a healthy snack ready—an apple or nuts for energy.",
      "🖐️ Roll your shoulders back and open up your chest right now.",
      "🩺 Check your posture—sit up straight and relax your shoulders.",
      "☀️ Step outside for a minute of fresh air and sunlight.",
      "🦶 Do a quick foot & ankle stretch to boost circulation.",
      "😴 Take 30 seconds to close your eyes, relax, and breathe deeply."
    ];

  // 3) Build a topic message
  // const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const randomIndex = Math.floor(Math.random() * healthReminderMessages.length);
    const randomMessage = healthReminderMessages[randomIndex];

    // const message = {
    //   topic: "dailyUpdates",
    //   notification: {
    //     title: "🔥 Your Daily Health Reminder! ❤️",
    //     body: randomMessage,
    //   },
    //   data: {
    //     sentAt: new Date().toISOString(),
    //   },
    // };
   const message = {
      topic: "dailyUpdates",
      notification: {
        title: "🔥 Your Daily Health Reminder! ❤️",
        body: randomMessage
      },
      data: {
        title: "🔥 Your Daily Health Reminder! ❤️",
        body: randomMessage,
        loop_sound: "true",
        wake_screen: "true",
        sound: "custom_sound", // Moved sound here
        sentAt: new Date().toISOString()
      },
      android: {
        priority: "high",
        notification: {
          sound: "custom_sound",
          channel_id: "FIREBASE_RINGTONE_CHANNEL"
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "custom_sound.caf"
          }
        }
      }
    };

  // 4) Send it
  try {
    const response = await admin.messaging().send(message);
    console.log("Sent message:", response);
    process.exit(0);
  } catch (err) {
    console.error("Error sending message:", err);
    process.exit(1);
  }
}

main();
