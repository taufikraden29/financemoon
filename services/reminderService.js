/**
 * Reminder Service - Check and send debt payment reminders
 */

import { differenceInDays, format, parseISO } from 'date-fns';
import { sendDebtReminder } from '@/services/telegramService';

// Default reminder intervals (days before due date)
const DEFAULT_REMINDER_DAYS = [5, 3, 1, 0];

/**
 * Get sent reminders from localStorage
 * @returns {Object} - Sent reminders record
 */
const getSentReminders = () => {
    try {
        return JSON.parse(localStorage.getItem('sent_debt_reminders') || '{}');
    } catch {
        return {};
    }
};

/**
 * Save sent reminder to localStorage
 * @param {string} reminderKey - Unique key for reminder
 */
const markReminderSent = (reminderKey) => {
    const sentReminders = getSentReminders();
    sentReminders[reminderKey] = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem('sent_debt_reminders', JSON.stringify(sentReminders));
};

/**
 * Check if reminder already sent today
 * @param {string} reminderKey - Unique key for reminder
 * @returns {boolean} - True if already sent
 */
const isReminderSentToday = (reminderKey) => {
    const sentReminders = getSentReminders();
    const today = format(new Date(), 'yyyy-MM-dd');
    return sentReminders[reminderKey] === today;
};

/**
 * Check debts and send reminders if needed
 * Uses the debt's reminderDays setting if available
 * @param {Array} debts - Array of debt objects
 * @returns {Promise<number>} - Number of reminders sent
 */
export const checkDebtReminders = async (debts) => {
    if (!debts || debts.length === 0) return 0;

    const today = new Date();
    let remindersSent = 0;

    for (const debt of debts) {
        // Skip paid debts or debts without due date
        if (debt.isPaid || !debt.dueDate) continue;

        try {
            const dueDate = parseISO(debt.dueDate);
            const daysLeft = differenceInDays(dueDate, today);

            // Get reminder days from debt settings (e.g., "3" means 3 days before)
            // Also check for overdue (0) and due today (0)
            const reminderDays = parseInt(debt.reminderDays) || 3;

            // Send reminder if:
            // 1. Days left matches user-configured reminder days, OR
            // 2. Due today (0 days left), OR
            // 3. Overdue (negative days, but only once)
            const shouldRemind =
                daysLeft === reminderDays ||  // User-configured reminder day
                daysLeft === 0 ||              // Due today
                (daysLeft < 0 && daysLeft >= -1); // Overdue by 1 day

            if (shouldRemind) {
                const reminderKey = `${debt.id}-${daysLeft}`;

                // Skip if already sent today
                if (isReminderSentToday(reminderKey)) {
                    continue;
                }

                // Send reminder
                const sent = await sendDebtReminder(debt, Math.max(daysLeft, 0));

                if (sent) {
                    markReminderSent(reminderKey);
                    remindersSent++;
                    console.log(`✅ Sent reminder for ${debt.name} (${daysLeft} days left, reminderDays: ${reminderDays})`);
                } else {
                    console.warn(`⚠️ Failed to send reminder for ${debt.name}`);
                }

                // Add small delay between messages to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`Error processing debt ${debt.name}:`, error);
        }
    }

    return remindersSent;
};

/**
 * Clear all sent reminder records
 * Useful for testing or resetting
 */
export const clearReminderHistory = () => {
    localStorage.removeItem('sent_debt_reminders');
    console.log('✅ Reminder history cleared');
};

/**
 * Get reminder status for a debt
 * @param {string} debtId - Debt ID
 * @returns {Object} - Reminder status per interval
 */
export const getReminderStatus = (debtId) => {
    const sentReminders = getSentReminders();
    const status = {};

    REMINDER_DAYS.forEach(days => {
        const key = `${debtId}-${days}`;
        status[days] = sentReminders[key] || null;
    });

    return status;
};

/**
 * Manual trigger for testing
 * @param {Object} debt - Debt object
 * @param {number} daysLeft - Days to simulate
 * @returns {Promise<boolean>} - Success status
 */
export const testDebtReminder = async (debt, daysLeft = 5) => {
    console.log(`🧪 Testing reminder for ${debt.name} with ${daysLeft} days left...`);
    const sent = await sendDebtReminder(debt, daysLeft);

    if (sent) {
        console.log('✅ Test reminder sent successfully');
    } else {
        console.log('❌ Test reminder failed');
    }

    return sent;
};
