export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'HKD' | 'SGD'
  | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS' | 'TRY' | 'EGP' | 'LKR'
export interface Currency {
  | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS' | 'TRY' | 'EGP' | 'LKR'

export interface Currency {
  code: CurrencyCode
  thousandsSep
  symbol: string
  decimalPlaces: number
  symbolPosition: 'before' | 'after'
  thousandsSeparator: string
  decimalSeparator: string
  rate: number
}

  displayCurrency: CurrencyCode
  autoUpdate
  rateSource?: string
  showOriginalAmount: bool
  updatedAt: n
}
export interface MultiCurrencyAmount 
  currency: Currenc
  originalCurrency
  convertedAt?: numbe

  guestId: string
 


  USD: { cod
  GBP: { code: 'GBP', name: 
  CNY: { code: 'CNY', name: 'Ch
  CAD: { code: 'CAD', name: 'Canadi
  HKD: { code: 'HKD', name
  SEK: { code: 'SEK', name: 
  NOK: { code: 'NOK',
  INR: { code: 'INR', name: 'Indian Rupee'
  ZAR: { code: 'ZAR', name: '
  RUB: { code: 'RUB
  SAR: { code: 'SAR
  KWD: { code: 'KWD
 

  IDR: { code: 'IDR', name: 'Indonesia
  VND: { code: '
  DKK: { code: 'DKK', na
  CZK: { code: 'CZK', nam
  ILS: { code: 'ILS', name: 'Isra
  EGP: { code: 'EGP', n
}




















































