/**
 * Telegram Service - Direct API (No Proxy) for Testing
 * This version bypasses the serverless proxy for easier setup
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

/**
 * Check if Telegram is configured
 */
export const isTelegramConfigured = () => {
    return Boolean(BOT_TOKEN && CHAT_ID);
};

/**
 * Send a message directly to Telegram API
 * Note: This may have CORS issues in production, but works for testing
 */
export const sendTelegramMessage = async (message) => {
    if (!isTelegramConfigured()) {
        console.warn('Telegram not configured. Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env');
        console.warn('Current values:', {
            hasToken: Boolean(BOT_TOKEN),
            hasChatId: Boolean(CHAT_ID),
            token: BOT_TOKEN ? `${BOT_TOKEN.substring(0, 10)}...` : 'undefined',
            chatId: CHAT_ID || 'undefined'
        });
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        console.log('Sending to Telegram...', {
            url: url.substring(0, 50) + '...',
            chatId: CHAT_ID,
            messageLength: message.length
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const data = await response.json();

        if (data.ok) {
            console.log('✅ Message sent successfully!', data.result);
            return true;
        } else {
            console.error('❌ Telegram API error:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error);
        return false;
    }
};

/**
 * Send debt payment reminder
 */
export const sendDebtReminder = async (debt, daysLeft) => {
    const emoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    const urgency = daysLeft <= 1 ? 'URGENT' : daysLeft <= 3 ? 'IMPORTANT' : 'REMINDER';

    const message = `
${emoji} *${urgency}: Debt Payment Reminder*

💳 *Debt:* ${debt.name}
💰 *Amount:* Rp ${debt.totalDebt?.toLocaleString('id-ID') || debt.totalAmount?.toLocaleString('id-ID')}
📅 *Due Date:* ${debt.dueDate}
⏰ *Days Left:* ${daysLeft} day${daysLeft > 1 ? 's' : ''}

${daysLeft <= 1 ? '⚠️ *Payment due tomorrow!*' : ''}
${daysLeft === 0 ? '🚨 *PAYMENT DUE TODAY!*' : ''}

_Action required: Please make payment soon._
`.trim();

    return sendTelegramMessage(message);
};

/**
 * Send test message
 */
export const sendTestMessage = async () => {
    const message = `
✅ *Telegram Bot Test*

Your Telegram bot is configured correctly!
You will receive debt payment reminders at:
• 5 days before due date 📅
• 3 days before due date ⚠️
• 1 day before due date 🚨

_Financial Moo - Your Smart Finance Tracker_

Time: ${new Date().toLocaleString('id-ID')}
`.trim();

    return sendTelegramMessage(message);
};

/**
 * Send recurring transaction notification
 */
export const sendRecurringNotification = async (recurring) => {
    const emoji = recurring.type === 'expense' ? '💸' : '💰';
    const message = `
${emoji} *Auto-Generated Transaction*

📝 *Name:* ${recurring.name}
${recurring.type === 'expense' ? '💸' : '💰'} *Amount:* Rp ${recurring.amount.toLocaleString('id-ID')}
📊 *Category:* ${recurring.category}
🔄 *Type:* ${recurring.type}

_This transaction was automatically created from your recurring schedule._
`.trim();

    return sendTelegramMessage(message);
};
