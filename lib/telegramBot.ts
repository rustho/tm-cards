import { Telegraf, Context } from 'telegraf';
import BotLogger from './botLogger';

interface BotContext extends Context {
  // Add custom context properties if needed
}

class TelegramBotService {
  private bot: Telegraf<BotContext>;
  private isInitialized = false;
  private logger: BotLogger;

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }
    
    this.bot = new Telegraf<BotContext>(botToken);
    this.logger = BotLogger.getInstance();
    this.setupCommands();
  }

  private async logUserMessage(ctx: BotContext, message: string) {
    if (!ctx.from) return;
    
    await this.logger.logUserMessage(
      ctx.from.id.toString(),
      ctx.from.username,
      ctx.from.first_name,
      ctx.from.last_name,
      ctx.chat?.id.toString() || '',
      message
    );
  }

  private async logBotResponse(ctx: BotContext, message: string, responseTime?: number) {
    if (!ctx.from) return;
    
    await this.logger.logBotResponse(
      ctx.from.id.toString(),
      ctx.chat?.id.toString() || '',
      message,
      responseTime
    );
  }

  private async logCommand(ctx: BotContext, command: string, success: boolean = true) {
    if (!ctx.from) return;
    
    await this.logger.logCommand(
      ctx.from.id.toString(),
      ctx.from.username,
      ctx.from.first_name,
      ctx.chat?.id.toString() || '',
      command,
      success
    );
  }

  private async logError(ctx: BotContext, error: Error | string, context?: string) {
    if (!ctx.from) return;
    
    await this.logger.logError(
      ctx.from.id.toString(),
      ctx.chat?.id.toString() || '',
      error,
      context
    );
  }

  private setupCommands() {
    // Start command
    this.bot.start(async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        // Log user started bot
        await this.logCommand(ctx, 'start');
        this.logger.newSession(ctx.from?.id.toString() || '');

        const welcomeMessage = `🌍 Welcome to TravelMate!

I'm your travel companion bot. Here's what I can help you with:

🔹 /app - Open TravelMate Mini App
🔹 /profile - View your profile
🔹 /matches - Check your latest matches
🔹 /notifications - Manage notifications
🔹 /help - Show this help message

Ready to find your perfect travel buddy? Tap /app to get started!`;

        await ctx.reply(welcomeMessage, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Open TravelMate App', web_app: { url: process.env.MINI_APP_URL || 'https://localhost:3000' } }]
            ]
          }
        });

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, welcomeMessage, responseTime);
        
        // Log notification sent
        await this.logger.logNotification(
          ctx.from?.id.toString() || '',
          ctx.chat?.id.toString() || '',
          'welcome',
          welcomeMessage,
          { command: 'start' }
        );

      } catch (error) {
        await this.logError(ctx, error as Error, 'start command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Help command
    this.bot.help(async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        await this.logCommand(ctx, 'help');

        const helpMessage = `🤖 TravelMate Bot Commands:

🔹 /app - Open the main TravelMate application
🔹 /profile - View your current profile status
🔹 /matches - See your recent matches
🔹 /notifications on/off - Toggle match notifications
🔹 /destinations - Popular travel destinations
🔹 /tips - Get travel tips
🔹 /support - Contact support

Need more help? Contact our support team!`;

        await ctx.reply(helpMessage);

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, helpMessage, responseTime);

      } catch (error) {
        await this.logError(ctx, error as Error, 'help command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // App command - opens Mini App
    this.bot.command('app', async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        await this.logCommand(ctx, 'app');

        const appMessage = '🚀 Opening TravelMate...';
        await ctx.reply(appMessage, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌍 Launch TravelMate', web_app: { url: process.env.MINI_APP_URL || 'https://localhost:3000' } }]
            ]
          }
        });

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, appMessage, responseTime);

        // Log that user requested app access
        await this.logger.logUserAction(
          ctx.from?.id.toString() || '',
          ctx.chat?.id.toString() || '',
          'app_access_requested',
          true,
          'launch_app_button'
        );

      } catch (error) {
        await this.logError(ctx, error as Error, 'app command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Profile command
    this.bot.command('profile', async (ctx: BotContext) => {
      const startTime = Date.now();
      const userId = ctx.from?.id.toString();
      if (!userId) return;

      try {
        await this.logCommand(ctx, 'profile');

        // Call your API to get profile data
        const response = await fetch(`${process.env.APP_URL || 'https://localhost:3000'}/api/profile/${userId}`);
        if (response.ok) {
          const profile = await response.json();
          const profileMessage = `👤 Your Profile:

Name: ${profile.name || 'Not set'}
Age: ${profile.age || 'Not set'}
Location: ${profile.country || 'Not set'}
Interests: ${profile.interests?.join(', ') || 'None set'}

Want to update? Use the /app command to open TravelMate!`;

          await ctx.reply(profileMessage);

          const responseTime = Date.now() - startTime;
          await this.logBotResponse(ctx, profileMessage, responseTime);

          // Log profile data accessed
          await this.logger.logUserAction(
            userId,
            ctx.chat?.id.toString() || '',
            'profile_viewed',
            false,
            'profile_command'
          );

        } else {
          const noProfileMessage = '🔄 Profile not found. Create your profile in the TravelMate app!';
          await ctx.reply(noProfileMessage, {
            reply_markup: {
              inline_keyboard: [
                [{ text: '📝 Create Profile', web_app: { url: `${process.env.MINI_APP_URL || 'https://localhost:3000'}/profile` } }]
              ]
            }
          });

          const responseTime = Date.now() - startTime;
          await this.logBotResponse(ctx, noProfileMessage, responseTime);
        }
      } catch (error) {
        await this.logError(ctx, error as Error, 'profile command');
        await ctx.reply('❌ Sorry, there was an error getting your profile. Please try again later.');
      }
    });

    // Matches command
    this.bot.command('matches', async (ctx: BotContext) => {
      const startTime = Date.now();
      const userId = ctx.from?.id.toString();
      if (!userId) return;

      try {
        await this.logCommand(ctx, 'matches');

        const response = await fetch(`${process.env.APP_URL || 'https://localhost:3000'}/api/matches/${userId}`);
        if (response.ok) {
          const matches = await response.json();
          if (matches.length > 0) {
            const matchMessage = `💫 Your Recent Matches:

${matches.slice(0, 3).map((match: any, index: number) => 
  `${index + 1}. ${match.name} from ${match.country}
   Interests: ${match.interests?.slice(0, 3).join(', ')}`
).join('\n\n')}

${matches.length > 3 ? `\n... and ${matches.length - 3} more!` : ''}

Open the app to connect with your matches!`;

            await ctx.reply(matchMessage, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '💬 View All Matches', web_app: { url: `${process.env.MINI_APP_URL || 'https://localhost:3000'}/home` } }]
                ]
              }
            });

            const responseTime = Date.now() - startTime;
            await this.logBotResponse(ctx, matchMessage, responseTime);

            // Log matches accessed
            await this.logger.logUserAction(
              userId,
              ctx.chat?.id.toString() || '',
              'matches_viewed',
              false,
              'matches_command'
            );

          } else {
            const noMatchesMessage = '🔍 No matches yet! Complete your profile to start matching with fellow travelers.';
            await ctx.reply(noMatchesMessage, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Find Matches', web_app: { url: `${process.env.MINI_APP_URL || 'https://localhost:3000'}/home` } }]
                ]
              }
            });

            const responseTime = Date.now() - startTime;
            await this.logBotResponse(ctx, noMatchesMessage, responseTime);
          }
        } else {
          await ctx.reply('❌ Unable to fetch matches. Please try again later.');
        }
      } catch (error) {
        await this.logError(ctx, error as Error, 'matches command');
        await ctx.reply('❌ Sorry, there was an error getting your matches. Please try again later.');
      }
    });

    // Notifications toggle
    this.bot.command('notifications', async (ctx: BotContext) => {
      try {
        await this.logCommand(ctx, 'notifications');

        // Handle text message for notifications command
        const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
        const args = messageText.split(' ');
        const action = args[1]?.toLowerCase();

        let responseMessage: string;

        if (action === 'on' || action === 'off') {
          // Here you would save the notification preference to your database
          responseMessage = `🔔 Notifications turned ${action}!`;
          
          // Log notification preference change
          await this.logger.logUserAction(
            ctx.from?.id.toString() || '',
            ctx.chat?.id.toString() || '',
            `notifications_${action}`,
            false,
            'notification_toggle'
          );
        } else {
          responseMessage = `🔔 Notification Settings:

Use:
• /notifications on - Enable match notifications
• /notifications off - Disable notifications

Current status: You'll receive notifications when you get new matches!`;
        }

        await ctx.reply(responseMessage);
        await this.logBotResponse(ctx, responseMessage);

      } catch (error) {
        await this.logError(ctx, error as Error, 'notifications command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Destinations command
    this.bot.command('destinations', async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        await this.logCommand(ctx, 'destinations');

        const destinations = `🌟 Popular Destinations on TravelMate:

🇻🇳 Vietnam:
   • Da Nang - Beautiful beaches & culture
   • Nha Trang - Tropical paradise

🇮🇩 Bali:
   • Canggu - Surf & sunset vibes
   • Ubud - Rice terraces & spirituality
   • Bukit - Clifftop views

🇹🇭 Thailand:
   • Bangkok - Urban adventures
   • Phuket - Island life
   • Chiang Mai - Mountain culture

🇱🇰 Sri Lanka:
   • Colombo - City exploration
   • Kandy - Hill country beauty

Find travel buddies for these amazing places in the app!`;

        await ctx.reply(destinations, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🗺️ Find Travel Buddies', web_app: { url: `${process.env.MINI_APP_URL || 'https://localhost:3000'}/home` } }]
            ]
          }
        });

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, destinations, responseTime);

        // Log destinations viewed
        await this.logger.logUserAction(
          ctx.from?.id.toString() || '',
          ctx.chat?.id.toString() || '',
          'destinations_viewed',
          false,
          'destinations_command'
        );

      } catch (error) {
        await this.logError(ctx, error as Error, 'destinations command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Tips command
    this.bot.command('tips', async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        await this.logCommand(ctx, 'tips');

        const tips = [
          "💡 Complete your profile with interests and hobbies for better matches!",
          "🌟 Be specific about your travel plans and dates for more relevant connections.",
          "📸 Add a good profile photo to increase your match rate!",
          "💬 Don't be shy - reach out to your matches and start conversations!",
          "🎯 Use the question game to break the ice with new connections.",
          "🔔 Enable notifications to stay updated on new matches!"
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        const tipMessage = `💡 Travel Tip:\n\n${randomTip}`;
        
        await ctx.reply(tipMessage);

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, tipMessage, responseTime);

        // Log tip sent
        await this.logger.logNotification(
          ctx.from?.id.toString() || '',
          ctx.chat?.id.toString() || '',
          'travel_tip',
          tipMessage,
          { tip: randomTip }
        );

      } catch (error) {
        await this.logError(ctx, error as Error, 'tips command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Support command
    this.bot.command('support', async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        await this.logCommand(ctx, 'support');

        const supportMessage = `🆘 Need Help?

For technical issues or questions about TravelMate:

📧 Email: support@travelmate.app
💬 Telegram: @TravelMateSupport

We typically respond within 24 hours!

You can also check our FAQ in the app settings.`;

        await ctx.reply(supportMessage, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '⚙️ App Settings', web_app: { url: `${process.env.MINI_APP_URL || 'https://localhost:3000'}/settings` } }]
            ]
          }
        });

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, supportMessage, responseTime);

        // Log support request
        await this.logger.logUserAction(
          ctx.from?.id.toString() || '',
          ctx.chat?.id.toString() || '',
          'support_requested',
          false,
          'support_command'
        );

      } catch (error) {
        await this.logError(ctx, error as Error, 'support command');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Handle text messages
    this.bot.on('text', async (ctx: BotContext) => {
      const startTime = Date.now();
      
      try {
        // Get message text safely
        const messageText = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
        const message = messageText.toLowerCase();
        
        // Log user message
        await this.logUserMessage(ctx, messageText);

        let responseMessage = '';

        if (message.includes('hello') || message.includes('hi')) {
          responseMessage = '👋 Hello! Use /help to see what I can do, or /app to open TravelMate!';
        } else if (message.includes('match') || message.includes('buddy')) {
          responseMessage = '🔍 Looking for travel buddies? Use /matches to see your connections or /app to find new ones!';
        } else {
          responseMessage = '🤖 I didn\'t understand that. Use /help to see available commands!';
        }

        await ctx.reply(responseMessage);

        const responseTime = Date.now() - startTime;
        await this.logBotResponse(ctx, responseMessage, responseTime);

      } catch (error) {
        await this.logError(ctx, error as Error, 'text message handling');
        await ctx.reply('❌ Something went wrong. Please try again later.');
      }
    });

    // Error handling
    this.bot.catch(async (err, ctx) => {
      console.error(`Bot error for ${ctx.updateType}:`, err);
      await this.logError(ctx, err as Error, `Bot error in ${ctx.updateType}`);
      await ctx.reply('❌ Something went wrong. Please try again later or contact support.');
    });
  }

  // Method to send notifications to users
  async sendMatchNotification(userId: string, matchData: any) {
    try {
      const message = `🎉 New Match Alert!

You've been matched with ${matchData.name} from ${matchData.country}!

Common interests: ${matchData.commonInterests?.join(', ')}

Ready to connect? Open the app to start chatting!`;

      await this.bot.telegram.sendMessage(userId, message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💬 View Match', web_app: { url: `${process.env.MINI_APP_URL}/home` } }]
          ]
        }
      });

      // Log notification sent
      await this.logger.logNotification(
        userId,
        userId, // chatId same as userId for direct messages
        'match_notification',
        message,
        {
          matchName: matchData.name,
          matchCountry: matchData.country,
          commonInterests: matchData.commonInterests
        }
      );

    } catch (error) {
      console.error('Error sending match notification:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendMatchNotification');
    }
  }

  // Method to send travel tips
  async sendTravelTip(userId: string, destination: string) {
    try {
      const tips: { [key: string]: string } = {
        'vietnam': 'Vietnam travel tip: Try local street food, but stick to busy stalls for the freshest options! 🍜',
        'bali': 'Bali tip: Rent a scooter to explore hidden gems, but always wear a helmet! 🛵',
        'thailand': 'Thailand tip: Learn basic Thai phrases - locals appreciate the effort! 🇹🇭',
        'sri lanka': 'Sri Lanka tip: Try Ceylon tea and visit a tea plantation in the hill country! 🍃'
      };

      const tip = tips[destination.toLowerCase()] || 'Safe travels and enjoy your adventure! ✈️';
      const message = `💡 ${tip}`;
      
      await this.bot.telegram.sendMessage(userId, message);

      // Log travel tip sent
      await this.logger.logNotification(
        userId,
        userId,
        'travel_tip',
        message,
        { destination, tip }
      );

    } catch (error) {
      console.error('Error sending travel tip:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendTravelTip');
    }
  }

  // Method to send custom notifications
  async sendCustomNotification(userId: string, message: string, data?: any) {
    try {
      await this.bot.telegram.sendMessage(userId, message);

      // Log custom notification sent
      await this.logger.logNotification(
        userId,
        userId,
        'custom',
        message,
        data
      );

    } catch (error) {
      console.error('Error sending custom notification:', error);
      await this.logger.logError(userId, userId, error as Error, 'sendCustomNotification');
    }
  }

  // Initialize the bot
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.bot.launch();
      this.isInitialized = true;
      console.log('🤖 Telegram Bot initialized successfully');
    } catch (error) {
      console.error('Error initializing bot:', error);
      throw error;
    }
  }

  // Graceful shutdown
  stop() {
    this.bot.stop('SIGINT');
    this.bot.stop('SIGTERM');
  }

  // Get bot instance for additional operations
  getBotInstance() {
    return this.bot;
  }

  // Get logger instance for external logging
  getLogger() {
    return this.logger;
  }
}

export default TelegramBotService; 