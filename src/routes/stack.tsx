import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useBgCanvas } from '../hooks/useBgCanvas';
import { usePixelCanvas } from '../hooks/usePixelCanvas';

// ─────────────────────────────────────────────────────────────────────────────
// STACK DATA
// ─────────────────────────────────────────────────────────────────────────────
type TechItem = {
    name: string;
    level: 'expert' | 'proficient' | 'familiar';
    note?: string;
    color?: string;
};

type Category = {
    id: string;
    label: string;
    icon: string;
    color: string;
    items: TechItem[];
};

const CATEGORIES: Category[] = [
    {
        id: 'languages',
        label: 'Languages',
        icon: '{ }',
        color: '#60c4ff',
        items: [
            { name: 'Python', level: 'expert', note: 'ML, automation, scripting, Flask backends' },
            { name: 'C++', level: 'expert', note: 'Robotics, embedded systems, performance-critical code' },
            { name: 'JavaScript', level: 'expert', note: 'Full-stack web, Node.js, browser APIs' },
            { name: 'Dart', level: 'expert', note: 'Flutter mobile & desktop apps' },
            { name: 'TypeScript', level: 'proficient', note: 'Typed JS, React projects, API contracts' },
            { name: 'Java', level: 'proficient', note: 'Android dev, OOP-heavy applications' },
            { name: 'C#', level: 'proficient', note: 'Unity, desktop apps, .NET tooling' },
            { name: 'C', level: 'proficient', note: 'Low-level programming, embedded targets' },
            { name: 'Bash / Shell', level: 'familiar', note: 'Automation scripts, CI pipelines, Linux tooling' },
            { name: 'Lua', level: 'familiar', note: 'Game scripting, embedded scripting engines' },
        ],
    },
    {
        id: 'web',
        label: 'Web & APIs',
        icon: '⬡',
        color: '#a78bfa',
        items: [
            { name: 'React', level: 'expert', note: 'Hooks, context, routing, custom component libs' },
            { name: 'Node.js', level: 'expert', note: 'REST APIs, real-time servers, CLI tools' },
            { name: 'Flask', level: 'expert', note: 'Python web APIs, auth, ML model serving' },
            { name: 'REST APIs', level: 'expert', note: 'Design, auth patterns, rate limiting, caching' },
            { name: 'Socket.IO', level: 'proficient', note: 'Real-time bidirectional event-driven apps' },
            { name: 'Sequelize', level: 'proficient', note: 'ORM for Node, migrations, associations' },
            { name: 'Tailwind CSS', level: 'expert', note: 'Utility-first styling, dark themes, responsive' },
        ],
    },
    {
        id: 'mobile',
        label: 'Mobile & Desktop',
        icon: '◫',
        color: '#34d399',
        items: [
            { name: 'Flutter', level: 'expert', note: 'Cross-platform mobile & desktop with Dart' },
            { name: 'Android Dev', level: 'proficient', note: 'Native Android, Java/Kotlin, Gradle' },
            { name: 'Electron', level: 'proficient', note: 'Desktop apps using web technologies' },
        ],
    },
    {
        id: 'robotics',
        label: 'Robotics & Embedded',
        icon: '⚙',
        color: '#fbbf24',
        items: [
            { name: 'Raspberry Pi', level: 'expert', note: 'GPIO, camera, IoT projects, Linux config' },
            { name: 'Arduino', level: 'expert', note: 'Microcontroller programming, sensors, actuators' },
            { name: 'Sensor Integration', level: 'expert', note: 'I2C, SPI, UART, analog/digital sensors' },
            { name: 'Embedded Design', level: 'proficient', note: 'PCB awareness, circuit logic, firmware' },
            { name: 'Multithreading', level: 'proficient', note: 'Concurrent systems, thread-safe data sharing' },
            { name: 'Event-Driven Systems', level: 'proficient', note: 'Reactive architectures, pub/sub, queues' },
        ],
    },
    {
        id: 'ai',
        label: 'AI & ML',
        icon: '◈',
        color: '#f472b6',
        items: [
            { name: 'Machine Learning', level: 'proficient', note: 'Supervised learning, model training & eval' },
            { name: 'Object Detection', level: 'proficient', note: 'YOLO, OpenCV, real-time vision pipelines' },
            { name: 'Q-Learning', level: 'familiar', note: 'Reinforcement learning, reward shaping' },
            { name: 'NEAT / NeuroEvol', level: 'proficient', note: 'Evolutionary neural networks, Python NEAT' },
            { name: 'Data Pipelines', level: 'proficient', note: 'ETL, data cleaning, feature engineering' },
        ],
    },
    {
        id: 'systems',
        label: 'Systems & Tools',
        icon: '▣',
        color: '#fb923c',
        items: [
            { name: 'Linux', level: 'expert', note: 'Daily driver, sysadmin, shell config' },
            { name: 'Git / GitHub', level: 'expert', note: 'Branching strategies, CI/CD, Actions' },
            { name: 'Docker', level: 'familiar', note: 'Containerized apps, compose, networking' },
            { name: 'Game Development', level: 'proficient', note: 'Physics engines, game loops, complex state' },
            { name: 'Compiler Basics', level: 'familiar', note: 'Lexing, parsing, AST, language design' },
            { name: 'Cloud Storage', level: 'familiar', note: 'Firebase, Supabase, S3-compatible storage' },
            { name: 'Automation', level: 'proficient', note: 'Task scheduling, scraping, workflow bots' },
        ],
    },
];

