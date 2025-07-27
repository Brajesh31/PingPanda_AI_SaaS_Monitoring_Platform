import { NextRequest, NextResponse } from "next/server"
import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rateLimit"

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("id")
  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return NextResponse.json({ reeor: "Missing API key" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { apiKey },
    select: {
      id: true,
      plan: true,
      email: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 })
  }

  const rateLimits = {
    FREE: 60,
    PRO: 1000,
  }

  const limit = rateLimits[user.plan] ?? 60 // Default to 60 if plan not found

  const allowed = await rateLimit(apiKey, limit, 60) // 60 requests per minute

  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
  }

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
  }

  const cacheKey = `user:${userId}`
  // await redis.del(`user:${userId}`)
  const cachedUser = await redis.get(cacheKey)

  if (cachedUser) {
    return NextResponse.json({ source: "cache", data: cachedUser })
  }
  try {
    const requestedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        quotaLimit: true,
      },
    })
    if (!requestedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await redis.set(cacheKey, requestedUser, { ex: 3600 }) // Cache for 1 hour

    return NextResponse.json({ source: "db", data: requestedUser })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
