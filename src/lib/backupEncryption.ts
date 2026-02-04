export interface BackupData {
  version: string
  timestamp: number
  encrypted: boolean
  data: any
  checksum?: string
}

export interface EncryptionKey {
  id: string
  key: string
  salt: string
  iterations: number
  createdAt: number
}

export interface BackupMetadata {
  id: string
  name: string
  description?: string
  timestamp: number
  size: number
  encrypted: boolean
  autoBackup: boolean
  dataKeys: string[]
  checksum: string
}

export interface BackupSettings {
  autoBackupEnabled: boolean
  autoBackupInterval: number
  maxBackups: number
  encryptionEnabled: boolean
  compressionEnabled: boolean
  includeSystemData: boolean
  includeSampleData: boolean
}

async function generateKey(password: string, salt: Uint8Array, iterations: number = 100000): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(data: string, password: string): Promise<{ encrypted: string; salt: string; iv: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  // @ts-expect-error - Crypto API type compatibility
  const key = await generateKey(password, salt)

  const encoder = new TextEncoder()
  const encodedData = encoder.encode(data)

  // @ts-expect-error - Crypto API type compatibility
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encodedData
  )

  return {
    encrypted: arrayBufferToBase64(encryptedData),
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer)
  }
}

export async function decryptData(encryptedData: string, password: string, salt: string, iv: string): Promise<string> {
  const saltArray = base64ToArrayBuffer(salt)
  const ivArray = base64ToArrayBuffer(iv)
  const key = await generateKey(password, new Uint8Array(saltArray))

  const encryptedArray = base64ToArrayBuffer(encryptedData)

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(ivArray)
    },
    key,
    encryptedArray
  )

  const decoder = new TextDecoder()
  return decoder.decode(decryptedData)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return arrayBufferToBase64(hashBuffer)
}

export async function verifyChecksum(data: string, checksum: string): Promise<boolean> {
  const newChecksum = await generateChecksum(data)
  return newChecksum === checksum
}

export function compressData(data: string): string {
  try {
    const compressed = new TextEncoder().encode(data)
    return btoa(String.fromCharCode(...compressed))
  } catch (error) {
    console.error('Compression failed:', error)
    return data
  }
}

export function decompressData(data: string): string {
  try {
    const decoded = atob(data)
    const bytes = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i)
    }
    return new TextDecoder().decode(bytes)
  } catch (error) {
    console.error('Decompression failed:', error)
    return data
  }
}

export async function createBackup(
  kvData: Record<string, any>,
  settings: BackupSettings,
  password?: string,
  metadata?: Partial<BackupMetadata>
): Promise<{ backup: BackupMetadata; data: string }> {
  const timestamp = Date.now()
  const backupId = `backup-${timestamp}`

  const backupData: BackupData = {
    version: '1.0.0',
    timestamp,
    encrypted: settings.encryptionEnabled && !!password,
    data: kvData
  }

  let dataString = JSON.stringify(backupData)
  
  const checksum = await generateChecksum(dataString)
  backupData.checksum = checksum

  dataString = JSON.stringify(backupData)

  if (settings.compressionEnabled) {
    dataString = compressData(dataString)
  }

  let finalData = dataString
  let encryptionInfo: { salt: string; iv: string } | undefined

  if (settings.encryptionEnabled && password) {
    const encrypted = await encryptData(dataString, password)
    finalData = JSON.stringify(encrypted)
  }

  const backupMetadata: BackupMetadata = {
    id: backupId,
    name: metadata?.name || `Backup ${new Date(timestamp).toLocaleString()}`,
    description: metadata?.description,
    timestamp,
    size: new Blob([finalData]).size,
    encrypted: settings.encryptionEnabled && !!password,
    autoBackup: metadata?.autoBackup || false,
    dataKeys: Object.keys(kvData),
    checksum
  }

  return {
    backup: backupMetadata,
    data: finalData
  }
}

export async function restoreBackup(
  backupData: string,
  password?: string,
  compressed: boolean = false
): Promise<Record<string, any>> {
  let data = backupData

  if (password) {
    try {
      const encryptedObj = JSON.parse(data)
      data = await decryptData(encryptedObj.encrypted, password, encryptedObj.salt, encryptedObj.iv)
    } catch (error) {
      throw new Error('Failed to decrypt backup. Invalid password or corrupted data.')
    }
  }

  if (compressed) {
    data = decompressData(data)
  }

  const backup: BackupData = JSON.parse(data)

  if (backup.checksum) {
    const dataToVerify = JSON.stringify({ ...backup, checksum: undefined })
    const isValid = await verifyChecksum(dataToVerify, backup.checksum)
    if (!isValid) {
      throw new Error('Backup integrity check failed. Data may be corrupted.')
    }
  }

  return backup.data
}

export function downloadBackup(backupData: string, filename: string) {
  const blob = new Blob([backupData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function uploadBackup(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export async function getAllKVData(): Promise<Record<string, any>> {
  const keys = await window.spark.kv.keys()
  const data: Record<string, any> = {}
  
  for (const key of keys) {
    const value = await window.spark.kv.get(key)
    data[key] = value
  }
  
  return data
}

export async function restoreAllKVData(data: Record<string, any>): Promise<void> {
  for (const [key, value] of Object.entries(data)) {
    await window.spark.kv.set(key, value)
  }
}

export function cleanupOldBackups(
  backups: BackupMetadata[],
  maxBackups: number
): BackupMetadata[] {
  const sortedBackups = [...backups].sort((a, b) => b.timestamp - a.timestamp)
  const manualBackups = sortedBackups.filter(b => !b.autoBackup)
  const autoBackups = sortedBackups.filter(b => b.autoBackup)
  
  const backupsToKeep = [
    ...manualBackups,
    ...autoBackups.slice(0, Math.max(0, maxBackups - manualBackups.length))
  ]
  
  return backupsToKeep
}
