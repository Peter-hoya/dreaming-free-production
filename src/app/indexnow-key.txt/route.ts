import { NextResponse } from "next/server";

function configuredIndexNowKey() {
  const key = process.env.INDEXNOW_KEY?.trim() || "";
  return /^[a-fA-F0-9-]{8,128}$/.test(key) ? key : "";
}

export function GET() {
  const key = configuredIndexNowKey();
  if (!key) {
    return new NextResponse("Not Found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(`${key}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
