export async function POST(request) {
  const { token, chatId, message } = await request.json();

  if (!token || !chatId || !message) {
    return Response.json(
      { error: 'Missing required parameters', required: ['token', 'chatId', 'message'] },
      { status: 400 }
    );
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();

    if (data.ok) {
      return Response.json({ success: true, messageId: data.result.message_id });
    } else {
      return Response.json(
        { error: 'Telegram API error', description: data.description },
        { status: 400 }
      );
    }
  } catch (error) {
    return Response.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
