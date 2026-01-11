import { toast } from 'sonner'

export type BatchOperation = 'delete' | 'update' | 'archive' | 'activate' | 'deactivate' | 'approve' | 'reject'

export interface BatchOperationResult {
  successful: number
  failed: number
  errors: Array<{ id: string; error: string }>
}

export async function executeBatchOperation<T extends { id: string }>(
  items: T[],
  operation: BatchOperation,
  operationFn: (item: T) => Promise<T | null>,
  options?: {
    onProgress?: (processed: number, total: number) => void
    batchSize?: number
  }
): Promise<BatchOperationResult> {
  const result: BatchOperationResult = {
    successful: 0,
    failed: 0,
    errors: [],
  }

  const batchSize = options?.batchSize || 10
  const batches: T[][] = []

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  let processed = 0

  for (const batch of batches) {
    const batchPromises = batch.map(async (item) => {
      try {
        await operationFn(item)
        result.successful++
      } catch (error) {
        result.failed++
        result.errors.push({
          id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })

    await Promise.all(batchPromises)
    processed += batch.length

    if (options?.onProgress) {
      options.onProgress(processed, items.length)
    }
  }

  return result
}

export function showBatchOperationResult(
  result: BatchOperationResult,
  operation: string
): void {
  if (result.failed === 0) {
    toast.success(`${operation} completed successfully for ${result.successful} items`)
  } else if (result.successful === 0) {
    toast.error(`${operation} failed for all ${result.failed} items`)
  } else {
    toast.warning(
      `${operation} completed with ${result.successful} successful and ${result.failed} failed`
    )
  }
}

export async function batchDelete<T extends { id: string }>(
  items: T[],
  deleteFn: (id: string) => void,
  options?: {
    confirmMessage?: string
    onProgress?: (processed: number, total: number) => void
  }
): Promise<BatchOperationResult> {
  const confirmed = window.confirm(
    options?.confirmMessage || `Are you sure you want to delete ${items.length} items?`
  )

  if (!confirmed) {
    return {
      successful: 0,
      failed: 0,
      errors: [],
    }
  }

  return executeBatchOperation(
    items,
    'delete',
    async (item) => {
      deleteFn(item.id)
      return null
    },
    options
  )
}

export async function batchUpdate<T extends { id: string }>(
  items: T[],
  updateFn: (item: T, updates: Partial<T>) => void,
  updates: Partial<T>,
  options?: {
    onProgress?: (processed: number, total: number) => void
  }
): Promise<BatchOperationResult> {
  return executeBatchOperation(
    items,
    'update',
    async (item) => {
      updateFn(item, updates)
      return { ...item, ...updates }
    },
    options
  )
}

export interface BatchExportOptions {
  format: 'csv' | 'json' | 'excel'
  filename?: string
  selectedFields?: string[]
}

export function batchExport<T>(
  items: T[],
  options: BatchExportOptions
): void {
  const filename = options.filename || `export-${Date.now()}`

  switch (options.format) {
    case 'csv':
      exportToCSV(items, filename, options.selectedFields)
      break
    case 'json':
      exportToJSON(items, filename)
      break
    case 'excel':
      toast.info('Excel export coming soon')
      break
  }
}

function exportToCSV<T>(
  items: T[],
  filename: string,
  selectedFields?: string[]
): void {
  if (items.length === 0) {
    toast.error('No items to export')
    return
  }

  const fields = selectedFields || Object.keys(items[0] as object)
  const headers = fields.join(',')

  const rows = items.map((item) => {
    return fields
      .map((field) => {
        const value = (item as any)[field]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return String(value)
      })
      .join(',')
  })

  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success(`Exported ${items.length} items to CSV`)
}

function exportToJSON<T>(items: T[], filename: string): void {
  const json = JSON.stringify(items, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.success(`Exported ${items.length} items to JSON`)
}

export interface BatchImportResult<T> {
  imported: T[]
  failed: number
  errors: Array<{ row: number; error: string }>
}

export async function batchImportCSV<T>(
  file: File,
  validator: (data: any) => T | null
): Promise<BatchImportResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter((line) => line.trim())

      if (lines.length < 2) {
        resolve({
          imported: [],
          failed: 0,
          errors: [{ row: 0, error: 'File is empty or invalid' }],
        })
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim())
      const result: BatchImportResult<T> = {
        imported: [],
        failed: 0,
        errors: [],
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map((v) => v.trim())
          const obj: any = {}

          headers.forEach((header, index) => {
            obj[header] = values[index]
          })

          const validatedItem = validator(obj)
          if (validatedItem) {
            result.imported.push(validatedItem)
          } else {
            result.failed++
            result.errors.push({ row: i + 1, error: 'Validation failed' })
          }
        } catch (error) {
          result.failed++
          result.errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      resolve(result)
    }

    reader.onerror = () => {
      resolve({
        imported: [],
        failed: 0,
        errors: [{ row: 0, error: 'Failed to read file' }],
      })
    }

    reader.readAsText(file)
  })
}
