import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    const tags = url.searchParams.get("tags");
    const keywords = url.searchParams.get("keywords");
    const q = url.searchParams.get("q"); // General search

    const db = adminDb();
    let query = db.collection("threads");

    if (username) {
      // Search by username (case-insensitive)
      const snapshot = await query.get();
      const threads = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((thread: any) => 
          thread.authorName && 
          thread.authorName.toLowerCase().includes(username.toLowerCase())
        );
      return NextResponse.json({ threads });
    }

    if (tags) {
      // Search by tags (case-insensitive)
      const snapshot = await query.get();
      const threads = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((thread: any) => 
          thread.tags && 
          Array.isArray(thread.tags) &&
          thread.tags.some((tag: string) => 
            tag.toLowerCase().includes(tags.toLowerCase())
          )
        );
      return NextResponse.json({ threads });
    }

    if (keywords) {
      // Search by keywords in title and description (case-insensitive)
      const snapshot = await query.get();
      const threads = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((thread: any) => {
          const searchTerm = keywords.toLowerCase();
          const title = (thread.heading || "").toLowerCase();
          const description = (thread.description || "").toLowerCase();
          return title.includes(searchTerm) || description.includes(searchTerm);
        });
      return NextResponse.json({ threads });
    }

    if (q) {
      // General search - search in username, title, description, and tags
      const snapshot = await query.get();
      const threads = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((thread: any) => {
          const searchTerm = q.toLowerCase();
          const title = (thread.heading || "").toLowerCase();
          const description = (thread.description || "").toLowerCase();
          const authorName = (thread.authorName || "").toLowerCase();
          const threadTags = Array.isArray(thread.tags) ? 
            thread.tags.map((tag: string) => tag.toLowerCase()) : [];
          
          return title.includes(searchTerm) || 
                 description.includes(searchTerm) || 
                 authorName.includes(searchTerm) ||
                 threadTags.some((tag: string) => tag.includes(searchTerm));
        });
      return NextResponse.json({ threads });
    }

    // If no search parameters, return all threads
    const snapshot = await query.orderBy("createdAt", "desc").get();
    const threads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ threads });

  } catch (err: any) {
    console.error("/api/forum/search GET error:", err);
    return NextResponse.json(
      { error: err?.message || "Server not configured" },
      { status: 500 }
    );
  }
}

