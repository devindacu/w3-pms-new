export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'HKD' | 'SGD'
  | 'SEK' | 'NOK' | 'INR' | 'AED' | 'SAR' | 'QAR' | 'BHD' | 'OMR' | 'JOD' | 'RUB'
  | 'MXN' | 'TRY' | 'EGP' | 'VND' | 'TWD' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS'


  symbol: string
}
export interfa
  displayCurrenc
  autoUpdateRates: bool
 

}
export interface ExchangeRat
  fromCurrency: CurrencyCode
  rate: number
  updatedAt: number
}
export const CURRENCIES: Record<CurrencyCo
  EUR: { code: 'EUR', name: '
  JPY: { code: 'JPY
  AUD: { code: 'AUD'
 

  NOK: { code: 'NOK', name: 'No
  AED: { cod
  QAR: { code: 'QAR', name: 
  OMR: { code: 'OMR', name
  RUB: { code:
  effectiveDate: number
  updatedAt: number
  updatedBy?: string
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalPlaces: 2 },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', decimalPlaces: 2 },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', decimalPlaces: 3 },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: '﷼', decimalPlaces: 3 },
  JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', decimalPlaces: 3 },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimalPlaces: 2 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', decimalPlaces: 2 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalPlaces: 2 },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: '£', decimalPlaces: 2 },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', decimalPlaces: 0 },







