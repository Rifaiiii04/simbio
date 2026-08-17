import { z } from 'zod';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ErrorCode } from '../../shared/errors/codes.js';
import { logger } from '../logger/index.js';
import {
  type LLMProvider,
  type RoadmapGenerationPrompt,
  type GeneratedRoadmapDraft,
  type AiPartnerRecommendationPrompt,
  type AiPartnerRecommendation,
} from './llm.provider.js';

const generatedRoadmapSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  milestones: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000),
        order: z.number().int().min(1),
      }),
    )
    .min(1)
    .max(10),
});

const partnerRecommendationsSchema = z.array(
  z.object({
    candidateId: z.string().min(1),
    aiMatchScore: z.number().min(0).max(100),
    reasoning: z.string().min(1).max(1000),
    suggestedProjectIdea: z.string().min(1).max(1000),
  }),
);

const audioTopicSchema = z.object({
  topic: z.string().min(2).max(200),
});

export class OpenRouterProvider implements LLMProvider {
  async generateRoadmapDraft(prompt: RoadmapGenerationPrompt): Promise<GeneratedRoadmapDraft> {
    const systemInstruction = `You are Simbi, a friendly capybara learning assistant for Simbioly.
Create a structured learning roadmap for a user who wants to learn "${prompt.skillName}".
Goal: "${prompt.goalTitle}".
${prompt.description ? `Description: "${prompt.description}".` : ''}
${prompt.targetOutcome ? `Target Outcome: "${prompt.targetOutcome}".` : ''}

You MUST return ONLY a raw JSON object with this exact structure:
{
  "title": "Roadmap Title",
  "description": "Brief description of this learning path",
  "milestones": [
    {
      "title": "Milestone 1 Title",
      "description": "What to learn or achieve in this milestone",
      "order": 1
    }
  ]
}
Return between 3 to 6 step-by-step milestones ordered logically from beginner to target outcome. Return ONLY valid JSON, no markdown formatting.`;

    try {
      const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://simbioly.local',
          'X-Title': 'Simbioly',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'You are an AI learning path generator. Respond only in valid JSON.' },
            { role: 'user', content: systemInstruction },
          ],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(env.OPENROUTER_TIMEOUT_MS),
      });

      if (!response.ok) {
        logger.error({ status: response.status, text: await response.text() }, 'OpenRouter request failed');
        throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI service unavailable', 503);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Empty response from AI', 502);
      }

      const cleanJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedJson = JSON.parse(cleanJson);
      return generatedRoadmapSchema.parse(parsedJson);
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof SyntaxError || err instanceof z.ZodError) {
        logger.warn({ err }, 'Failed to parse AI output');
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Invalid AI response format', 502);
      }
      logger.error({ err }, 'OpenRouter communication error');
      throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI provider communication failed', 503);
    }
  }

  async recommendPartners(prompt: AiPartnerRecommendationPrompt): Promise<AiPartnerRecommendation[]> {
    const systemInstruction = `You are Simbi, the AI Matchmaker for Simbioly.
Analyze the current user's profile and potential skill exchange candidates below.

Current User:
Name: "${prompt.user.name}"
Bio: "${prompt.user.bio || 'None'}"
Teaches: ${prompt.user.teachSkills.join(', ') || 'None'}
Wants to Learn: ${prompt.user.learnSkills.join(', ') || 'None'}

Candidates List:
${JSON.stringify(prompt.candidates, null, 2)}

For EACH candidate in the candidates list, evaluate reciprocal skill synergy, mutual growth potential, and suggest a creative collaborative project.
You MUST return ONLY a JSON array with objects matching this exact structure:
[
  {
    "candidateId": "uuid-here",
    "aiMatchScore": 95,
    "reasoning": "Direct explanation of why this pair is synergistic",
    "suggestedProjectIdea": "A concrete 2-person collaborative project idea combining their skills"
  }
]
Return ONLY valid JSON array without markdown code blocks.`;

    try {
      const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://simbioly.local',
          'X-Title': 'Simbioly',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'You are an AI skill-exchange matchmaker. Respond ONLY in valid JSON array.' },
            { role: 'user', content: systemInstruction },
          ],
          temperature: 0.6,
        }),
        signal: AbortSignal.timeout(env.OPENROUTER_TIMEOUT_MS),
      });

      if (!response.ok) {
        logger.error({ status: response.status, text: await response.text() }, 'OpenRouter partner recommendation failed');
        throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI service unavailable', 503);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Empty response from AI', 502);
      }

      const cleanJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedJson = JSON.parse(cleanJson);
      return partnerRecommendationsSchema.parse(parsedJson);
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof SyntaxError || err instanceof z.ZodError) {
        logger.warn({ err }, 'Failed to parse AI partner output');
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Invalid AI partner response format', 502);
      }
      logger.error({ err }, 'OpenRouter communication error');
      throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI provider communication failed', 503);
    }
  }

  async generateAudioTopic(skillDomain: string): Promise<string> {
    const systemInstruction = `Generate one random discussion topic about "${skillDomain}" suitable for a beginner/intermediate skill exchange session.
You MUST return ONLY a JSON object with this exact structure:
{
  "topic": "Discussion Topic Title"
}
Return ONLY valid JSON. No explanation, bullet list, or description.`;

    try {
      const response = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://simbioly.local',
          'X-Title': 'Simbioly',
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: 'system', content: 'Respond ONLY in valid JSON format.' },
            { role: 'user', content: systemInstruction },
          ],
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(env.OPENROUTER_TIMEOUT_MS),
      });

      if (!response.ok) {
        logger.error({ status: response.status, text: await response.text() }, 'OpenRouter audio topic generation failed');
        throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI service unavailable', 503);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Empty response from AI', 502);
      }

      const cleanJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedJson = JSON.parse(cleanJson);
      const validated = audioTopicSchema.parse(parsedJson);
      return validated.topic;
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err instanceof SyntaxError || err instanceof z.ZodError) {
        logger.warn({ err }, 'Failed to parse AI topic output');
        throw new AppError(ErrorCode.AI_INVALID_RESPONSE, 'Invalid AI topic response format', 502);
      }
      logger.error({ err }, 'OpenRouter communication error');
      throw new AppError(ErrorCode.AI_UNAVAILABLE, 'AI provider communication failed', 503);
    }
  }
}
