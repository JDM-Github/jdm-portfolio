import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './routes/dashboard';
import { Nav } from './layout/nav';
import { motion } from 'framer-motion';
import { Projects } from './routes/projects';
import { Stack } from './routes/stack';
import { Contact } from './routes/contact';
import { Resume } from './routes/resume';

function AnimatedBlobs() {
	return (
		<>
			<motion.div
				className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none z-0"
				style={{ background: '#a78bfa', filter: 'blur(150px)', opacity: 0.15 }}
				animate={{ x: [0, -200, 0], y: [0, 50, 0] }}
				transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.div
				className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
				style={{ background: '#34d399', filter: 'blur(120px)', opacity: 0.12 }}
				animate={{ x: [0, 150, 0], y: [0, -100, 0] }}
				transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
			/>
		</>
	);
}

function App() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-bg-base to-bg-base-2 text-text-primary font-sans relative overflow-x-hidden">
			<AnimatedBlobs />
			<div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
				<Nav />
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/home" element={<Dashboard />} />
					<Route path="/projects" element={<Projects />} />
					<Route path="/stack" element={<Stack />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/resume" element={<Resume />} />
				</Routes>
				
			</div>
		</div>
	);
}

export default App;