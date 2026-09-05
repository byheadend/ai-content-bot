import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data', 'content-bot.db');

let db: Database.Database;

export function initDatabase(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name  TEXT NOT NULL,
      content_json  TEXT NOT NULL,
      language      TEXT NOT NULL DEFAULT 'en',
      tone          TEXT NOT NULL DEFAULT 'professional',
      seo_score     INTEGER DEFAULT 0,
      tokens_used   INTEGER DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_generations_date 
      ON generations(created_at DESC);
  `);
}

export function saveGeneration(
  productName: string,
  contentJson: string,
  language: string,
  tone: string,
  seoScore: number,
  tokensUsed: number
): void {
  const stmt = db.prepare(`
    INSERT INTO generations (product_name, content_json, language, tone, seo_score, tokens_used)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(productName, contentJson, language, tone, seoScore, tokensUsed);
}

export function getRecentGenerations(limit: number = 10): any[] {
  return db.prepare(`
    SELECT id, product_name, language, seo_score, 
           strftime('%Y-%m-%d %H:%M', created_at) as created_at
    FROM generations 
    ORDER BY created_at DESC 
    LIMIT ?
  `).all(limit);
}

export function getUsageStats(): {
  totalGenerations: number;
  totalTokens: number;
  avgSeoScore: number;
  todayGenerations: number;
} {
  const total = db.prepare(`
    SELECT COUNT(*) as count, 
           COALESCE(SUM(tokens_used), 0) as tokens,
           COALESCE(AVG(seo_score), 0) as avg_score
    FROM generations
  `).get() as any;

  const today = db.prepare(`
    SELECT COUNT(*) as count 
    FROM generations 
    WHERE date(created_at) = date('now')
  `).get() as any;

  return {
    totalGenerations: total.count,
    totalTokens: total.tokens,
    avgSeoScore: Math.round(total.avg_score),
    todayGenerations: today.count,
  };
}

export function getDatabase(): Database.Database {
  return db;
}
