"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoBackground } from "@/components/video-background";
import { useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const [avatarPreview, setAvatarPreview] = useState<string>("");

	async function fileToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		let avatar = "";
		const file = form.get("avatar");
		if (file && file instanceof File && file.size > 0) {
			avatar = await fileToBase64(file);
		}
		const data = {
			firstName: String(form.get("firstName") || ""),
			lastName: String(form.get("lastName") || ""),
			dob: String(form.get("dob") || ""),
			email: String(form.get("email") || ""),
			avatar,
		};
		try {
			localStorage.setItem("profile", JSON.stringify(data));
		} catch {}
		// TODO: integrate with real registration
		router.push("/auth/login");
	}

	function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setAvatarPreview(url);
	}

	return (
		<div className="relative min-h-screen w-full text-foreground">
			<VideoBackground />
			<div className="relative z-10 mx-auto max-w-md px-6 py-16">
				<h1 className="text-3xl font-semibold">Create your account</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Fill in your details to get started.
				</p>

				<form className="mt-8" onSubmit={onSubmit}>
					<div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center">
								{avatarPreview ? (
									<img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
								) : (
									<span className="text-xs text-white/70">No image</span>
								)}
							</div>
							<div>
								<label htmlFor="avatar" className="text-sm font-medium">
									Upload avatar
								</label>
								<input id="avatar" name="avatar" type="file" accept="image/*" onChange={onAvatarChange} className="mt-1 block text-sm" />
								<p className="text-xs text-white/60 mt-1">JPG/PNG, up to ~2MB recommended.</p>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 mt-6">
							<div className="space-y-2">
								<label htmlFor="firstName" className="text-sm font-medium">
									First name
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									required
									placeholder="John"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="lastName" className="text-sm font-medium">
									Last name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									required
									placeholder="Doe"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
						</div>

						<div className="space-y-2 mt-4">
							<label htmlFor="dob" className="text-sm font-medium">
								Date of birth
							</label>
							<input
								id="dob"
								name="dob"
								type="date"
								required
								className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
							/>
						</div>

						<div className="space-y-4 mt-4">
							<div className="space-y-2">
								<label htmlFor="email" className="text-sm font-medium">
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									placeholder="you@example.com"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmEmail" className="text-sm font-medium">
									Confirm email
								</label>
								<input
									id="confirmEmail"
									name="confirmEmail"
									type="email"
									required
									placeholder="you@example.com"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
						</div>

						<div className="space-y-4 mt-4">
							<div className="space-y-2">
								<label htmlFor="password" className="text-sm font-medium">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									required
									placeholder="••••••••"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="confirmPassword" className="text-sm font-medium">
									Confirm password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									placeholder="••••••••"
									className="w-full rounded-md border bg-background/60 px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-cyan-400"
								/>
							</div>
						</div>

						<button
							type="submit"
							className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
						>
							Create account
						</button>
					</div>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/auth/login" className="font-medium text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
