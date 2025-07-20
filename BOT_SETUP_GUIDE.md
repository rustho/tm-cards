# 🤖 TravelMate Bot Setup Guide

This guide will help you add Telegram Bot functionality to your TravelMate Mini App with comprehensive logging and notification features.

## Overview

The bot adds these features to your TravelMate app:
- **User Engagement**: Welcome messages and help commands
- **Quick Access**: Direct buttons to open the Mini App
- **Profile Management**: Check profile status via bot commands
- **Match Notifications**: Get notified about new matches
- **Travel Tips**: Random travel advice and destination info
- **Support**: Easy access to help and support
- **📊 Comprehensive Logging**: Track all bot interactions and analytics
- **🔔 Smart Notifications**: Automated and scheduled notifications

## 🚀 Quick Setup

### 1. Run the Automated Setup

```bash
pnpm run bot:setup
```

This script will:
- Guide you through creating a bot with @BotFather
- Configure environment variables
- Set up bot commands automatically

### 2. Start Your Development Server

```bash
pnpm run dev
```

### 3. Test the Bot

Message your bot on Telegram and try commands like `/start` or `/help`.

## 📋 Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot:

### Step 1: Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "TravelMate Helper")
4. Choose a username (e.g., "travelmatehelper_bot")
5. Copy the bot token that BotFather provides

### Step 2: Configure Environment Variables

Create or update your `.env.local` file:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
MINI_APP_URL=https://localhost:3000
APP_URL=https://localhost:3000

# Existing configurations...
MONGODB_URI=your_mongodb_connection_string
GOOGLE_SHEETS_PRIVATE_KEY=your_google_sheets_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_google_sheets_client_email
SPREADSHEET_ID=your_spreadsheet_id
```

### Step 3: Set Bot Commands (Optional)

You can manually set bot commands using BotFather:

1. Send `/setcommands` to @BotFather
2. Select your bot
3. Send this command list:

```
start - Start using TravelMate bot
app - Open TravelMate Mini App
profile - View your profile
matches - Check your matches
notifications - Manage notifications
destinations - View popular destinations
tips - Get travel tips
help - Show help message
support - Contact support
```

## 🎯 Bot Features

### Available Commands

| Command | Description | Logged Data |
|---------|-------------|------------|
| `/start` | Welcome message with Mini App access button | User info, session start, welcome notification |
| `/app` | Quick button to open TravelMate Mini App | App access requests, button clicks |
| `/profile` | Check your profile status and data | Profile views, data access |
| `/matches` | View your recent travel buddy matches | Match views, interaction tracking |
| `/notifications on/off` | Toggle match notifications | Preference changes, settings updates |
| `/destinations` | Browse popular travel destinations | Destination interest tracking |
| `/tips` | Get random travel tips | Tip delivery, user engagement |
| `/help` | Show all available commands | Help requests, feature discovery |
| `/support` | Get support contact information | Support requests, issue tracking |

### Smart Text Responses

The bot also responds to natural language:
- "Hello" or "Hi" → Greeting with help options
- Messages containing "match" or "buddy" → Match-related suggestions
- Other text → Help command suggestion

## 📊 Logging & Analytics

### What Gets Logged

- **User Messages**: All incoming messages with user info
- **Bot Responses**: All outgoing messages with response times
- **Command Usage**: Which commands users use most
- **Notifications Sent**: Match alerts, tips, reminders
- **User Actions**: Mini App opens, button clicks
- **Errors**: Failed operations with full context
- **Sessions**: Conversation tracking and user journeys

### Log Structure

```typescript
{
  userId: "123456789",
  username: "john_doe",
  firstName: "John",
  chatId: "123456789",
  type: "command_used", // message_received, message_sent, notification_sent, error, user_action
  command: "matches",
  message: "User requested matches",
  timestamp: "2024-01-15T10:30:00Z",
  sessionId: "session_123456789_1642234200000",
  responseTime: 150, // milliseconds
  success: true
}
```

## 🔧 Bot Management

### Development Commands

```bash
# Bot Control
pnpm run bot:status    # Check bot status
pnpm run bot:start     # Start bot in polling mode
pnpm run bot:stop      # Stop the bot
pnpm run bot:webhook   # Set up webhook (production)

