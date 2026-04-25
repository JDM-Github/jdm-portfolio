import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitFork, Star, ExternalLink, RefreshCw, Calendar,
    Globe, Eye, AlertCircle, Loader2,
    ChevronDown, ChevronLeft, ChevronRight, X, Search, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useBgCanvas } from '../hooks/useBgCanvas';
import { usePixelCanvas } from '../hooks/usePixelCanvas';

// ─────────────────────────────────────────────────────────────────────────────
// STATIC REPO CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type RepoButton = {
    label: string;
    icon: 'globe' | 'eye' | 'external';
    url: string;
    color?: string;
};

type StaticRepoConfig = {
    repoUrl: string;
    featured?: boolean;
    description?: string;
    buttons: RepoButton[];
};

const STATIC_CONFIGS: StaticRepoConfig[] = [
    {
        repoUrl: 'https://github.com/JDM-Github/agribot-hydro-nft-studio',
        featured: true,
        buttons: [
            {
                label: 'Open App',
                icon: 'globe',
                url: 'https://agribot-hydro-nft-stdio.netlify.app',
                color: '#34d399',
            },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [6, 12, 24];
const DEFAULT_PAGE_SIZE = 6;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type GitHubRepo = {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    updated_at: string;
    topics: string[];
    private: boolean;
    homepage: string | null;
    open_issues_count: number;
    visibility: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────────────────────────────────────
const CACHE_KEY = 'jdm_github_repos_cache';
const CACHE_TTL = 365 * 60 * 60 * 1000;
const MANUAL_REFRESH_COOLDOWN = 30 * 1000;

type CacheEntry = {
    repos: GitHubRepo[];
    fetchedAt: number;
};

function readCache(): CacheEntry | null {
    try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.fetchedAt > CACHE_TTL) return null;
        return entry;
    } catch {
        return null;
    }
}

function writeCache(repos: GitHubRepo[]) {
    try {
        const entry: CacheEntry = { repos, fetchedAt: Date.now() };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch { /* storage full – ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH
// ─────────────────────────────────────────────────────────────────────────────
const GITHUB_USERNAME = 'JDM-Github';
async function fetchAllRepos(token?: string): Promise<GitHubRepo[]> {
    const headers: Record<string, string> = {
        Accept: 'application/vnd.github+json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const all: GitHubRepo[] = [];
    let page = 1;

    while (true) {
        const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&page=${page}`,
            { headers }
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const batch: GitHubRepo[] = await res.json();
        if (batch.length === 0) break;
        all.push(...batch);
        page++;
        if (batch.length < 100) break;
    }

    return all;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const LANG_COLOR: Record<string, string> = {
    TypeScript: '#60a5fa',
    JavaScript: '#fbbf24',
    Python: '#fbbf24',
    'C++': '#60c4ff',
    C: '#60c4ff',
    'C#': '#a78bfa',
    Java: '#f97316',
    Dart: '#34d399',
    HTML: '#f87171',
    CSS: '#a78bfa',
    Rust: '#fb923c',
    Go: '#34d399',
    Kotlin: '#a78bfa',
    Swift: '#f97316',
    Lua: '#60a5fa',
    Shell: '#34d399',
    Bash: '#34d399',
};
const langColor = (l: string | null) => (l ? (LANG_COLOR[l] ?? '#60c4ff') : '#60c4ff');

function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtCooldown(ms: number) {
    return Math.ceil(ms / 1000);
}

const ButtonIcon = ({ icon }: { icon: RepoButton['icon'] }) => {
    if (icon === 'globe') return <Globe size={11} strokeWidth={2} />;
    if (icon === 'eye') return <Eye size={11} strokeWidth={2} />;
    return <ExternalLink size={11} strokeWidth={2} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
type PaginationProps = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    accentColor?: string;
};

function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    accentColor = '#60c4ff',
}: PaginationProps) {
    // Build visible page numbers with ellipsis
    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (number | '...')[] = [];
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const btnBase: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        borderRadius: '7px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        color: 'rgba(255,255,255,0.4)',
        cursor: 'pointer',
        fontSize: '0.65rem',
        fontFamily: "'DM Mono', monospace",
        fontWeight: 700,
        transition: 'all 0.18s',
        flexShrink: 0,
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                marginTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
            }}
        >
            
            <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
            }}>
                {startItem}-{endItem} of {totalItems}
            </span>

            {/* Center: page buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    title="First page"
                    style={{
                        ...btnBase,
                        opacity: currentPage === 1 ? 0.3 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                        if (currentPage !== 1) {
                            (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
                            (e.currentTarget as HTMLElement).style.color = accentColor;
                            (e.currentTarget as HTMLElement).style.background = `${accentColor}0d`;
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                >
                    <ChevronsLeft size={12} strokeWidth={2} />
                </button>

                {/* Prev page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Previous page"
                    style={{
                        ...btnBase,
                        opacity: currentPage === 1 ? 0.3 : 1,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                        if (currentPage !== 1) {
                            (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
                            (e.currentTarget as HTMLElement).style.color = accentColor;
                            (e.currentTarget as HTMLElement).style.background = `${accentColor}0d`;
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                >
                    <ChevronLeft size={12} strokeWidth={2} />
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span
                            key={`ellipsis-${i}`}
                            style={{
                                width: '30px',
                                textAlign: 'center',
                                fontFamily: "'DM Mono', monospace",
                                fontSize: '0.62rem',
                                color: 'rgba(255,255,255,0.2)',
                                letterSpacing: '0.1em',
                            }}
                        >
                            ···
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            style={{
                                ...btnBase,
                                ...(currentPage === p ? {
                                    border: `1px solid ${accentColor}50`,
                                    background: `${accentColor}18`,
                                    color: accentColor,
                                    boxShadow: `0 0 12px ${accentColor}20`,
                                } : {}),
                            }}
                            onMouseEnter={e => {
                                if (currentPage !== p) {
                                    (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}30`;
                                    (e.currentTarget as HTMLElement).style.color = `${accentColor}cc`;
                                    (e.currentTarget as HTMLElement).style.background = `${accentColor}0a`;
                                }
                            }}
                            onMouseLeave={e => {
                                if (currentPage !== p) {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                                }
                            }}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Next page"
                    style={{
                        ...btnBase,
                        opacity: currentPage === totalPages ? 0.3 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                        if (currentPage !== totalPages) {
                            (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
                            (e.currentTarget as HTMLElement).style.color = accentColor;
                            (e.currentTarget as HTMLElement).style.background = `${accentColor}0d`;
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                >
                    <ChevronRight size={12} strokeWidth={2} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Last page"
                    style={{
                        ...btnBase,
                        opacity: currentPage === totalPages ? 0.3 : 1,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                        if (currentPage !== totalPages) {
                            (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}40`;
                            (e.currentTarget as HTMLElement).style.color = accentColor;
                            (e.currentTarget as HTMLElement).style.background = `${accentColor}0d`;
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                >
                    <ChevronsRight size={12} strokeWidth={2} />
                </button>
            </div>

            {/* Right: per-page selector */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                }}>
                    per page
                </span>
                <div style={{ position: 'relative' }}>
                    <select
                        value={pageSize}
                        onChange={e => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        style={{
                            appearance: 'none',
                            padding: '0.3rem 1.6rem 0.3rem 0.6rem',
                            borderRadius: '7px',
                            border: `1px solid ${accentColor}25`,
                            background: `${accentColor}08`,
                            color: `${accentColor}cc`,
                            cursor: 'pointer',
                            fontSize: '0.65rem',
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            outline: 'none',
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <ChevronDown size={10} style={{
                        position: 'absolute', right: '0.4rem', top: '50%',
                        transform: 'translateY(-50%)', color: `${accentColor}80`,
                        pointerEvents: 'none',
                    }} />
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TYPES
// ─────────────────────────────────────────────────────────────────────────────
const ALL_FILTER = 'All';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function Projects() {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetched, setLastFetched] = useState<number | null>(null);
    const [cooldownLeft, setCooldownLeft] = useState(0);
    const [search, setSearch] = useState('');
    const [langFilter, setLangFilter] = useState<string>(ALL_FILTER);
    const [featuredOnly, setFeaturedOnly] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // ── Pagination state ───────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasPixelRef = useRef<HTMLCanvasElement>(null);
    useBgCanvas(canvasRef, { cy: 0.3, radius: 260 });
    usePixelCanvas(canvasPixelRef, 30);

    // ── Fetch logic ───────────────────────────────────────────────────────────
    const load = useCallback(async (force = false) => {
        if (force && lastFetched && Date.now() - lastFetched < MANUAL_REFRESH_COOLDOWN) {
            return;
        }

        if (!force) {
            const cached = readCache();
            if (cached) {
                setRepos(cached.repos);
                setLastFetched(cached.fetchedAt);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        setError(null);
        try {
            const token = (import.meta as any).env?.VITE_GITHUB_TOKEN as string | undefined;
            const data = await fetchAllRepos(token);
            writeCache(data);
            setRepos(data);
            setLastFetched(Date.now());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch repositories');
        } finally {
            setLoading(false);
        }
    }, [lastFetched]);

    useEffect(() => { load(false); }, []);

    // ── Reset to page 1 whenever filters change ───────────────────────────
    useEffect(() => {
        setCurrentPage(1);
    }, [search, langFilter, featuredOnly]);

    // ── Cooldown ticker ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!lastFetched) return;
        const tick = () => {
            const remaining = MANUAL_REFRESH_COOLDOWN - (Date.now() - lastFetched);
            setCooldownLeft(Math.max(0, remaining));
        };
        tick();
        const interval = setInterval(tick, 500);
        return () => clearInterval(interval);
    }, [lastFetched]);

    const featuredUrls = new Set(STATIC_CONFIGS.filter(c => c.featured).map(c => c.repoUrl));
    const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[])).sort();

    const filtered = repos.filter(repo => {
        if (featuredOnly && !featuredUrls.has(repo.html_url)) return false;
        if (langFilter !== ALL_FILTER && repo.language !== langFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (
                repo.name.toLowerCase().includes(q) ||
                (repo.description ?? '').toLowerCase().includes(q) ||
                repo.topics.some(t => t.toLowerCase().includes(q))
            );
        }
        return true;
    });

    const sorted = [...filtered].sort((a, b) => {
        const af = featuredUrls.has(a.html_url) ? 1 : 0;
        const bf = featuredUrls.has(b.html_url) ? 1 : 0;
        if (bf !== af) return bf - af;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    // ── Pagination calculations ───────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const pageStart = (safePage - 1) * pageSize;
    const pageEnd = pageStart + pageSize;
    const paginated = sorted.slice(pageStart, pageEnd);

    const onRefresh = () => {
        if (cooldownLeft > 0) return;
        load(true);
    };

    // ── Scroll to top on page change ─────────────────────────────────────
    const gridRef = useRef<HTMLDivElement>(null);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div style={{ paddingBottom: '1rem', paddingTop: '2rem' }}>

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

            {/* ── PAGE TITLE ────────────────────────────────────────────── */}
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
                        github.com/{GITHUB_USERNAME}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                            fontWeight: 900,
                            color: '#60c4ff',
                            textShadow: '0 0 20px rgba(96,196,255,0.4)',
                            letterSpacing: '0.06em',
                            lineHeight: 1.1,
                            margin: 0,
                        }}>
                            Projects
                        </h1>
                        <p style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.7rem',
                            color: 'rgba(255,255,255,0.3)',
                            marginTop: '0.4rem',
                            letterSpacing: '0.05em',
                        }}>
                            {repos.length > 0
                                ? `${repos.length} repositories · ${sorted.length} shown · page ${safePage} of ${totalPages}`
                                : 'Loading repositories...'}
                        </p>
                    </div>

                    {/* Refresh button */}
                    <motion.button
                        onClick={onRefresh}
                        whileHover={cooldownLeft === 0 ? { scale: 1.04 } : {}}
                        whileTap={cooldownLeft === 0 ? { scale: 0.96 } : {}}
                        title={cooldownLeft > 0 ? `Wait ${fmtCooldown(cooldownLeft)}s` : 'Refresh from GitHub'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            border: `1px solid ${cooldownLeft > 0 ? 'rgba(255,255,255,0.08)' : 'rgba(96,196,255,0.25)'}`,
                            background: cooldownLeft > 0 ? 'rgba(255,255,255,0.03)' : 'rgba(96,196,255,0.07)',
                            color: cooldownLeft > 0 ? 'rgba(255,255,255,0.2)' : '#60c4ff',
                            cursor: cooldownLeft > 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.7rem',
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                    >
                        {loading
                            ? <Loader2 size={13} style={{ animation: 'jdm-spin 1s linear infinite' }} />
                            : <RefreshCw size={13} />
                        }
                        {cooldownLeft > 0
                            ? `wait ${fmtCooldown(cooldownLeft)}s`
                            : loading ? 'fetching...' : 'refresh'
                        }
                    </motion.button>
                </div>
            </motion.div>

            {/* ── SEARCH + FILTERS ─────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex',
                    gap: '0.625rem',
                    flexWrap: 'wrap',
                    marginBottom: '2rem',
                    alignItems: 'center',
                }}
            >
                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: '1 1 220px',
                    padding: '0.55rem 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(96,196,255,0.15)',
                    background: 'rgba(96,196,255,0.04)',
                }}>
                    <Search size={13} style={{ color: 'rgba(96,196,255,0.4)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search repos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.75rem',
                            fontFamily: "'DM Mono', monospace",
                            width: '100%',
                            letterSpacing: '0.04em',
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.25)' }}
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                {/* Featured toggle */}
                <button
                    onClick={() => setFeaturedOnly(v => !v)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.55rem 0.875rem', borderRadius: '8px',
                        border: `1px solid ${featuredOnly ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        background: featuredOnly ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                        color: featuredOnly ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        fontSize: '0.68rem',
                        fontFamily: "'DM Mono', monospace",
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Star size={11} strokeWidth={2} />
                    Featured only
                </button>

                {/* Language filter */}
                <div style={{ position: 'relative' }}>
                    <select
                        value={langFilter}
                        onChange={e => setLangFilter(e.target.value)}
                        style={{
                            appearance: 'none',
                            padding: '0.55rem 2rem 0.55rem 0.875rem',
                            borderRadius: '8px',
                            border: `1px solid ${langFilter !== ALL_FILTER ? 'rgba(96,196,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            background: langFilter !== ALL_FILTER ? 'rgba(96,196,255,0.07)' : 'rgba(255,255,255,0.03)',
                            color: langFilter !== ALL_FILTER ? '#60c4ff' : 'rgba(255,255,255,0.35)',
                            cursor: 'pointer',
                            fontSize: '0.68rem',
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            outline: 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        <option value={ALL_FILTER}>All languages</option>
                        {languages.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                    <ChevronDown size={11} style={{
                        position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.3)', pointerEvents: 'none',
                    }} />
                </div>
            </motion.div>

            {/* ── ERROR ────────────────────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.875rem 1rem', borderRadius: '10px',
                            border: '1px solid rgba(248,113,113,0.25)',
                            background: 'rgba(248,113,113,0.06)',
                            marginBottom: '1.5rem',
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.72rem',
                            color: 'rgba(248,113,113,0.8)',
                        }}
                    >
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        {error}
                        <button
                            onClick={() => setError(null)}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        >
                            <X size={13} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── LOADING SKELETON ─────────────────────────────────────── */}
            {loading && repos.length === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}>
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <div key={i} style={{
                            height: '210px', borderRadius: '12px',
                            border: '1px solid rgba(96,196,255,0.08)',
                            background: 'rgba(96,196,255,0.02)',
                            animation: 'jdm-shimmer 1.6s ease-in-out infinite',
                            animationDelay: `${i * 0.1}s`,
                        }} />
                    ))}
                </div>
            )}

            {/* ── EMPTY STATE ──────────────────────────────────────────── */}
            {!loading && sorted.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
                    // no repositories match your filters
                </div>
            )}

            {/* ── REPO GRID ────────────────────────────────────────────── */}
            <div ref={gridRef} style={{ scrollMarginTop: '1rem' }}>
                <motion.div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.875rem' }}
                >
                    <AnimatePresence mode="popLayout">
                        {paginated.map((repo, idx) => {
                            const config = STATIC_CONFIGS.find(c => c.repoUrl === repo.html_url);
                            const isFeatured = featuredUrls.has(repo.html_url);
                            const lc = langColor(repo.language);
                            const isExpanded = expandedId === repo.id;
                            const desc = config?.description ?? repo.description;

                            return (
                                <motion.div
                                    key={repo.id}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: Math.min(idx * 0.03, 0.3), duration: 0.35 }}
                                    style={{
                                        borderRadius: '13px',
                                        border: `1px solid ${isFeatured ? `${lc}30` : 'rgba(96,196,255,0.1)'}`,
                                        background: isFeatured ? `${lc}06` : 'rgba(96,196,255,0.025)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'border-color 0.25s, background 0.25s, box-shadow 0.25s',
                                        cursor: 'default',
                                    }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.borderColor = `${lc}40`;
                                        el.style.boxShadow = `0 4px 28px ${lc}12`;
                                        el.style.background = `${lc}0a`;
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.borderColor = isFeatured ? `${lc}30` : 'rgba(96,196,255,0.1)';
                                        el.style.boxShadow = 'none';
                                        el.style.background = isFeatured ? `${lc}06` : 'rgba(96,196,255,0.025)';
                                    }}
                                >
                                    {/* Top accent line */}
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                                        background: `linear-gradient(90deg, transparent, ${lc}${isFeatured ? '80' : '40'}, transparent)`,
                                    }} />

                                    <div style={{ padding: '1.125rem 1.125rem 0' }}>
                                        {/* Header row */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                                <div style={{
                                                    width: '8px', height: '8px', borderRadius: '50%',
                                                    background: lc, flexShrink: 0,
                                                    boxShadow: `0 0 6px ${lc}80`,
                                                }} />
                                                {isFeatured && (
                                                    <span style={{
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontSize: '0.55rem',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.14em',
                                                        textTransform: 'uppercase',
                                                        color: lc,
                                                        opacity: 0.85,
                                                        flexShrink: 0,
                                                    }}>
                                                        ◆ Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.25)' }}>
                                                    <Star size={10} strokeWidth={1.5} style={{ color: lc, opacity: 0.7 }} />
                                                    {repo.stargazers_count}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontFamily: "'DM Mono', monospace", color: 'rgba(255,255,255,0.25)' }}>
                                                    <GitFork size={10} strokeWidth={1.5} style={{ color: lc, opacity: 0.7 }} />
                                                    {repo.forks_count}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Repo name */}
                                        <h3 style={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            color: 'rgba(255,255,255,0.9)',
                                            marginBottom: '0.4rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {repo.name}
                                        </h3>

                                        {/* Description */}
                                        <p
                                            onClick={() => setExpandedId(isExpanded ? null : repo.id)}
                                            style={{
                                                fontSize: '0.72rem',
                                                color: 'rgba(255,255,255,0.38)',
                                                lineHeight: 1.6,
                                                marginBottom: '0.75rem',
                                                display: '-webkit-box',
                                                WebkitLineClamp: isExpanded ? 'unset' : 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: isExpanded ? 'visible' : 'hidden',
                                                cursor: desc && desc.length > 80 ? 'pointer' : 'default',
                                                minHeight: '2.3rem',
                                            }}
                                        >
                                            {desc || 'No description provided.'}
                                        </p>

                                        {/* Tags */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
                                            {repo.language && (
                                                <span style={{
                                                    fontSize: '0.58rem',
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontWeight: 700,
                                                    padding: '0.18rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: `${lc}15`,
                                                    border: `1px solid ${lc}30`,
                                                    color: lc,
                                                }}>
                                                    {repo.language}
                                                </span>
                                            )}
                                            {repo.topics.slice(0, 3).map(t => (
                                                <span key={t} style={{
                                                    fontSize: '0.58rem',
                                                    fontFamily: "'DM Mono', monospace",
                                                    padding: '0.18rem 0.5rem',
                                                    borderRadius: '4px',
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.07)',
                                                    color: 'rgba(255,255,255,0.25)',
                                                }}>
                                                    {t}
                                                </span>
                                            ))}
                                            <span style={{
                                                display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                fontSize: '0.58rem', fontFamily: "'DM Mono', monospace",
                                                padding: '0.18rem 0.5rem', borderRadius: '4px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                color: 'rgba(255,255,255,0.2)',
                                            }}>
                                                <Calendar size={8} strokeWidth={1.5} />
                                                {fmtDate(repo.updated_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer — action buttons */}
                                    <div style={{
                                        marginTop: 'auto',
                                        padding: '0.75rem 1.125rem',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                    }}>
                                        <a
                                            href={repo.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.35rem',
                                                fontSize: '0.65rem',
                                                fontFamily: "'DM Mono', monospace",
                                                fontWeight: 700,
                                                color: `${lc}bb`,
                                                textDecoration: 'none',
                                                letterSpacing: '0.04em',
                                                transition: 'color 0.2s',
                                                padding: '0.3rem 0',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.color = lc)}
                                            onMouseLeave={e => (e.currentTarget.style.color = `${lc}bb`)}
                                        >
                                            <FaGithub size={12} />
                                            Source
                                        </a>

                                        {config?.buttons.map((btn, bi) => {
                                            const btnColor = btn.color ?? '#60c4ff';
                                            return (
                                                <motion.a
                                                    key={bi}
                                                    href={btn.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.04, y: -1 }}
                                                    whileTap={{ scale: 0.96 }}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem',
                                                        fontSize: '0.65rem',
                                                        fontFamily: "'DM Mono', monospace",
                                                        fontWeight: 700,
                                                        letterSpacing: '0.06em',
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${btnColor}40`,
                                                        background: `${btnColor}12`,
                                                        color: btnColor,
                                                        textDecoration: 'none',
                                                        transition: 'all 0.18s',
                                                        boxShadow: `0 0 10px ${btnColor}15`,
                                                    }}
                                                    onMouseEnter={e => {
                                                        const el = e.currentTarget as HTMLElement;
                                                        el.style.background = `${btnColor}20`;
                                                        el.style.borderColor = `${btnColor}65`;
                                                        el.style.boxShadow = `0 0 18px ${btnColor}30`;
                                                    }}
                                                    onMouseLeave={e => {
                                                        const el = e.currentTarget as HTMLElement;
                                                        el.style.background = `${btnColor}12`;
                                                        el.style.borderColor = `${btnColor}40`;
                                                        el.style.boxShadow = `0 0 10px ${btnColor}15`;
                                                    }}
                                                >
                                                    <ButtonIcon icon={btn.icon} />
                                                    {btn.label}
                                                </motion.a>
                                            );
                                        })}

                                        {!config?.buttons.length && repo.homepage && (
                                            <motion.a
                                                href={repo.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.04, y: -1 }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    fontSize: '0.65rem',
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontWeight: 700,
                                                    letterSpacing: '0.06em',
                                                    padding: '0.35rem 0.75rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid rgba(52,211,153,0.3)',
                                                    background: 'rgba(52,211,153,0.08)',
                                                    color: '#34d399',
                                                    textDecoration: 'none',
                                                    transition: 'all 0.18s',
                                                }}
                                            >
                                                <Globe size={11} strokeWidth={2} />
                                                Live
                                            </motion.a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* ── PAGINATION ───────────────────────────────────────────── */}
            {!loading && sorted.length > 0 && (
                <Pagination
                    currentPage={safePage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={sorted.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={setPageSize}
                    accentColor="#60c4ff"
                />
            )}

            {/* ── CACHE NOTE ───────────────────────────────────────────── */}
            {lastFetched && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.6rem',
                        color: 'rgba(255,255,255,0.15)',
                        letterSpacing: '0.07em',
                    }}
                >
                    last fetched {new Date(lastFetched).toLocaleTimeString()} · cached for 365 days · manual refresh{' '}
                    {cooldownLeft > 0 ? `locked (${fmtCooldown(cooldownLeft)}s)` : 'available'}
                </motion.div>
            )}

            <style>{`
                @keyframes jdm-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes jdm-shimmer {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                select option {
                    background: #0a0c14;
                    color: rgba(255,255,255,0.8);
                }
            `}</style>
        </div>
    );
}