# 🤖 AI Content Bot — AI-Powered Product Description Generator

Telegram bot that generates SEO-optimized product titles and descriptions from raw product data using AI (GPT-4 / Claude). Built for e-commerce sellers who need high-quality, conversion-focused product content at scale.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)

## ✨ Features

- 🧠 **AI-Powered Generation** — GPT-4 and Claude for human-quality product descriptions
- 🎯 **SEO Optimization** — Keyword-rich titles and descriptions that rank
- 🌍 **Multi-Language** — Generate content in English, Turkish, German, and more
- 📱 **Telegram Interface** — Send product info, get polished content back instantly
- 📦 **Bulk Processing** — Upload CSV/Excel files for batch content generation
- ✏️ **Tone Control** — Professional, casual, luxury, technical — choose your brand voice
- 📊 **A/B Variations** — Generate multiple versions to test which converts best
- 💾 **History & Templates** — Save and reuse successful content patterns

## 💬 How It Works

```
YOU                                          BOT
 │                                            │
 │  📸 Send product photo + basic info        │
 │  ──────────────────────────────────────▶   │
 │                                            │
 │                              🧠 AI analyzes│
 │                              image + data  │
 │                                            │
 │   📝 Receive optimized title,              │
 │      description, keywords & tags          │
 │  ◀──────────────────────────────────────   │
 │                                            │
 │  ✅ Approve / ✏️ Edit / 🔄 Regenerate      │
 │  ──────────────────────────────────────▶   │
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key or Anthropic API key
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Installation

```bash
# Clone the repository
git clone https://github.com/byheadend/ai-content-bot.git
cd ai-content-bot

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start the bot
npm run start
```

### Configuration

```env
# AI Provider (openai or anthropic)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_CHAT_ID=your_chat_id

# Generation Settings
DEFAULT_LANGUAGE=en
MAX_TITLE_LENGTH=150
MAX_DESCRIPTION_LENGTH=2000
```

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and quick guide |
| `/generate` | Start generating content for a product |
| `/bulk` | Upload CSV/Excel for batch processing |
| `/templates` | View and manage saved templates |
| `/language <code>` | Set output language (en, tr, de, etc.) |
| `/tone <style>` | Set brand voice (professional, casual, luxury) |
| `/history` | View recently generated content |
| `/stats` | Usage statistics and API costs |

## 📝 Sample Output

**Input:**
```
Product: Wireless Bluetooth Headphones
Brand: SoundMax
Color: Matte Black
Features: ANC, 40hr battery, USB-C, foldable
Price: $79.99
```

**Generated Output:**

### 📌 Title Options
1. `SoundMax Pro Wireless ANC Headphones - 40H Battery, Foldable Design, Matte Black`
2. `Premium Noise-Cancelling Bluetooth Headphones | 40-Hour Playback | SoundMax`

### 📄 Description
```
Experience studio-quality sound without the studio price. The SoundMax Pro 
wireless headphones combine advanced Active Noise Cancellation with an 
impressive 40-hour battery life, so your music never stops.

✅ Active Noise Cancellation — Block out the world and focus on what matters
✅ 40-Hour Battery — A full work week on a single charge  
✅ USB-C Fast Charging — 10 minutes = 3 hours of playback
✅ Foldable Design — Compact enough for any bag or backpack
✅ Premium Matte Black — Sleek, professional look for any setting

From morning commutes to late-night sessions, these headphones 
deliver crystal-clear audio with deep bass and crisp highs.
```

### 🏷️ Suggested Keywords
`wireless headphones, noise cancelling, ANC, bluetooth headphones, 40 hour battery, USB-C headphones, foldable headphones`

## 📊 Performance

| Metric | Value |
|--------|-------|
| Avg. generation time | 3-5 seconds |
| Daily capacity | 500+ products |
| Languages supported | 10+ |
| API cost per product | ~$0.02 |
| User satisfaction | 4.8/5 |

## 📁 Project Structure

```
ai-content-bot/
├── src/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Configuration
│   ├── ai/
│   │   ├── openai.ts         # OpenAI integration
│   │   ├── anthropic.ts      # Claude integration
│   │   └── prompts.ts        # Prompt templates
│   ├── telegram/
│   │   ├── bot.ts            # Bot initialization
│   │   ├── commands.ts       # Command handlers
│   │   ├── handlers.ts       # Message handlers
│   │   └── keyboards.ts      # Inline keyboards
│   ├── content/
│   │   ├── generator.ts      # Content generation logic
│   │   ├── optimizer.ts      # SEO optimization
│   │   └── templates.ts      # Template management
│   ├── database/
│   │   ├── models.ts         # Data models
│   │   └── queries.ts        # CRUD operations
│   └── utils/
│       ├── csv-parser.ts     # Bulk upload parser
│       ├── image-analyzer.ts # Product image analysis
│       └── logger.ts         # Logging
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **AI:** OpenAI GPT-4o / Anthropic Claude
- **Bot Framework:** grammy (Telegram Bot API)
- **Database:** SQLite (lightweight, zero-config)
- **Image Analysis:** OpenAI Vision API
- **Bulk Processing:** csv-parser + xlsx

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by [Serkan Tastan](https://github.com/byheadend)**
