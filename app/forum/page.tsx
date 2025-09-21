"use client";

import { useEffect, useState } from "react";

export default function ForumPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    heading: "",
    description: "",
    tags: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "username" | "tags" | "keywords">("all");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

    async function loadThreads() {
      try {
        const res = await fetch("/api/forum/threads");
        const data = await res.json();
        setThreads(data.threads || []);
      } catch (error) {
        console.error("Error loading threads:", error);
      } finally {
        setLoading(false);
      }
    }
    loadThreads();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      let url = "/api/forum/search?";
      const params = new URLSearchParams();
      
      if (searchType === "username") {
        params.append("username", searchQuery);
      } else if (searchType === "tags") {
        params.append("tags", searchQuery);
      } else if (searchType === "keywords") {
        params.append("keywords", searchQuery);
      } else {
        params.append("q", searchQuery);
      }
      
      url += params.toString();
      
      const res = await fetch(url);
      const data = await res.json();
      setSearchResults(data.threads || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating thread with data:", formData);
    setSubmitting(true);
    setUploading(true);
    
    try {
      const tags = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean);
      let mediaUrl = null;
      
      // Upload file if selected
      if (selectedFile) {
        console.log("Uploading file:", selectedFile.name);
        mediaUrl = await uploadFile(selectedFile);
        if (!mediaUrl) {
          alert('Failed to upload file. Please try again.');
          return;
        }
        console.log("File uploaded successfully:", mediaUrl);
      }
      
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heading: formData.heading,
          description: formData.description,
          tags: tags,
          mediaUrl: mediaUrl,
          authorName: userName || "Forum User"
        }),
      });

      const responseData = await res.json();
      console.log("API Response:", responseData);

      if (res.ok) {
        // Reset form and reload threads
        setFormData({ heading: "", description: "", tags: "" });
        setSelectedFile(null);
        setShowCreateForm(false);
        
        // Reload threads
        const threadsRes = await fetch("/api/forum/threads");
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
        
        alert("Thread created successfully!");
      } else {
        console.error("Failed to create thread:", responseData);
        alert(`Failed to create thread: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Community Forum</h1>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
          >
            {showCreateForm ? "Cancel" : "Create New Thread"}
          </button>
        </div>

        {/* Search Section */}
        <div className="border border-cyan-400/30 rounded-2xl p-6 bg-slate-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Search Forum</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none"
                placeholder="Search threads..."
              />
            </div>
            <div className="flex gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="username">By Username</option>
                <option value="tags">By Tags</option>
                <option value="keywords">By Keywords</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-3 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="border border-cyan-400/30 rounded-2xl p-8 bg-slate-800/50 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Create a New Thread</h2>
            <form onSubmit={handleCreateThread} className="space-y-6">
              <div>
                <label className="block text-cyan-200 text-sm font-medium mb-2">Thread Title</label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({...formData, heading: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none"
                  placeholder="Enter a descriptive title for your thread"
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-200 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none"
                  placeholder="Share your thoughts, ask questions, or start a discussion..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-cyan-200 text-sm font-medium mb-2">Tags (optional)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white placeholder-cyan-300/50 focus:border-cyan-400 focus:outline-none"
                  placeholder="Enter tags separated by commas (e.g., discussion, help, question)"
                />
              </div>
              
              <div>
                <label className="block text-cyan-200 text-sm font-medium mb-2">Attach Image or Video (optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-cyan-400/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-400 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 p-3 rounded-lg bg-slate-700/30 border border-cyan-400/20">
                    <div className="flex items-center gap-3">
                      <div className="text-cyan-300 text-sm">
                        📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (uploading ? "Uploading..." : "Creating...") : "Create Thread"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-8 py-3 rounded-lg bg-slate-600 text-white font-semibold hover:bg-slate-500 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-cyan-300 text-lg">Loading threads...</div>
          </div>
        ) : threads.length === 0 ? (
          <div className="border border-cyan-400/30 rounded-2xl p-12 text-center bg-slate-800/50 backdrop-blur-sm">
            <div className="text-2xl font-semibold mb-4 text-white">Be the first to post</div>
            <p className="text-cyan-200 mb-8 max-w-md mx-auto">Start a new discussion and kick things off. Share your thoughts, ask questions, or connect with the community.</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
            >
              <span className="text-2xl leading-none">+</span>
              <span>Create Thread</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery && (
              <div className="text-center py-4">
                <div className="text-cyan-300 text-lg">
                  {isSearching ? "Searching..." : `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
                </div>
                {searchResults.length === 0 && !isSearching && (
                  <p className="text-cyan-200 mt-2">No threads found matching your search criteria.</p>
                )}
              </div>
            )}
            {(searchQuery ? searchResults : threads).map((thread: any) => (
              <div 
                key={thread.id} 
                onClick={() => window.location.href = `/forum/${thread.id}`}
                className="border border-cyan-400/20 rounded-xl p-6 bg-slate-800/30 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-300 cursor-pointer hover:border-cyan-400/40"
              >
                <div className="flex gap-6">
                  {/* Content on the left */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{thread.heading}</h3>
                    <p className="text-cyan-200 mb-4">{thread.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-cyan-300">
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
                    </div>
                  </div>
                  
                  {/* Media on the right */}
                  {thread.mediaUrl && (
                    <div className="flex-shrink-0 w-48">
                      {thread.mediaUrl.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                        <video 
                          src={thread.mediaUrl} 
                          controls 
                          className="w-full h-32 rounded-lg object-cover"
                        />
                      ) : (
                        <img 
                          src={thread.mediaUrl} 
                          alt="Thread media" 
                          className="w-full h-32 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Floating Create Thread Button */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full shadow-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 hover:shadow-emerald-500/25 hover:scale-110 flex items-center justify-center text-2xl font-bold z-50"
          title="Create New Thread"
        >
          +
        </button>
      </div>
    </div>
  );
}






