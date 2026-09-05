import dotenv from 'dotenv';
import { createBot } from './telegram/bot';
import { initDatabase } from './database/queries';
import { logger } from './utils/logger';

dotenv.config();

/**
 * AI Content Bot — Product Description Generator
 *
 * Telegram bot that generates SEO-optimized product content
 * using OpenAI GPT-4 with multi-language and tone support.
 *
 * @author Serkan Tastan
 */
async function main(): Promise<void> {
  logger.info('🤖 AI Content Bot starting...');

  // Validate required config
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!botToken) {
    logger.error('TELEGRAM_BOT_TOKEN is required');
    process.exit(1);
  }

  if (!apiKey) {
    logger.error('OPENAI_API_KEY is required');
    process.exit(1);
  }

  // Initialize database
  initDatabase();
  logger.info('✅ Database initialized');

  // Create and start bot
  const bot = createBot(botToken);
  bot.start();
  logger.info('✅ Telegram bot started');

  logger.info('🟢 AI Content Bot is running. Send /start to your bot!');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await bot.stop();
    logger.info('👋 Bot stopped');
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Fatal error', { error: error.message });
  process.exit(1);
});
