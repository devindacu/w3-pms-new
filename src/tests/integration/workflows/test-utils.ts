export interface WorkflowResult {
  success: boolean
  error?: string
  steps: string[]
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateTestId(prefix: string): string {
  return `${prefix}-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function validateRequired<T>(data: T, fields: (keyof T)[]): string | null {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `Missing required field: ${String(field)}`
    }
  }
  return null
}

export function calculateTotal(items: Array<{ quantity: number; price: number }>): number {
  return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function getDateRange(days: number): { start: number; end: number } {
  const now = Date.now()
  return {
    start: now,
    end: now + (days * 24 * 60 * 60 * 1000)
  }
}

export function isOverlapping(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && end1 > start2
}
