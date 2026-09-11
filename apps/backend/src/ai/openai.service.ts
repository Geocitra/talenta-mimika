import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || process.env.OPENAI_API_KEY || '';
    this.model = this.configService.get<string>('OPENAI_MODEL') || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.baseUrl = this.configService.get<string>('OPENAI_BASE_URL') || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (this.isAvailable()) {
      this.logger.log(`OpenAI Service initialized successfully with model: ${this.model}`);
    } else {
      this.logger.warn('OpenAI API Key not detected. Service will run in Local Fallback mode.');
    }
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().startsWith('sk-'));
  }

  /**
   * Panggilan Chat Completion ke OpenAI API
   * Dilengkapi AbortController timeout 10 detik & graceful fallback return null jika gagal.
   */
  async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    },
  ): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: options?.temperature ?? 0.4,
          max_tokens: options?.maxTokens ?? 1000,
          response_format: options?.jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`OpenAI API returned status ${response.status}: ${errorText}`);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content ? content.trim() : null;
    } catch (error: any) {
      clearTimeout(timeoutId);
      this.logger.warn(`OpenAI completion failed (${error.name || 'Error'}): ${error.message}. Switching to local fallback.`);
      return null;
    }
  }

  /**
   * Panggilan Embeddings ke OpenAI API (text-embedding-3-small)
   */
  async getEmbedding(text: string): Promise<number[] | null> {
    if (!this.isAvailable() || !text?.trim()) {
      return null;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data?.[0]?.embedding || null;
    } catch (error: any) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  private readonly embeddingCache = new Map<string, number[]>();

  /**
   * Mengambil embedding dengan caching in-memory agar hemat token & super cepat
   */
  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const key = (text || '').trim().toLowerCase();
    if (!key) return null;
    if (this.embeddingCache.has(key)) {
      return this.embeddingCache.get(key)!;
    }
    const emb = await this.getEmbedding(key);
    if (emb) {
      this.embeddingCache.set(key, emb);
    }
    return emb;
  }

  /**
   * Menghitung Cosine Similarity antara dua vektor float
   */
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  /**
   * Menghitung kemiripan semantik antara dua teks keahlian (0.0 - 1.0)
   */
  async computeSemanticSimilarity(textA: string, textB: string): Promise<number> {
    const cleanA = (textA || '').trim().toLowerCase();
    const cleanB = (textB || '').trim().toLowerCase();

    if (!cleanA || !cleanB) return 0;
    if (cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA)) {
      return 1.0;
    }

    if (!this.isAvailable()) {
      return 0;
    }

    const [embA, embB] = await Promise.all([
      this.getCachedEmbedding(cleanA),
      this.getCachedEmbedding(cleanB),
    ]);

    if (!embA || !embB) {
      return 0;
    }

    return this.cosineSimilarity(embA, embB);
  }
}
