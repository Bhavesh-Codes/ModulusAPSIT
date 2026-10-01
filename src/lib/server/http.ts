import { NextResponse } from "next/server"
import { HttpError } from "@/lib/server/access"

export function errorResponse(e: unknown) {
  const status = e instanceof HttpError ? e.status : 500
  const message = e instanceof Error ? e.message : "Internal server error"
  return NextResponse.json({ error: message || "Internal server error" }, { status })
}
