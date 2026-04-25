import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Menu, X } from 'lucide-react';
import { FaGithub, FaYoutube, FaFacebook, FaFileAlt } from 'react-icons/fa';

const navItems = [
	{ label: 'Home', to: '/' },
	{ label: 'Projects', to: '/projects' },
	{ label: 'Stack', to: '/stack' },
	{ label: 'Contact', to: '/contact' },
];

const socials = [
	{ icon: FaGithub, href: 'https://github.com/JDM-Github', label: 'GitHub', color: '#60c4ff' },
	{ icon: FaYoutube, href: 'https://youtube.com/@jdmaster888', label: 'YouTube', color: '#ff6b6b' },
	{ icon: FaFacebook, href: 'https://facebook.com/jdmaster888', label: 'Facebook', color: '#60a5fa' },
	{ icon: Mail, href: 'mailto:jdmaster888@gmail.com', label: 'Email', color: '#34d399' },
	{ icon: FaFileAlt, href: '/resume', label: 'Resume', color: '#fbbf24' },
];

export function Nav() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<>
			<motion.nav
				initial={{ opacity: 0, y: -16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
				style={{
					position: 'sticky',
					top: 0,
					zIndex: 100,
					backgroundColor: 'rgba(4, 6, 12, 0.88)',
					backdropFilter: 'blur(20px)',
					borderBottom: '1px solid rgba(42, 130, 220, 0.15)',
					padding: '0 2rem',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					height: '64px',
				}}
				className="rounded-xl"
			>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: '50%',
						transform: 'translateX(-50%)',
						width: '200px',
						height: '1px',
						background: 'linear-gradient(90deg, transparent, #60c4ff, transparent)',
						zIndex: 2,
					}}
				/>
				{/* Logo - links to home */}
				<NavLink to="/" style={{ textDecoration: 'none' }}>
					<motion.div
						whileHover={{ scale: 1.04 }}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0.5rem',
						}}
					>
						<div
							style={{
								fontFamily: "'Rajdhani', 'Orbitron', monospace",
								fontSize: '1.5rem',
								fontWeight: 800,
								letterSpacing: '0.08em',
								color: '#60c4ff',
								textShadow: '0 0 12px rgba(96, 196, 255, 0.6), 0 0 30px rgba(96, 196, 255, 0.2)',
								lineHeight: 1,
							}}
						>
							JDM
						</div>
						<div
							style={{
								width: '1px',
								height: '20px',
								background: 'rgba(96, 196, 255, 0.3)',
							}}
						/>
						<div
							style={{
								fontFamily: "'DM Mono', monospace",
								fontSize: '0.62rem',
								color: 'rgba(255,255,255,0.3)',
								letterSpacing: '0.12em',
								textTransform: 'uppercase',
								lineHeight: 1.3,
							}}
						>
							<div>John Dave</div>
							<div>C. Pega</div>
						</div>
					</motion.div>
				</NavLink>

				{/* Desktop Nav Links */}
				<div
					style={{ display: 'flex', gap: '0.25rem' }}
					className="nav-links-desktop"
				>
					{navItems.map((item, i) => (
						<NavLink
							key={item.label}
							to={item.to}
							style={({ isActive }) => ({
								textDecoration: 'none',
								color: isActive ? '#60c4ff' : 'rgba(255,255,255,0.45)',
								fontSize: '0.78rem',
								fontWeight: 600,
								letterSpacing: '0.08em',
								textTransform: 'uppercase',
								fontFamily: "'DM Mono', monospace",
								padding: '0.4rem 0.85rem',
								borderRadius: '6px',
								transition: 'color 0.2s, background 0.2s',
								background: isActive ? 'rgba(96, 196, 255, 0.1)' : 'transparent',
							})}
							onMouseEnter={(e) => {
								if (!e.currentTarget.classList.contains('active')) {
									e.currentTarget.style.background = 'rgba(96, 196, 255, 0.08)';
								}
							}}
							onMouseLeave={(e) => {
								if (!e.currentTarget.classList.contains('active')) {
									e.currentTarget.style.background = 'transparent';
								}
							}}
						>
							<motion.span
								initial={{ opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.07 + 0.2 }}
							>
								{item.label}
							</motion.span>
						</NavLink>
					))}
				</div>

				{/* Social Icons */}
				<div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
					{socials.map((s, i) => (
						<motion.a
							key={s.label}
							href={s.href}
							target="_blank"
							rel="noopener noreferrer"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: i * 0.07 + 0.4 }}
							whileHover={{ scale: 1.12, y: -2 }}
							title={s.label}
							style={{
								width: '34px',
								height: '34px',
								borderRadius: '8px',
								border: '1px solid rgba(42, 130, 220, 0.2)',
								background: 'rgba(96, 196, 255, 0.05)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'rgba(255,255,255,0.35)',
								textDecoration: 'none',
								transition: 'all 0.2s',
							}}
							onMouseEnter={e => {
								const el = e.currentTarget;
								el.style.color = s.color;
								el.style.borderColor = `${s.color}55`;
								el.style.background = `${s.color}12`;
								el.style.boxShadow = `0 0 12px ${s.color}30`;
							}}
							onMouseLeave={e => {
								const el = e.currentTarget;
								el.style.color = 'rgba(255,255,255,0.35)';
								el.style.borderColor = 'rgba(42, 130, 220, 0.2)';
								el.style.background = 'rgba(96, 196, 255, 0.05)';
								el.style.boxShadow = 'none';
							}}
						>
							<s.icon size={15} />
						</motion.a>
					))}

					{/* Mobile menu button */}
					<motion.button
						whileTap={{ scale: 0.95 }}
						onClick={() => setMenuOpen(v => !v)}
						style={{
							display: 'none',
							marginLeft: '0.5rem',
							width: '34px',
							height: '34px',
							border: '1px solid rgba(42, 130, 220, 0.2)',
							background: 'rgba(96, 196, 255, 0.05)',
							borderRadius: '8px',
							alignItems: 'center',
							justifyContent: 'center',
							color: 'rgba(255,255,255,0.45)',
							cursor: 'pointer',
						}}
						className="mobile-menu-btn"
					>
						{menuOpen ? <X size={16} /> : <Menu size={16} />}
					</motion.button>
				</div>
			</motion.nav>

			{/* Mobile Menu */}
			<AnimatePresence>
				{menuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						style={{
							background: 'rgba(4, 6, 12, 0.97)',
							borderBottom: '1px solid rgba(42, 130, 220, 0.15)',
							overflow: 'hidden',
							zIndex: 99,
							position: 'relative',
						}}
					>
						<div style={{ padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
							{navItems.map(item => (
								<NavLink
									key={item.label}
									to={item.to}
									onClick={() => setMenuOpen(false)}
									style={({ isActive }) => ({
										textDecoration: 'none',
										color: isActive ? '#60c4ff' : 'rgba(255,255,255,0.55)',
										fontSize: '0.85rem',
										fontWeight: 600,
										letterSpacing: '0.06em',
										padding: '0.6rem 0.5rem',
										borderBottom: '1px solid rgba(42, 130, 220, 0.08)',
										fontFamily: "'DM Mono', monospace",
										transition: 'color 0.2s',
									})}
								>
									{item.label}
								</NavLink>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<style>{`
				@media (max-width: 768px) {
					.nav-links-desktop { display: none !important; }
					.mobile-menu-btn { display: flex !important; }
				}
			`}</style>
		</>
	);
}