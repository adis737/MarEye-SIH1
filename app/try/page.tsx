import Link from "next/link";
import { VideoBackground } from "@/components/video-background";

export default function TryPage() {
	return (
		<div className="relative min-h-screen w-full text-foreground">
			<VideoBackground />
			<div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
				<h1 className="text-4xl font-bold tracking-tight">Try our website</h1>
				<p className="mt-3 text-muted-foreground">
					Explore the key features of our AI-powered biodiversity platform.
				</p>

				<div className="mt-10 grid gap-6 md:grid-cols-2">
					<div className="rounded-xl border bg-card/60 backdrop-blur-md p-6 shadow-sm">
						<h2 className="text-xl font-semibold">Species Identification</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Upload images to identify species using computer vision models and access
							confidence scores.
						</p>
					</div>
					<div className="rounded-xl border bg-card/60 backdrop-blur-md p-6 shadow-sm">
						<h2 className="text-xl font-semibold">Conservation Insights</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							AI-assisted recommendations for conservation strategies driven by
							spatial and temporal data.
						</p>
					</div>
					<div className="rounded-xl border bg-card/60 backdrop-blur-md p-6 shadow-sm">
						<h2 className="text-xl font-semibold">Water Quality Analysis</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Visualize water quality metrics and hotspots with interactive maps and
							model-based predictions.
						</p>
					</div>
					<div className="rounded-xl border bg-card/60 backdrop-blur-md p-6 shadow-sm">
						<h2 className="text-xl font-semibold">Gene Sequence Analysis</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Analyze genetic sequences to predict functional annotations and
							potential threats.
						</p>
					</div>
				</div>

				<div className="mt-12 flex items-center justify-center">
					<Link
						href="/auth/login"
						className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						Get started
					</Link>
				</div>
			</div>
		</div>
	);
}
