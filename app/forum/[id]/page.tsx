"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.id as string;
  
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyFormContent, setReplyFormContent] = useState("");

  useEffect(() => {
    // Get user name from profile
    async function getUserName() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const fullName = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim();
            setUserName(fullName || data.user.email || "Forum User");
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setUserName("Forum User");
      }
    }
    getUserName();

    async function loadThread() {
      try {
        const res = await fetch(`/api/forum/threads/${threadId}`);
        const data = await res.json();
        setThread(data.thread);
        setReplies(data.replies || []);
      } catch (error) {
        console.error("Error loading thread:", error);
      } finally {
        setLoading(false);
      }
    }
    loadThread();
  }, [threadId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: threadId,
          content: replyContent,
          authorName: userName || "Forum User"
        }),
      });

      if (res.ok) {
        setReplyContent("");
        // Reload replies
        const threadRes = await fetch(`/api/forum/threads/${threadId}`);
        const threadData = await threadRes.json();
        setReplies(threadData.replies || []);
      } else {
        console.error("Failed to create reply");
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNestedReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyFormContent.trim() || !replyingTo) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/replies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: threadId,
          content: replyFormContent,
          authorName: userName || "Forum User",
          parentId: replyingTo
        }),
      });

      if (res.ok) {
        setReplyFormContent("");
        setReplyingTo(null);
        // Reload replies
        const threadRes = await fetch(`/api/forum/threads/${threadId}`);
        const threadData = await threadRes.json();
        setReplies(threadData.replies || []);
      } else {
        console.error("Failed to create nested reply");
      }
    } catch (error) {
      console.error("Error creating nested reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-cyan-300 text-lg">Loading thread...</div>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-400 text-lg">Thread not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Back button */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          ← Back to Forum
        </button>

        {/* Thread content */}
        <div className="border border-cyan-400/30 rounded-2xl p-8 bg-slate-800/50 backdrop-blur-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {thread.authorName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{thread.heading}</h1>
              <div className="flex items-center gap-4 text-sm text-cyan-300 mb-4">
                <span>by {thread.authorName}</span>
                <span>•</span>
                <span>{thread.createdAt ? (() => {
                  try {
                    if (thread.createdAt.seconds) {
                      return new Date(thread.createdAt.seconds * 1000).toLocaleDateString();
                    } else if (thread.createdAt.toDate) {
                      return thread.createdAt.toDate().toLocaleDateString();
                    } else {
                      return new Date(thread.createdAt).toLocaleDateString();
                    }
                  } catch (e) {
                    return 'Unknown date';
                  }
                })() : 'Unknown date'}</span>
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">OP</span>
              </div>
            </div>
          </div>
          
          <p className="text-cyan-200 mb-6 text-lg leading-relaxed">{thread.description}</p>
          
          {thread.mediaUrl && (
            <div className="mb-6">
              {thread.mediaUrl.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                <video 
                  src={thread.mediaUrl} 
                  controls 
                  className="max-w-full max-h-96 rounded-lg"
                />
              ) : (
                <img 
                  src={thread.mediaUrl} 
                  alt="Thread media" 
                  className="max-w-full max-h-96 rounded-lg object-contain"
                />
              )}
            </div>
          )}

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {thread.tags.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Replies section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Replies ({replies.length})</h2>
          
          {replies.length === 0 ? (
            <div className="border border-cyan-400/20 rounded-xl p-8 text-center bg-slate-800/30 backdrop-blur-sm">
              <div className="text-cyan-300 text-lg mb-2">No replies yet</div>
              <p className="text-cyan-200">Be the first to reply to this thread!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply: any) => (
                <div key={reply.id} className="border border-cyan-400/20 rounded-xl p-6 bg-slate-800/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {reply.authorName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-cyan-300 font-medium">{reply.authorName}</span>
                        {reply.authorId === thread.authorId && (
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">OP</span>
                        )}
                        <span className="text-cyan-400 text-sm">•</span>
                        <span className="text-cyan-400 text-sm">
                          {reply.createdAt ? (() => {
                            try {
                              if (reply.createdAt.seconds) {
                                return new Date(reply.createdAt.seconds * 1000).toLocaleDateString();
                              } else if (reply.createdAt.toDate) {
                                return reply.createdAt.toDate().toLocaleDateString();
                              } else {
                                return new Date(reply.createdAt).toLocaleDateString();
                              }
                            } catch (e) {
                              return 'Unknown date';
                            }
                          })() : 'Unknown date'}
                        </span>
                        <button
                          onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                          className="ml-auto px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full hover:bg-cyan-500/30 transition-colors"
                        >
                          {replyingTo === reply.id ? 'Cancel' : 'Reply'}
                        </button>
                      </div>
                      <p className="text-cyan-200 mb-3">{reply.content}</p>
                      
                      {/* Nested replies */}
                      {reply.children && reply.children.length > 0 && (
                        <div className="ml-4 space-y-3 border-l-2 border-cyan-400/20 pl-4">
                          {reply.children.map((nestedReply: any) => (
                            <div key={nestedReply.id} className="border border-cyan-400/10 rounded-lg p-4 bg-slate-700/20">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                  {nestedReply.authorName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-cyan-300 text-sm font-medium">{nestedReply.authorName}</span>
                                    {nestedReply.authorId === thread.authorId && (
                                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">OP</span>
                                    )}
                                    <span className="text-cyan-400 text-xs">•</span>
                                    <span className="text-cyan-400 text-xs">
                                      {nestedReply.createdAt ? (() => {
                                        try {
                                          if (nestedReply.createdAt.seconds) {
                                            return new Date(nestedReply.createdAt.seconds * 1000).toLocaleDateString();
                                          } else if (nestedReply.createdAt.toDate) {
                                            return nestedReply.createdAt.toDate().toLocaleDateString();
                                          } else {
                                            return new Date(nestedReply.createdAt).toLocaleDateString();
                                          }
                                        } catch (e) {
                                          return 'Unknown date';
                                        }
                                      })() : 'Unknown date'}
                                    </span>
                                  </div>
                                  <p className="text-cyan-200 text-sm">{nestedReply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reply form for this specific reply */}
                      {replyingTo === reply.id && (
                        <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-cyan-400/20">
                          <form onSubmit={handleNestedReply} className="space-y-3">
                            <textarea
                              value={replyFormContent}
                              onChange={(e) => setReplyFormContent(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-slate-600/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none text-sm"
                              placeholder={`Reply to ${reply.authorName}...`}
                              rows={3}
                              required
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {submitting ? "Posting..." : "Post Reply"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyFormContent("");
                                }}
                                className="px-4 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply form */}
          <div className="border border-cyan-400/30 rounded-2xl p-6 bg-slate-800/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Add a Reply</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none"
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}