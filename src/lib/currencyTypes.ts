export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'HKD' | 'SGD'
  | 'SEK' | 'KRW' | 'NOK' | 'NZD' | 'INR' | 'MXN' | 'ZAR' | 'BRL' | 'RUB' | 'AED'
  | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'JOD' | 'THB' | 'MYR' | 'IDR' | 'PHP'
  | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS' | 'TRY' | 'EGP' | 'LKR'

export interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  decimalPlaces: number
  symbolPosition: 'before' | 'after'
  thousandsSeparator: string
  decimalSeparator: string
  isActive: boolean
}

export interface ExchangeRate {
  id: string
  fromCurrency: CurrencyCode
  toCurrency: CurrencyCode
  rate: number
  inverseRate: number
  source: 'manual' | 'api' | 'system'
  validFrom: number
  validTo?: number
  lastUpdated: number
  updatedBy: string
  isActive: boolean
}

export interface CurrencyConfiguration {
  id: string
  baseCurrency: CurrencyCode
  displayCurrency: CurrencyCode
  allowedCurrencies: CurrencyCode[]
  autoUpdateRates: boolean
  rateUpdateInterval: number
  rateSource?: string
  roundingMode: 'round' | 'floor' | 'ceil'
  showOriginalAmount: boolean
  createdAt: number
  updatedAt: number
  updatedBy: string
}

export interface MultiCurrencyAmount {
  amount: number
  currency: CurrencyCode
  originalAmount?: number
  originalCurrency?: CurrencyCode
  exchangeRate?: number
  convertedAt?: number
}

export interface GuestCurrencyPreference {
  guestId: string
  preferredCurrency: CurrencyCode
  autoConvert: boolean
  createdAt: number
  updatedAt: number
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: "'", decimalSeparator: '.', isActive: true },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ' ', decimalSeparator: '.', isActive: true },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimalPlaces: 3, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', decimalPlaces: 3, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimalPlaces: 3, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', decimalPlaces: 3, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalPlaces: 0, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  TWD: { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimalPlaces: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimalPlaces: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimalPlaces: 0, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',', isActive: true },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: '.', decimalSeparator: ',', isActive: true },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimalPlaces: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.', isActive: true },
}
