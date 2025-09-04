import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const LoadingSpinner = () => {
	const [textIndex, setTextIndex] = useState(0);
	const loadingTexts = [
		"Welcome to LastMinute SCSIT",
		"Preparing your study resources...",
		"Loading question papers...",
		"Setting up your experience...",
		"Almost ready..."
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setTextIndex((prev) => (prev + 1) % loadingTexts.length);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden'>
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]'></div>
			
			<motion.div 
				className='absolute top-0 left-0 w-full h-full opacity-20'
				initial={{ opacity: 0 }}
				animate={{ opacity: 0.2 }}
				transition={{ duration: 2 }}
			>
				<div className='absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full'></div>
				<div className='absolute top-40 right-20 w-1 h-1 bg-indigo-400 rounded-full'></div>
				<div className='absolute bottom-32 left-16 w-1.5 h-1.5 bg-blue-300 rounded-full'></div>
				<div className='absolute bottom-20 right-10 w-2 h-2 bg-indigo-300 rounded-full'></div>
				<div className='absolute top-60 left-1/3 w-1 h-1 bg-blue-400 rounded-full'></div>
				<div className='absolute top-32 right-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full'></div>
			</motion.div>

			<div className='flex flex-col items-center space-y-8 z-10'>
				<motion.div
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className='text-center'
				>
					<motion.h1 
						className='text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2'
						initial={{ y: -20 }}
						animate={{ y: 0 }}
						transition={{ delay: 0.3, duration: 0.6 }}
					>
						LastMinute
					</motion.h1>
					<motion.div 
						className='text-2xl md:text-3xl font-semibold text-blue-300'
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6 }}
					>
						SCSIT
					</motion.div>
					<motion.p 
						className='text-slate-400 text-sm mt-2 font-light'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8, duration: 0.6 }}
					>
						Your Complete Study Platform
					</motion.p>
				</motion.div>

				<div className='relative flex items-center justify-center'>
					<motion.div
						className='w-20 h-20 border-4 border-blue-500/30 rounded-full absolute'
						animate={{ rotate: 360 }}
						transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
					/>
					<motion.div
						className='w-16 h-16 border-4 border-t-blue-400 border-r-purple-400 border-b-indigo-400 border-l-transparent rounded-full'
						animate={{ rotate: -360 }}
						transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
					/>
					<motion.div
						className='w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full absolute'
						animate={{ scale: [1, 1.2, 1] }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
				</div>

				<motion.div 
					className='text-center h-16 flex items-center'
					key={textIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.5 }}
				>
					<p className='text-blue-200 text-lg font-medium px-4'>
						{loadingTexts[textIndex]}
					</p>
				</motion.div>

				<motion.div 
					className='flex space-x-2'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.2, duration: 0.6 }}
				>
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							className='w-2 h-2 bg-blue-400 rounded-full'
							animate={{ 
								scale: [1, 1.5, 1],
								opacity: [0.5, 1, 0.5]
							}}
							transition={{
								duration: 1.5,
								repeat: Infinity,
								delay: i * 0.2
							}}
						/>
					))}
				</motion.div>

				<motion.div 
					className='absolute bottom-10 text-center'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5, duration: 0.8 }}
				>
					<p className='text-slate-500 text-xs'>
						Question Papers • Study Materials • Resources
					</p>
				</motion.div>
			</div>

			<motion.div 
				className='absolute inset-0 pointer-events-none'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 3 }}
			>
				<div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl'></div>
				<div className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl'></div>
			</motion.div>
		</div>
	);
};

export default LoadingSpinner;
