import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthenticatedUser } from "@/lib/firebase-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ThreadPayload = {
  heading: string;
  description: string;
  tags?: string[];
  mediaUrl?: string | null;
  authorName?: string;
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");
    const db = adminDb();

    let query = db.collection("threads").orderBy("createdAt", "desc");
    if (tag) {
      query = query.where("tags", "array-contains", tag);
    }
    const snapshot = await query.get();
    const threads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ threads });
  } catch (err: any) {
    console.error("/api/forum/threads GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Server not configured" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // For now, allow posting without authentication for testing
    // TODO: Add proper authentication later
    const user = await getAuthenticatedUser(req);
    
    const body = (await req.json()) as ThreadPayload;
    if (!body.heading || !body.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const tags = Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean)
      : [];

    const db = adminDb();
    const doc = await db.collection("threads").add({
      heading: body.heading,
      description: body.description,
      tags,
      mediaUrl: body.mediaUrl || null,
      authorId: user?.uid || "anonymous",
      authorName: body.authorName || user?.name || user?.email || "Forum User",
      createdAt: new Date(),
    });

    const saved = await doc.get();
    return NextResponse.json({ id: saved.id, ...saved.data() });
  } catch (err: any) {
    console.error("/api/forum/threads POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Server not configured" },
      { status: 500 }
    );
  }
}



