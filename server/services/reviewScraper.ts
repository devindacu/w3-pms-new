import * as zlib from 'zlib'
import { promisify } from 'util'

const gunzip = promisify(zlib.gunzip)
const inflate = promisify(zlib.inflate)
const brotliDecompress = promisify(zlib.brotliDecompress)

const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

export interface ScrapedReviewData {
  success: boolean
  dataSource: 'api' | 'scraped' | 'partial' | 'sample'
  overallRating?: number
  totalReviews?: number
  hotelName?: string
  reviews: ScrapedReview[]
  error?: string
}

export interface ScrapedReview {
  reviewerName: string
  rating: number
  date: number
  comment?: string
  externalReviewId: string
}

async function fetchPage(url: string, extraHeaders: Record<string, string> = {}): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const resp = await fetch(url, {
      headers: { ...BROWSER_HEADERS, ...extraHeaders },
      signal: controller.signal,
      redirect: 'follow',
    })

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`)
    }

    const contentEncoding = (resp.headers.get('content-encoding') || '').toLowerCase().trim()
    const buffer = Buffer.from(await resp.arrayBuffer())

    if (buffer.length === 0) return ''

    try {
      if (contentEncoding === 'br') {
        return (await brotliDecompress(buffer)).toString('utf-8')
      } else if (contentEncoding === 'gzip') {
        return (await gunzip(buffer)).toString('utf-8')
      } else if (contentEncoding === 'deflate') {
        return (await inflate(buffer)).toString('utf-8')
      }
    } catch {
      // fallthrough — try reading raw if decompression fails
    }

    return buffer.toString('utf-8')
  } finally {
    clearTimeout(timeout)
  }
}

function extractJsonLd(html: string): any[] {
  const results: any[] = []
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim())
      if (Array.isArray(parsed)) results.push(...parsed)
      else results.push(parsed)
    } catch {}
  }
  return results
}

function findHotelSchema(schemas: any[]): any | null {
  for (const schema of schemas) {
    const type = schema['@type']
    if (!type) continue
    const types = Array.isArray(type) ? type : [type]
    if (types.some((t: string) => ['Hotel', 'LodgingBusiness', 'Accommodation', 'LocalBusiness'].includes(t))) {
      return schema
    }
    if (schema['@graph']) {
      const found = findHotelSchema(schema['@graph'])
      if (found) return found
    }
  }
  return null
}

function extractReviewsFromSchema(schema: any, source: string, maxRating: number): ScrapedReview[] {
  const reviews: ScrapedReview[] = []
  const rawReviews = schema?.review || schema?.reviews || []
  const items = Array.isArray(rawReviews) ? rawReviews : [rawReviews]

  for (const r of items.slice(0, 30)) {
    try {
      const ratingRaw = r?.reviewRating?.ratingValue || r?.starRating?.value || 0
      const rating = parseFloat(String(ratingRaw))
      if (!rating) continue

      const authorName = r?.author?.name || r?.author || 'Guest'
      const text = r?.reviewBody || r?.description || ''
      const dateStr = r?.datePublished || r?.dateCreated || ''
      const date = dateStr ? new Date(dateStr).getTime() : Date.now() - Math.floor(Math.random() * 180) * 86400000

      reviews.push({
        reviewerName: typeof authorName === 'string' ? authorName : 'Guest',
        rating: Math.min(rating, maxRating),
        date: isNaN(date) ? Date.now() : date,
        comment: text || undefined,
        externalReviewId: `${source}-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
      })
    } catch {}
  }

  return reviews
}

