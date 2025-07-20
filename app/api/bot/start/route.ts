import { NextResponse } from 'next/server';
import TelegramBotService from '@/lib/telegramBot';

let botService: TelegramBotService | null = null;

export async function POST() {
  try {
    if (botService) {
      return NextResponse.json({
        message: 'Bot is already running',
        status: 'active'
      });
    }

    // Initialize and start bot in polling mode
    botService = new TelegramBotService();
    await botService.initialize();

    return NextResponse.json({
      message: 'Bot started successfully in polling mode',
      status: 'started'
    });
  } catch (error) {
    console.error('Error starting bot:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start bot',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (botService) {
      botService.stop();
      botService = null;
      
      return NextResponse.json({
        message: 'Bot stopped successfully',
        status: 'stopped'
      });
    }

    return NextResponse.json({
      message: 'Bot was not running',
      status: 'inactive'
    });
  } catch (error) {
    console.error('Error stopping bot:', error);
    return NextResponse.json(
      { error: 'Failed to stop bot' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: botService ? 'active' : 'inactive',
    message: botService ? 'Bot is running' : 'Bot is not running'
  });
} 