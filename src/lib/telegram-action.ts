
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
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    const settingsRef = doc(db, "settings", "admin");
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      return;
    }
    
    const data = settingsSnap.data();
    const telegramBotToken = data?.telegramBotToken;
    const telegramChannelId = data?.telegramChannelId;
    
    if (!telegramBotToken || !telegramChannelId) {
      return;
    }

    // Clean the token: remove 'bot' prefix if user added it
    const cleanToken = telegramBotToken.trim().startsWith('bot') 
      ? telegramBotToken.trim().substring(3) 
      : telegramBotToken.trim();

    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    
    // Construct Admin Panel URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const adminUrl = baseUrl ? `${baseUrl}/admin/transactions` : null;

    const body: any = {
      chat_id: telegramChannelId.trim(),
      text: message,
      parse_mode: 'HTML',
    };

    // Add Fast Action Buttons linking to the admin portal
    if (adminUrl) {
      body.reply_markup = {
        inline_keyboard: [
          [
            { text: "✅ APPROVE REQUEST", url: adminUrl },
            { text: "❌ REJECT REQUEST", url: adminUrl }
          ],
          [
            { text: "💳 Open Admin Panel", url: adminUrl }
          ]
        ]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram API error (${response.status}): ${errorText}`);
    }
  } catch (err) {
    console.error("Telegram notification exception:", err);
  }
}