function extractMetaRating(html: string): { rating?: number; count?: number } {
  const patterns = [
    /ratingValue["']?\s*[:=]\s*["']?([\d.]+)/i,
    /itemprop=["']ratingValue["'][^>]*content=["']([\d.]+)/i,
    /"ratingValue"\s*:\s*([\d.]+)/i,
    /rating[_-]?value["']?\s*:\s*["']?([\d.]+)/i,
  ]
  const countPatterns = [
    /reviewCount["']?\s*[:=]\s*["']?([\d,]+)/i,
    /itemprop=["']reviewCount["'][^>]*content=["']([\d,]+)/i,
    /"reviewCount"\s*:\s*([\d,]+)/i,
    /userRatingCount['"]\s*:\s*([\d]+)/i,
    /([\d,]+)\s+(?:reviews?|ratings?)/i,
  ]

  let rating: number | undefined
  let count: number | undefined

  for (const p of patterns) {
    const m = html.match(p)
    if (m) { rating = parseFloat(m[1]); break }
  }
  for (const p of countPatterns) {
    const m = html.match(p)
    if (m) { count = parseInt(m[1].replace(/,/g, '')); break }
  }

  return { rating, count }
}

function extractHotelName(html: string, url: string): string | undefined {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (og) return og[1].replace(/\s*[-|].*$/, '').trim()

  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (title) return title[1].replace(/\s*[-|].*$/, '').trim()

  return undefined
}

export async function scrapeGoogleMapsReviews(url: string, injectedApiKey?: string): Promise<ScrapedReviewData> {
  const apiKey = injectedApiKey || process.env.GOOGLE_PLACES_API_KEY

  if (apiKey) {
    return scrapeGoogleWithPlacesApi(url, apiKey)
  }

  try {
    const resolvedUrl = await resolveGoogleMapsUrl(url)
    const html = await fetchPage(resolvedUrl)
    const schemas = extractJsonLd(html)
    const hotel = findHotelSchema(schemas)
    const { rating, count } = extractMetaRating(html)

    const ratingValue = hotel?.aggregateRating?.ratingValue || rating
    const reviewCount = hotel?.aggregateRating?.reviewCount || hotel?.aggregateRating?.ratingCount || count

    const scraped = hotel ? extractReviewsFromSchema(hotel, 'google-maps', 5) : []
    const hotelName = hotel?.name || extractHotelName(html, url)

    if (ratingValue) {
      return {
        success: true,
        dataSource: scraped.length > 0 ? 'scraped' : 'partial',
        overallRating: parseFloat(String(ratingValue)),
        totalReviews: reviewCount ? parseInt(String(reviewCount)) : undefined,
        hotelName,
        reviews: scraped,
      }
    }

    return {
      success: false,
      dataSource: 'sample',
      reviews: [],
      error: 'Google Maps requires JavaScript rendering and blocks server-side requests. Set a GOOGLE_PLACES_API_KEY environment variable to enable real review imports.',
    }
  } catch (err: any) {
    const msg = err.message || String(err)
    const friendly = msg.includes('403') || msg.includes('Forbidden')
      ? 'Google Maps blocked the request (403). Set a GOOGLE_PLACES_API_KEY for reliable access.'
      : msg.includes('401') ? 'Google Maps requires authentication. Set a GOOGLE_PLACES_API_KEY.'
      : msg.includes('abort') ? 'Request timed out after 12 seconds.'
      : `Google Maps fetch failed: ${msg}`
    return { success: false, dataSource: 'sample', reviews: [], error: friendly }
  }
}

async function resolveGoogleMapsUrl(url: string): Promise<string> {
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
    const resp = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: BROWSER_HEADERS })
    return resp.url || url
  }
  return url
}

async function scrapeGoogleWithPlacesApi(mapsUrl: string, apiKey: string): Promise<ScrapedReviewData> {
  try {
    let placeId = extractPlaceIdFromUrl(mapsUrl)

    if (!placeId) {
      const resolved = await resolveGoogleMapsUrl(mapsUrl)
      placeId = extractPlaceIdFromUrl(resolved)
    }

    if (!placeId) {
      const hotelName = extractHotelNameFromUrl(mapsUrl)
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(hotelName)}&inputtype=textquery&fields=place_id&key=${apiKey}`
      const searchResp = await fetch(searchUrl)
      const searchData = await searchResp.json()
      placeId = searchData?.candidates?.[0]?.place_id
    }

    if (!placeId) {
      return { success: false, dataSource: 'sample', reviews: [], error: 'Could not determine Place ID from URL' }
    }

    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews&language=en&reviews_sort=newest&key=${apiKey}`
    const detailResp = await fetch(detailUrl)
    const detail = await detailResp.json()

    if (detail.status !== 'OK') {
      return { success: false, dataSource: 'sample', reviews: [], error: `Places API error: ${detail.status}` }
    }

    const place = detail.result
    const reviews: ScrapedReview[] = (place.reviews || []).map((r: any) => ({
      reviewerName: r.author_name || 'Guest',
      rating: r.rating || 0,
      date: (r.time || 0) * 1000,
      comment: r.text || undefined,
      externalReviewId: `google-${r.author_url?.split('/').pop() || Date.now()}`,
    }))

    return {
      success: true,
      dataSource: 'api',
      overallRating: place.rating,
      totalReviews: place.user_ratings_total,
      hotelName: place.name,
      reviews,
    }
  } catch (err: any) {
    return { success: false, dataSource: 'sample', reviews: [], error: `Places API request failed: ${err.message}` }
  }
}

function extractPlaceIdFromUrl(url: string): string | null {
  const patterns = [
    /[?&]place_id=([A-Za-z0-9_-]+)/,
    /!1s(ChIJ[A-Za-z0-9_-]+)/,
    /cid=(\d+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function extractHotelNameFromUrl(url: string): string {
  const placeMatch = url.match(/\/maps\/place\/([^/@]+)/)
  if (placeMatch) return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
  return 'hotel'
}

export async function scrapeTripAdvisorReviews(url: string): Promise<ScrapedReviewData> {
  try {
    const html = await fetchPage(url, { Referer: 'https://www.tripadvisor.com/' })
    const schemas = extractJsonLd(html)
    const hotel = findHotelSchema(schemas)

    const { rating, count } = extractMetaRating(html)
    const ratingValue = hotel?.aggregateRating?.ratingValue || rating
    const reviewCount = hotel?.aggregateRating?.reviewCount || hotel?.aggregateRating?.ratingCount || count
    const hotelName = hotel?.name || extractHotelName(html, url)

    const scraped = hotel ? extractReviewsFromSchema(hotel, 'tripadvisor', 5) : []

    const reviewsFromHtml = extractTripAdvisorReviewsFromHtml(html)
    const allReviews = [...scraped, ...reviewsFromHtml].filter(
      (r, i, arr) => arr.findIndex(x => x.externalReviewId === r.externalReviewId) === i
    )

    if (ratingValue || allReviews.length > 0) {
      return {
        success: true,
        dataSource: allReviews.length > 0 ? 'scraped' : 'partial',
        overallRating: ratingValue ? parseFloat(String(ratingValue)) : undefined,
        totalReviews: reviewCount ? parseInt(String(reviewCount)) : undefined,
        hotelName,
        reviews: allReviews,
      }
    }

    return { success: false, dataSource: 'sample', reviews: [], error: 'TripAdvisor blocked the request. Their pages require JavaScript rendering and bot-detection bypass, which is not available server-side. Sample reviews will be generated instead.' }
  } catch (err: any) {
    const msg = err.message || String(err)
    const friendly = msg.includes('403') ? 'TripAdvisor blocked the request (403). Their site uses bot detection that cannot be bypassed server-side. Sample reviews generated.'
      : msg.includes('abort') ? 'TripAdvisor request timed out. Sample reviews generated.'
      : `TripAdvisor fetch failed: ${msg}`
    return { success: false, dataSource: 'sample', reviews: [], error: friendly }
  }
}

function extractTripAdvisorReviewsFromHtml(html: string): ScrapedReview[] {
  const reviews: ScrapedReview[] = []
  const reviewPattern = /"reviewRating":\{"ratingValue":([\d.]+)\}.*?"text":"((?:[^"\\]|\\.)*)"/g
  const authorPattern = /"authorContact":\{"points":\d+,"memberSince":"[^"]+","name":"([^"]+)"/g

  const ratingMatches = [...html.matchAll(/"ratingValue":([\d.]+).*?"reviewBody":"((?:[^"\\]|\\.)*)"/gs)]

  for (const m of ratingMatches.slice(0, 20)) {
    reviews.push({
      reviewerName: 'TripAdvisor Guest',
      rating: parseFloat(m[1]),
      date: Date.now() - Math.floor(Math.random() * 180) * 86400000,
      comment: m[2].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim() || undefined,
      externalReviewId: `tripadvisor-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    })
  }

  return reviews
}

export async function scrapeBookingReviews(url: string): Promise<ScrapedReviewData> {
  try {
    const html = await fetchPage(url, {
      Referer: 'https://www.booking.com/',
      'Accept-Language': 'en-GB,en;q=0.9',
    })

    const schemas = extractJsonLd(html)
    const hotel = findHotelSchema(schemas)

    const { rating: metaRating, count: metaCount } = extractMetaRating(html)

    const bookingRatingMatch = html.match(/"reviewScore"\s*:\s*([\d.]+)/) ||
      html.match(/class=["'][^"']*rating[^"']*["'][^>]*>([\d.]+)/)
    const bookingCountMatch = html.match(/"numberOfReviews"\s*:\s*(\d+)/) ||
      html.match(/([\d,]+)\s+reviews/i)

    const ratingValue = hotel?.aggregateRating?.ratingValue || metaRating ||
      (bookingRatingMatch ? parseFloat(bookingRatingMatch[1]) : undefined)
    const reviewCount = hotel?.aggregateRating?.reviewCount || metaCount ||
      (bookingCountMatch ? parseInt(bookingCountMatch[1].replace(/,/g, '')) : undefined)
    const hotelName = hotel?.name || extractHotelName(html, url)

    const scraped = hotel ? extractReviewsFromSchema(hotel, 'booking.com', 10) : []
    const htmlReviews = extractBookingReviewsFromHtml(html)
    const allReviews = [...scraped, ...htmlReviews].filter(
      (r, i, arr) => arr.findIndex(x => x.externalReviewId === r.externalReviewId) === i
    )

    if (ratingValue || allReviews.length > 0) {
      return {
        success: true,
        dataSource: allReviews.length > 0 ? 'scraped' : 'partial',
        overallRating: ratingValue ? parseFloat(String(ratingValue)) : undefined,
        totalReviews: reviewCount,
        hotelName,
        reviews: allReviews,
      }
    }

    return { success: false, dataSource: 'sample', reviews: [], error: 'Booking.com page requires partner API access for review data.' }
  } catch (err: any) {
    return { success: false, dataSource: 'sample', reviews: [], error: `Booking.com fetch failed: ${err.message}` }
  }
}

function extractBookingReviewsFromHtml(html: string): ScrapedReview[] {
  const reviews: ScrapedReview[] = []
  const positivePattern = /"positive":"((?:[^"\\]|\\.)*)"/g
  const negativePattern = /"negative":"((?:[^"\\]|\\.)*)"/g
  const scorePattern = /"reviewScore":([\d.]+)/g
  const reviewerPattern = /"reviewerDisplayName":"([^"]+)"/g

  const positives: string[] = []
  const reviewers: string[] = []
  const scores: number[] = []

  let m
  while ((m = positivePattern.exec(html)) !== null) positives.push(m[1].replace(/\\"/g, '"'))
  while ((m = reviewerPattern.exec(html)) !== null) reviewers.push(m[1])
  while ((m = scorePattern.exec(html)) !== null) scores.push(parseFloat(m[1]))

  const count = Math.min(positives.length, 20)
  for (let i = 0; i < count; i++) {
    reviews.push({
      reviewerName: reviewers[i] || 'Booking Guest',
      rating: scores[i] || 8,
      date: Date.now() - Math.floor(Math.random() * 180) * 86400000,
      comment: positives[i] || undefined,
      externalReviewId: `booking-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`,
    })
  }

  return reviews
}

export async function scrapeAirbnbReviews(url: string): Promise<ScrapedReviewData> {
  try {
    const roomIdMatch = url.match(/\/rooms\/(\d+)/)
    const roomId = roomIdMatch?.[1]

    const html = await fetchPage(url, {
      Referer: 'https://www.airbnb.com/',
      'X-Airbnb-API-Key': 'd306zoyjsyarp7ifhu67rjxn52tv0t20',
    })

    const nextDataMatch = html.match(/<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/)
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1])
        const reviews = extractAirbnbReviewsFromNextData(nextData, roomId || '')
        const rating = findDeep(nextData, 'ratingValue') || findDeep(nextData, 'reviewsRating')
        const count = findDeep(nextData, 'reviewCount') || findDeep(nextData, 'numberOfReviews')
        const name = findDeep(nextData, 'listingName') || findDeep(nextData, 'name')

        if (reviews.length > 0 || rating) {
          return {
            success: true,
            dataSource: reviews.length > 0 ? 'scraped' : 'partial',
            overallRating: rating ? parseFloat(String(rating)) : undefined,
            totalReviews: count ? parseInt(String(count)) : undefined,
            hotelName: typeof name === 'string' ? name : undefined,
            reviews,
          }
        }
      } catch {}
    }

    const { rating, count } = extractMetaRating(html)
    const hotelName = extractHotelName(html, url)

    if (rating) {
      return {
        success: true,
        dataSource: 'partial',
        overallRating: rating,
        totalReviews: count,
        hotelName,
        reviews: [],
      }
    }

    return { success: false, dataSource: 'sample', reviews: [], error: 'Airbnb requires login or uses client-side rendering. Only sample data is available.' }
  } catch (err: any) {
    return { success: false, dataSource: 'sample', reviews: [], error: `Airbnb fetch failed: ${err.message}` }
  }
}

function extractAirbnbReviewsFromNextData(data: any, roomId: string): ScrapedReview[] {
  const reviews: ScrapedReview[] = []
  const reviewArrays = findAllDeep(data, 'reviews')

  for (const arr of reviewArrays) {
    if (!Array.isArray(arr)) continue
    for (const r of arr.slice(0, 20)) {
      if (!r || typeof r !== 'object') continue
      const rating = r.rating || r.starRating || 5
      const author = r.reviewer?.firstName || r.reviewee?.firstName || r.author?.name || 'Airbnb Guest'
      const comment = r.comments || r.publicReview || r.response || ''
      const date = r.createdAt ? new Date(r.createdAt).getTime() : Date.now() - Math.floor(Math.random() * 180) * 86400000

      reviews.push({
        reviewerName: author,
        rating,
        date,
        comment: comment || undefined,
        externalReviewId: `airbnb-${r.id || Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      })
    }
  }

  return reviews
}

function findDeep(obj: any, key: string, depth = 0): any {
  if (!obj || typeof obj !== 'object' || depth > 8) return undefined
  if (key in obj) return obj[key]
  for (const v of Object.values(obj)) {
    const found = findDeep(v, key, depth + 1)
    if (found !== undefined) return found
  }
  return undefined
}

function findAllDeep(obj: any, key: string, depth = 0): any[] {
  const results: any[] = []
  if (!obj || typeof obj !== 'object' || depth > 8) return results
  if (key in obj) results.push(obj[key])
  for (const v of Object.values(obj)) {
    results.push(...findAllDeep(v, key, depth + 1))
  }
  return results
}

export async function scrapeReviewsFromUrl(
  url: string,
  source: string,
  apiKey?: string
): Promise<ScrapedReviewData> {
  switch (source) {
    case 'google-maps': return scrapeGoogleMapsReviews(url, apiKey)
    case 'tripadvisor': return scrapeTripAdvisorReviews(url)
    case 'booking.com': return scrapeBookingReviews(url)
    case 'airbnb': return scrapeAirbnbReviews(url)
    default:
      return { success: false, dataSource: 'sample', reviews: [], error: `Unsupported source: ${source}` }
  }
}

export async function testGooglePlacesApiKey(apiKey: string): Promise<{ success: boolean; detail?: string; error?: string }> {
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=hotel&inputtype=textquery&fields=place_id,name&key=${apiKey}`
    const resp = await fetch(searchUrl)
    const data = await resp.json()

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      return { success: true, detail: 'API key is valid and Places API is enabled' }
    }
    if (data.status === 'REQUEST_DENIED') {
      const msg = data.error_message || 'API key is invalid or Places API is not enabled in your Google Cloud project'
      return { success: false, error: msg }
    }
    if (data.status === 'INVALID_REQUEST') {
      return { success: true, detail: 'API key authenticated (invalid test query, but key is accepted)' }
    }
    return { success: false, error: `Unexpected status from Google: ${data.status}` }
  } catch (err: any) {
    return { success: false, error: `Could not reach Google Places API: ${err.message}` }
  }
}
