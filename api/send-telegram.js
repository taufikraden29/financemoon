/**
 * Serverless Function - Telegram Bot Proxy
 * Deploy this to Vercel/Netlify
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

    // Get parameters from request body
    const { token, chatId, message } = req.body;

    // Validate required parameters
    if (!token || !chatId || !message) {
        return res.status(400).json({
            error: 'Missing required parameters',
            required: ['token', 'chatId', 'message']
        });
    }

    try {
        // Construct Telegram API URL
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        // Send message to Telegram
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown' // Enable Markdown formatting
            })
        });

        const data = await response.json();

        // Check if Telegram API call was successful
        if (data.ok) {
            return res.status(200).json({
                success: true,
                messageId: data.result.message_id
            });
        } else {
            return res.status(400).json({
                error: 'Telegram API error',
                description: data.description
            });
        }
    } catch (error) {
        console.error('Telegram proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
