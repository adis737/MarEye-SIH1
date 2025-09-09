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

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include", // important for cookies
        });

        if (!res.ok) {
          router.push("/auth/login"); // redirect if not logged in
          return;
        }

        const data = await res.json();
        setProfile(data.user);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  function logout() {
    document.cookie = "auth_token=; path=/; max-age=0";
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="relative min-h-screen w-full text-foreground">
      <VideoBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Your Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account details associated with your login.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-white/30 bg-white/10 flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
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
              <p className="text-xs text-muted-foreground">First name</p>
              <p className="text-base font-medium">{profile.firstName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last name</p>
              <p className="text-base font-medium">{profile.lastName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of birth</p>
              <p className="text-base font-medium">{profile.dob || "-"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-base font-medium break-all">
                {profile.email || "-"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
