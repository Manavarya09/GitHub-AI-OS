import { createClient } from 'redis'

const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })

client.on('error', (err) => console.error('Redis Client Error', err))

async function connect() {
  if (!client.isOpen) {
    await client.connect()
  }
}

connect().catch((e) => console.error('Redis connection error', e))

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const v = await client.get(key)
    if (!v) return null
    return JSON.parse(v) as T
  } catch (e) {
    console.error('Cache get error', e)
    return null
  }
}

export async function setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
  try {
    if (ttlSeconds) {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds })
    } else {
      await client.set(key, JSON.stringify(value))
    }
  } catch (e) {
    console.error('Cache set error', e)
  }
}
