"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoBackground } from "@/components/video-background";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  email?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        console.log("Fetching profile...");

        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
        });

        console.log("Response status:", res.status, "OK:", res.ok);

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError);
          data = { error: "Invalid response from server" };
        }

        setRawResponse({ status: res.status, ok: res.ok, body: data });

        if (!res.ok) {
          const errorMessage = data?.error ?? data?.message ?? `Request failed (${res.status})`;
          setError(errorMessage);
          
          // If unauthorized, redirect to login after a delay
          if (res.status === 401) {
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
          }
          return;
        }

        if (!data.user) {
          setError("No user data received from server");
          return;
        }

        setProfile(data.user);
      } catch (err) {
        console.error("Fetch profile failed:", err);
        setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  function logout() {
    // Make a request to logout API or just clear the cookie
    fetch('/api/logout', { method: 'POST', credentials: 'include' })
      .finally(() => {
        // Clear any client-side storage
        try {
          localStorage.removeItem("profile");
          localStorage.removeItem("user");
        } catch (e) {
          console.warn("Could not clear localStorage:", e);
        }
        
        // Redirect to login
        router.push("/auth/login");
      });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-start justify-center p-8 bg-gray-900 text-white">
        <div className="max-w-2xl w-full bg-white/5 p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-2 text-red-400">Profile could not be loaded</h2>
          <p className="text-sm mb-4 text-red-300">{error ?? "No profile returned"}</p>

          {error?.includes("Invalid or expired token") || error?.includes("Authentication") ? (
            <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/30 rounded">
              <p className="text-sm text-yellow-200">
                Your session has expired. You will be redirected to login in a few seconds...
              </p>
            </div>
          ) : null}

          <div className="mb-4 flex gap-3">
            <button
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              Retry
            </button>
          </div>

          <details className="text-xs text-gray-300 bg-white/5 p-3 rounded border border-white/10">
            <summary className="cursor-pointer hover:text-white">Debug: raw API response</summary>
            <pre className="whitespace-pre-wrap mt-2 text-xs overflow-auto max-h-64">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full text-white">
      <VideoBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <p className="mt-2 text-sm text-gray-300">
          Account details associated with your login.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-white/70">No image</span>
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {profile.firstName || "-"} {profile.lastName || ""}
              </p>
              <p className="text-sm text-white/70">{profile.email || "-"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">First name</p>
              <p className="text-base font-medium">{profile.firstName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Last name</p>
              <p className="text-base font-medium">{profile.lastName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Date of birth</p>
              <p className="text-base font-medium">{profile.dob || "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-base font-medium break-all">{profile.email || "-"}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}