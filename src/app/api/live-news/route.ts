import { NextResponse } from "next/server";
import {
  getLiveNewsItems,
  LIVE_NEWS_REVALIDATE_SECONDS,
} from "@/lib/live-news";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getLiveNewsItems();

  return NextResponse.json(
    {
      updatedAt: new Date().toISOString(),
      revalidateSeconds: LIVE_NEWS_REVALIDATE_SECONDS,
      items,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${LIVE_NEWS_REVALIDATE_SECONDS}, stale-while-revalidate=${LIVE_NEWS_REVALIDATE_SECONDS}`,
      },
    }
  );
}
