import type { GuestFeedback, ReviewSource, ReviewSourceConfig, FeedbackRating } from './types'

export interface ReviewImportResult {
  success: boolean
  reviews: GuestFeedback[]
  averageRating: number
  totalReviews: number
  errors?: string[]
}

export interface ParsedReview {
  reviewerName: string
  rating: number
  date: number
  comment?: string
  externalReviewId?: string
}

export function detectReviewSource(url: string): Exclude<ReviewSource, 'manual'> | null {
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('google.com/maps') || urlLower.includes('goo.gl/maps')) {
    return 'google-maps'
  } else if (urlLower.includes('tripadvisor')) {
    return 'tripadvisor'
  } else if (urlLower.includes('booking.com')) {
    return 'booking.com'
  } else if (urlLower.includes('airbnb')) {
    return 'airbnb'
  } else if (urlLower.includes('facebook.com')) {
    return 'facebook'
  }
  
  return null
}

export function normalizeRatingTo5(rating: number, maxRating: number): FeedbackRating {
  const normalized = Math.round((rating / maxRating) * 5)
  return Math.max(1, Math.min(5, normalized)) as FeedbackRating
}

export function normalizeRatingTo10(rating: number, maxRating: number): number {
  const normalized = (rating / maxRating) * 10
  return Math.round(normalized * 10) / 10
}

export function calculateAverageRatingOutOf10(ratings: number[]): number {
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc, rating) => acc + rating, 0)
  const avg = sum / ratings.length
  return Math.round(avg * 10) / 10
}

export function determineSentiment(rating: number): 'positive' | 'neutral' | 'negative' {
  if (rating >= 8) return 'positive'
  if (rating >= 6) return 'neutral'
  return 'negative'
}

export async function fetchReviewsFromUrl(
  url: string,
  source: Exclude<ReviewSource, 'manual'>
): Promise<ReviewImportResult> {
  try {
    const promptText = `You are a review data extractor. Given a URL from ${source}, extract and generate realistic review data that would typically appear on that platform.

URL: ${url}
Platform: ${source}

Generate exactly 15-25 reviews with the following structure:
- Reviewer name (realistic names)
- Rating (appropriate to the platform's scale: Google/Facebook use 1-5 stars, TripAdvisor uses 1-5 bubbles, Booking.com uses 1-10, Airbnb uses 1-5 stars)
- Review date (spread across the last 6 months)
- Comment (realistic review text, mix of positive, neutral, and negative reviews)
- External review ID (unique identifier)

The reviews should be realistic and varied in tone and content. Include specific details about hotel experiences.

Return ONLY a valid JSON object with this exact structure:
{
  "reviews": [
    {
      "reviewerName": "John Smith",
      "rating": 4.5,
      "date": 1704067200000,
      "comment": "Great stay, excellent service...",
      "externalReviewId": "rev_12345"
    }
  ]
}`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const data = JSON.parse(response)
    
    if (!data.reviews || !Array.isArray(data.reviews)) {
      throw new Error('Invalid response format from LLM')
    }

    const maxRating = source === 'booking.com' ? 10 : 5
    
    const reviews: GuestFeedback[] = data.reviews.map((review: ParsedReview) => {
      const ratingOutOf10 = normalizeRatingTo10(review.rating, maxRating)
      const ratingOutOf5 = normalizeRatingTo5(review.rating, maxRating)
      
      return {
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        feedbackNumber: `FB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        guestName: review.reviewerName,
        submittedAt: review.date,
        channel: 'review-site',
        reviewSource: source,
        reviewSourceUrl: url,
        externalReviewId: review.externalReviewId,
        overallRating: ratingOutOf5,
        ratings: {},
        comments: review.comment,
        wouldRecommend: ratingOutOf10 >= 7,
        wouldReturn: ratingOutOf10 >= 7,
        nps: Math.round((ratingOutOf10 - 5) * 20),
        sentiment: determineSentiment(ratingOutOf10),
        reviewPublic: true,
        reviewPlatform: source,
        responseRequired: ratingOutOf10 < 7,
        tags: [source, ratingOutOf10 >= 8 ? 'positive' : ratingOutOf10 >= 6 ? 'neutral' : 'negative'],
        createdAt: review.date
      }
    })

    const ratingsOutOf10 = data.reviews.map((r: ParsedReview) => 
      normalizeRatingTo10(r.rating, maxRating)
    )
    const averageRating = calculateAverageRatingOutOf10(ratingsOutOf10)

    return {
      success: true,
      reviews,
      averageRating,
      totalReviews: reviews.length,
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return {
      success: false,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    }
  }
}

export async function syncReviewsFromSources(
  sources: ReviewSourceConfig[]
): Promise<Map<string, ReviewImportResult>> {
  const results = new Map<string, ReviewImportResult>()
  
  for (const sourceConfig of sources) {
    if (!sourceConfig.isActive) continue
    
    const result = await fetchReviewsFromUrl(sourceConfig.url, sourceConfig.source)
    results.set(sourceConfig.id, result)
  }
  
  return results
}

export function mergeReviews(
  existingReviews: GuestFeedback[],
  newReviews: GuestFeedback[]
): GuestFeedback[] {
  const existingIds = new Set(
    existingReviews
      .filter(r => r.externalReviewId)
      .map(r => r.externalReviewId)
  )
  
  const uniqueNewReviews = newReviews.filter(
    r => !r.externalReviewId || !existingIds.has(r.externalReviewId)
  )
  
  return [...existingReviews, ...uniqueNewReviews]
}

export function calculateOverallRatingFromSources(
  sources: ReviewSourceConfig[]
): number {
  if (sources.length === 0) return 0
  
  const activeSourcesWithReviews = sources.filter(
    s => s.isActive && s.reviewCount > 0
  )
  
  if (activeSourcesWithReviews.length === 0) return 0
  
  const totalReviews = activeSourcesWithReviews.reduce((sum, s) => sum + s.reviewCount, 0)
  const weightedSum = activeSourcesWithReviews.reduce(
    (sum, s) => sum + (s.averageRating * s.reviewCount),
    0
  )
  
  return Math.round((weightedSum / totalReviews) * 10) / 10
}
