# Telegram Bot Setup Guide

## 📱 Step 1: Create Telegram Bot

1. Open Telegram app
2. Search for `@BotFather`
3. Start a chat and send: `/newbot`
4. Follow the instructions:
   - Choose a name for your bot (e.g., "Financial Moo Bot")
   - Choose a username (must end with 'bot', e.g., "financialmoo_bot")
5. **Save the bot token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

## 🆔 Step 2: Get Your Chat ID

1. Search for `@userinfobot` in Telegram
2. Start a chat
3. Send any message
4. Bot will reply with your user info
5. **Copy your ID** (a number like: `123456789`)

## 🔧 Step 3: Configure .env File

1. Create or edit `.env` file in project root
2. Add these lines (replace with your actual values):

```env
VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
VITE_TELEGRAM_CHAT_ID=123456789
VITE_TELEGRAM_API_URL=https://your-app.vercel.app/api/send-telegram
```

## ☁️ Step 4: Deploy Serverless Function

### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project root:
```bash
vercel --prod
```

4. Copy the deployment URL (e.g., `https://financialmoo.vercel.app`)

5. Update `.env` with your API URL:
```env
VITE_TELEGRAM_API_URL=https://financialmoo.vercel.app/api/send-telegram
```

### Option B: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Create `netlify.toml`:
```toml
[build]
  functions = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

3. Deploy:
```bash
netlify deploy --prod
```

## ✅ Step 5: Test Connection

1. Open browser console (F12)
2. Run test:
```javascript
import { sendTestMessage } from './src/services/telegramService';
sendTestMessage();
```

3. Check your Telegram - you should receive a test message!

## 🔄 How It Works

### Automatic Reminders

The app automatically checks debts and sends reminders:
- **5 days before** due date 📅
- **3 days before** due date ⚠️
- **1 day before** due date 🚨

### Check Frequency

- On app load (when you open the app)
- Every 24 hours (while app is running)

### Message Format

```
🚨 URGENT: Debt Payment Reminder

💳 Debt: Credit Card
💰 Amount: Rp 1.000.000
📅 Due Date: 2025-12-10
⏰ Days Left: 1 day

⚠️ Payment due tomorrow!

Action required: Please make payment soon.
```

## 🧪 Manual Testing

### Test Reminder Service

```javascript
// In browser console
import { testDebtReminder } from './src/services/reminderService';

const testDebt = {
  id: 'test-1',
  name: 'Test Debt',
  totalDebt: 1000000,
  dueDate: '2025-12-10'
};

testDebtReminder(testDebt, 5); // Test 5-day reminder
```

### Check Sent Reminders

```javascript
// View sent reminders
console.log(localStorage.getItem('sent_debt_reminders'));

// Clear reminder history (for testing)
import { clearReminderHistory } from './src/services/reminderService';
clearReminderHistory();
```

## 🔒 Security Notes

- ✅ Bot token stored in `.env` (not committed to git)
- ✅ `.env` added to `.gitignore`
- ✅ Serverless function validates requests
- ⚠️ Never share your bot token publicly

## 🐛 Troubleshooting

### Bot not sending messages?

1. Check `.env` configuration
2. Verify bot token is correct
3. Verify chat ID is correct
4. Check serverless function is deployed
5. Check browser console for errors

### Duplicate messages?

- Reminders are sent once per day
- Clear reminder history: `clearReminderHistory()`
- Check localStorage for sent reminders

### Rate limits?

- Telegram allows 30 messages/second
- App adds 500ms delay between messages
- Should not hit limits with normal usage

## 📊 Monitoring

Check reminder status:
```javascript
import { getReminderStatus } from './src/services/reminderService';
getReminderStatus('debt-id-here');
// Returns: { 5: '2025-12-01', 3: '2025-12-03', 1: null }
```

## 🎯 Next Steps

- ✅ Configure Telegram bot
- ✅ Deploy serverless function
- ✅ Add credentials to `.env`
- ✅ Test with sample debt
- ✅ Monitor Telegram notifications

---

**Need help?** Check:
- Telegram Bot API: https://core.telegram.org/bots/api
- Vercel Docs: https://vercel.com/docs
- Console logs for debugging
