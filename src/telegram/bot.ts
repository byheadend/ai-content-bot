import { Bot, Context, InlineKeyboard } from 'grammy';
import {
  generateProductContent,
  ProductInput,
  ContentTone,
  ContentLanguage,
  GeneratedContent,
} from '../ai/generator';
import { saveGeneration, getRecentGenerations, getUsageStats } from '../database/queries';
import { logger } from '../utils/logger';

// User session state
const userSessions = new Map<number, {
  step: 'idle' | 'awaiting_name' | 'awaiting_features' | 'awaiting_brand';
  productInput: Partial<ProductInput>;
  language: ContentLanguage;
  tone: ContentTone;
}>();

/**
 * Creates and configures the Telegram bot.
 */
export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // ─── /start ────────────────────────────────────────────────

  bot.command('start', async (ctx: Context) => {
    await ctx.reply(
      `🤖 *AI Content Bot*\n\n` +
      `I generate SEO-optimized product descriptions using AI.\n\n` +
      `*Quick Start:*\n` +
      `Just send me a product name and details, and I'll create:\n` +
      `✅ Multiple title variations\n` +
      `✅ SEO-optimized description\n` +
      `✅ Keyword suggestions\n` +
      `✅ Benefit-focused bullet points\n\n` +
      `*Commands:*\n` +
      `/generate — Start content generation\n` +
      `/language — Set output language\n` +
      `/tone — Set writing tone\n` +
      `/history — Recent generations\n` +
      `/stats — Usage statistics\n` +
      `/help — Show this message`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /generate ─────────────────────────────────────────────

  bot.command('generate', async (ctx: Context) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    userSessions.set(chatId, {
      step: 'awaiting_name',
      productInput: {},
      language: 'en',
      tone: 'professional',
    });

    await ctx.reply(
      `📝 *Let's create product content!*\n\n` +
      `Send me the product information in this format:\n\n` +
      `\`Product: Wireless Bluetooth Headphones\n` +
      `Brand: SoundMax\n` +
      `Features: ANC, 40hr battery, USB-C\n` +
      `Color: Matte Black\n` +
      `Price: 79.99\`\n\n` +
      `Or just send the product name and I'll work with that!`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── /language ─────────────────────────────────────────────

  bot.command('language', async (ctx: Context) => {
    const keyboard = new InlineKeyboard()
      .text('🇬🇧 English', 'lang_en')
      .text('🇹🇷 Türkçe', 'lang_tr')
      .row()
      .text('🇩🇪 Deutsch', 'lang_de')
      .text('🇫🇷 Français', 'lang_fr')
      .text('🇪🇸 Español', 'lang_es');

    await ctx.reply('🌍 Select output language:', { reply_markup: keyboard });
  });

  // ─── /tone ─────────────────────────────────────────────────

  bot.command('tone', async (ctx: Context) => {
    const keyboard = new InlineKeyboard()
      .text('👔 Professional', 'tone_professional')
      .text('😊 Casual', 'tone_casual')
      .row()
      .text('💎 Luxury', 'tone_luxury')
      .text('🔧 Technical', 'tone_technical')
      .text('🤗 Friendly', 'tone_friendly');

    await ctx.reply('🎨 Select writing tone:', { reply_markup: keyboard });
  });

  // ─── /history ──────────────────────────────────────────────

  bot.command('history', async (ctx: Context) => {
    const recent = getRecentGenerations(5);
    if (recent.length === 0) {
      await ctx.reply('📭 No recent generations. Use /generate to create content!');
      return;
    }

    let message = '📋 *Recent Generations:*\n\n';
    for (const gen of recent) {
      message += `*${gen.id}.* ${gen.product_name}\n`;
      message += `   📊 SEO: ${gen.seo_score}/100 | 🗣 ${gen.language} | ${gen.created_at}\n\n`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
  });

  // ─── /stats ────────────────────────────────────────────────

  bot.command('stats', async (ctx: Context) => {
    const stats = getUsageStats();
    await ctx.reply(
      `📊 *Usage Statistics*\n\n` +
      `📝 Total generations: ${stats.totalGenerations}\n` +
      `🔤 Total tokens used: ${stats.totalTokens.toLocaleString()}\n` +
      `💰 Estimated cost: $${(stats.totalTokens * 0.00001).toFixed(4)}\n` +
      `📊 Avg SEO score: ${stats.avgSeoScore}/100\n` +
      `📅 Today: ${stats.todayGenerations} generations`,
      { parse_mode: 'Markdown' }
    );
  });

  // ─── Callback Queries (Inline Buttons) ─────────────────────

  bot.callbackQuery(/^lang_(.+)$/, async (ctx) => {
    const lang = ctx.match![1] as ContentLanguage;
    const chatId = ctx.chat?.id;
    if (chatId) {
      const session = userSessions.get(chatId) || {
        step: 'idle' as const,
        productInput: {},
        language: 'en' as ContentLanguage,
        tone: 'professional' as ContentTone,
      };
      session.language = lang;
      userSessions.set(chatId, session);
    }

    const names: Record<string, string> = {
      en: '🇬🇧 English',
      tr: '🇹🇷 Türkçe',
      de: '🇩🇪 Deutsch',
      fr: '🇫🇷 Français',
      es: '🇪🇸 Español',
    };

    await ctx.answerCallbackQuery(`Language set to ${names[lang]}`);
    await ctx.editMessageText(`✅ Language set to ${names[lang]}`);
  });

  bot.callbackQuery(/^tone_(.+)$/, async (ctx) => {
    const tone = ctx.match![1] as ContentTone;
    const chatId = ctx.chat?.id;
    if (chatId) {
      const session = userSessions.get(chatId) || {
        step: 'idle' as const,
        productInput: {},
        language: 'en' as ContentLanguage,
        tone: 'professional' as ContentTone,
      };
      session.tone = tone;
      userSessions.set(chatId, session);
    }

    await ctx.answerCallbackQuery(`Tone set to ${tone}`);
    await ctx.editMessageText(`✅ Tone set to ${tone}`);
  });

  bot.callbackQuery('regenerate', async (ctx) => {
    await ctx.answerCallbackQuery('Regenerating...');
    // Trigger regeneration with last input
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    const session = userSessions.get(chatId);
    if (session?.productInput?.name) {
      await handleGeneration(ctx, session.productInput as ProductInput, session.language, session.tone);
    }
  });

  // ─── Text Message Handler (Product Input) ─────────────────

  bot.on('message:text', async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const text = ctx.message.text;
    if (text.startsWith('/')) return; // Ignore commands

    const session = userSessions.get(chatId) || {
      step: 'idle' as const,
      productInput: {},
      language: 'en' as ContentLanguage,
      tone: 'professional' as ContentTone,
    };

    // Parse product input from text
    const input = parseProductInput(text);
    session.productInput = input;
    userSessions.set(chatId, session);

    await handleGeneration(ctx, input as ProductInput, session.language, session.tone);
  });

  bot.catch((err) => {
    logger.error('Bot error', { error: err.message });
  });

  return bot;
}

/**
 * Handles the content generation flow.
 */
async function handleGeneration(
  ctx: Context,
  input: ProductInput,
  language: ContentLanguage,
  tone: ContentTone
): Promise<void> {
  await ctx.reply('⏳ Generating content... This takes 3-5 seconds.');

  try {
    const content = await generateProductContent(input, { language, tone });

    // Format and send the result
    let message = `✅ *Content Generated!*\n\n`;

    // Titles
    message += `📌 *Title Options:*\n`;
    content.titles.forEach((title, i) => {
      message += `${i + 1}. \`${title}\`\n`;
    });

    // Description
    message += `\n📄 *Description:*\n${content.description}\n`;

    // Bullet points
    if (content.bulletPoints.length > 0) {
      message += `\n✅ *Key Benefits:*\n`;
      content.bulletPoints.forEach((bp) => {
        message += `• ${bp}\n`;
      });
    }

    // Keywords
    message += `\n🏷 *Keywords:*\n\`${content.keywords.join(', ')}\`\n`;

    // SEO Score
    message += `\n📊 *SEO Score:* ${content.seoScore}/100\n`;
    message += `🔤 *Tokens Used:* ${content.tokensUsed}`;

    const keyboard = new InlineKeyboard()
      .text('🔄 Regenerate', 'regenerate')
      .text('✅ Done', 'done');

    // Split long messages (Telegram 4096 char limit)
    if (message.length > 4000) {
      const mid = message.lastIndexOf('\n', 4000);
      await ctx.reply(message.substring(0, mid), { parse_mode: 'Markdown' });
      await ctx.reply(message.substring(mid), {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    } else {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });
    }

    // Save to database
    saveGeneration(
      input.name,
      JSON.stringify(content),
      language,
      tone,
      content.seoScore,
      content.tokensUsed
    );

    logger.info('Content delivered to user', {
      product: input.name,
      seoScore: content.seoScore,
    });
  } catch (error) {
    await ctx.reply(`❌ Generation failed: ${(error as Error).message}\n\nPlease try again.`);
  }
}

/**
 * Parses structured product input from free-form text.
 */
function parseProductInput(text: string): Partial<ProductInput> {
  const input: Partial<ProductInput> = {};

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':').trim();

    if (!value) {
      // Single line — treat as product name
      if (!input.name) input.name = line;
      continue;
    }

    const keyLower = key.toLowerCase().trim();
    switch (keyLower) {
      case 'product':
      case 'name':
        input.name = value;
        break;
      case 'brand':
        input.brand = value;
        break;
      case 'category':
        input.category = value;
        break;
      case 'color':
      case 'colour':
        input.color = value;
        break;
      case 'material':
        input.material = value;
        break;
      case 'dimensions':
      case 'size':
        input.dimensions = value;
        break;
      case 'price':
        input.price = parseFloat(value.replace(/[^0-9.]/g, ''));
        break;
      case 'features':
        input.features = value.split(',').map((f) => f.trim());
        break;
      case 'audience':
      case 'target':
        input.targetAudience = value;
        break;
      default:
        input.additionalInfo = (input.additionalInfo || '') + `${key}: ${value}\n`;
    }
  }

  if (!input.name && lines.length > 0) {
    input.name = lines[0];
  }

  return input;
}
