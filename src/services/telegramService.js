/**
 * Telegram Service - Send messages via Telegram Bot API
 */

const TELEGRAM_API = import.meta.env.VITE_TELEGRAM_API_URL;
const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

/**
 * Check if Telegram is configured
 */
export const isTelegramConfigured = () => {
    return Boolean(BOT_TOKEN && CHAT_ID && TELEGRAM_API);
};

/**
 * Send a message to Telegram
 * @param {string} message - Message text (supports Markdown)
 * @returns {Promise<boolean>} - Success status
 */
export const sendTelegramMessage = async (message) => {
    if (!isTelegramConfigured()) {
        console.warn('Telegram not configured. Please set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env');
        return false;
    }

    try {
        const response = await fetch(TELEGRAM_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: BOT_TOKEN,
                chatId: CHAT_ID,
                message
            })
        });

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return false;
    }
};

/**
 * Send debt payment reminder
 * @param {Object} debt - Debt object
 * @param {number} daysLeft - Days until due date
 * @returns {Promise<boolean>} - Success status
 */
export const sendDebtReminder = async (debt, daysLeft) => {
    const emoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '📅';
    const urgency = daysLeft <= 1 ? 'URGENT' : daysLeft <= 3 ? 'IMPORTANT' : 'REMINDER';

    const message = `
${emoji} *${urgency}: Debt Payment Reminder*

💳 *Debt:* ${debt.name}
💰 *Amount:* Rp ${debt.totalDebt.toLocaleString('id-ID')}
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
 * @returns {Promise<boolean>} - Success status
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
`.trim();

    return sendTelegramMessage(message);
};

/**
 * Send recurring transaction notification
 * @param {Object} recurring - Recurring transaction object
 * @returns {Promise<boolean>} - Success status
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
