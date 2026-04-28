
"use server";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

/**
 * Server action to notify admin via Telegram.
 * It fetches the bot credentials from Firestore first.
 */
export async function notifyTelegram(message: string, txId?: string) {
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
    
    // We provide a link back to the transactions page for "fast" processing
    // Note: True inline approval requires a webhook/bot server to handle callbacks.
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const adminUrl = `${baseUrl}/admin/transactions`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChannelId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: "💳 View in Admin Panel", url: adminUrl }
            ]
          ]
        }
      })
    });
  } catch (err) {
    console.error("Telegram notification error:", err);
  }
}