const LEVEL_META = {
    expert: { label: 'Expert', fill: '100%', color: '#60c4ff' },
    proficient: { label: 'Proficient', fill: '68%', color: '#a78bfa' },
    familiar: { label: 'Familiar', fill: '38%', color: '#fbbf24' },
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
type TooltipPos = { x: number; y: number };

function Tooltip({ note, color, pos, visible }: { note: string; color: string; pos: TooltipPos; visible: boolean }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 4 }}
                    transition={{ duration: 0.14 }}
                    style={{
                        position: 'fixed',
                        left: pos.x,
                        top: pos.y,
                        zIndex: 9999,
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -100%)',
                        marginTop: '-8px',
                    }}
                >
                    <div style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${color}35`,
                        background: 'rgba(8, 10, 20, 0.95)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: `0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
                        maxWidth: '220px',
                        whiteSpace: 'normal',
                    }}>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.65rem',
                            color: 'rgba(255,255,255,0.72)',
                            lineHeight: 1.55,
                            letterSpacing: '0.02em',
                            margin: 0,
                        }}>
                            {note}
                        </p>
                        {/* Arrow */}
                        <div style={{
                            position: 'absolute',
                            bottom: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)',
                            width: '8px',
                            height: '8px',
                            background: 'rgba(8, 10, 20, 0.95)',
                            borderRight: `1px solid ${color}35`,
                            borderBottom: `1px solid ${color}35`,
                        }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TECH CARD
