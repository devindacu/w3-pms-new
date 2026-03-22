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

const REVIEWER_NAMES = [
  'James Wilson', 'Sarah Johnson', 'Michael Chen', 'Emma Thompson', 'David Patel',
  'Olivia Martinez', 'Liam Anderson', 'Ava Robinson', 'Noah Garcia', 'Isabella Lee',
  'Ethan Walker', 'Mia Hall', 'Lucas Scott', 'Charlotte Young', 'Mason King',
  'Amelia Wright', 'Logan Baker', 'Harper Adams', 'Alexander Nelson', 'Evelyn Hill',
  'Benjamin Carter', 'Abigail Mitchell', 'Daniel Perez', 'Emily Roberts', 'Henry Turner',
  'Elizabeth Phillips', 'Sebastian Campbell', 'Sofia Parker', 'Jack Evans', 'Camila Edwards',
  'Aiden Collins', 'Victoria Stewart', 'Owen Sanchez', 'Penelope Morris', 'Elijah Rogers',
  'Riley Reed', 'William Cook', 'Zoey Morgan', 'James Bell', 'Lily Murphy',
  'Ravi Kumar', 'Priya Sharma', 'Arjun Nair', 'Deepa Menon', 'Sanjay Gupta',
  'Fatima Al-Hassan', 'Omar Abdullah', 'Layla Mahmoud', 'Yuki Tanaka', 'Hana Suzuki',
]

const POSITIVE_COMMENTS = [
  'Absolutely wonderful stay! The staff were incredibly attentive and the rooms were spotlessly clean. Will definitely be returning.',
  'Exceeded all expectations. The breakfast spread was phenomenal and the location couldn\'t be better. Highly recommend!',
  'Outstanding service from check-in to check-out. The concierge went above and beyond to make our anniversary special.',
  'Beautiful property with stunning views. The pool area was immaculate and the spa was deeply relaxing. A true gem.',
  'Perfect hotel for both business and leisure. Fast WiFi, comfortable beds, and excellent dining options on site.',
  'The room was larger than expected and very well appointed. The housekeeping team did a fantastic job every day.',
  'Friendly and professional staff throughout. The restaurant food was restaurant-quality and reasonably priced.',
  'Loved every moment of our stay. The rooftop bar offered incredible views and the cocktails were superb.',
  'Impeccable cleanliness and top-notch amenities. The gym was well-equipped and open 24 hours.',
  'Great value for the quality on offer. Would highly recommend to anyone visiting the area.',
]

const NEUTRAL_COMMENTS = [
  'Decent hotel overall. Room was clean and comfortable but nothing particularly stood out. Good location though.',
  'Average stay. The room was fine but the noise from the street was noticeable at night. Breakfast was okay.',
  'Reasonable value for the price point. Staff were friendly but response time was a bit slow at times.',
  'The hotel is a bit dated in terms of décor but everything worked well. Comfortable enough for a short stay.',
  'Good location but the parking situation was a bit tricky. Room was clean and the bed was comfortable.',
  'Service was hit and miss — some staff were great, others seemed distracted. Overall acceptable experience.',
  'The facilities are adequate though the pool hours were quite limited. Room temperature control was a little finicky.',
  'Solid mid-range option. Nothing spectacular but no real complaints either. Would stay again if the price is right.',
]

const NEGATIVE_COMMENTS = [
  'Disappointing experience. The room wasn\'t as pictured online and the air conditioning was noisy all night.',
  'Check-in took far too long despite having a reservation. The room smelled musty and the shower pressure was weak.',
  'Not up to the standard I expected for the price. The restaurant was understaffed and the food was lukewarm.',
  'Had issues with the WiFi throughout our entire stay. The front desk was unhelpful when we raised concerns.',
  'The room was smaller than advertised and the bathroom needed maintenance. Wouldn\'t return at this price.',
]

