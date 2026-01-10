export interface DataPoint {
  date: string
  value: number
}

export interface ForecastResult {
  date: string
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable'
  strength: number
  slope: number
  rSquared: number
}

export function calculateLinearRegression(data: DataPoint[]): { slope: number; intercept: number; rSquared: number } {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

  const xValues = data.map((_, i) => i)
  const yValues = data.map(d => d.value)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const yMean = sumY / n
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0)
  const ssResidual = yValues.reduce((sum, y, i) => {
    const predicted = slope * i + intercept
    return sum + Math.pow(y - predicted, 2)
  }, 0)
  const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0

  return { slope, intercept, rSquared }
}

export function exponentialSmoothing(data: DataPoint[], alpha: number = 0.3): number[] {
  if (data.length === 0) return []
  
  const smoothed: number[] = [data[0].value]
  
  for (let i = 1; i < data.length; i++) {
    const value = alpha * data[i].value + (1 - alpha) * smoothed[i - 1]
    smoothed.push(value)
  }
  
  return smoothed
}

export function doubleExponentialSmoothing(data: DataPoint[], alpha: number = 0.3, beta: number = 0.3): { level: number; trend: number } {
  if (data.length < 2) return { level: data[0]?.value || 0, trend: 0 }

  let level = data[0].value
  let trend = data[1].value - data[0].value

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level
    level = alpha * data[i].value + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
  }

  return { level, trend }
}

export function movingAverage(data: DataPoint[], window: number = 7): number[] {
  if (data.length < window) window = data.length
  
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1)
    const subset = data.slice(start, i + 1)
    const avg = subset.reduce((sum, d) => sum + d.value, 0) / subset.length
    result.push(avg)
  }
  
  return result
}

export function calculateSeasonality(data: DataPoint[], period: number = 7): number[] {
  if (data.length < period * 2) return new Array(data.length).fill(1)

  const detrended = detrend(data)
  const seasonalFactors: number[] = new Array(period).fill(0)
  const counts: number[] = new Array(period).fill(0)

  detrended.forEach((value, i) => {
    const seasonIndex = i % period
    seasonalFactors[seasonIndex] += value
    counts[seasonIndex]++
  })

  for (let i = 0; i < period; i++) {
    if (counts[i] > 0) {
      seasonalFactors[i] /= counts[i]
    }
  }

  const avgFactor = seasonalFactors.reduce((a, b) => a + b, 0) / period
  return seasonalFactors.map(f => f / (avgFactor || 1))
}

function detrend(data: DataPoint[]): number[] {
  const { slope, intercept } = calculateLinearRegression(data)
  return data.map((d, i) => {
    const trend = slope * i + intercept
    return trend > 0 ? d.value / trend : d.value
  })
}

export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

export function forecastLinearRegression(
  historicalData: DataPoint[],
  periodsAhead: number
): ForecastResult[] {
  const { slope, intercept, rSquared } = calculateLinearRegression(historicalData)
  const residuals = historicalData.map((d, i) => {
    const predicted = slope * i + intercept
    return d.value - predicted
  })
  const stdDev = calculateStandardDeviation(residuals)
  
  const forecasts: ForecastResult[] = []
  const lastDate = new Date(historicalData[historicalData.length - 1]?.date || new Date())
  
  for (let i = 1; i <= periodsAhead; i++) {
    const x = historicalData.length + i - 1
    const predicted = slope * x + intercept
    const margin = 1.96 * stdDev * Math.sqrt(1 + i / historicalData.length)
    
    const forecastDate = new Date(lastDate)
    forecastDate.setDate(lastDate.getDate() + i)
    
    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, predicted),
      lowerBound: Math.max(0, predicted - margin),
      upperBound: Math.max(0, predicted + margin),
      confidence: Math.max(0, Math.min(100, rSquared * 100))
    })
  }
  
  return forecasts
}

export function forecastExponentialSmoothing(
  historicalData: DataPoint[],
  periodsAhead: number,
  alpha: number = 0.3,
  beta: number = 0.3
): ForecastResult[] {
  const { level, trend } = doubleExponentialSmoothing(historicalData, alpha, beta)
  
  const errors = historicalData.map((d, i) => {
    if (i === 0) return 0
    const { level: l, trend: t } = doubleExponentialSmoothing(historicalData.slice(0, i), alpha, beta)
    return d.value - (l + t)
  })
  const stdDev = calculateStandardDeviation(errors)
  
  const forecasts: ForecastResult[] = []
  const lastDate = new Date(historicalData[historicalData.length - 1]?.date || new Date())
  
  for (let i = 1; i <= periodsAhead; i++) {
    const predicted = level + trend * i
    const margin = 1.96 * stdDev * Math.sqrt(i)
    
    const forecastDate = new Date(lastDate)
    forecastDate.setDate(lastDate.getDate() + i)
    
    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, predicted),
      lowerBound: Math.max(0, predicted - margin),
      upperBound: Math.max(0, predicted + margin),
      confidence: Math.max(0, Math.min(100, 85 - i * 2))
    })
  }
  
  return forecasts
}

