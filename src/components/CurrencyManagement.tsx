import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  CurrencyDollar, 
  Plus, 
  Pencil, 
  Trash,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  TrendUp,
  Clock,
  Calculator,
  Copy
} from '@phosphor-icons/react'
import { 
  type CurrencyCode, 
  type ExchangeRate, 
  type CurrencyConfiguration,
  CURRENCIES 
} from '@/lib/currencyTypes'
import { 
  formatCurrencyAmount,
  getActiveCurrencies,
  updateExchangeRate,
  getLatestExchangeRate,
  generateDefaultExchangeRates,
  calculateCurrencyMargin,
  applyCurrencyMargin
} from '@/lib/currencyHelpers'
import { formatDateTime } from '@/lib/helpers'
import type { SystemUser } from '@/lib/types'

interface CurrencyManagementProps {
  configuration: CurrencyConfiguration | null
  setConfiguration: (config: CurrencyConfiguration) => void
  exchangeRates: ExchangeRate[]
  setExchangeRates: (rates: ExchangeRate[]) => void
  currentUser: SystemUser
}

export function CurrencyManagement({
  configuration,
  setConfiguration,
  exchangeRates,
  setExchangeRates,
  currentUser
}: CurrencyManagementProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedFromCurrency, setSelectedFromCurrency] = useState<CurrencyCode>('USD')
  const [selectedToCurrency, setSelectedToCurrency] = useState<CurrencyCode>('LKR')
  const [rateValue, setRateValue] = useState('')
  const [marginPercent, setMarginPercent] = useState('0')
  const [bulkRates, setBulkRates] = useState<Record<string, string>>({})
  const [selectedHistoryCurrencyPair, setSelectedHistoryCurrencyPair] = useState<{ from: CurrencyCode, to: CurrencyCode } | null>(null)
  const [quickPreset, setQuickPreset] = useState<'market' | 'competitive' | 'premium'>('market')

  const defaultConfig: CurrencyConfiguration = configuration || {
    id: 'currency-config-1',
    baseCurrency: 'LKR',
    displayCurrency: 'LKR',
    allowedCurrencies: ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'],
    autoUpdateRates: false,
    rateUpdateInterval: 3600000,
    roundingMode: 'round',
    showOriginalAmount: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    updatedBy: currentUser.id
  }

  const handleConfigUpdate = (updates: Partial<CurrencyConfiguration>) => {
    const updated: CurrencyConfiguration = {
      ...defaultConfig,
      ...updates,
      updatedAt: Date.now(),
      updatedBy: currentUser.id
    }
    setConfiguration(updated)
    toast.success('Currency configuration updated')
  }

  const handleAddExchangeRate = () => {
    if (!rateValue || parseFloat(rateValue) <= 0) {
      toast.error('Please enter a valid exchange rate')
      return
    }

    const baseRate = parseFloat(rateValue)
    const margin = parseFloat(marginPercent) || 0
    const finalRate = margin !== 0 ? applyCurrencyMargin(baseRate, margin) : baseRate

    const updatedRates = updateExchangeRate(
      exchangeRates,
      selectedFromCurrency,
      selectedToCurrency,
      finalRate,
      currentUser.id,
      'manual'
    )

    setExchangeRates(updatedRates)
    setEditDialogOpen(false)
    setRateValue('')
    setMarginPercent('0')
    toast.success(`Exchange rate updated: ${selectedFromCurrency} → ${selectedToCurrency}`)
  }

  const handleGenerateDefaultRates = () => {
    const defaultRates = generateDefaultExchangeRates(
      defaultConfig.baseCurrency,
      currentUser.id
    )
    setExchangeRates([...exchangeRates, ...defaultRates])
    toast.success(`Generated ${defaultRates.length} default exchange rates`)
  }

  const handleDeleteRate = (rateId: string) => {
    setExchangeRates(exchangeRates.map(r => 
      r.id === rateId ? { ...r, isActive: false } : r
    ))
    toast.success('Exchange rate deactivated')
  }

  const handleToggleCurrency = (currencyCode: CurrencyCode) => {
    const current = defaultConfig.allowedCurrencies || []
    const updated = current.includes(currencyCode)
      ? current.filter(c => c !== currencyCode)
      : [...current, currencyCode]
    
    handleConfigUpdate({ allowedCurrencies: updated })
  }

  const activeRates = exchangeRates.filter(r => r.isActive)
  const allowedCurrencies = getActiveCurrencies(defaultConfig.allowedCurrencies)

  const handleBulkEditOpen = () => {
    const baseCurrency = defaultConfig.baseCurrency
    const rates: Record<string, string> = {}
    
    allowedCurrencies.forEach(currency => {
      if (currency.code !== baseCurrency) {
        const existingRate = getLatestExchangeRate(exchangeRates, baseCurrency, currency.code)
        rates[currency.code] = existingRate ? existingRate.rate.toString() : ''
      }
    })
    
    setBulkRates(rates)
    setBulkEditDialogOpen(true)
  }

  const handleBulkSave = () => {
    let updatedCount = 0
    const baseCurrency = defaultConfig.baseCurrency
    let updatedRates = exchangeRates
    
    Object.entries(bulkRates).forEach(([currencyCode, rateStr]) => {
      const rate = parseFloat(rateStr)
      if (rate && rate > 0) {
        updatedRates = updateExchangeRate(
          updatedRates,
          baseCurrency,
          currencyCode as CurrencyCode,
          rate,
          currentUser.id,
          'manual'
        )
        updatedCount++
      }
    })
    
    setExchangeRates(updatedRates)
    setBulkEditDialogOpen(false)
    toast.success(`Updated ${updatedCount} exchange rates`)
  }

  const handleQuickSetRate = (currencyCode: CurrencyCode, rate: string) => {
    setBulkRates(prev => ({
      ...prev,
      [currencyCode]: rate
    }))
  }

  const handleApplyPreset = (preset: 'market' | 'competitive' | 'premium') => {
    setQuickPreset(preset)
    const margin = preset === 'market' ? 0 : preset === 'competitive' ? 1.5 : 3.0
    setMarginPercent(margin.toString())
  }

  const handleCopyFromCurrency = (sourceCurrency: CurrencyCode) => {
    const rate = getLatestExchangeRate(exchangeRates, sourceCurrency, selectedToCurrency)
    if (rate) {
      setRateValue(rate.rate.toString())
      toast.success(`Copied rate from ${sourceCurrency}`)
    } else {
      toast.error(`No rate found for ${sourceCurrency} → ${selectedToCurrency}`)
    }
  }

  const handleViewHistory = (fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => {
    setSelectedHistoryCurrencyPair({ from: fromCurrency, to: toCurrency })
    setHistoryDialogOpen(true)
  }

  const getRateHistory = (fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => {
    return exchangeRates
      .filter(r => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 10)
  }

  const calculateRateChange = (currentRate: number, previousRate: number): { percent: number; direction: 'up' | 'down' | 'stable' } => {
    if (!previousRate) return { percent: 0, direction: 'stable' }
    const change = ((currentRate - previousRate) / previousRate) * 100
    return {
      percent: Math.abs(change),
      direction: change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'stable'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Multi-Currency Management</h2>
        <p className="text-muted-foreground">
          Configure custom exchange rates and currency settings for international guests
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Base Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base-currency">Base Currency (Hotel Currency)</Label>
            <Select
              value={defaultConfig.baseCurrency}
              onValueChange={(value) => handleConfigUpdate({ baseCurrency: value as CurrencyCode })}
            >
              <SelectTrigger id="base-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CURRENCIES).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The primary currency for your hotel operations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-currency">Default Display Currency</Label>
            <Select
              value={defaultConfig.displayCurrency}
              onValueChange={(value) => handleConfigUpdate({ displayCurrency: value as CurrencyCode })}
            >
              <SelectTrigger id="display-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CURRENCIES).map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default currency shown to guests
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rounding-mode">Rounding Mode</Label>
            <Select
              value={defaultConfig.roundingMode}
              onValueChange={(value) => handleConfigUpdate({ roundingMode: value as 'round' | 'floor' | 'ceil' })}
            >
              <SelectTrigger id="rounding-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">Round (Standard)</SelectItem>
                <SelectItem value="floor">Floor (Round Down)</SelectItem>
                <SelectItem value="ceil">Ceil (Round Up)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between space-x-2 pt-6">
            <div className="space-y-0.5">
              <Label htmlFor="show-original">Show Original Amount</Label>
              <p className="text-xs text-muted-foreground">
                Display both converted and original amounts
              </p>
            </div>
            <Switch
              id="show-original"
              checked={defaultConfig.showOriginalAmount}
              onCheckedChange={(checked) => handleConfigUpdate({ showOriginalAmount: checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Allowed Currencies</h3>
          <Badge variant="outline">
            {allowedCurrencies.length} Active
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.values(CURRENCIES).map((currency) => {
            const isAllowed = defaultConfig.allowedCurrencies?.includes(currency.code)
            return (
              <div
                key={currency.code}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  isAllowed
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleToggleCurrency(currency.code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currency.symbol}</span>
                    <div>
                      <p className="font-medium text-sm">{currency.code}</p>
                      <p className="text-xs text-muted-foreground">{currency.name}</p>
                    </div>
                  </div>
                  {isAllowed && (
                    <CheckCircle size={20} className="text-primary" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Exchange Rates</h3>
            <p className="text-sm text-muted-foreground">
              Manage currency conversion rates
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateDefaultRates}
            >
              <ArrowsClockwise size={18} className="mr-2" />
              Load Defaults
            </Button>
            <Button
              variant="outline"
              onClick={handleBulkEditOpen}
            >
              <Pencil size={18} className="mr-2" />
              Bulk Edit
            </Button>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Rate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exchange Rate</DialogTitle>
                  <DialogDescription>
                    Set the conversion rate between two currencies
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Currency</Label>
                      <Select
                        value={selectedFromCurrency}
                        onValueChange={(value) => setSelectedFromCurrency(value as CurrencyCode)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedCurrencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>To Currency</Label>
                      <Select
                        value={selectedToCurrency}
                        onValueChange={(value) => setSelectedToCurrency(value as CurrencyCode)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedCurrencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.symbol} {currency.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate-value">Exchange Rate</Label>
                    <Input
                      id="rate-value"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 325.50"
                      value={rateValue}
                      onChange={(e) => setRateValue(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      1 {selectedFromCurrency} = {rateValue || '?'} {selectedToCurrency}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Quick Margin Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={quickPreset === 'market' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleApplyPreset('market')}
                      >
                        <Calculator size={16} className="mr-2" />
                        Market (0%)
                      </Button>
                      <Button
                        type="button"
                        variant={quickPreset === 'competitive' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleApplyPreset('competitive')}
                      >
                        <TrendUp size={16} className="mr-2" />
                        Competitive (1.5%)
                      </Button>
                      <Button
                        type="button"
                        variant={quickPreset === 'premium' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleApplyPreset('premium')}
                      >
                        <TrendUp size={16} className="mr-2" />
                        Premium (3%)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="margin">Custom Margin % (Optional)</Label>
                    <Input
                      id="margin"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 2.5"
                      value={marginPercent}
                      onChange={(e) => {
                        setMarginPercent(e.target.value)
                        setQuickPreset('market')
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a margin for currency exchange services
                    </p>
                  </div>

                  {rateValue && parseFloat(marginPercent) !== 0 && (
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm font-medium text-primary mb-1">Final Rate with Margin:</p>
                      <p className="text-lg font-semibold">
                        1 {selectedFromCurrency} = {applyCurrencyMargin(parseFloat(rateValue), parseFloat(marginPercent)).toFixed(4)} {selectedToCurrency}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddExchangeRate}>
                      Add Rate
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeRates.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollar size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Exchange Rates</h3>
            <p className="text-muted-foreground mb-4">
              Add exchange rates to enable multi-currency support
            </p>
            <Button onClick={() => setEditDialogOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add First Rate
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Inverse</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRates.map((rate) => {
                  const fromCurrency = CURRENCIES[rate.fromCurrency]
                  const toCurrency = CURRENCIES[rate.toCurrency]
                  return (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{fromCurrency.symbol}</span>
                          <span className="font-medium">{rate.fromCurrency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{toCurrency.symbol}</span>
                          <span className="font-medium">{rate.toCurrency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{rate.rate.toFixed(4)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-muted-foreground">
                          {rate.inverseRate ? rate.inverseRate.toFixed(4) : (1 / rate.rate).toFixed(4)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          rate.source === 'manual' ? 'default' :
                          rate.source === 'api' ? 'secondary' : 'outline'
                        }>
                          {rate.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(rate.lastUpdated)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFromCurrency(rate.fromCurrency)
                              setSelectedToCurrency(rate.toCurrency)
                              setRateValue(rate.rate.toString())
                              setEditDialogOpen(true)
                            }}
                            title="Edit rate"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(rate.fromCurrency, rate.toCurrency)}
                            title="View history"
                          >
                            <Clock size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(rate.rate.toString())
                              toast.success('Rate copied to clipboard')
                            }}
                            title="Copy rate"
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRate(rate.id)}
                            title="Deactivate rate"
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-6 border-amber-500/50 bg-amber-500/5">
        <div className="flex gap-3">
          <Warning size={24} className="text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold mb-2">Important Notes</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Exchange rates should be updated regularly for accuracy</li>
              <li>All transactions are stored in the base currency</li>
              <li>Guest invoices can display amounts in their preferred currency</li>
              <li>Historical rates are preserved for audit purposes</li>
              <li>Consider adding a small margin to cover exchange rate fluctuations</li>
            </ul>
          </div>
        </div>
      </Card>

      <Dialog open={bulkEditDialogOpen} onOpenChange={setBulkEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Edit Exchange Rates</DialogTitle>
            <DialogDescription>
              Configure exchange rates for all allowed currencies from {defaultConfig.baseCurrency}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Base Currency: {CURRENCIES[defaultConfig.baseCurrency].symbol} {defaultConfig.baseCurrency}</p>
              <p className="text-xs text-muted-foreground">
                Set the exchange rate from {defaultConfig.baseCurrency} to each currency below
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allowedCurrencies.map((currency) => {
                if (currency.code === defaultConfig.baseCurrency) return null
                
                const currentRate = getLatestExchangeRate(
                  exchangeRates,
                  defaultConfig.baseCurrency,
                  currency.code
                )

                return (
                  <div key={currency.code} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.symbol}</span>
                        <div>
                          <p className="font-medium">{currency.code}</p>
                          <p className="text-xs text-muted-foreground">{currency.name}</p>
                        </div>
                      </div>
                      {currentRate && (
                        <Badge variant="outline" className="text-xs">
                          Current: {currentRate.rate.toFixed(4)}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">
                        1 {defaultConfig.baseCurrency} = ? {currency.code}
                      </Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder={`e.g., ${currentRate ? currentRate.rate.toFixed(4) : '0.0000'}`}
                        value={bulkRates[currency.code] || ''}
                        onChange={(e) => handleQuickSetRate(currency.code, e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setBulkEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkSave}>
                <CheckCircle size={18} className="mr-2" />
                Save All Rates
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Exchange Rate History</DialogTitle>
            <DialogDescription>
              {selectedHistoryCurrencyPair && (
                <>Historical rates for {CURRENCIES[selectedHistoryCurrencyPair.from].symbol} {selectedHistoryCurrencyPair.from} → {CURRENCIES[selectedHistoryCurrencyPair.to].symbol} {selectedHistoryCurrencyPair.to}</>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedHistoryCurrencyPair && (
            <div className="space-y-4 py-4">
              {(() => {
                const history = getRateHistory(selectedHistoryCurrencyPair.from, selectedHistoryCurrencyPair.to)
                if (history.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No history available for this currency pair</p>
                    </div>
                  )
                }
                
                return (
                  <div className="space-y-3">
                    {history.map((rate, index) => {
                      const previousRate = history[index + 1]
                      const change = previousRate ? calculateRateChange(rate.rate, previousRate.rate) : null
                      const isActive = rate.isActive
                      
                      return (
                        <div
                          key={rate.id}
                          className={`p-4 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-2xl font-semibold">
                                  {rate.rate.toFixed(4)}
                                </span>
                                {isActive && (
                                  <Badge variant="default">Current</Badge>
                                )}
                                {change && (
                                  <Badge variant={
                                    change.direction === 'up' ? 'default' :
                                    change.direction === 'down' ? 'destructive' : 'outline'
                                  }>
                                    {change.direction === 'up' && <TrendUp size={14} className="mr-1" />}
                                    {change.direction === 'down' && <TrendUp size={14} className="mr-1 rotate-180" />}
                                    {change.percent.toFixed(2)}%
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {formatDateTime(rate.updatedAt || rate.effectiveDate)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {rate.source}
                                </Badge>
                                {rate.updatedBy && (
                                  <span>Updated by: {rate.updatedBy}</span>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedFromCurrency(rate.fromCurrency)
                                  setSelectedToCurrency(rate.toCurrency)
                                  setRateValue(rate.rate.toString())
                                  setHistoryDialogOpen(false)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Pencil size={14} className="mr-2" />
                                Update
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
