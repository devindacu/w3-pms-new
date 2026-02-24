import { 
  type CurrencyCode, 
  type Currency, 
  type ExchangeRate, 
  type CurrencyConfiguration,
  type MultiCurrencyAmount,
  CURRENCIES 
} from './currencyTypes'

export function formatCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode = 'LKR',
  showCode: boolean = true
): string {
  const currency = CURRENCIES[currencyCode]
  if (!currency) {
    return amount.toFixed(2)
  }

  const absAmount = Math.abs(amount)
  const isNegative = amount < 0

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(absAmount)

  const parts = formatted.split('.')
  const integerPart = parts[0].replace(/,/g, '')
  const decimalPart = parts[1] || ''

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    currency.thousandsSeparator || ','
  )

  let result = decimalPart
    ? `${formattedInteger}${currency.decimalSeparator || '.'}${decimalPart}`
    : formattedInteger

  if (currency.symbolPosition === 'before') {
    result = showCode 
      ? `${currency.symbol} ${result}`
      : `${currency.symbol}${result}`
  } else {
    result = showCode
      ? `${result} ${currency.symbol}`
      : `${result}${currency.symbol}`
  }

  if (isNegative) {
    result = `-${result}`
  }

  if (showCode && currency.code !== currency.symbol) {
    result = `${result} ${currency.code}`
  }

  return result
}

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: ExchangeRate[]
): { amount: number; rate: number } | null {
  if (fromCurrency === toCurrency) {
    return { amount, rate: 1 }
  }

  const directRate = exchangeRates.find(
    (rate) =>
      rate.fromCurrency === fromCurrency &&
      rate.toCurrency === toCurrency &&
      rate.isActive &&
      (!rate.validTo || rate.validTo > Date.now())
  )

  if (directRate) {
    return {
      amount: amount * directRate.rate,
      rate: directRate.rate,
    }
  }

  const inverseRate = exchangeRates.find(
    (rate) =>
      rate.fromCurrency === toCurrency &&
      rate.toCurrency === fromCurrency &&
      rate.isActive &&
      (!rate.validTo || rate.validTo > Date.now())
  )

  if (inverseRate && inverseRate.inverseRate) {
    return {
      amount: amount * inverseRate.inverseRate,
      rate: inverseRate.inverseRate,
    }
  }

  return null
}

export function roundCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode,
  mode: 'round' | 'floor' | 'ceil' = 'round'
): number {
  const currency = CURRENCIES[currencyCode]
  if (!currency) return amount

  const multiplier = Math.pow(10, currency.decimalPlaces)
  
  switch (mode) {
    case 'floor':
      return Math.floor(amount * multiplier) / multiplier
    case 'ceil':
      return Math.ceil(amount * multiplier) / multiplier
    default:
      return Math.round(amount * multiplier) / multiplier
  }
}

export function getActiveCurrencies(allowedCurrencies?: CurrencyCode[]): Currency[] {
  const codes = allowedCurrencies || Object.keys(CURRENCIES) as CurrencyCode[]
  return codes
    .map((code) => CURRENCIES[code])
    .filter((currency) => currency && currency.isActive)
}

export function getCurrencyByCode(code: CurrencyCode): Currency | null {
  return CURRENCIES[code] || null
}

export function createMultiCurrencyAmount(
  amount: number,
  currency: CurrencyCode,
  originalAmount?: number,
  originalCurrency?: CurrencyCode,
  exchangeRate?: number
): MultiCurrencyAmount {
  return {
    amount,
    currency,
    originalAmount,
    originalCurrency,
    exchangeRate,
    convertedAt: originalAmount !== undefined ? Date.now() : undefined,
  }
}

