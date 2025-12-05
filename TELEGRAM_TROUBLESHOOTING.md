# Telegram Troubleshooting Guide

## Quick Checklist

### 1. ✅ Restart Dev Server (PENTING!)

After changing .env, you MUST restart the dev server:

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

**Why?** Vite only reads .env on startup!

---

### 2. ✅ Check .env Format

Make sure .env file looks exactly like this:

```env
VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
VITE_TELEGRAM_CHAT_ID=123456789
VITE_TELEGRAM_API_URL=https://your-app.vercel.app/api/send-telegram
```

**Common Mistakes:**
- ❌ Extra spaces
- ❌ Quotes around values
- ❌ Missing `VITE_` prefix
- ❌ Trailing slashes in URL

**Correct Example:**
```env
VITE_TELEGRAM_BOT_TOKEN=7891011121:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
VITE_TELEGRAM_CHAT_ID=123456789
VITE_TELEGRAM_API_URL=https://financialmoo.vercel.app/api/send-telegram
```

---

### 3. ⚠️ Deploy Serverless Function FIRST

The API URL won't work until you deploy!

**Quick Deploy to Vercel:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy from project root:
```bash
vercel --prod
```

4. Copy deployment URL and update .env:
```env
VITE_TELEGRAM_API_URL=https://your-deployment-url.vercel.app/api/send-telegram
```

5. **Restart dev server again!**

---

### 4. 🔍 Debug in Browser Console

Open browser console (F12) and run:

```javascript
// Check if env vars loaded
console.log({
  token: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID,
  apiUrl: import.meta.env.VITE_TELEGRAM_API_URL
});

// Should show your actual values, not undefined!
```

**If you see `undefined`:**
- ✅ Restart dev server
- ✅ Check .env has `VITE_` prefix
- ✅ Check .env is in project root (not src/)

---

### 5. 🧪 Test Manually

Try direct API call in console:

```javascript
const testDirect = async () => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  console.log('Testing with:', { token, chatId });

  // Test without proxy (direct to Telegram)
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: 'Direct test from browser'
    })
  });

  const data = await response.json();
  console.log('Response:', data);

  return data;
};

testDirect();
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "message_id": 123,
    ...
  }
}
```

**If you get CORS error:**
- ✅ This is expected! You need the proxy
- ✅ Deploy serverless function to Vercel

**If you get `"ok": false`:**
- ❌ Check bot token
- ❌ Check chat ID
- ❌ Make sure you started conversation with bot

---

### 6. 📱 Verify Bot Token & Chat ID

**Test Bot Token:**
```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getMe"
```

Should return bot info. If error → token invalid.

**Get Chat ID Alternative:**
1. Send message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}`

---

## Step-by-Step Fix

### Option A: Deploy-First Approach (Recommended if you have Vercel account)

```bash
# 1. Deploy serverless function
vercel --prod

# 2. Copy URL from output
# Example: https://financialmoo-abc123.vercel.app

# 3. Update .env
# VITE_TELEGRAM_API_URL=https://financialmoo-abc123.vercel.app/api/send-telegram

# 4. Restart dev server
npm run dev

# 5. Test in browser
```

### Option B: No-Deploy Testing (Use direct Telegram API)

For testing only (has CORS issues in production):

1. **Temporarily modify** `telegramService.js`:

```javascript
// TEMPORARY: Direct API for testing
export const sendTelegramMessage = async (message) => {
  const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram not configured');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Telegram error:', error);
    return false;
  }
};
```

2. Restart dev server
3. Test - should work but will have CORS warnings
4. **Revert changes and deploy proxy for production**

---

## Common Issues & Solutions

### Issue: "Telegram not configured"
**Solution:**
- Check .env has all 3 variables
- Restart dev server
- Check browser console for env values

### Issue: "Failed to send message"
**Solution:**
- Check API URL is deployed and correct
- Test direct Telegram API
- Check network tab in DevTools

### Issue: "CORS error"
**Solution:**
- Must use proxy (deploy to Vercel)
- Direct Telegram API blocked by browser

### Issue: Bot doesn't respond
**Solution:**
- Start conversation with bot first
- Send `/start` to bot in Telegram
- Verify chat ID is correct

---

## Verification Steps

After fixing, verify:

1. ✅ .env has all 3 variables with `VITE_` prefix
2. ✅ Dev server restarted
3. ✅ Browser console shows env values (not undefined)
4. ✅ Serverless function deployed (if using proxy)
5. ✅ Test button works
6. ✅ Message received in Telegram

---

## Need More Help?

**Check logs:**
- Browser console (F12)
- Network tab for API calls
- Vercel function logs (if deployed)

**Verify bot:**
- Search bot in Telegram
- Send /start command
- Bot should respond

**Still not working?**
Share error message from console and we'll debug together!
