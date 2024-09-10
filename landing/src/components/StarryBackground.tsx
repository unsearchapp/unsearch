import { useEffect, useState } from "react";

interface Star {
	id: number;
	top: string;
	left: string;
	size: number;
	opacity: number;
	animationDuration: number;
}

export default function StarryBackground() {
	const [stars, setStars] = useState<Star[]>([]);

	useEffect(() => {
		const generateStars = () => {
			const newStars: Star[] = [];
			for (let i = 0; i < 100; i++) {
				newStars.push({
					id: i,
					top: `${Math.random() * 100}%`,
					left: `${Math.random() * 100}%`,
					size: Math.random() * 2.5 + 0.5, // Slightly increased size range
					opacity: Math.random() * 0.7 + 0.3,
					animationDuration: Math.random() * 4 + 2 // Increased animation duration range
				});
			}
			setStars(newStars);
		};

		generateStars();
	}, []);

	return (
		<div className="pointer-events-none absolute inset-0">
			{stars.map((star) => (
				<div
					key={star.id}
					className="animate-twinkle absolute rounded-full bg-gray-400"
					style={{
						top: star.top,
						left: star.left,
						width: `${star.size}px`,
						height: `${star.size}px`,
						opacity: star.opacity,
						animationDuration: `${star.animationDuration}s`
					}}
				/>
			))}
			<style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-twinkle {
          animation-name: twinkle;
          animation-iteration-count: infinite;
        }
      `}</style>
		</div>
	);
}
