export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'HKD' | 'SGD'
  | 'MXN' | 'TRY' | 'EGP' | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS'
export interface Currency {
  | 'MXN' | 'TRY' | 'EGP' | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS'

export interface Currency {
  code: CurrencyCode

  baseCurrency: 
  allowedCurrencies: Cu
  rateSource?: string
  showOriginalAmount: boolea
  updatedBy?: string

 

export interface CurrencyConfiguration {
  baseCurrency: CurrencyCode
  displayCurrency: CurrencyCode
  allowedCurrencies: CurrencyCode[]
  autoUpdateRates: boolean
  rateSource?: string
  roundingMode: 'round' | 'floor' | 'ceil'
  showOriginalAmount: boolean
  updatedAt: number
  updatedBy?: string
 

export interface ExchangeRate {
  id: string
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  HKD: { code: 'HKD',
  SEK: { code: 'SEK', name: 'Swedish 
  NOK: { code: 'NOK
  INR: { code: 'IN
  AED: { code: 'AED',
  QAR: { code: 'QAR
  BHD: { code: 'BHD
  JOD: { code: 'J
}

  RUB: { code: 'RUB', name: 'Russian R
  MXN: { code: '
  EGP: { code: 'EGP', na
  TWD: { code: 'TWD', nam
  PLN: { code: 'PLN', name: 'Poli
  HUF: { code: 'HUF', n
}
}





}










































}