export function updateExchangeRate(
  rates: ExchangeRate[],
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rate: number,
  userId: string,
  source: 'manual' | 'api' | 'system' = 'manual'
): ExchangeRate[] {
  const existingIndex = rates.findIndex(
    (r) =>
      r.fromCurrency === fromCurrency &&
      r.toCurrency === toCurrency &&
      r.isActive
  )

  const newRate: ExchangeRate = {
    id: `rate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fromCurrency,
    toCurrency,
    rate,
    inverseRate: 1 / rate,
    source,
    effectiveDate: Date.now(),
    updatedAt: Date.now(),
    validFrom: Date.now(),
    lastUpdated: Date.now(),
    updatedBy: userId,
    isActive: true,
  }

  if (existingIndex !== -1) {
    const updatedRates = [...rates]
    updatedRates[existingIndex] = { ...updatedRates[existingIndex], isActive: false }
    return [...updatedRates, newRate]
  }

  return [...rates, newRate]
}

export function getLatestExchangeRate(
  rates: ExchangeRate[],
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): ExchangeRate | null {
  const activeRates = rates
    .filter(
      (rate) =>
        rate.fromCurrency === fromCurrency &&
        rate.toCurrency === toCurrency &&
        rate.isActive &&
        (!rate.validTo || rate.validTo > Date.now())
    )
    .sort((a, b) => (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0))

  return activeRates[0] || null
}

export function bulkConvertAmounts(
  amounts: { id: string; amount: number }[],
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: ExchangeRate[]
): { id: string; originalAmount: number; convertedAmount: number; rate: number }[] {
  const conversion = convertCurrency(1, fromCurrency, toCurrency, exchangeRates)
  
  if (!conversion) {
    return amounts.map((item) => ({
      id: item.id,
      originalAmount: item.amount,
      convertedAmount: item.amount,
      rate: 1,
    }))
  }

  return amounts.map((item) => ({
    id: item.id,
    originalAmount: item.amount,
    convertedAmount: roundCurrencyAmount(
      item.amount * conversion.rate,
      toCurrency
    ),
    rate: conversion.rate,
  }))
}

export const DEFAULT_EXCHANGE_RATES: Partial<Record<CurrencyCode, number>> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 148.50,
  CNY: 7.24,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.35,
  SEK: 10.48,
  KRW: 1329.50,
  NOK: 10.72,
  NZD: 1.66,
  INR: 83.12,
  LKR: 325.00,
  AED: 3.67,
  SAR: 3.75,
  THB: 35.50,
  MYR: 4.72,
  IDR: 15750.00,
  PHP: 56.25,
  VND: 24450.00,
}

export function generateDefaultExchangeRates(
  baseCurrency: CurrencyCode = 'USD',
  userId: string
): ExchangeRate[] {
  const rates: ExchangeRate[] = []
  const baseRate = DEFAULT_EXCHANGE_RATES[baseCurrency] || 1

  Object.entries(DEFAULT_EXCHANGE_RATES).forEach(([code, rate]) => {
    const currencyCode = code as CurrencyCode
    if (currencyCode !== baseCurrency) {
      const exchangeRate = rate / baseRate
      rates.push({
        id: `rate-${Date.now()}-${currencyCode}`,
        fromCurrency: baseCurrency,
        toCurrency: currencyCode,
        rate: exchangeRate,
        inverseRate: 1 / exchangeRate,
        source: 'system',
        effectiveDate: Date.now(),
        updatedAt: Date.now(),
        validFrom: Date.now(),
        lastUpdated: Date.now(),
        updatedBy: userId,
        isActive: true,
      })
    }
  })

  return rates
}

export function calculateCurrencyMargin(
  baseRate: number,
  appliedRate: number
): number {
  return ((appliedRate - baseRate) / baseRate) * 100
}

export function applyCurrencyMargin(
  baseRate: number,
  marginPercent: number
): number {
  return baseRate * (1 + marginPercent / 100)
}

export function parseCurrencyInput(
  input: string,
  currencyCode: CurrencyCode = 'LKR'
): number | null {
  const currency = CURRENCIES[currencyCode]
  if (!currency) return null

  const cleanInput = input
    .replace(new RegExp(`\\${currency.symbol}`, 'g'), '')
    .replace(new RegExp(currency.code, 'g'), '')
    .replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${currency.decimalSeparator}`, 'g'), '.')
    .trim()

  const parsed = parseFloat(cleanInput)
  return isNaN(parsed) ? null : parsed
}