# Logging & Analytics
pnpm run bot:logs      # View recent bot activity
pnpm run bot:analytics # Get 7-day analytics summary
pnpm run bot:cleanup   # Clean old logs (30+ days)
```

### API Endpoints

**Bot Management:**
- `GET /api/bot/start` - Check bot status
- `POST /api/bot/start` - Start bot in polling mode
- `DELETE /api/bot/start` - Stop the bot
- `GET /api/bot/webhook` - Set up webhook for production
- `POST /api/bot/webhook` - Handle webhook updates

**Logging & Analytics:**
- `GET /api/bot/logs?recent=true&limit=20` - Recent activity
- `GET /api/bot/logs?analytics=true&days=7` - Analytics summary
- `GET /api/bot/logs?userId=123456789&limit=50` - User conversation history
- `DELETE /api/bot/logs?days=30` - Cleanup old logs

## 🔔 Notification System

### Using the Notification Service

```typescript
import BotNotificationService from '@/lib/botNotificationService';

const notificationService = BotNotificationService.getInstance();

// Send match notification
await notificationService.notifyNewMatch('123456789', {
  id: 'match_123',
  name: 'John Doe',
  country: 'Thailand',
  interests: ['Photography', 'Hiking', 'Food']
});

// Profile completion reminder
await notificationService.sendProfileReminder('123456789', ['Age', 'Photo']);

// Daily travel tip
await notificationService.sendDailyTravelTip('123456789', ['thailand', 'bali']);

// Custom notification templates
await notificationService.sendCustomNotification('123456789', 'welcome');

// Bulk notifications
await notificationService.sendBulkNotification(
  ['123456789', '987654321'],
  '🎉 TravelMate is now available in 10 new countries!'
);
```

### Notification Templates

- **`welcome`**: New user onboarding
- **`match_timeout`**: Urgent match expiration alerts
- **`app_update`**: Feature announcements
- **`event_invite`**: Community event invitations

## 📱 Integration with Mini App

### Profile Integration
```typescript
// In your profile update logic
if (profileCompleted) {
  await notificationService.sendCustomNotification(userId, 'welcome');
} else {
  await notificationService.sendProfileReminder(userId, missingFields);
}
```

### Match Integration  
```typescript
// In your matching algorithm
const match = await createMatch(user1, user2);
await notificationService.notifyNewMatch(user1.telegramId, {
  id: match.id,
  name: user2.name,
  country: user2.country,
  interests: user2.interests
});
```

### Analytics Integration
```typescript
// Get bot analytics for admin dashboard
const analytics = await fetch('/api/bot/logs?analytics=true&days=30');
const data = await analytics.json();

console.log(`
📊 Bot Analytics (30 days):
- Total interactions: ${data.data.totalInteractions}
- Unique users: ${data.data.uniqueUsers}
- Mini App opens: ${data.data.miniAppOpens}
- Most used command: ${data.data.commandUsage[0]?._id}
`);
```

## 🌍 Production Deployment

### Using Webhooks (Recommended)

1. Deploy your app to a public URL (e.g., Vercel, Railway)
2. Update environment variables:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   MINI_APP_URL=https://your-app.vercel.app
   APP_URL=https://your-app.vercel.app
   ```
3. Set webhook: `GET https://your-app.vercel.app/api/bot/webhook`

### Database Considerations

The logging system uses MongoDB collections:
- `botlogs` - All bot interactions and analytics
- Indexes on `userId`, `timestamp`, `type` for efficient queries
- Automatic cleanup of logs older than 30 days

## 🔐 Security Features

- **Environment Protection**: Bot token secured in environment variables
- **API Integration**: Secure calls to your existing Mini App APIs
- **Error Handling**: Graceful error handling with user-friendly messages
- **Input Validation**: Safe handling of user inputs and commands
- **Rate Limiting**: Built-in delays for bulk notifications
- **Data Privacy**: User data logged securely with proper indexing

## 📈 Analytics & Insights

### Key Metrics Tracked

- **User Engagement**: Command usage, session duration
- **Notification Effectiveness**: Delivery rates, user responses
- **Mini App Conversion**: Bot-to-app transition tracking
- **Error Monitoring**: Failed operations and recovery
- **Feature Usage**: Most popular commands and features

