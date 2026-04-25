import { motion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useBgCanvas } from '../hooks/useBgCanvas';
import { usePixelCanvas } from '../hooks/usePixelCanvas';
import {
    FileText,
    Download,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    AlertCircle,
    Eye,
} from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

type DocInfo = {
    id: 'resume' | 'cv';
    label: string;
    path: string;
    accentColor: string;
    accentAlpha: string;
    description: string;
};

const DOCS: DocInfo[] = [
    {
        id: 'resume',
        label: 'Resume',
        path: '/resume.pdf',
        accentColor: '#60c4ff',
        accentAlpha: '40',
        description: '1-2 page highlight reel',
    },
    {
        id: 'cv',
        label: 'CV',
        path: '/cv.pdf',
        accentColor: '#34d399',
        accentAlpha: '40',
        description: 'Full academic & work record',
    },
];

function PdfPanel({ doc, defaultExpanded = false }: { doc: DocInfo; defaultExpanded?: boolean }) {
    const [numPages, setNumPages] = useState<number>(0);
    const [page, setPage] = useState(1);
    const [scale, setScale] = useState(0.8);
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

    const onDocLoad = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoadState('ok');
    }, []);

    const onDocError = useCallback(() => {
        setLoadState('error');
    }, []);

    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

    const ac = doc.accentColor;

    // Viewer width: expanded = fill container, collapsed = standard
    const viewerWidth = expanded ? '100%' : '100%';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            style={{
                borderRadius: '16px',
                border: `1px solid ${ac}22`,
                background: `${ac}05`,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Top shimmer */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: `linear-gradient(90deg, transparent, ${ac}55, transparent)`,
                pointerEvents: 'none', zIndex: 2,
            }} />

            {/* ── Panel header ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderBottom: `1px solid ${ac}18`,
                background: `${ac}06`,
                gap: '1rem',
                flexWrap: 'wrap',
            }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '9px',
                        background: `${ac}14`, border: `1px solid ${ac}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: ac, flexShrink: 0,
                        boxShadow: `0 0 14px ${ac}20`,
                    }}>
                        <FileText size={16} />
                    </div>
                    <div>
                        <div style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: '0.9rem', fontWeight: 900,
                            color: ac, letterSpacing: '0.08em',
                            textShadow: `0 0 14px ${ac}60`,
                        }}>
                            {doc.label}
                        </div>
                        <div style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                            letterSpacing: '0.1em',
                        }}>
                            {doc.description}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Zoom */}
                    {loadState === 'ok' && (
                        <>
                            <ControlBtn
                                icon={<ZoomOut size={13} />}
                                title="Zoom out"
                                color={ac}
                                onClick={() => setScale(s => clamp(+(s - 0.2).toFixed(1), 0.4, 2.5))}
                            />
                            <span style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '0.65rem', color: `${ac}80`,
                                minWidth: '3rem', textAlign: 'center',
                            }}>
                                {Math.round(scale * 100)}%
                            </span>
                            <ControlBtn
                                icon={<ZoomIn size={13} />}
                                title="Zoom in"
                                color={ac}
                                onClick={() => setScale(s => clamp(+(s + 0.2).toFixed(1), 0.4, 2.5))}
                            />
                            <div style={{ width: '1px', height: '20px', background: `${ac}20` }} />
                            {/* Page nav */}
                            {numPages > 1 && (
                                <>
                                    <ControlBtn
                                        icon={<ChevronLeft size={13} />}
                                        title="Prev page"
                                        color={ac}
                                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                                        disabled={page <= 1}
                                    />
                                    <span style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: '0.65rem', color: `${ac}80`,
                                        minWidth: '4rem', textAlign: 'center',
                                    }}>
                                        {page} / {numPages}
                                    </span>
                                    <ControlBtn
                                        icon={<ChevronRight size={13} />}
                                        title="Next page"
                                        color={ac}
                                        onClick={() => setPage(p => Math.min(p + 1, numPages))}
                                        disabled={page >= numPages}
                                    />
                                    <div style={{ width: '1px', height: '20px', background: `${ac}20` }} />
                                </>
                            )}
                        </>
                    )}

                    {/* Expand / Collapse */}
                    <ControlBtn
                        icon={expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                        title={expanded ? 'Collapse' : 'Expand'}
                        color={ac}
                        onClick={() => setExpanded(e => !e)}
                    />

                    {/* Download */}
                    <a
                        href={doc.path}
                        download
                        style={{ textDecoration: 'none' }}
                    >
                        <ControlBtn
                            icon={<Download size={13} />}
                            title={`Download ${doc.label}`}
                            color={ac}
                            onClick={() => { }}
                            filled
                        />
                    </a>

                    {/* View (opens raw PDF) */}
                    <ControlBtn
                        icon={<Eye size={13} />}
                        title={`View ${doc.label} in new tab`}
                        color={ac}
                        onClick={() => window.open(doc.path, '_blank')}
                    />

                </div>
            </div>

            {/* ── PDF canvas area ── */}
            <div style={{
                width: viewerWidth,
                minHeight: expanded ? '85vh' : '560px',
                maxHeight: expanded ? 'none' : '560px',
                overflow: 'auto',
                display: 'flex',
                alignItems: loadState !== 'ok' ? 'center' : 'flex-start',
                justifyContent: 'center',
                padding: loadState === 'ok' ? '1.25rem' : '0',
                background: 'rgba(0,0,0,0.25)',
                position: 'relative',
                transition: 'min-height 0.3s ease, max-height 0.3s ease',
                scrollbarWidth: 'thin',
                scrollbarColor: `${ac}30 transparent`,
            }}>
                <Document
                    file={doc.path}
                    onLoadSuccess={onDocLoad}
                    onLoadError={onDocError}
                    loading={<PdfLoading color={ac} />}
                    error={<PdfError color={ac} label={doc.label} path={doc.path} />}
                >
                    {loadState === 'ok' && (
                        <motion.div
                            key={`${page}-${scale}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${ac}15`,
                                borderRadius: '4px',
                                overflow: 'hidden',
                            }}
                        >
                            <Page
                                pageNumber={page}
                                scale={scale}
                                renderAnnotationLayer
                                renderTextLayer
                            />
                        </motion.div>
                    )}
                </Document>
            </div>

            {/* Page indicator strip (bottom) */}
            {loadState === 'ok' && numPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.75rem',
                    borderTop: `1px solid ${ac}10`,
                    background: `${ac}04`,
                }}>
                    {Array.from({ length: numPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            style={{
                                width: page === i + 1 ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '999px',
                                background: page === i + 1 ? ac : `${ac}30`,
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'all 0.2s',
                                boxShadow: page === i + 1 ? `0 0 8px ${ac}60` : 'none',
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ─── tiny control button ──────────────────────────────────────────────────────
function ControlBtn({
    icon, title, color, onClick, disabled = false, filled = false,
}: {
    icon: React.ReactNode;
    title: string;
    color: string;
    onClick: () => void;
    disabled?: boolean;
    filled?: boolean;
}) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '7px',
                border: `1px solid ${hov && !disabled ? `${color}50` : `${color}20`}`,
                background: filled
                    ? (hov ? `${color}25` : `${color}15`)
                    : (hov && !disabled ? `${color}12` : 'transparent'),
                color: disabled ? `${color}30` : (hov ? color : `${color}70`),
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: 0,
                transition: 'all 0.15s',
                boxShadow: filled && hov ? `0 0 12px ${color}25` : 'none',
                flexShrink: 0,
            }}
        >
            {icon}
        </button>
    );
}

// ─── loading state ────────────────────────────────────────────────────────────
function PdfLoading({ color }: { color: string }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '4rem',
        }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: '32px', height: '32px',
                    border: `2px solid ${color}20`,
                    borderTopColor: color,
                    borderRadius: '50%',
                }}
            />
            <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.65rem', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: `${color}50`,
            }}>
                Loading document...
            </span>
        </div>
    );
}

