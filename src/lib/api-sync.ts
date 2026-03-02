// Utility to sync data from REST API with graceful fallback to KV store
const API_BASE = '/api'

export async function fetchFromAPI<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`)
    if (!response.ok) return fallback
    const data = await response.json()
    return Array.isArray(data) ? data as T : fallback
  } catch {
    return fallback
  }
}

export async function createViaAPI<T>(endpoint: string, data: Partial<T>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function updateViaAPI<T>(endpoint: string, id: string | number, data: Partial<T>): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

export async function deleteViaAPI(endpoint: string, id: string | number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch {
    return false
  }
}
