"use client";

export function VideoBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			<video
				autoPlay
				loop
				muted
				playsInline
				className="absolute inset-0 w-full h-full object-cover"
			>
				<source src="/Underwater loop background..mp4" type="video/mp4" />
			</video>
			<div className="absolute inset-0 bg-black/40" />
		</div>
	);
}
