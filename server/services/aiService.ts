import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AIRequestOptions {
  provider?: 'openai' | 'gemini' | 'auto'
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  feature?: string
}

export interface AIResponse {
  text: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
}

/**
 * Estimate cost in USD per 1K tokens based on model name.
 * Prices as of 2025-Q1 — update when OpenAI/Google change their pricing.
 * Source: https://openai.com/pricing and https://ai.google.dev/pricing
 */
function estimateCostPer1kTokens(model: string): number {
  if (model.includes('gpt-4o-mini')) return 0.00015
  if (model.includes('gpt-4o')) return 0.005
  if (model.includes('gpt-4-turbo')) return 0.01
  if (model.includes('gemini-1.5-flash') || model.includes('gemini-2.0-flash')) return 0.000075
  if (model.includes('gemini-1.5-pro')) return 0.00125
  return 0.001
}

export function calculateCost(totalTokens: number, model: string): number {
  return (totalTokens / 1000) * estimateCostPer1kTokens(model)
}

/**
 * Call OpenAI ChatCompletion API.
 */
async function callOpenAI(
  prompt: string,
  options: AIRequestOptions,
  apiKey: string
): Promise<AIResponse> {
  const client = new OpenAI({ apiKey })
  const model = options.model || 'gpt-4o'
  const start = Date.now()

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  })

  const latencyMs = Date.now() - start
  const choice = completion.choices[0]
  const usage = completion.usage

  return {
    text: choice.message.content ?? '',
    provider: 'openai',
    model,
    promptTokens: usage?.prompt_tokens ?? 0,
    completionTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
    latencyMs,
  }
}

/**
 * Call Google Gemini GenerateContent API.
 */
async function callGemini(
  prompt: string,
  options: AIRequestOptions,
  apiKey: string
): Promise<AIResponse> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const modelName = options.model || 'gemini-1.5-pro'
  const model = genAI.getGenerativeModel({ model: modelName })
  const start = Date.now()

  const fullPrompt = options.systemPrompt ? `${options.systemPrompt}\n\n${prompt}` : prompt
  const result = await model.generateContent(fullPrompt)
  const response = await result.response
  const text = response.text()
  const latencyMs = Date.now() - start

  // Gemini SDK v0.24 provides usageMetadata
  const usage = (response as any).usageMetadata
  // Fallback: rough approximation of ~4 chars per token (less accurate for non-English text)
  const promptTokens: number = usage?.promptTokenCount ?? Math.ceil(fullPrompt.length / 4)
  const completionTokens: number = usage?.candidatesTokenCount ?? Math.ceil(text.length / 4)

  return {
    text,
    provider: 'gemini',
    model: modelName,
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
    latencyMs,
  }
}

/**
 * Central AI Gateway: smart routing with automatic failover.
 *
 * Resolution order:
 *  - 'openai'  → try OpenAI; if failoverEnabled & fails → try Gemini
 *  - 'gemini'  → try Gemini; if failoverEnabled & fails → try OpenAI
 *  - 'auto'    → try OpenAI first (if key present), then Gemini
 */
export async function sendAIRequest(
  prompt: string,
  options: AIRequestOptions & {
    openaiApiKey?: string
    geminiApiKey?: string
    failoverEnabled?: boolean
  }
): Promise<AIResponse> {
  const { openaiApiKey, geminiApiKey, failoverEnabled = true } = options
  const provider = options.provider ?? 'auto'

  const tryOpenAI = async () => {
    if (!openaiApiKey) throw new Error('OpenAI API key not configured')
    return callOpenAI(prompt, options, openaiApiKey)
  }

  const tryGemini = async () => {
    if (!geminiApiKey) throw new Error('Gemini API key not configured')
    return callGemini(prompt, options, geminiApiKey)
  }

  if (provider === 'openai') {
    try {
      return await tryOpenAI()
    } catch (err) {
      if (failoverEnabled && geminiApiKey) {
        console.warn('[AI Gateway] OpenAI failed, falling back to Gemini:', (err as Error).message)
        return tryGemini()
      }
      throw err
    }
  }

  if (provider === 'gemini') {
    try {
      return await tryGemini()
    } catch (err) {
      if (failoverEnabled && openaiApiKey) {
        console.warn('[AI Gateway] Gemini failed, falling back to OpenAI:', (err as Error).message)
        return tryOpenAI()
      }
      throw err
    }
  }

  // auto: prefer OpenAI when key is available
  if (openaiApiKey) {
    try {
      return await tryOpenAI()
    } catch (err) {
      if (failoverEnabled && geminiApiKey) {
        console.warn('[AI Gateway] Auto – OpenAI failed, trying Gemini:', (err as Error).message)
        return tryGemini()
      }
      throw err
    }
  }

  if (geminiApiKey) {
    return tryGemini()
  }

  throw new Error('No AI provider API key configured. Please add your OpenAI or Gemini key in Settings → AI Configuration.')
}

