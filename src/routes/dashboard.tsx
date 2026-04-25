import { motion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';
import { useRef } from 'react';
import { FaGithub } from 'react-icons/fa';
import { useBgCanvas } from '../hooks/useBgCanvas';
import { usePixelCanvas } from '../hooks/usePixelCanvas';

export function Dashboard() {
	const canvasGridRef = useRef<HTMLCanvasElement>(null);
	const canvasPixelRef = useRef<HTMLCanvasElement>(null);

	useBgCanvas(canvasGridRef, { cy: 0.45, radius: 300 });
	usePixelCanvas(canvasPixelRef, 30);

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6 }}
				style={{
					position: 'relative',
					padding: '6rem 2rem 5rem',
					textAlign: 'center',
					overflow: 'hidden',
				}}
			>
				{/* 1. Grid background canvas */}
				<canvas
					ref={canvasGridRef}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
					}}
				/>

				{/* 2. Pixel animation canvas */}
				<canvas
					ref={canvasPixelRef}
					style={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						pointerEvents: 'none',
						zIndex: 1,
					}}
				/>

				<div style={{ position: 'relative', zIndex: 3 }}>
					{/* Status badge */}
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15 }}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '0.5rem',
							padding: '0.35rem 0.9rem',
							borderRadius: '999px',
							border: '1px solid rgba(96, 196, 255, 0.25)',
							background: 'rgba(96, 196, 255, 0.07)',
							marginBottom: '2rem',
						}}
					>
						<span
							style={{
								width: '6px',
								height: '6px',
								borderRadius: '50%',
								background: '#34d399',
								boxShadow: '0 0 8px #34d399',
								animation: 'jdm-pulse 2s ease-in-out infinite',
								display: 'inline-block',
							}}
						/>
						<span
							style={{
								fontFamily: "'DM Mono', monospace",
								fontSize: '0.65rem',
								letterSpacing: '0.12em',
								textTransform: 'uppercase',
								color: 'rgba(255,255,255,0.45)',
							}}
						>
							Open to opportunities
						</span>
						<MapPin size={10} style={{ color: 'rgba(255,255,255,0.25)' }} />
						<span
							style={{
								fontFamily: "'DM Mono', monospace",
								fontSize: '0.65rem',
								color: 'rgba(255,255,255,0.25)',
							}}
						>
							Philippines
						</span>
					</motion.div>

					{/* JDM hero mark */}
					<motion.div
						initial={{ opacity: 0, scale: 0.92 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.25, duration: 0.5 }}
						style={{ marginBottom: '1rem' }}
					>
						<div
							style={{
								fontFamily: "'Orbitron', 'Rajdhani', monospace",
								fontSize: 'clamp(4.5rem, 14vw, 8rem)',
								fontWeight: 900,
								letterSpacing: '0.12em',
								lineHeight: 1,
								color: '#60c4ff',
								textShadow: `
									0 0 20px rgba(96, 196, 255, 0.7),
									0 0 50px rgba(96, 196, 255, 0.35),
									0 0 100px rgba(96, 196, 255, 0.15)
								`,
								WebkitTextStroke: '1px rgba(96, 196, 255, 0.4)',
							}}
						>
							JDM
						</div>
					</motion.div>

					{/* Full name */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.35 }}
						style={{
							fontFamily: "'DM Mono', monospace",
							fontSize: '0.7rem',
							letterSpacing: '0.25em',
							textTransform: 'uppercase',
							color: 'rgba(255,255,255,0.3)',
							marginBottom: '2rem',
						}}
					>
						John Dave C. Pega &nbsp;·&nbsp; JDMaster
					</motion.div>

					{/* Bio */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.45 }}
						style={{
							fontSize: '1.05rem',
							color: 'rgba(255,255,255,0.5)',
							maxWidth: '400px',
							margin: '0 auto 2.5rem',
							lineHeight: 1.65,
							fontStyle: 'italic',
						}}
					>
						Normal guy, who know how to type.
					</motion.p>

					{/* Skill tags */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.52 }}
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							gap: '0.4rem',
							justifyContent: 'center',
							maxWidth: '900px',
							margin: '0 auto 2.75rem',
						}}
					>
						{[
							'Python', 'C++', 'JavaScript', 'TypeScript', 'Java', 'C#', 'C', 'Bash', 'Dart', 'Flask', 'REST APIs', 'Sequelize', 'Socket.IO', 'Raspberry Pi', 'Embedded Design', 'Sensor Integration', 'Event - Driven Systems', 'Multithreading', 'Image Processing', 'Q - Learning', 'NEAT', 'Data Pipelines', 'Complex Game Dev', 'Game Physics', 'Language Design', 'Compiler Basics', 'Android Dev', 'Automation', 
						].map((skill, i) => (
							<motion.span
								key={skill}
								initial={{ opacity: 0, scale: 0.85 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.55 + i * 0.008 }}
								style={{
									fontFamily: "'DM Mono', monospace",
									fontSize: '0.62rem',
									letterSpacing: '0.07em',
									padding: '0.28rem 0.65rem',
									borderRadius: '4px',
									border: '1px solid rgba(96, 196, 255, 0.18)',
									background: 'rgba(96, 196, 255, 0.06)',
									color: 'rgba(96, 196, 255, 0.7)',
								}}
							>
								{skill}
							</motion.span>
						))}
					</motion.div>

					{/* CTA buttons */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.65 }}
						style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
					>
						<motion.a
							href="https://github.com/JDM-Github"
							target="_blank"
							rel="noopener noreferrer"
							whileHover={{ scale: 1.03, y: -2 }}
							whileTap={{ scale: 0.97 }}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '0.5rem',
								padding: '0.75rem 1.75rem',
								borderRadius: '8px',
								background: 'rgba(96, 196, 255, 0.1)',
								border: '1px solid rgba(96, 196, 255, 0.35)',
								color: '#60c4ff',
								fontSize: '0.82rem',
								fontWeight: 700,
								textDecoration: 'none',
								letterSpacing: '0.04em',
								boxShadow: '0 0 20px rgba(96, 196, 255, 0.1)',
								transition: 'box-shadow 0.2s',
							}}
							onMouseEnter={e => {
								(e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(96, 196, 255, 0.25)';
							}}
							onMouseLeave={e => {
								(e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(96, 196, 255, 0.1)';
							}}
						>
							<FaGithub size={15} />
							View GitHub
						</motion.a>

						<motion.a
							href="/projects"
							whileHover={{ scale: 1.03, y: -2 }}
							whileTap={{ scale: 0.97 }}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '0.5rem',
								padding: '0.75rem 1.75rem',
								borderRadius: '8px',
								background: 'rgba(255,255,255,0.04)',
								border: '1px solid rgba(255,255,255,0.1)',
								color: 'rgba(255,255,255,0.55)',
								fontSize: '0.82rem',
								fontWeight: 700,
								textDecoration: 'none',
								letterSpacing: '0.04em',
								transition: 'all 0.2s',
							}}
							onMouseEnter={e => {
								const el = e.currentTarget as HTMLElement;
								el.style.color = 'rgba(255,255,255,0.85)';
								el.style.borderColor = 'rgba(255,255,255,0.2)';
							}}
							onMouseLeave={e => {
								const el = e.currentTarget as HTMLElement;
								el.style.color = 'rgba(255,255,255,0.55)';
								el.style.borderColor = 'rgba(255,255,255,0.1)';
							}}
						>
							See My Work
							<ArrowRight size={14} strokeWidth={2.5} />
						</motion.a>

						<motion.a
							href="/contact"
							whileHover={{ scale: 1.03, y: -2 }}
							whileTap={{ scale: 0.97 }}
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: '0.5rem',
								padding: '0.75rem 1.75rem',
								borderRadius: '8px',
								background: 'rgba(52, 211, 153, 0.07)',
								border: '1px solid rgba(52, 211, 153, 0.25)',
								color: '#34d399',
								fontSize: '0.82rem',
								fontWeight: 700,
								textDecoration: 'none',
								letterSpacing: '0.04em',
								transition: 'all 0.2s',
							}}
						>
							Contact Me
						</motion.a>
					</motion.div>
				</div>

				<style>{`
					@keyframes jdm-pulse {
						0%, 100% { opacity: 1; transform: scale(1); }
						50% { opacity: 0.6; transform: scale(0.85); }
					}
				`}</style>
			</motion.div>

			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '240px',
					background: 'linear-gradient(to bottom, transparent, rgba(4,6,12,0.6))',
					pointerEvents: 'none',
					zIndex: 2,
				}}
			/>
		</>
	);
}