export function forecastSeasonalDecomposition(
  historicalData: DataPoint[],
  periodsAhead: number,
  seasonalPeriod: number = 7
): ForecastResult[] {
  const { slope, intercept } = calculateLinearRegression(historicalData)
  const seasonalFactors = calculateSeasonality(historicalData, seasonalPeriod)
  
  const errors: number[] = []
  historicalData.forEach((d, i) => {
    const trendValue = slope * i + intercept
    const seasonalIndex = i % seasonalPeriod
    const predicted = trendValue * seasonalFactors[seasonalIndex]
    errors.push(d.value - predicted)
  })
  const stdDev = calculateStandardDeviation(errors)
  
  const forecasts: ForecastResult[] = []
  const lastDate = new Date(historicalData[historicalData.length - 1]?.date || new Date())
  
  for (let i = 1; i <= periodsAhead; i++) {
    const x = historicalData.length + i - 1
    const trendValue = slope * x + intercept
    const seasonalIndex = x % seasonalPeriod
    const predicted = trendValue * seasonalFactors[seasonalIndex]
    const margin = 1.96 * stdDev * Math.sqrt(1 + i / historicalData.length)
    
    const forecastDate = new Date(lastDate)
    forecastDate.setDate(lastDate.getDate() + i)
    
    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predicted: Math.max(0, predicted),
      lowerBound: Math.max(0, predicted - margin),
      upperBound: Math.max(0, predicted + margin),
      confidence: Math.max(0, Math.min(100, 90 - i * 1.5))
    })
  }
  
  return forecasts
}

export function ensembleForecast(
  historicalData: DataPoint[],
  periodsAhead: number
): ForecastResult[] {
  if (historicalData.length < 7) {
    return forecastLinearRegression(historicalData, periodsAhead)
  }

  const linearForecasts = forecastLinearRegression(historicalData, periodsAhead)
  const expForecasts = forecastExponentialSmoothing(historicalData, periodsAhead)
  const seasonalForecasts = forecastSeasonalDecomposition(historicalData, periodsAhead)
  
  const ensembleForecasts: ForecastResult[] = []
  
  for (let i = 0; i < periodsAhead; i++) {
    const predicted = (
      linearForecasts[i].predicted * 0.3 +
      expForecasts[i].predicted * 0.35 +
      seasonalForecasts[i].predicted * 0.35
    )
    
    const lowerBound = Math.min(
      linearForecasts[i].lowerBound,
      expForecasts[i].lowerBound,
      seasonalForecasts[i].lowerBound
    )
    
    const upperBound = Math.max(
      linearForecasts[i].upperBound,
      expForecasts[i].upperBound,
      seasonalForecasts[i].upperBound
    )
    
    const confidence = (
      linearForecasts[i].confidence * 0.3 +
      expForecasts[i].confidence * 0.35 +
      seasonalForecasts[i].confidence * 0.35
    )
    
    ensembleForecasts.push({
      date: linearForecasts[i].date,
      predicted,
      lowerBound,
      upperBound,
      confidence
    })
  }
  
  return ensembleForecasts
}

export function analyzeTrend(data: DataPoint[]): TrendAnalysis {
  const { slope, rSquared } = calculateLinearRegression(data)
  const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length
  const strength = Math.abs(slope) / (avgValue || 1)
  
  let trend: 'increasing' | 'decreasing' | 'stable'
  if (Math.abs(slope) < avgValue * 0.01) {
    trend = 'stable'
  } else if (slope > 0) {
    trend = 'increasing'
  } else {
    trend = 'decreasing'
  }
  
  return {
    trend,
    strength: Math.min(1, strength * 10),
    slope,
    rSquared
  }
}

export function detectAnomalies(data: DataPoint[], threshold: number = 2): number[] {
  const values = data.map(d => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const stdDev = calculateStandardDeviation(values)
  
  const anomalyIndices: number[] = []
  
  values.forEach((value, i) => {
    const zScore = Math.abs((value - mean) / (stdDev || 1))
    if (zScore > threshold) {
      anomalyIndices.push(i)
    }
  })
  
  return anomalyIndices
}