// ─── Specialised prompt builders ────────────────────────────────────────────

/**
 * Generate a reply to a guest review.
 */
export function buildReviewReplyPrompt(params: {
  reviewText: string
  rating: number
  guestName: string
  platform: string
  tone: 'friendly' | 'professional' | 'apologetic'
  hotelName: string
}): { systemPrompt: string; userPrompt: string } {
  const toneMap = {
    friendly: 'warm, friendly, and approachable',
    professional: 'formal and professional',
    apologetic: 'empathetic and apologetic',
  }
  return {
    systemPrompt: `You are the Guest Relations Manager at ${params.hotelName}. 
Write a reply to the following ${params.platform} review in a ${toneMap[params.tone]} tone.
Keep the reply concise (2-4 sentences), personalised, and do NOT promise anything you cannot deliver.
Reply in the same language as the review if it is not English.`,
    userPrompt: `Guest: ${params.guestName}
Rating: ${params.rating}/5
Review: ${params.reviewText}

Write a reply:`,
  }
}

/**
 * Build an auto-reply prompt for an incoming guest message.
 */
export function buildGuestMessagePrompt(params: {
  guestName: string
  guestMessage: string
  language?: string
  context?: string
  hotelName: string
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a helpful concierge at ${params.hotelName}. 
Respond to guest enquiries politely, accurately, and concisely.
${params.context ? `Context about the hotel: ${params.context}` : ''}
${params.language ? `Reply in ${params.language}.` : 'Reply in the same language as the guest message.'}`,
    userPrompt: `Guest (${params.guestName}) wrote: ${params.guestMessage}

Your reply:`,
  }
}

/**
 * Build an upselling suggestions prompt.
 */
export function buildUpsellPrompt(params: {
  guestName: string
  roomType: string
  checkInDate: string
  checkOutDate: string
  hotelName: string
  availableServices: string[]
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are the Revenue Manager at ${params.hotelName}.
Your goal is to suggest relevant upsell offers to guests to increase revenue per guest.
Always return a JSON array of suggestions with fields: type, title, description, estimatedPrice, confidence (0-1).
Types: room-upgrade, spa, dining, transport, activity.`,
    userPrompt: `Guest: ${params.guestName}
Room: ${params.roomType}
Stay: ${params.checkInDate} to ${params.checkOutDate}
Available services: ${params.availableServices.join(', ')}

Return JSON array of upsell suggestions:`,
  }
}

/**
 * Build a demand forecast prompt using historical data.
 */
export function buildForecastPrompt(params: {
  historicalOccupancy: Array<{ date: string; occupancy: number; adr: number }>
  forecastDays: number
  hotelName: string
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a hotel revenue management AI for ${params.hotelName}.
Analyze the historical occupancy and ADR data to forecast demand for the next ${params.forecastDays} days.
Return a JSON array where each element has: date (YYYY-MM-DD), predictedOccupancy (0-100), predictedADR (number), confidence (0-1), demandLevel (low/medium/high/very-high), factors (array of strings).
Consider seasonality, day-of-week patterns, and trends.`,
    userPrompt: `Historical data (last ${params.historicalOccupancy.length} days):
${JSON.stringify(params.historicalOccupancy.slice(-30))}

Forecast next ${params.forecastDays} days as JSON:`,
  }
}

/**
 * Build an AI revenue insights prompt.
 */
export function buildRevenueInsightsPrompt(params: {
  occupancy: number
  adr: number
  revpar: number
  trend: string
  hotelName: string
}): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a hotel revenue management expert for ${params.hotelName}.
Analyze the provided KPIs and return a JSON array of actionable insights.
Each insight must have: type (pricing/occupancy/revenue/promotion/risk), priority (low/medium/high/critical), title, description, recommendation, potentialImpact.`,
    userPrompt: `Current KPIs:
- Occupancy: ${params.occupancy}%
- ADR: ${params.adr}
- RevPAR: ${params.revpar}
- Trend: ${params.trend}

Provide 3-5 actionable revenue insights as JSON:`,
  }
}
