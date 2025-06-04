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

  // 3) Build a topic message
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const message = {
    topic: "dailyUpdates",
    notification: {
      title: `Good morning! (${now})`,
      body: "Here’s your automated update 😊",
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
