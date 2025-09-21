import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getAuthenticatedUser } from "@/lib/firebase-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReplyPayload = {
  threadId: string;
  content: string;
  mediaUrl?: string | null;
  parentId?: string | null;
  authorName?: string;
};

export async function POST(req: NextRequest) {
  try {
    // For now, allow posting without authentication for testing
    // TODO: Add proper authentication later
    const user = await getAuthenticatedUser(req);
    
    const body = (await req.json()) as ReplyPayload;
    if (!body.threadId || !body.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const db = adminDb();
    const doc = await db.collection("replies").add({
      threadId: body.threadId,
      content: body.content,
      mediaUrl: body.mediaUrl || null,
      parentId: body.parentId || null,
      authorId: user?.uid || "anonymous",
      authorName: body.authorName || user?.name || user?.email || "Forum User",
      createdAt: new Date(),
    });
    const saved = await doc.get();
    return NextResponse.json({ id: saved.id, ...saved.data() });
  } catch (err: any) {
    console.error("/api/forum/replies POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Server not configured" },
      { status: 500 }
    );
  }
}