// ─── error state ──────────────────────────────────────────────────────────────
function PdfError({ color, label, path }: { color: string; label: string; path: string }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '1rem', padding: '3rem 2rem', textAlign: 'center', maxWidth: '320px',
        }}>
            <div style={{
                width: '52px', height: '52px', borderRadius: '12px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f87171',
            }}>
                <AlertCircle size={22} />
            </div>
            <div>
                <div style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '0.8rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem',
                    letterSpacing: '0.06em',
                }}>
                    {label} not found
                </div>
                <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)',
                    lineHeight: 1.6,
                }}>
                    Place your file at <span style={{ color: `${color}60` }}>public{path}</span> to display it here.
                </div>
            </div>
        </div>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────
export function Resume() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasPixelRef = useRef<HTMLCanvasElement>(null);
    useBgCanvas(canvasRef, { cy: 0.3, radius: 260 });
    usePixelCanvas(canvasPixelRef, 30);

    return (
        <div style={{ paddingBottom: '5rem', paddingTop: '2rem', position: 'relative' }}>

            {/* Background canvas */}
            <canvas ref={canvasRef} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 0,
            }} />
            <canvas ref={canvasPixelRef} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 1,
            }} />

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2.75rem', position: 'relative', zIndex: 1 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '24px', height: '1px', background: 'rgba(96,196,255,0.5)' }} />
                    <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', fontWeight: 700,
                        letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(96,196,255,0.55)',
                    }}>
                        Documents
                    </span>
                </div>
                <h1 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                    fontWeight: 900, color: '#60c4ff',
                    textShadow: '0 0 20px rgba(96,196,255,0.4)',
                    letterSpacing: '0.06em', lineHeight: 1.1, margin: '0 0 0.5rem',
                }}>
                    Resume & CV
                </h1>
                <p style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', margin: 0,
                }}>
                    View or download my latest resume and curriculum vitae.
                </p>
            </motion.div>

            {/* ── Two-column PDF viewers ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '1.75rem',
                position: 'relative',
                zIndex: 1,
            }}>
                {DOCS.map((doc, i) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.1 }}
                    >
                        <PdfPanel doc={doc} />
                    </motion.div>
                ))}
            </div>

            {/* Scrollbar style */}
            <style>{`
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(96,196,255,0.2); border-radius: 99px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(96,196,255,0.4); }
            `}</style>
        </div>
    );
}