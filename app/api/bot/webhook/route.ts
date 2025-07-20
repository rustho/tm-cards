import { NextRequest, NextResponse } from 'next/server';
import TelegramBotService from '@/lib/telegramBot';

// Initialize bot instance
let botService: TelegramBotService | null = null;

async function initBot() {
  if (!botService) {
    try {
      botService = new TelegramBotService();
      await botService.initialize();
      console.log('Bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize bot:', error);
      throw error;
    }
  }
  return botService;
}

// Handle webhook updates from Telegram
export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Initialize bot if not already done
    const bot = await initBot();
    
    // Process the update
    await bot.getBotInstance().handleUpdate(update);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Set webhook endpoint (for development/setup)
export async function GET() {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 400 }
      );
    }

    const webhookUrl = `${process.env.APP_URL || 'https://localhost:3000'}/api/bot/webhook`;
    
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      }
    );

    const result = await response.json();
    
    if (result.ok) {
      return NextResponse.json({
        message: 'Webhook set successfully',
        webhookUrl,
        result
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to set webhook', details: result },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to set webhook' },
      { status: 500 }
    );
  }
} 