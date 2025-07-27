import { redis } from "./redis"

export async function rateLimit(
  apiKey: string,
  limit = 60,
  windowInSeconds = 60
) {
  const key = `rate-limit:${apiKey}`

  const current = await redis.incr(key)

  if (current === 1) {
    await redis.expire(key, windowInSeconds)
  }
  if (current > limit) {
    return false
  }

  return true
}
