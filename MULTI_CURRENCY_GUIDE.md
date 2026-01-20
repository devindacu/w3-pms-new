# Multi-Currency Support for International Guests

## Overview

The W3 Hotel PMS now includes comprehensive multi-currency support to serve international guests. This feature allows hotels to:

- Configure multiple currencies for guest transactions
- Set and manage exchange rates
- Display amounts in guest-preferred currencies
- Maintain all records in the hotel's base currency
- Apply currency conversion margins for exchange services

## Features

### 1. Currency Configuration

**Location:** Settings > Currency

Configure the following:
- **Base Currency**: The hotel's primary operating currency (e.g., LKR)
- **Display Currency**: Default currency shown to guests
- **Allowed Currencies**: Select which currencies are available for guests
- **Rounding Mode**: Choose how amounts are rounded (round, floor, or ceil)
- **Show Original Amount**: Display both converted and original amounts on invoices

### 2. Exchange Rate Management

Administrators can:
- Manually add exchange rates between currency pairs
- Set custom margins for currency exchange services
- View real-time and historical exchange rates
- Load default exchange rates as starting values
- Deactivate outdated rates while preserving history

### 3. Supported Currencies

The system supports 40 major world currencies including:

**Major Currencies:**
- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- JPY - Japanese Yen
- CNY - Chinese Yuan

**Regional Currencies:**
- AUD, CAD, CHF, HKD, SGD
- SEK, KRW, NOK, NZD
- INR, LKR (Sri Lankan Rupee)

**Middle East:**
- AED, SAR, QAR, KWD, BHD, OMR, JOD

**Asia Pacific:**
- THB, MYR, IDR, PHP, VND, TWD

**Others:**
- BRL, RUB, ZAR, MXN, TRY, EGP, ILS
- DKK, PLN, CZK, HUF

## Implementation Details

### Data Structure

#### Currency Configuration
```typescript
{
  baseCurrency: 'LKR',
  displayCurrency: 'USD',
  allowedCurrencies: ['LKR', 'USD', 'EUR', 'GBP', ...],
  autoUpdateRates: false,
  roundingMode: 'round',
  showOriginalAmount: true
}
```

#### Exchange Rates
```typescript
{
  fromCurrency: 'USD',
  toCurrency: 'LKR',
  rate: 325.50,
  inverseRate: 0.00307,
  source: 'manual' | 'api' | 'system',
  validFrom: timestamp,
  lastUpdated: timestamp,
  isActive: true
}
```

### Currency Formatting

Each currency has specific formatting rules:
- **Symbol**: Currency symbol (e.g., $, €, ¥)
- **Symbol Position**: Before or after the amount
- **Decimal Places**: 0-3 decimal places
- **Separators**: Thousands and decimal separators

Examples:
- USD: `$ 1,234.56`
- EUR: `€ 1.234,56`
- JPY: `¥ 1,235` (no decimals)
- KWD: `د.ك 1,234.567` (3 decimals)

## Usage Guide

### Setting Up Multi-Currency

1. **Go to Settings > Currency**
2. **Configure Base Settings:**
   - Select your hotel's base currency
   - Choose default display currency
   - Set rounding preferences

3. **Enable Currencies:**
   - Click on currency cards to enable/disable them
   - Select currencies relevant to your guest demographics

4. **Add Exchange Rates:**
   - Click "Add Rate" button
   - Select currency pair (FROM → TO)
   - Enter exchange rate
   - Optionally add a margin percentage
   - Save the rate

5. **Load Default Rates (Optional):**
   - Click "Load Defaults" to populate with system defaults
   - Edit rates as needed for your requirements

### Exchange Rate Best Practices

1. **Regular Updates**: Update rates daily or weekly based on market fluctuations
2. **Margin Application**: Consider adding 1-3% margin to cover:
   - Bank fees
   - Exchange rate volatility
   - Administrative costs

3. **Rate Sources**:
   - **Manual**: Entered by staff
   - **API**: Auto-updated from currency APIs (future feature)
   - **System**: Default rates provided by the system

### Guest Invoice Currency Display

When generating guest invoices:
- Amounts are stored in the base currency
- Converted to guest's preferred currency for display
- Original amounts can optionally be shown for transparency
- Exchange rate and conversion timestamp are recorded

## API Functions

### Core Functions

#### formatCurrencyAmount()
```typescript
formatCurrencyAmount(
  amount: number,
  currencyCode: 'USD' | 'EUR' | ...,
  showCode: boolean = true
): string
```

#### convertCurrency()
```typescript
convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: ExchangeRate[]
): { amount: number; rate: number } | null
```

#### roundCurrencyAmount()
```typescript
roundCurrencyAmount(
  amount: number,
  currencyCode: CurrencyCode,
  mode: 'round' | 'floor' | 'ceil'
): number
```

### Helper Functions

- `getActiveCurrencies()` - Get list of enabled currencies
- `getCurrencyByCode()` - Get currency details
- `updateExchangeRate()` - Add/update exchange rate
- `getLatestExchangeRate()` - Get current rate for currency pair
- `calculateCurrencyMargin()` - Calculate margin percentage
- `applyCurrencyMargin()` - Apply margin to rate

## Database Storage

All currency data is stored in IndexedDB using the spark.kv system:

- `w3-hotel-currency-config` - Currency configuration
- `w3-hotel-exchange-rates` - Exchange rate history

### Data Persistence

✅ **Preserved on Updates:**
- All currency configurations
- Exchange rate history
- Guest currency preferences

✅ **Safe Updates:**
- New features won't reset currency settings
- Rate history is maintained indefinitely
- Deactivated rates are preserved for audit

## Migration from Single Currency

If upgrading from a previous version:

1. **Existing Data**: All amounts remain in LKR (or your base currency)
2. **No Data Loss**: Historical transactions are unchanged
3. **Gradual Rollout**: Enable currencies as needed
4. **Default Rates**: Use "Load Defaults" for quick setup

## Future Enhancements

Planned features for future releases:

1. **Auto-Update Rates**: Integration with live currency APIs
2. **Guest Preferences**: Save currency preference per guest profile
3. **Multi-Currency Reporting**: Analytics in multiple currencies
4. **Currency Hedging**: Track exchange rate gains/losses
5. **Bank Integration**: Direct integration with bank exchange rates

## Troubleshooting

### Common Issues

**Q: Exchange rates not showing?**
A: Click "Load Defaults" to populate initial rates, then customize as needed.

**Q: Can I change the base currency?**
A: Yes, but this will require recalculation of all stored amounts. Contact support before changing.

**Q: How often should I update rates?**
A: For high-volume international hotels, daily updates recommended. Otherwise, weekly is sufficient.

**Q: Can guests pay in any enabled currency?**
A: Display currency is separate from payment currency. Payment processing depends on your payment gateway.

### Support

For additional support with multi-currency configuration:
- Email: support@w3media.lk
- Documentation: https://docs.w3media.lk/hotel-pms/multi-currency

## Technical Notes

### Performance

- Currency conversions are calculated client-side
- No external API calls required
- Fast lookup using indexed exchange rate tables
- Minimal impact on application performance

### Security

- Exchange rates require admin privileges to modify
- Audit trail maintained for all rate changes
- Historical rates preserved for compliance

### Compatibility

- Works with all existing modules
- Compatible with guest invoicing
- Integrates with payment tracking
- Supports all reporting features

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Module:** Multi-Currency Support  
**Platform:** W3 Hotel PMS
