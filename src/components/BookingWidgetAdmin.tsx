import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RatePlan {
  id: number
  name: string
  description: string | null
  roomType: string | null
  residentRate: string
  nonResidentRate: string
  mealPlan: string | null
  minNights: number | null
  maxNights: number | null
  isActive: boolean | null
  taxPercent: string | null
  serviceChargePercent: string | null
}

interface ResidentRule {
  id: number
  ratePlanId: number | null
  countryCode: string
  countryName: string
  isActive: boolean | null
}

interface SeasonalMultiplier {
  id: number
  ratePlanId: number | null
  name: string
  startDate: string
  endDate: string
  multiplier: string | null
}

interface PromoCode {
  id: number
  code: string
  description: string | null
  discountType: string | null
  discountValue: string
  minNights: number | null
  maxUses: number | null
  usedCount: number | null
  validFrom: string | null
  validTo: string | null
  isActive: boolean | null
}

interface WidgetSettings {
  propertyId: string
  primaryColor: string
  accentColor: string
  logoUrl: string | null
  propertyName: string
  welcomeMessage: string | null
  currencyCode: string
  currencySymbol: string
  residentLabel: string
  nonResidentLabel: string
  showAddOns: boolean | null
  allowedOrigins: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyRatePlan(): Omit<RatePlan, 'id'> {
  return {
    name: '',
    description: null,
    roomType: '',
    residentRate: '0',
    nonResidentRate: '0',
    mealPlan: 'room_only',
    minNights: 1,
    maxNights: null,
    isActive: true,
    taxPercent: '16',
    serviceChargePercent: '5',
  }
}

// ─── Widget Settings Tab ──────────────────────────────────────────────────────

function WidgetSettingsTab({ onCurrencyChange }: { onCurrencyChange?: (code: string) => void }) {
  const [settings, setSettings] = useState<WidgetSettings>({
    propertyId: 'default',
    primaryColor: '#1a56db',
    accentColor: '#0e9f6e',
    logoUrl: null,
    propertyName: 'Hotel',
    welcomeMessage: null,
    currencyCode: 'KES',
    currencySymbol: 'KES',
    residentLabel: 'Resident',
    nonResidentLabel: 'Non-Resident',
    showAddOns: true,
    allowedOrigins: null,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/booking/widget-settings')
      .then(r => r.json())
      .then(d => {
        setSettings(s => ({ ...s, ...d }))
        if (d.currencyCode && onCurrencyChange) onCurrencyChange(d.currencyCode)
      })
      .catch(() => {})
  }, [onCurrencyChange])

  async function save() {
    setSaving(true)
    try {
      const resp = await fetch('/api/booking/widget-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!resp.ok) throw new Error('Save failed')
      toast.success('Widget settings saved')
      if (onCurrencyChange) onCurrencyChange(settings.currencyCode)
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function set(field: keyof WidgetSettings, value: string | boolean | null) {
    setSettings(s => ({ ...s, [field]: value }))
  }

  return (
    <Card>
      <CardHeader><CardTitle>Widget Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Property Name</Label>
            <Input value={settings.propertyName} onChange={e => set('propertyName', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Welcome Message</Label>
            <Input value={settings.welcomeMessage ?? ''} onChange={e => set('welcomeMessage', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={e => set('primaryColor', e.target.value)}
                className="w-10 h-9 rounded border cursor-pointer"
              />
              <Input value={settings.primaryColor} onChange={e => set('primaryColor', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={e => set('accentColor', e.target.value)}
                className="w-10 h-9 rounded border cursor-pointer"
              />
              <Input value={settings.accentColor} onChange={e => set('accentColor', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Currency Code</Label>
            <Input value={settings.currencyCode} onChange={e => set('currencyCode', e.target.value)} placeholder="KES" />
          </div>
          <div className="space-y-1">
            <Label>Currency Symbol</Label>
            <Input value={settings.currencySymbol} onChange={e => set('currencySymbol', e.target.value)} placeholder="KES" />
          </div>
          <div className="space-y-1">
            <Label>Resident Label</Label>
            <Input value={settings.residentLabel} onChange={e => set('residentLabel', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Non-Resident Label</Label>
            <Input value={settings.nonResidentLabel} onChange={e => set('nonResidentLabel', e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Logo URL</Label>
            <Input value={settings.logoUrl ?? ''} onChange={e => set('logoUrl', e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Allowed Origins (comma-separated)</Label>
            <Input value={settings.allowedOrigins ?? ''} onChange={e => set('allowedOrigins', e.target.value)} placeholder="https://myhotel.com,https://www.myhotel.com" />
          </div>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
      </CardContent>
    </Card>
  )
}

// ─── Rate Plans Tab ───────────────────────────────────────────────────────────

function RatePlansTab({ currencyCode }: { currencyCode: string }) {
  const [plans, setPlans] = useState<RatePlan[]>([])
  const [editing, setEditing] = useState<Partial<RatePlan> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/booking/rate-plans')
    if (r.ok) setPlans(await r.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!editing) return
    setSaving(true)
    try {
      const url = isNew ? '/api/booking/rate-plans' : `/api/booking/rate-plans/${editing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!resp.ok) throw new Error('Save failed')
      toast.success(isNew ? 'Rate plan created' : 'Rate plan updated')
      setEditing(null)
      load()
    } catch {
      toast.error('Failed to save rate plan')
    } finally {
      setSaving(false)
    }
  }

  async function deletePlan(id: number) {
    if (!confirm('Delete this rate plan?')) return
    const resp = await fetch(`/api/booking/rate-plans/${id}`, { method: 'DELETE' })
    if (resp.ok) {
      toast.success('Rate plan deleted')
      load()
    } else {
      toast.error('Failed to delete rate plan')
    }
  }

  function set(field: keyof RatePlan, value: string | boolean | number | null) {
    setEditing(e => e ? { ...e, [field]: value } : e)
  }

  if (editing !== null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? 'New Rate Plan' : 'Edit Rate Plan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <Label>Name *</Label>
              <Input value={editing.name ?? ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Description</Label>
              <Input value={editing.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Room Type</Label>
              <Input value={editing.roomType ?? ''} onChange={e => set('roomType', e.target.value)} placeholder="e.g. deluxe, standard" />
            </div>
            <div className="space-y-1">
              <Label>Meal Plan</Label>
              <Select value={editing.mealPlan ?? 'room_only'} onValueChange={v => set('mealPlan', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="room_only">Room Only</SelectItem>
                  <SelectItem value="bed_breakfast">Bed & Breakfast</SelectItem>
                  <SelectItem value="half_board">Half Board</SelectItem>
                  <SelectItem value="full_board">Full Board</SelectItem>
                  <SelectItem value="all_inclusive">All Inclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Resident Rate (per night)</Label>
              <Input type="number" min="0" step="0.01" value={editing.residentRate ?? ''} onChange={e => set('residentRate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Non-Resident Rate (per night)</Label>
              <Input type="number" min="0" step="0.01" value={editing.nonResidentRate ?? ''} onChange={e => set('nonResidentRate', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Tax %</Label>
              <Input type="number" min="0" step="0.01" value={editing.taxPercent ?? ''} onChange={e => set('taxPercent', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Service Charge %</Label>
              <Input type="number" min="0" step="0.01" value={editing.serviceChargePercent ?? ''} onChange={e => set('serviceChargePercent', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Min Nights</Label>
              <Input type="number" min="1" value={editing.minNights ?? 1} onChange={e => set('minNights', parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1">
              <Label>Max Nights (leave blank for unlimited)</Label>
              <Input type="number" min="1" value={editing.maxNights ?? ''} onChange={e => set('maxNights', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="planActive"
                checked={editing.isActive ?? true}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="planActive">Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Rate Plans ({plans.length})</h3>
        <Button onClick={() => { setEditing(emptyRatePlan()); setIsNew(true) }}>+ New Rate Plan</Button>
      </div>
      {plans.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No rate plans yet. Create one to enable the booking engine.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <Card key={plan.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{plan.name}</p>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
                      {plan.roomType && <Badge variant="outline">{plan.roomType}</Badge>}
                    </div>
                    {plan.description && <p className="text-sm text-muted-foreground mt-0.5">{plan.description}</p>}
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span>Resident: <strong className="text-foreground">{currencyCode} {plan.residentRate}</strong></span>
                      <span>Non-Resident: <strong className="text-foreground">{currencyCode} {plan.nonResidentRate}</strong></span>
                      <span>Tax: {plan.taxPercent}% · SC: {plan.serviceChargePercent}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(plan); setIsNew(false) }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deletePlan(plan.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Resident Rules Tab ───────────────────────────────────────────────────────

const COUNTRIES = [
  { code: 'KE', name: 'Kenya' }, { code: 'TZ', name: 'Tanzania' }, { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' }, { code: 'ET', name: 'Ethiopia' }, { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' }, { code: 'GH', name: 'Ghana' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' }, { code: 'CN', name: 'China' }, { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' }, { code: 'CA', name: 'Canada' }, { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
]

function ResidentRulesTab() {
  const [rules, setRules] = useState<ResidentRule[]>([])
  const [plans, setPlans] = useState<RatePlan[]>([])
  const [form, setForm] = useState({ ratePlanId: '', countryCode: 'KE' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch('/api/booking/resident-rules').then(r => r.json()),
      fetch('/api/booking/rate-plans').then(r => r.json()),
    ])
    setRules(r1)
    setPlans(r2)
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    if (!form.ratePlanId) { toast.error('Select a rate plan'); return }
    setSaving(true)
    try {
      const country = COUNTRIES.find(c => c.code === form.countryCode)
      const resp = await fetch('/api/booking/resident-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ratePlanId: parseInt(form.ratePlanId),
          countryCode: form.countryCode,
          countryName: country?.name ?? form.countryCode,
          isActive: true,
        }),
      })
      if (!resp.ok) throw new Error('Failed')
      toast.success('Resident rule added')
      load()
    } catch {
      toast.error('Failed to add resident rule')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    const resp = await fetch(`/api/booking/resident-rules/${id}`, { method: 'DELETE' })
    if (resp.ok) { toast.success('Rule removed'); load() }
    else toast.error('Failed to remove rule')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Resident Country Rule</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Rate Plan</Label>
              <Select value={form.ratePlanId} onValueChange={v => setForm(f => ({ ...f, ratePlanId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.filter(p => p.isActive).map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Country</Label>
              <Select value={form.countryCode} onValueChange={v => setForm(f => ({ ...f, countryCode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={add} disabled={saving} className="w-full">{saving ? 'Adding…' : 'Add Rule'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No resident rules defined. Guests from unlisted countries get non-resident rates.</p>
        ) : rules.map(rule => {
          const plan = plans.find(p => p.id === rule.ratePlanId)
          return (
            <Card key={rule.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{rule.countryName}</span>
                  <span className="text-sm text-muted-foreground ml-2">({rule.countryCode})</span>
                  {plan && <span className="text-sm text-muted-foreground ml-2">→ {plan.name}</span>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => remove(rule.id)}>Remove</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Seasonal Multipliers Tab ─────────────────────────────────────────────────

function SeasonalMultipliersTab() {
  const [multipliers, setMultipliers] = useState<SeasonalMultiplier[]>([])
  const [plans, setPlans] = useState<RatePlan[]>([])
  const [form, setForm] = useState({ ratePlanId: '', name: '', startDate: '', endDate: '', multiplier: '1.000' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [r1, r2] = await Promise.all([
      fetch('/api/booking/seasonal-multipliers').then(r => r.json()),
      fetch('/api/booking/rate-plans').then(r => r.json()),
    ])
    setMultipliers(r1)
    setPlans(r2)
  }, [])

  useEffect(() => { load() }, [load])

  async function add() {
    if (!form.ratePlanId || !form.name || !form.startDate || !form.endDate) {
      toast.error('Fill all fields')
      return
    }
    setSaving(true)
    try {
      const resp = await fetch('/api/booking/seasonal-multipliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ratePlanId: parseInt(form.ratePlanId) }),
      })
      if (!resp.ok) throw new Error('Failed')
      toast.success('Seasonal multiplier added')
      setForm(f => ({ ...f, name: '', startDate: '', endDate: '', multiplier: '1.000' }))
      load()
    } catch {
      toast.error('Failed to add multiplier')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    const resp = await fetch(`/api/booking/seasonal-multipliers/${id}`, { method: 'DELETE' })
    if (resp.ok) { toast.success('Multiplier removed'); load() }
    else toast.error('Failed to remove multiplier')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Add Seasonal Multiplier</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Rate Plan</Label>
              <Select value={form.ratePlanId} onValueChange={v => setForm(f => ({ ...f, ratePlanId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.filter(p => p.isActive).map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Season Name</Label>
              <Input placeholder="e.g. High Season" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Multiplier</Label>
              <Input type="number" step="0.001" min="0.1" max="10" placeholder="1.000" value={form.multiplier} onChange={e => setForm(f => ({ ...f, multiplier: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={add} disabled={saving} className="w-full">{saving ? 'Adding…' : 'Add Season'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {multipliers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No seasonal multipliers defined. Base rates apply year-round.</p>
        ) : multipliers.map(m => {
          const plan = plans.find(p => p.id === m.ratePlanId)
          return (
            <Card key={m.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{m.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{m.startDate} → {m.endDate}</span>
                  <Badge variant="outline" className="ml-2">×{m.multiplier}</Badge>
                  {plan && <span className="text-sm text-muted-foreground ml-2">({plan.name})</span>}
                </div>
                <Button size="sm" variant="destructive" onClick={() => remove(m.id)}>Remove</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Promo Codes Tab ──────────────────────────────────────────────────────────

function PromoCodesTab({ currencyCode }: { currencyCode: string }) {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [editing, setEditing] = useState<Partial<PromoCode> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/booking/promo-codes')
    if (r.ok) setCodes(await r.json())
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!editing) return
    setSaving(true)
    try {
      const url = isNew ? '/api/booking/promo-codes' : `/api/booking/promo-codes/${editing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!resp.ok) throw new Error('Save failed')
      toast.success(isNew ? 'Promo code created' : 'Promo code updated')
      setEditing(null)
      load()
    } catch {
      toast.error('Failed to save promo code')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCode(id: number) {
    if (!confirm('Delete this promo code?')) return
    const resp = await fetch(`/api/booking/promo-codes/${id}`, { method: 'DELETE' })
    if (resp.ok) { toast.success('Promo code deleted'); load() }
    else toast.error('Failed to delete promo code')
  }

  function set(field: keyof PromoCode, value: string | boolean | number | null) {
    setEditing(e => e ? { ...e, [field]: value } : e)
  }

  if (editing !== null) {
    return (
      <Card>
        <CardHeader><CardTitle>{isNew ? 'New Promo Code' : 'Edit Promo Code'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Code *</Label>
              <Input value={editing.code ?? ''} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SUMMER25" />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input value={editing.description ?? ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Discount Type</Label>
              <Select value={editing.discountType ?? 'percent'} onValueChange={v => set('discountType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Discount Value *</Label>
              <Input type="number" min="0" step="0.01" value={editing.discountValue ?? ''} onChange={e => set('discountValue', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Min Nights</Label>
              <Input type="number" min="1" value={editing.minNights ?? 1} onChange={e => set('minNights', parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1">
              <Label>Max Uses (blank = unlimited)</Label>
              <Input type="number" min="1" value={editing.maxUses ?? ''} onChange={e => set('maxUses', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            <div className="space-y-1">
              <Label>Valid From</Label>
              <Input type="date" value={editing.validFrom ?? ''} onChange={e => set('validFrom', e.target.value || null)} />
            </div>
            <div className="space-y-1">
              <Label>Valid To</Label>
              <Input type="date" value={editing.validTo ?? ''} onChange={e => set('validTo', e.target.value || null)} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="promoActive"
                checked={editing.isActive ?? true}
                onChange={e => set('isActive', e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="promoActive">Active</Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Promo Codes ({codes.length})</h3>
        <Button onClick={() => {
          setEditing({ code: '', discountType: 'percent', discountValue: '0', minNights: 1, isActive: true })
          setIsNew(true)
        }}>+ New Promo Code</Button>
      </div>
      {codes.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No promo codes yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {codes.map(code => (
            <Card key={code.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-mono font-semibold">{code.code}</p>
                      <Badge variant={code.isActive ? 'default' : 'secondary'}>{code.isActive ? 'Active' : 'Inactive'}</Badge>
                      <Badge variant="outline">
                        {code.discountType === 'percent' ? `${code.discountValue}%` : `${currencyCode} ${code.discountValue}`} off
                      </Badge>
                    </div>
                    {code.description && <p className="text-sm text-muted-foreground mt-0.5">{code.description}</p>}
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>Used: {code.usedCount ?? 0}{code.maxUses ? ` / ${code.maxUses}` : ''}</span>
                      {code.validFrom && <span>From: {code.validFrom}</span>}
                      {code.validTo && <span>To: {code.validTo}</span>}
                      <span>Min nights: {code.minNights ?? 1}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(code); setIsNew(false) }}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCode(code.id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Widget Preview Tab ───────────────────────────────────────────────────────

function WidgetPreviewTab() {
  const [settings, setSettings] = useState<WidgetSettings | null>(null)

  useEffect(() => {
    fetch('/api/booking/widget-settings')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => {})
  }, [])

  if (!settings) return <p className="text-muted-foreground">Loading preview…</p>

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Live preview of the booking widget appearance.</p>
      <div
        className="rounded-xl border p-6 max-w-sm shadow"
        style={{ borderColor: settings.primaryColor }}
      >
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="logo" className="h-10 mb-3 object-contain" />
        )}
        <h3 className="font-bold text-lg" style={{ color: settings.primaryColor }}>
          {settings.propertyName}
        </h3>
        {settings.welcomeMessage && (
          <p className="text-sm text-muted-foreground mt-1">{settings.welcomeMessage}</p>
        )}
        <Separator className="my-3" />
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Check-in / Check-out</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded border p-2 text-sm text-muted-foreground">Select date</div>
            <div className="rounded border p-2 text-sm text-muted-foreground">Select date</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded border p-2 text-sm text-muted-foreground">Adults: 1</div>
            <div className="rounded border p-2 text-sm text-muted-foreground">{settings.residentLabel}</div>
          </div>
        </div>
        <button
          className="mt-4 w-full py-2 rounded font-semibold text-white text-sm transition"
          style={{ backgroundColor: settings.primaryColor }}
        >
          Search Availability
        </button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Rates in {settings.currencyCode} ({settings.currencySymbol})
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingWidgetAdmin() {
  const [currencyCode, setCurrencyCode] = useState('KES')

  useEffect(() => {
    fetch('/api/booking/widget-settings')
      .then(r => r.json())
      .then(d => { if (d.currencyCode) setCurrencyCode(d.currencyCode) })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Booking Engine Admin</h1>
        <p className="text-muted-foreground text-sm">Configure rate plans, resident rules, promotions and widget appearance</p>
      </div>

      <Tabs defaultValue="widget-settings">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="widget-settings">Widget Settings</TabsTrigger>
          <TabsTrigger value="rate-plans">Rate Plans</TabsTrigger>
          <TabsTrigger value="resident-rules">Resident Rules</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Rates</TabsTrigger>
          <TabsTrigger value="promo-codes">Promo Codes</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="widget-settings" className="mt-4">
          <WidgetSettingsTab onCurrencyChange={setCurrencyCode} />
        </TabsContent>
        <TabsContent value="rate-plans" className="mt-4">
          <RatePlansTab currencyCode={currencyCode} />
        </TabsContent>
        <TabsContent value="resident-rules" className="mt-4">
          <ResidentRulesTab />
        </TabsContent>
        <TabsContent value="seasonal" className="mt-4">
          <SeasonalMultipliersTab />
        </TabsContent>
        <TabsContent value="promo-codes" className="mt-4">
          <PromoCodesTab currencyCode={currencyCode} />
        </TabsContent>
        <TabsContent value="preview" className="mt-4">
          <WidgetPreviewTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
