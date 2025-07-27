import { currentUser } from "@clerk/nextjs/server"
import { router } from "../__internals/router"
import { publicProcedure } from "../procedures"
import { db } from "@/db"

export const authRouter = router({
  getDatabaseSyncStatus: publicProcedure.query(async ({ c }) => {
    const auth = await currentUser()

    if (!auth) {
      return c.json({ status: "Not Authenticated" })
    }

    const user = await db.user.findFirst({
      where: {
        externalId: auth.id,
      },
    })

    if (!user) {
      await db.user.create({
        data: {
          quotaLimit: 100,
          email: auth.emailAddresses[0].emailAddress,
          externalId: auth.id,
        },
      })

      return c.json({ status: "User Created", isSynced: true })
    }
    return c.json({ status: "Already Synced", isSynced: true })
  }),
})

// route.ts
// export const GET = (req: Request) => {
//   return new Response(JSON.stringify({ status: "Success" }))
// }
