import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

// Cache currency setting to avoid per-query DB round-trips
let _currencyCache: { code: string; cachedAt: number } | null = null;
async function getCurrency(): Promise<string> {
  const now = Date.now();
  if (_currencyCache && now - _currencyCache.cachedAt < 60000) return _currencyCache.code;
  try {
    const rows = await db.select().from(schema.widgetSettings).where(eq(schema.widgetSettings.propertyId, 'default'));
    const code = rows[0]?.currencyCode ?? 'KES';
    _currencyCache = { code, cachedAt: now };
    return code;
  } catch {
    return 'KES';
  }
}

export interface RateQuoteRequest {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  roomId: number;
  guestCountry?: string;
  promoCode?: string;
}

export interface RateQuote {
  roomId: number;
  ratePlanId: number;
  ratePlanName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rateType: 'resident' | 'nonResident';
  baseRatePerNight: number;
  seasonalMultiplier: number;
  adjustedRatePerNight: number;
  subtotal: number;
  promoDiscount: number;
  afterPromo: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  currency: string;
  promoCode?: string;
  breakdown: Array<{ label: string; amount: number }>;
}

function daysBetween(d1: string, d2: string): number {
  const ms = new Date(d2).getTime() - new Date(d1).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export async function computeRateQuote(req: RateQuoteRequest): Promise<RateQuote> {
  // 1. Validate dates
  const checkIn = new Date(req.checkIn);
  const checkOut = new Date(req.checkOut);
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) throw new Error('Invalid dates');
  if (checkOut <= checkIn) throw new Error('Check-out must be after check-in');

  const nights = daysBetween(req.checkIn, req.checkOut);

  // 2. Fetch room
  const roomRows = await db.select().from(schema.rooms).where(eq(schema.rooms.id, req.roomId));
  if (!roomRows.length) throw new Error('Room not found');
  const room = roomRows[0];

  // 3. Find an active rate plan for this room type
  const plans = await db.select().from(schema.ratePlans).where(
    and(eq(schema.ratePlans.isActive, true), eq(schema.ratePlans.roomType, room.type))
  );
  // fallback to any active plan
  const allPlans = plans.length
    ? plans
    : await db.select().from(schema.ratePlans).where(eq(schema.ratePlans.isActive, true));
  if (!allPlans.length) throw new Error('No active rate plan found');
  const plan = allPlans[0];

  // 4. Determine resident vs non-resident
  let rateType: 'resident' | 'nonResident' = 'nonResident';
  if (req.guestCountry) {
    const rules = await db.select().from(schema.residentRules).where(
      and(
        eq(schema.residentRules.ratePlanId, plan.id),
        eq(schema.residentRules.isActive, true),
        eq(schema.residentRules.countryCode, req.guestCountry.toUpperCase())
      )
    );
    if (rules.length) rateType = 'resident';
  }

  const baseRate = rateType === 'resident'
    ? parseFloat(plan.residentRate as string)
    : parseFloat(plan.nonResidentRate as string);

  // 5. Apply seasonal multiplier
  let seasonalMultiplier = 1;
  const seasonalRows = await db.select().from(schema.seasonalMultipliers).where(
    eq(schema.seasonalMultipliers.ratePlanId, plan.id)
  );
  for (const s of seasonalRows) {
    if (isDateInRange(req.checkIn, s.startDate as string, s.endDate as string)) {
      seasonalMultiplier = parseFloat(s.multiplier as string);
      break;
    }
  }

  const adjustedRatePerNight = baseRate * seasonalMultiplier;
  const subtotal = adjustedRatePerNight * nights;

  // 6. Apply promo code
  let promoDiscount = 0;
  let usedPromoCode: string | undefined;
  if (req.promoCode) {
    const promos = await db.select().from(schema.promoCodes).where(
      and(eq(schema.promoCodes.code, req.promoCode.toUpperCase()), eq(schema.promoCodes.isActive, true))
    );
    if (promos.length) {
      const promo = promos[0];
      const today = new Date().toISOString().split('T')[0];
      const validFrom = promo.validFrom as string | null;
      const validTo = promo.validTo as string | null;
      const notExpired = (!validTo || today <= validTo) && (!validFrom || today >= validFrom);
      const notExhausted = !promo.maxUses || (promo.usedCount ?? 0) < promo.maxUses;
      const meetsMinNights = nights >= (promo.minNights ?? 1);
      if (notExpired && notExhausted && meetsMinNights) {
        if (promo.discountType === 'percent') {
          promoDiscount = subtotal * (parseFloat(promo.discountValue as string) / 100);
        } else {
          promoDiscount = Math.min(parseFloat(promo.discountValue as string), subtotal);
        }
        usedPromoCode = promo.code;
      }
    }
  }

  const afterPromo = subtotal - promoDiscount;
  const serviceChargeRate = parseFloat(plan.serviceChargePercent as string ?? '5') / 100;
  const taxRate = parseFloat(plan.taxPercent as string ?? '16') / 100;
  const serviceCharge = afterPromo * serviceChargeRate;
  const tax = (afterPromo + serviceCharge) * taxRate;
  const totalAmount = afterPromo + serviceCharge + tax;
  const currency = await getCurrency();

  const breakdown = [
    { label: `Room rate (${nights} night${nights > 1 ? 's' : ''} × ${adjustedRatePerNight.toFixed(2)})`, amount: subtotal },
  ];
  if (promoDiscount > 0) breakdown.push({ label: `Promo discount (${usedPromoCode})`, amount: -promoDiscount });
  breakdown.push({ label: 'Service charge', amount: serviceCharge });
  breakdown.push({ label: 'Tax', amount: tax });

  return {
    roomId: req.roomId,
    ratePlanId: plan.id,
    ratePlanName: plan.name,
    checkIn: req.checkIn,
    checkOut: req.checkOut,
    nights,
    rateType,
    baseRatePerNight: baseRate,
    seasonalMultiplier,
    adjustedRatePerNight,
    subtotal,
    promoDiscount,
    afterPromo,
    serviceCharge,
    tax,
    totalAmount,
    currency,
    promoCode: usedPromoCode,
    breakdown,
  };
}
