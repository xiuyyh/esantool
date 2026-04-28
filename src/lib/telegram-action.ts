
"use server";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Server action to notify admin via Telegram.
 * It fetches the bot credentials from Firestore first.
 */
export async function notifyTelegram(message: string) {
  try {
    // We need to initialize a server-side instance of Firebase to read settings
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const settingsRef = doc(db, "settings", "admin");
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) return;
    
    const { telegramBotToken, telegramChannelId } = settingsSnap.data();
    
    if (!telegramBotToken || !telegramChannelId) return;

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChannelId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error("Telegram notification error:", err);
  }
}
