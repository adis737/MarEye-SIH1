"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoBackground } from "@/components/video-background";

export default function LoginPage() {
	const router = useRouter();

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		// TODO: integrate with real auth
		document.cookie = `auth_token=dummy; path=/; max-age=${60 * 60 * 24}; secure`;
		router.push("/");
	}

	return (
		<div className="relative min-h-screen w-full text-foreground">
			<VideoBackground />
			<div className="relative z-10 mx-auto max-w-md px-6 py-16">
				<h1 className="text-3xl font-semibold">Login</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Welcome back. Please enter your details.
				</p>

				<form className="mt-8" onSubmit={onSubmit}>
					<div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
						<div className="space-y-4">
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

							<button
								type="submit"
								className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
							>
								Sign in
							</button>
						</div>
					</div>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don t have an account?{" "}
					<Link href="/auth/register" className="font-medium text-primary hover:underline">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
