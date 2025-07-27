import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  for (let i = 1; i <= 65; i++) {
    const res = await fetch(`http://localhost:3000/api/user?id=cmaodxl2g0000jqghx8y7cxvy`, {
      headers: {
        "x-api-key": "cmaodxl2j0001jqghn1z8ec5p",
      },
    });

    const text = await res.text();
    console.log(`Request ${i}: Status ${res.status}`, text);
  }

  return NextResponse.json({ message: "Done testing rate limit" });
}
