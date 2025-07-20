#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function setupBot() {
  console.log('🤖 TravelMate Bot Setup');
  console.log('========================\n');
  
  console.log('This script will help you set up your Telegram Bot for TravelMate.\n');
  
  try {
    // Get bot token
    console.log('1. First, create a bot with @BotFather on Telegram:');
    console.log('   - Send /newbot to @BotFather');
    console.log('   - Choose a name and username for your bot');
    console.log('   - Copy the bot token\n');
    
    const botToken = await question('Enter your bot token: ');
    if (!botToken) {
      console.log('❌ Bot token is required!');
      process.exit(1);
    }
    
    // Get app URL
    console.log('\n2. App Configuration:');
    const appUrl = await question('Enter your app URL (default: https://localhost:3000): ') || 'https://localhost:3000';
    
    // Create or update .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add bot configuration
    const botConfig = `
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${botToken}
MINI_APP_URL=${appUrl}
APP_URL=${appUrl}
`;
    
    if (envContent.includes('TELEGRAM_BOT_TOKEN')) {
      // Update existing configuration
      envContent = envContent.replace(/TELEGRAM_BOT_TOKEN=.*/, `TELEGRAM_BOT_TOKEN=${botToken}`);
      envContent = envContent.replace(/MINI_APP_URL=.*/, `MINI_APP_URL=${appUrl}`);
      envContent = envContent.replace(/APP_URL=.*/, `APP_URL=${appUrl}`);
    } else {
      // Add new configuration
      envContent += botConfig;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Environment configuration saved to .env.local');
    
    // Setup bot commands
    console.log('\n3. Setting up bot commands...');
    
    const commands = [
      { command: 'start', description: 'Start using TravelMate bot' },
      { command: 'app', description: 'Open TravelMate Mini App' },
      { command: 'profile', description: 'View your profile' },
      { command: 'matches', description: 'Check your matches' },
      { command: 'notifications', description: 'Manage notifications' },
      { command: 'destinations', description: 'View popular destinations' },
      { command: 'tips', description: 'Get travel tips' },
      { command: 'help', description: 'Show help message' },
      { command: 'support', description: 'Contact support' }
    ];
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Bot commands configured successfully');
      } else {
        console.log('⚠️  Warning: Could not set bot commands:', result.description);
      }
    } catch (error) {
      console.log('⚠️  Warning: Could not set bot commands:', error.message);
    }
    
    console.log('\n🎉 Bot setup completed!');
    console.log('\nNext steps:');
    console.log('1. Start your development server: pnpm run dev');
    console.log('2. Test the bot by messaging it on Telegram');
    console.log('3. For production, set up webhooks using: GET /api/bot/webhook');
    console.log('\nBot features:');
    console.log('- /start - Welcome message with Mini App button');
    console.log('- /app - Quick access to TravelMate');
    console.log('- /profile - Check user profile status');
    console.log('- /matches - View recent matches');
    console.log('- /notifications - Toggle notifications');
    console.log('- /destinations - Popular travel destinations');
    console.log('- /tips - Random travel tips');
    console.log('- /help - Show all commands');
    console.log('- /support - Contact information');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled.');
  process.exit(0);
});

setupBot(); 