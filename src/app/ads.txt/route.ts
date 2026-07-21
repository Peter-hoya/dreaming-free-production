import { NextResponse } from "next/server";

export function GET() {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  const clientMatch = adsenseClient?.match(/^ca-(pub-\d+)$/);
  if (!clientMatch) {
    return new NextResponse("", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const publisherId = clientMatch[1];
  return new NextResponse(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
