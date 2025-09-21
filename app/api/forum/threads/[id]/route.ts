import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildReplyTree(replies: any[]) {
  const byId: Record<string, any> = {};
  const roots: any[] = [];
  replies.forEach((r) => (byId[r.id] = { ...r, children: [] }));
  replies.forEach((r) => {
    if (r.parentId) {
      const parent = byId[r.parentId];
      if (parent) parent.children.push(byId[r.id]);
      else roots.push(byId[r.id]);
    } else {
      roots.push(byId[r.id]);
    }
  });
  return roots.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
  );
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = adminDb();
    const threadDoc = await db.collection("threads").doc(params.id).get();
    if (!threadDoc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const thread = { id: threadDoc.id, ...threadDoc.data() };

    const repliesSnap = await db
      .collection("replies")
      .where("threadId", "==", params.id)
      .get();
    const replies = repliesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort by creation date
    replies.sort((a, b) => {
      const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
      const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
      return aTime - bTime;
    });
    const tree = buildReplyTree(replies);

    return NextResponse.json({ thread, replies: tree });
  } catch (err: any) {
    console.error(`/api/forum/threads/${params.id} GET error:`, err);
    return NextResponse.json(
      { error: err?.message || "Server not configured" },
      { status: 500 }
    );
  }
}



