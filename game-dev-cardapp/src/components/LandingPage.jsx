import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Gamepad2, Sword, Trophy, Zap } from 'lucide-react';

const LandingPage = () => {
const navigate = useNavigate();

return (
	<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
	{/* Animated pixel grid background */}
	<div className="absolute inset-0 opacity-10">
		<div className="grid grid-cols-20 grid-rows-20 h-full w-full">
		{[...Array(400)].map((_, i) => (
			<div
			key={i}
			className="border border-cyan-400 animate-pulse"
			style={{ animationDelay: `${Math.random() * 2}s` }}
			/>
		))}
		</div>
	</div>

	{/* Floating pixel elements */}
	<div className="absolute top-20 left-20 animate-bounce" style={{ animationDuration: '3s' }}>
		<Gamepad2 className="w-12 h-12 text-cyan-400" />
	</div>
	<div className="absolute top-40 right-32 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
		<Trophy className="w-10 h-10 text-yellow-400" />
	</div>
	<div className="absolute bottom-32 left-40 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
		<Sword className="w-14 h-14 text-pink-400" />
	</div>
	<div className="absolute bottom-20 right-20 animate-bounce" style={{ animationDuration: '4.5s' }}>
		<Zap className="w-12 h-12 text-green-400" />
	</div>

	{/* Main content */}
	<div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
		<div className="text-center space-y-8 max-w-4xl">
		{/* Title with pixel border effect */}
		<div className="relative inline-block">
			<div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 opacity-75 blur-xl animate-pulse" />
			<h1 className="relative text-6xl md:text-8xl font-bold pixel-text text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]">
			GAME DEV
			</h1>
		</div>
		
		<div className="relative inline-block mt-4">
			<h2 className="text-4xl md:text-5xl font-bold pixel-text text-green-400 drop-shadow-[0_0_20px_rgba(0,255,135,0.6)]">
			LINK TREE
			</h2>
		</div>

		<p className="text-xl md:text-2xl text-cyan-200 font-mono max-w-2xl mx-auto leading-relaxed mt-8">
			Your <span className="text-yellow-300 font-bold">epic portfolio</span> for showcasing games.
			<br />
			Level up your <span className="text-pink-300 font-bold">developer profile</span>!
		</p>

		{/* Pixel art style features */}
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
			{[
			{ icon: Gamepad2, text: 'Showcase Games', color: 'cyan' },
			{ icon: Trophy, text: 'Share Achievements', color: 'yellow' },
			{ icon: Zap, text: 'Go Viral', color: 'pink' },
			].map((feature, idx) => (
			<div
				key={idx}
				className="bg-slate-800/50 border-4 border-slate-700 p-6 pixel-border hover:border-${feature.color}-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]"
			>
				<feature.icon className={`w-12 h-12 mx-auto mb-3 text-${feature.color}-400`} />
				<p className="text-lg font-mono text-slate-200">{feature.text}</p>
			</div>
			))}
		</div>

		{/* CTA Button */}
		<div className="mt-16">
			<Button
			onClick={() => navigate('/create-profile')}
			className="pixel-button text-2xl md:text-3xl px-12 py-8 font-bold bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white border-4 border-white shadow-[0_8px_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all duration-150"
			>
			<Zap className="inline-block mr-3 w-8 h-8" />
			START YOUR QUEST
			</Button>
		</div>

		<p className="text-sm text-slate-400 font-mono mt-8">
			Press <span className="text-cyan-400 font-bold">[START]</span> to begin your journey
		</p>
		</div>
	</div>
	</div>
);
};

export default LandingPage;
