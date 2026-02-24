import { useKV as useSparkKV } from '@github/spark/hooks'

/**
 * Object-API wrapper around @github/spark/hooks useKV.
 * Returns { value, setValue, deleteValue } for easier destructuring.
 */
export function useKV<T>(key: string, initialValue: T) {
  const [value, setValue, deleteValue] = useSparkKV<T>(key, initialValue)
  return { value: (value ?? initialValue) as T, setValue, deleteValue }
}