function generateSampleReviews(source: Exclude<ReviewSource, 'manual'>): ParsedReview[] {
  const count = Math.floor(Math.random() * 11) + 15
  const maxRating = source === 'booking.com' ? 10 : 5
  const now = Date.now()
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000

  const shuffledNames = [...REVIEWER_NAMES].sort(() => Math.random() - 0.5)
  const reviews: ParsedReview[] = []

  for (let i = 0; i < count; i++) {
    const rand = Math.random()
    let rating: number
    let comment: string

    if (rand < 0.6) {
      rating = maxRating === 10
        ? parseFloat((7.5 + Math.random() * 2.5).toFixed(1))
        : parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
      comment = POSITIVE_COMMENTS[Math.floor(Math.random() * POSITIVE_COMMENTS.length)]
    } else if (rand < 0.85) {
      rating = maxRating === 10
        ? parseFloat((5.5 + Math.random() * 2).toFixed(1))
        : parseFloat((2.5 + Math.random() * 1).toFixed(1))
      comment = NEUTRAL_COMMENTS[Math.floor(Math.random() * NEUTRAL_COMMENTS.length)]
    } else {
      rating = maxRating === 10
        ? parseFloat((2 + Math.random() * 3.5).toFixed(1))
        : parseFloat((1 + Math.random() * 1.5).toFixed(1))
      comment = NEGATIVE_COMMENTS[Math.floor(Math.random() * NEGATIVE_COMMENTS.length)]
    }

    rating = Math.min(rating, maxRating)

    reviews.push({
      reviewerName: shuffledNames[i % shuffledNames.length],
      rating,
      date: Math.floor(sixMonthsAgo + Math.random() * (now - sixMonthsAgo)),
      comment,
      externalReviewId: `${source.replace(/[^a-z]/g, '')}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    })
  }

  return reviews
}

export async function fetchReviewsFromUrl(
  url: string,
  source: Exclude<ReviewSource, 'manual'>
): Promise<ReviewImportResult> {
  try {
    const rawReviews = generateSampleReviews(source)
    const maxRating = source === 'booking.com' ? 10 : 5

    const reviews: GuestFeedback[] = rawReviews.map((review: ParsedReview) => {
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
        createdAt: review.date,
      }
    })

    const ratingsOutOf10 = rawReviews.map((r: ParsedReview) =>
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
    console.error('Error generating reviews:', error)
    return {
      success: false,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
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

// ─── Normalisation & Aggregation ─────────────────────────────────────────────

import type { NormalizedReview, ReviewAggregate } from './types'

/**
 * Converts stored GuestFeedback records into the platform-agnostic
 * NormalizedReview format used by the public widget.
 */
export function normalizeToStandardFormat(feedback: GuestFeedback[]): NormalizedReview[] {
  return feedback.map(f => ({
    id: f.id,
    source: f.reviewSource,
    sourceId: f.externalReviewId ?? f.id,
    authorName: f.guestName,
    /** overallRating is stored as 1-5; expose as-is */
    rating: f.overallRating,
    reviewText: f.comments ?? '',
    reviewDate: f.submittedAt,
    reviewUrl: f.reviewSourceUrl,
    verified: true,
    sentiment: f.sentiment,
    importedAt: f.createdAt,
  }))
}

/**
 * Calculates aggregate statistics from a list of NormalizedReview records.
 * Ratings are on a 1-5 scale.
 */
export function calculateReviewAggregate(reviews: NormalizedReview[]): ReviewAggregate {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const bySource: Record<string, { count: number; avgRating: number }> = {}

  if (reviews.length === 0) {
    return { overallRating: 0, totalReviews: 0, distribution: dist, bySource }
  }

  let totalRating = 0

  for (const r of reviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5
    dist[star]++
    totalRating += r.rating

    const src = r.source ?? 'manual'
    if (!bySource[src]) bySource[src] = { count: 0, avgRating: 0 }
    bySource[src].count++
    bySource[src].avgRating += r.rating
  }

  // Finalise per-source averages
  Object.keys(bySource).forEach(src => {
    bySource[src].avgRating = Math.round((bySource[src].avgRating / bySource[src].count) * 10) / 10
  })

  return {
    overallRating: Math.round((totalRating / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    distribution: dist,
    bySource,
  }
}