### Sample Analytics Output

```json
{
  "period": "7 days",
  "totalInteractions": 1250,
  "uniqueUsers": 85,
  "commandUsage": [
    { "_id": "start", "count": 45 },
    { "_id": "matches", "count": 38 },
    { "_id": "app", "count": 32 }
  ],
  "notificationsSent": [
    { "_id": "match_notification", "count": 67 },
    { "_id": "travel_tip", "count": 23 }
  ],
  "miniAppOpens": 156,
  "errors": 3,
  "avgInteractionsPerUser": 15
}
```

## 🎨 Customization

### Adding New Commands

Edit `lib/telegramBot.ts` to add new commands:

```typescript
this.bot.command('newcommand', async (ctx: BotContext) => {
  await this.logCommand(ctx, 'newcommand');
  
  const message = 'Your custom response here!';
  await ctx.reply(message);
  
  await this.logBotResponse(ctx, message);
});
```

### Custom Notification Types

Add to `lib/botNotificationService.ts`:

```typescript
async sendCustomAlert(userId: string, alertType: string, data: any) {
  const message = `🚨 ${alertType}: ${data.message}`;
  await this.bot.sendCustomNotification(userId, message, data);
}
```

### Extending Analytics

Add custom metrics to `lib/botLogger.ts`:

```typescript
async getCustomAnalytics(userId: string) {
  const userSessions = await BotLog.distinct('sessionId', { userId });
  const avgSessionLength = await BotLog.aggregate([
    { $match: { userId } },
    { $group: { _id: '$sessionId', count: { $sum: 1 } } },
    { $group: { _id: null, avg: { $avg: '$count' } } }
  ]);
  
  return { sessionCount: userSessions.length, avgSessionLength };
}
```

## 🐛 Troubleshooting

### Common Issues

**Bot doesn't respond:**
- Check if `TELEGRAM_BOT_TOKEN` is set correctly
- Verify bot is started: `pnpm run bot:status`
- Check console logs for errors
- Check MongoDB connection

**Logging not working:**
- Verify MongoDB connection
- Check database permissions
- Monitor console for log errors

**Webhook errors:**
- Ensure your app is accessible via HTTPS
- Check webhook URL is correct
- Verify bot token permissions

**Notifications not sending:**
- Check bot initialization status
- Verify user has interacted with bot first
- Check rate limiting delays

### Debug Mode

Enable debug logging:

```env
DEBUG=telegraf:*
NODE_ENV=development
```

### Log Analysis

```bash
# Check recent errors
curl -X GET 'http://localhost:3000/api/bot/logs?recent=true' | jq '.data[] | select(.type=="error")'

# User interaction summary
curl -X GET 'http://localhost:3000/api/bot/logs?userId=123456789&limit=100'

# Command popularity
curl -X GET 'http://localhost:3000/api/bot/logs?analytics=true' | jq '.data.commandUsage'
```

## 💡 Best Practices

### User Experience
1. **Keep responses concise** - Mobile users prefer brief messages
2. **Use emojis effectively** - Visual cues improve engagement
3. **Provide clear CTAs** - Always include next step buttons
4. **Handle errors gracefully** - Never leave users confused

### Technical
1. **Monitor analytics regularly** - Weekly reviews of bot performance
2. **Clean logs periodically** - Prevent database bloat
3. **Test notifications thoroughly** - Verify delivery before bulk sends
4. **Handle rate limits** - Respect Telegram's API limits

### Privacy & Security
1. **Minimal data logging** - Only log necessary information
2. **Regular log cleanup** - Automated 30-day retention
3. **Secure environment variables** - Never commit tokens
4. **User consent** - Respect notification preferences

## 🆘 Support

Need help? The bot includes a support command (`/support`) that provides:
- Email contact information
- Telegram support channel
- FAQ links
- Direct access to app settings

### Additional Resources

- [Telegraf Documentation](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [MongoDB Logging Best Practices](https://www.mongodb.com/docs/manual/administration/)

---

Your TravelMate bot is now ready with comprehensive logging and notification features to enhance user engagement and provide valuable insights! 🚀📊 