// ─────────────────────────────────────────────────────────────────────────────
function TechCard({ item, catColor }: { item: TechItem; catColor: string }) {
    const [hovered, setHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState<TooltipPos>({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const color = item.color ?? catColor;
    const meta = LEVEL_META[item.level];

    const handleMouseEnter = (e: React.MouseEvent) => {
        setHovered(true);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 6,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 6,
        });
    };

    return (
        <>
            {item.note && (
                <Tooltip
                    note={item.note}
                    color={color}
                    pos={tooltipPos}
                    visible={hovered}
                />
            )}
            <motion.div
                ref={cardRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(false)}
                whileHover={{ y: -3, scale: 1.02 }}
                style={{
                    padding: '0.875rem 1rem',
                    borderRadius: '10px',
                    border: `1px solid ${hovered ? `${color}45` : `${color}18`}`,
                    background: hovered ? `${color}0e` : `${color}06`,
                    boxShadow: hovered ? `0 4px 20px ${color}14` : 'none',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'default',
                }}
            >
                {/* Shimmer top line */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                    background: `linear-gradient(90deg, transparent, ${color}${hovered ? '70' : '30'}, transparent)`,
                    transition: 'opacity 0.2s',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', gap: '0.5rem' }}>
                    <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'rgba(255,255,255,0.88)',
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {item.name}
                    </span>
                    <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: meta.color,
                        flexShrink: 0,
                        opacity: 0.8,
                    }}>
                        {meta.label}
                    </span>
                </div>

                {/* Level bar */}
                <div style={{
                    height: '3px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: meta.fill }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        style={{
                            height: '100%',
                            borderRadius: '999px',
                            background: `linear-gradient(90deg, ${color}80, ${color})`,
                            boxShadow: `0 0 8px ${color}60`,
                        }}
                    />
                </div>
            </motion.div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGEND
// ─────────────────────────────────────────────────────────────────────────────
function Legend() {
    return (
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {Object.entries(LEVEL_META).map(([key, meta]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{
                        width: '24px', height: '3px', borderRadius: '999px',
                        background: meta.color,
                        boxShadow: `0 0 6px ${meta.color}80`,
                    }} />
                    <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.62rem',
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.08em',
                    }}>
                        {meta.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.875rem 1.5rem',
            borderRadius: '10px',
            border: `1px solid ${color}25`,
            background: `${color}07`,
            minWidth: '90px',
        }}>
            <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '1.5rem',
                fontWeight: 900,
                color: color,
                textShadow: `0 0 16px ${color}60`,
                lineHeight: 1,
                marginBottom: '0.35rem',
            }}>
                {value}
            </span>
            <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.58rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.25)',
            }}>
                {label}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function Stack() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasPixelRef = useRef<HTMLCanvasElement>(null);
    useBgCanvas(canvasRef, { cy: 0.3, radius: 260 });
    usePixelCanvas(canvasPixelRef, 30);

    const totalItems = CATEGORIES.reduce((acc, c) => acc + c.items.length, 0);
    const expertCount = CATEGORIES.flatMap(c => c.items).filter(i => i.level === 'expert').length;
    const proficientCount = CATEGORIES.flatMap(c => c.items).filter(i => i.level === 'proficient').length;

    const displayed = activeCategory
        ? CATEGORIES.filter(c => c.id === activeCategory)
        : CATEGORIES;

    return (
        <div style={{ paddingBottom: '5rem', paddingTop: '2rem' }}>

            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />
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

            {/* ── HEADER ───────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.5rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '24px', height: '1px', background: 'rgba(96,196,255,0.5)' }} />
                    <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: 'rgba(96,196,255,0.55)',
                    }}>
                        What I work with
                    </span>
                </div>
                <h1 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                    fontWeight: 900,
                    color: '#60c4ff',
                    textShadow: '0 0 20px rgba(96,196,255,0.4)',
                    letterSpacing: '0.06em',
                    lineHeight: 1.1,
                    margin: '0 0 0.5rem',
                }}>
                    Tech Stack
                </h1>
                <p style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.05em',
                    margin: 0,
                }}>
                    Hover a card for details · {totalItems} technologies across {CATEGORIES.length} domains
                </p>
            </motion.div>

            {/* ── SUMMARY PILLS ────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}
            >
                <StatPill value={totalItems} label="Total" color="#60c4ff" />
                <StatPill value={expertCount} label="Expert" color="#60c4ff" />
                <StatPill value={proficientCount} label="Proficient" color="#a78bfa" />
                <StatPill value={totalItems - expertCount - proficientCount} label="Familiar" color="#fbbf24" />
                <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                    <Legend />
                </div>
            </motion.div>

            {/* ── CATEGORY FILTER TABS ─────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}
            >
                <button
                    onClick={() => setActiveCategory(null)}
                    style={{
                        padding: '0.4rem 0.875rem',
                        borderRadius: '6px',
                        border: `1px solid ${!activeCategory ? 'rgba(96,196,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        background: !activeCategory ? 'rgba(96,196,255,0.1)' : 'rgba(255,255,255,0.03)',
                        color: !activeCategory ? '#60c4ff' : 'rgba(255,255,255,0.3)',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                    }}
                >
                    All
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.4rem 0.875rem',
                            borderRadius: '6px',
                            border: `1px solid ${activeCategory === cat.id ? `${cat.color}50` : 'rgba(255,255,255,0.08)'}`,
                            background: activeCategory === cat.id ? `${cat.color}12` : 'rgba(255,255,255,0.03)',
                            color: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.3)',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                        }}
                    >
                        <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </motion.div>

            {/* ── CATEGORY SECTIONS ────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
                {displayed.map((cat, ci) => (
                    <motion.section
                        key={cat.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ci * 0.07 + 0.15, duration: 0.4 }}
                    >
                        {/* Section header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                            paddingBottom: '0.75rem',
                            borderBottom: `1px solid ${cat.color}18`,
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: `${cat.color}15`,
                                border: `1px solid ${cat.color}30`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', fontFamily: 'monospace',
                                color: cat.color,
                                flexShrink: 0,
                            }}>
                                {cat.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    color: 'rgba(255,255,255,0.85)',
                                    lineHeight: 1.2,
                                }}>
                                    {cat.label}
                                </div>
                                <div style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '0.58rem',
                                    color: `${cat.color}70`,
                                    letterSpacing: '0.1em',
                                    marginTop: '0.1rem',
                                }}>
                                    {cat.items.length} technologies
                                </div>
                            </div>

                            {/* Right: mini legend for this section */}
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                                {(['expert', 'proficient', 'familiar'] as const).map(lvl => {
                                    const count = cat.items.filter(i => i.level === lvl).length;
                                    if (!count) return null;
                                    return (
                                        <span key={lvl} style={{
                                            fontFamily: "'DM Mono', monospace",
                                            fontSize: '0.58rem',
                                            padding: '0.15rem 0.45rem',
                                            borderRadius: '4px',
                                            background: `${LEVEL_META[lvl].color}15`,
                                            border: `1px solid ${LEVEL_META[lvl].color}25`,
                                            color: `${LEVEL_META[lvl].color}bb`,
                                        }}>
                                            {count} {lvl}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cards grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.5rem',
                        }}>
                            {cat.items.map((item, ii) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: ci * 0.05 + ii * 0.03 + 0.2 }}
                                >
                                    <TechCard item={item} catColor={cat.color} />
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                ))}
            </div>

        </div>
    );
}