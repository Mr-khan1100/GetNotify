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

    const romanticMessages = [
    "Woke up wishing you were tangled in my sheets, not just in my thoughts 😘",
    "If kisses were text messages, you'd have hundreds from me by now 💋",
    "I don’t need coffee this morning—just the thought of your lips on mine ☕💞",
    "I swear my pillow still smells like you… or maybe it’s just my imagination going wild 😍",
    "Every morning, I fall a little harder for you — and sometimes that includes falling into fantasies 😏",
    "Woke up with your name on my lips and your hands in my dreams 🔥",
    "You're the reason I smile… and blush… and bite my lip when no one’s looking 😉",
    "Morning babe 😇 Just thinking about that smirk you give right before you steal a kiss 😚",
    "Sun’s up… and so are my thoughts about you 🌅😈",
    "Can we skip to the part where I get to hold you too close and not let go? 🥺❤️",
  ];

  // 3) Build a topic message
  // const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const randomIndex = Math.floor(Math.random() * romanticMessages.length);
    const randomMessage = romanticMessages[randomIndex];

    const message = {
      topic: "dailyUpdates",
      notification: {
        title: "🔥 From your Love! Habib ❤️",
        body: randomMessage,
      },
      data: {
        sentAt: new Date().toISOString(),
      },
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
