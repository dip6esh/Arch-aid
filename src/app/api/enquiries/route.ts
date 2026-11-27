import { NextResponse } from "next/server";
import { z } from "zod";
import { PROJECT_TYPES } from "@/lib/content";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(5).max(120),
  type: z.enum(PROJECT_TYPES),
  message: z.string().trim().max(2000).optional().default(""),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the details and try again." }, { status: 400 });

  // TODO(phase 2): persist + notify. Add rate limiting (e.g. Upstash) before going live.
  //   import { db } from "@/lib/db";  await db.enquiry.create({ data: parsed.data });
  //   await resend.emails.send({ to: process.env.ENQUIRY_TO_EMAIL!, subject: `Enquiry from ${parsed.data.name}`, text: ... });
  console.log("[enquiry]", parsed.data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
