import OpenAI from 'openai';
import { logger } from '../utils/logger';

export type ContentTone = 'professional' | 'casual' | 'luxury' | 'technical' | 'friendly';
export type ContentLanguage = 'en' | 'tr' | 'de' | 'fr' | 'es';

export interface ProductInput {
  name: string;
  brand?: string;
  category?: string;
  features?: string[];
  price?: number;
  color?: string;
  material?: string;
  dimensions?: string;
  targetAudience?: string;
  additionalInfo?: string;
}

export interface GeneratedContent {
  titles: string[];
  description: string;
  keywords: string[];
  bulletPoints: string[];
  seoScore: number;
  tokensUsed: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates SEO-optimized product content using GPT-4.
 */
export async function generateProductContent(
  input: ProductInput,
  options: {
    language?: ContentLanguage;
    tone?: ContentTone;
    maxTitleLength?: number;
    maxDescriptionLength?: number;
    variations?: number;
  } = {}
): Promise<GeneratedContent> {
  const {
    language = 'en',
    tone = 'professional',
    maxTitleLength = 150,
    maxDescriptionLength = 2000,
    variations = 3,
  } = options;

  const prompt = buildPrompt(input, language, tone, maxTitleLength, maxDescriptionLength, variations);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language, tone),
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI');

    const parsed = JSON.parse(content);
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info('Content generated', {
      product: input.name,
      language,
      tone,
      tokensUsed,
    });

    return {
      titles: parsed.titles || [],
      description: parsed.description || '',
      keywords: parsed.keywords || [],
      bulletPoints: parsed.bulletPoints || parsed.bullet_points || [],
      seoScore: calculateSeoScore(parsed),
      tokensUsed,
    };
  } catch (error) {
    logger.error('Content generation failed', {
      product: input.name,
      error: (error as Error).message,
    });
    throw error;
  }
}

function getSystemPrompt(language: ContentLanguage, tone: ContentTone): string {
  const languageNames: Record<ContentLanguage, string> = {
    en: 'English',
    tr: 'Turkish',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
  };

  const toneDescriptions: Record<ContentTone, string> = {
    professional: 'professional, authoritative, and trustworthy',
    casual: 'conversational, friendly, and approachable',
    luxury: 'premium, exclusive, and sophisticated',
    technical: 'detailed, specifications-focused, and informative',
    friendly: 'warm, helpful, and engaging',
  };

  return `You are an expert e-commerce copywriter and SEO specialist. 
Generate product content in ${languageNames[language]} with a ${toneDescriptions[tone]} tone.

IMPORTANT RULES:
1. Write content that is optimized for e-commerce search engines
2. Include relevant keywords naturally - do NOT keyword stuff
3. Focus on BENEFITS, not just features
4. Use power words that drive conversions
5. Every title must be unique and compelling
6. Description should be scannable with clear structure
7. Always respond in valid JSON format

Response format:
{
  "titles": ["title1", "title2", "title3"],
  "description": "full product description with formatting",
  "keywords": ["keyword1", "keyword2", ...],
  "bulletPoints": ["benefit1", "benefit2", ...],
  "category_suggestion": "suggested category"
}`;
}

function buildPrompt(
  input: ProductInput,
  language: ContentLanguage,
  tone: ContentTone,
  maxTitleLength: number,
  maxDescriptionLength: number,
  variations: number
): string {
  let prompt = `Generate e-commerce product content for:\n\n`;
  prompt += `Product: ${input.name}\n`;

  if (input.brand) prompt += `Brand: ${input.brand}\n`;
  if (input.category) prompt += `Category: ${input.category}\n`;
  if (input.color) prompt += `Color: ${input.color}\n`;
  if (input.material) prompt += `Material: ${input.material}\n`;
  if (input.dimensions) prompt += `Dimensions: ${input.dimensions}\n`;
  if (input.price) prompt += `Price: $${input.price}\n`;
  if (input.targetAudience) prompt += `Target Audience: ${input.targetAudience}\n`;

  if (input.features && input.features.length > 0) {
    prompt += `\nFeatures:\n`;
    input.features.forEach((f) => (prompt += `- ${f}\n`));
  }

  if (input.additionalInfo) {
    prompt += `\nAdditional Info: ${input.additionalInfo}\n`;
  }

  prompt += `\nRequirements:\n`;
  prompt += `- Generate ${variations} unique title variations (max ${maxTitleLength} chars each)\n`;
  prompt += `- Description max ${maxDescriptionLength} characters\n`;
  prompt += `- Include 5-10 SEO keywords\n`;
  prompt += `- Include 4-6 bullet points highlighting key benefits\n`;

  return prompt;
}

/**
 * Calculates an approximate SEO score (0-100) based on content quality.
 */
function calculateSeoScore(content: any): number {
  let score = 0;

  // Title quality (max 30 points)
  if (content.titles?.length >= 2) score += 15;
  if (content.titles?.[0]?.length > 30 && content.titles?.[0]?.length < 150) score += 15;

  // Description quality (max 30 points)
  if (content.description?.length > 200) score += 15;
  if (content.description?.length > 500) score += 15;

  // Keywords (max 20 points)
  if (content.keywords?.length >= 5) score += 10;
  if (content.keywords?.length >= 8) score += 10;

  // Bullet points (max 20 points)
  if (content.bulletPoints?.length >= 3) score += 10;
  if (content.bulletPoints?.length >= 5) score += 10;

  return Math.min(100, score);
}
