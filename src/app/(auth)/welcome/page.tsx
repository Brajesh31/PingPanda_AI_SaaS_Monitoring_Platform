// synchronize auth status to database
 "use client"

import { client } from "@/lib/client"
import { Heading } from "@/components/heading"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useQuery } from "@tanstack/react-query"
import { LucideProps } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
  const router = useRouter()

    const {data} = useQuery({
        queryFn: async (): Promise<{ isSynced: boolean }> => {
          const res = await client.auth.getDatabaseSyncStatus.$get()
          const json = await res.json()
          return { isSynced: json.status === "synced" }
        },
        queryKey: ["get-database-sync-status"],
        refetchInterval: (query) => {
          return query.state.data?.isSynced ? false : 1000
        },
    })

    useEffect(() => {
      if(data?.isSynced) router.push("/dashboard")
    }, [data, router])
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4">
      <BackgroundPattern className="absolute inset-0 left-1/2 z-0 -translate-x-1/2 opacity-75" />
      <div className="relative z-10 flex -translate-y-1/2 flex-col items-center gap-6 text-center">
        <LoadingSpinner size="md" />
        <Heading>Creating your account...</Heading>
        <p className="text-base/7 text-gray-600 max-w-prose">
          Just a moment while we set thing up for you.
        </p>
      </div>
    </div>
  )
}

const BackgroundPattern = (props: LucideProps) => {
  return (
    <svg
      width="768"
      height="736"
      viewBox="0 0 768 736"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <mask
        id="mask0_5036_374506"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="-32"
        width="768"
        height="768"
      >
        <rect
          width="768"
          height="768"
          transform="translate(0 -32)"
          fill="url(#paint0_radial_5036_374506)"
        />
      </mask>
      <g mask="url(#mask0_5036_374506)">
        <g clipPath="url(#clip0_5036_374506)">
          <g clipPath="url(#clip1_5036_374506)">
            {[...Array(16)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 48 + 0.5}
                y1="-32"
                x2={i * 48 + 0.5}
                y2="736"
                stroke="#CBD5E1"
                strokeOpacity={i % 2 === 0 ? 1 : 0.5}
              />
            ))}
            <line x1="768.5" y1="-32" x2="768.5" y2="736" stroke="#CBD5E1" />
          </g>
          <rect x="0.5" y="-31.5" width="767" height="767" stroke="#CBD5E1" />
          <g clipPath="url(#clip2_5036_374506)">
            {[...Array(16)].map((_, i) => (
              <line
                key={`h-${i}`}
                y1={15.5 + i * 48}
                x2="768"
                y2={15.5 + i * 48}
                stroke="#CBD5E1"
                strokeDasharray={i % 2 === 0 ? "0" : "4,4"}
              />
            ))}
            <line y1="735.5" x2="768" y2="735.5" stroke="#CBD5E1" />
          </g>
          <rect x="0.5" y="-31.5" width="767" height="767" stroke="#CBD5E1" />
        </g>
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_5036_374506"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(384 384) rotate(90) scale(384 384)"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
        <clipPath id="clip0_5036_374506">
          <rect
            width="768"
            height="768"
            fill="white"
            transform="translate(0 -32)"
          />
        </clipPath>
        <clipPath id="clip1_5036_374506">
          <rect y="-32" width="768" height="768" fill="white" />
        </clipPath>
        <clipPath id="clip2_5036_374506">
          <rect y="-32" width="768" height="768" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
export default Page
