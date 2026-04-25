import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useBgCanvas } from '../hooks/useBgCanvas';
import { Send, Mail, MapPin, Copy, Check, AlertCircle } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { usePixelCanvas } from '../hooks/usePixelCanvas';

// ─────────────────────────────────────────────────────────────────────────────
// USPEEDO EMAIL SENDER
// ─────────────────────────────────────────────────────────────────────────────
const USPEEDO_API = 'https://api.uspeedo.com/api/v1/email/SendEmail';
const MY_EMAIL = 'jdmaster888@gmail.com';
const MY_NAME = 'John Dave C. Pega';

function getAuthHeader(): string {
    const id = import.meta.env.VITE_ACCESS_KEY_ID ?? '';
    const secret = import.meta.env.VITE_ACCESS_KEY_SECRET ?? '';
    return 'Basic ' + btoa(`${id}:${secret}`);
}

async function sendViaUSpeedo(payload: {
    to: string[];
    subject: string;
    html: string;
    fromName: string;
}) {
    const res = await fetch(USPEEDO_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
            SendEmail: MY_EMAIL,          // verified sender in uSpeedo console
            TargetEmailAddress: payload.to,
            Subject: payload.subject,
            Content: payload.html,
            FromName: payload.fromName,
        }),
    });

    const data = await res.json();
    if (data.RetCode !== 0) {
        throw new Error(data.Message ?? 'uSpeedo send failed');
    }
    return data;
}

// HTML for the notification email YOU receive
function buildNotificationHtml(name: string, email: string, subject: string, message: string) {
    const ts = new Date().toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'full',
        timeStyle: 'short',
    });
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#0a0f1a;font-family:'DM Sans',Arial,sans-serif;color:#e2e8f0;}
  .wrap{max-width:600px;margin:40px auto;background:#0d1321;border:1px solid rgba(96,196,255,0.15);border-radius:16px;overflow:hidden;}
  .header{background:linear-gradient(135deg,#0d1f3c,#0a1628);padding:32px 36px;border-bottom:1px solid rgba(96,196,255,0.12);}
  .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:999px;padding:4px 14px;margin-bottom:16px;}
  .badge-dot{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399;}
  .badge-text{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(52,211,153,0.8);}
  h1{margin:0;font-size:22px;font-weight:800;color:#60c4ff;letter-spacing:0.04em;}
  .sub{font-size:12px;color:rgba(255,255,255,0.3);margin-top:6px;font-family:'DM Mono',monospace;}
  .body{padding:32px 36px;}
  .field{margin-bottom:20px;}
  .label{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(96,196,255,0.55);font-family:'DM Mono',monospace;margin-bottom:6px;}
  .value{font-size:14px;color:rgba(255,255,255,0.82);background:rgba(96,196,255,0.05);border:1px solid rgba(96,196,255,0.12);border-radius:8px;padding:10px 14px;word-break:break-word;}
  .message-box{white-space:pre-wrap;line-height:1.7;}
  .footer{padding:20px 36px;border-top:1px solid rgba(96,196,255,0.08);font-size:11px;color:rgba(255,255,255,0.2);font-family:'DM Mono',monospace;text-align:center;}
  a{color:#60c4ff;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="badge"><span class="badge-dot"></span><span class="badge-text">New Contact</span></div>
    <h1>📬 Someone reached out!</h1>
    <div class="sub">Received · ${ts} (PHT)</div>
  </div>
  <div class="body">
    <div class="field">
      <div class="label">From</div>
      <div class="value">${name}</div>
    </div>
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${email}">${email}</a></div>
    </div>
    <div class="field">
      <div class="label">Subject</div>
      <div class="value">${subject || '(no subject)'}</div>
    </div>
    <div class="field">
      <div class="label">Message</div>
      <div class="value message-box">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
  </div>
  <div class="footer">JDMaster Portfolio · ${MY_EMAIL}</div>
</div>
</body>
</html>`;
}

// HTML for the auto-reply sent to the person who contacted you
function buildAutoReplyHtml(name: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  body{margin:0;padding:0;background:#0a0f1a;font-family:'DM Sans',Arial,sans-serif;color:#e2e8f0;}
  .wrap{max-width:600px;margin:40px auto;background:#0d1321;border:1px solid rgba(96,196,255,0.15);border-radius:16px;overflow:hidden;}
  .header{background:linear-gradient(135deg,#0d1f3c,#0a1628);padding:32px 36px;border-bottom:1px solid rgba(96,196,255,0.12);}
  h1{margin:0;font-size:22px;font-weight:800;color:#60c4ff;letter-spacing:0.04em;}
  .jdm{font-size:32px;font-weight:900;color:#60c4ff;letter-spacing:0.1em;text-shadow:0 0 20px rgba(96,196,255,0.5);margin-bottom:10px;}
  .body{padding:32px 36px;line-height:1.7;font-size:14px;color:rgba(255,255,255,0.75);}
  .highlight{color:rgba(96,196,255,0.9);font-weight:600;}
  .tag{display:inline-block;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.25);border-radius:999px;padding:3px 12px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(52,211,153,0.8);margin-bottom:20px;font-family:'DM Mono',monospace;}
  .footer{padding:20px 36px;border-top:1px solid rgba(96,196,255,0.08);font-size:11px;color:rgba(255,255,255,0.2);font-family:'DM Mono',monospace;text-align:center;}
  a{color:#60c4ff;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="jdm">JDM</div>
    <h1>Thanks for reaching out, ${name}!</h1>
  </div>
  <div class="body">
    <div class="tag">✔ Message received</div>
    <p>Hey <span class="highlight">${name}</span>,</p>
    <p>
      I've received your message and wanted to let you know I'm already on it.
      I typically respond within <span class="highlight">24–48 hours</span>, so sit tight — I'll get back to you soon.
    </p>
    <p>
      If your matter is urgent, feel free to reach me directly at
      <a href="mailto:${MY_EMAIL}">${MY_EMAIL}</a>.
    </p>
    <p>
      Talk soon,<br/>
      <span class="highlight">${MY_NAME}</span><br/>
      <span style="font-size:12px;color:rgba(255,255,255,0.3);font-family:'DM Mono',monospace;">JDMaster · Full-Stack & Embedded Dev</span>
    </p>
  </div>
  <div class="footer">JDMaster Portfolio · Do not reply to this address.</div>
</div>
</body>
</html>`;
}

async function sendContactEmails(
    name: string,
    email: string,
    subject: string,
    message: string,
) {
    // 1. Notification to yourself
    await sendViaUSpeedo({
        to: [MY_EMAIL],
        subject: `[Portfolio] New message from ${name}${subject ? ` — ${subject}` : ''}`,
        html: buildNotificationHtml(name, email, subject, message),
        fromName: 'JDMaster Portfolio',
    });

    // 2. Auto-reply to sender
    await sendViaUSpeedo({
        to: [email],
        subject: `Got your message, ${name}! — JDMaster`,
        html: buildAutoReplyHtml(name),
        fromName: MY_NAME,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT LINKS DATA
// ─────────────────────────────────────────────────────────────────────────────
type ContactLink = {
    id: string;
    label: string;
    value: string;
    href?: string;
    icon: React.ReactNode;
    color: string;
    copyable?: boolean;
};

const CONTACT_LINKS: ContactLink[] = [
    {
        id: 'email',
        label: 'Email',
        value: MY_EMAIL,
        href: `mailto:${MY_EMAIL}`,
        icon: <Mail size={16} />,
        color: '#34d399',
        copyable: true,
    },
    {
        id: 'github',
        label: 'GitHub',
        value: 'github.com/JDM-Github',
        href: 'https://github.com/JDM-Github',
        icon: <FaGithub size={16} />,
        color: '#60c4ff',
    },
    {
        id: 'location',
        label: 'Location',
        value: 'Philippines',
        icon: <MapPin size={16} />,
        color: '#fbbf24',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function CopyButton({ text, color }: { text: string; color: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.9 }}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: copied ? color : 'rgba(255,255,255,0.2)',
                padding: '0.15rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
            }}
            title={copied ? 'Copied!' : 'Copy'}
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
        </motion.button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ContactCard({ link }: { link: ContactLink }) {
    const [hovered, setHovered] = useState(false);

    const inner = (
        <motion.div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ y: -3 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: `1px solid ${hovered ? `${link.color}40` : `${link.color}18`}`,
                background: hovered ? `${link.color}0c` : `${link.color}06`,
                boxShadow: hovered ? `0 4px 24px ${link.color}12` : 'none',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden',
                cursor: link.href ? 'pointer' : 'default',
                textDecoration: 'none',
            }}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: `linear-gradient(90deg, transparent, ${link.color}${hovered ? '60' : '25'}, transparent)`,
                transition: 'opacity 0.2s',
            }} />
            <div style={{
                width: '38px', height: '38px', borderRadius: '9px',
                background: `${link.color}14`, border: `1px solid ${link.color}28`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: link.color, flexShrink: 0,
                boxShadow: hovered ? `0 0 16px ${link.color}25` : 'none',
                transition: 'box-shadow 0.2s',
            }}>
                {link.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.58rem', fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: `${link.color}80`, marginBottom: '0.2rem',
                }}>
                    {link.label}
                </div>
                <div style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {link.value}
                </div>
            </div>
            {link.copyable && <CopyButton text={link.value} color={link.color} />}
        </motion.div>
    );

    if (link.href) {
        return (
            <a href={link.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                {inner}
            </a>
        );
    }
    return inner;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────────────────────────────────────
function FormField({
    label, id, type = 'text', placeholder, textarea, value, onChange,
}: {
    label: string; id: string; type?: string; placeholder: string;
    textarea?: boolean; value: string; onChange: (v: string) => void;
}) {
    const [focused, setFocused] = useState(false);
    const baseStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        border: `1px solid ${focused ? 'rgba(96,196,255,0.45)' : 'rgba(96,196,255,0.15)'}`,
        background: focused ? 'rgba(96,196,255,0.07)' : 'rgba(96,196,255,0.03)',
        color: 'rgba(255,255,255,0.88)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.82rem',
        outline: 'none',
        resize: 'none' as const,
        transition: 'border-color 0.2s, background 0.2s',
        boxSizing: 'border-box',
        boxShadow: focused ? '0 0 0 3px rgba(96,196,255,0.06)' : 'none',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor={id} style={{
                fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: focused ? 'rgba(96,196,255,0.7)' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.2s',
            }}>
                {label}
            </label>
            {textarea ? (
                <textarea
                    id={id} rows={5} placeholder={placeholder}
                    value={value} onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ ...baseStyle, minHeight: '120px' }}
                />
            ) : (
                <input
                    id={id} type={type} placeholder={placeholder}
                    value={value} onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={baseStyle}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT STATE
// ─────────────────────────────────────────────────────────────────────────────
type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function Contact() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasPixelRef = useRef<HTMLCanvasElement>(null);
    useBgCanvas(canvasRef, { cy: 0.3, radius: 260 });
    usePixelCanvas(canvasPixelRef, 30);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async () => {
        if (!name || !email || !message) return;
        setSubmitState('sending');
        setErrorMsg('');

        try {
            await sendContactEmails(name.trim(), email.trim(), subject.trim(), message.trim());
            setSubmitState('sent');
            // Reset form after success
            setTimeout(() => {
                setSubmitState('idle');
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
            }, 5000);
        } catch (err) {
            console.error('[Contact] Email send failed:', err);
            setErrorMsg(err instanceof Error ? err.message : 'Failed to send. Try emailing directly.');
            setSubmitState('error');
            setTimeout(() => setSubmitState('idle'), 6000);
        }
    };

    const isValid = name.trim() && email.trim() && message.trim();

    // Derive button styles from state
    const btnColor = submitState === 'sent'
        ? '#34d399'
        : submitState === 'error'
            ? '#f87171'
            : isValid ? '#60c4ff' : 'rgba(96,196,255,0.3)';

    const btnBorder = submitState === 'sent'
        ? 'rgba(52,211,153,0.4)'
        : submitState === 'error'
            ? 'rgba(248,113,113,0.4)'
            : isValid ? 'rgba(96,196,255,0.4)' : 'rgba(96,196,255,0.12)';

    const btnBg = submitState === 'sent'
        ? 'rgba(52,211,153,0.1)'
        : submitState === 'error'
            ? 'rgba(248,113,113,0.08)'
            : isValid ? 'rgba(96,196,255,0.1)' : 'rgba(96,196,255,0.04)';

    return (
        <div style={{ paddingBottom: '5rem', paddingTop: '2rem', position: 'relative' }}>

            <canvas ref={canvasRef} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 0,
            }} />
            <canvas ref={canvasPixelRef} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                pointerEvents: 'none', zIndex: 1,
            }} />

            {/* ── HEADER ── */}
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
                        Let's connect
                    </span>
                </div>
                <h1 style={{
                    fontFamily: "'Orbitron', monospace", fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                    fontWeight: 900, color: '#60c4ff', textShadow: '0 0 20px rgba(96,196,255,0.4)',
                    letterSpacing: '0.06em', lineHeight: 1.1, margin: '0 0 0.5rem',
                }}>
                    Contact
                </h1>
                <p style={{
                    fontFamily: "'DM Mono', monospace", fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em', margin: 0,
                }}>
                    Open to work, collaborations, or just a good chat.
                </p>
            </motion.div>

            {/* ── TWO-COL LAYOUT ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.45fr)',
                gap: '2rem', alignItems: 'start', position: 'relative', zIndex: 1,
            }}>

                {/* ── LEFT: INFO PANEL ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {/* Identity block */}
                    <div style={{
                        padding: '1.5rem', borderRadius: '14px',
                        border: '1px solid rgba(96,196,255,0.15)',
                        background: 'rgba(96,196,255,0.04)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(96,196,255,0.4), transparent)',
                        }} />
                        <div style={{
                            fontFamily: "'Orbitron', monospace", fontSize: '2rem', fontWeight: 900,
                            color: '#60c4ff', textShadow: '0 0 20px rgba(96,196,255,0.5)',
                            letterSpacing: '0.12em', marginBottom: '0.5rem',
                        }}>
                            JDM
                        </div>
                        <div style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.8)', marginBottom: '0.25rem',
                        }}>
                            John Dave C. Pega
                        </div>
                        <div style={{
                            fontFamily: "'DM Mono', monospace", fontSize: '0.62rem',
                            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', marginBottom: '1rem',
                        }}>
                            JDMaster · Full-Stack & Embedded Dev
                        </div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.3rem 0.75rem', borderRadius: '999px',
                            border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.07)',
                        }}>
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#34d399', boxShadow: '0 0 8px #34d399',
                                animation: 'jdm-pulse 2s ease-in-out infinite',
                                display: 'inline-block', flexShrink: 0,
                            }} />
                            <span style={{
                                fontFamily: "'DM Mono', monospace", fontSize: '0.62rem',
                                letterSpacing: '0.1em', textTransform: 'uppercase',
                                color: 'rgba(52,211,153,0.75)',
                            }}>
                                Open to opportunities
                            </span>
                        </div>
                    </div>

                    {/* Contact links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {CONTACT_LINKS.map((link, i) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, x: -14 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.18 + i * 0.06 }}
                            >
                                <ContactCard link={link} />
                            </motion.div>
                        ))}
                    </div>

                    {/* Response time */}
                    <div style={{
                        padding: '0.875rem 1rem', borderRadius: '10px',
                        border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.04)',
                    }}>
                        <div style={{
                            fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', fontWeight: 700,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            color: 'rgba(251,191,36,0.55)', marginBottom: '0.25rem',
                        }}>
                            Response time
                        </div>
                        <div style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: '0.78rem',
                            color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
                        }}>
                            Usually within <span style={{ color: 'rgba(251,191,36,0.75)', fontWeight: 600 }}>24–48 hours</span>. For urgent stuff, email directly.
                        </div>
                    </div>
                </motion.div>

                {/* ── RIGHT: FORM ── */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                        padding: '1.75rem', borderRadius: '14px',
                        border: '1px solid rgba(96,196,255,0.13)',
                        background: 'rgba(96,196,255,0.03)',
                        position: 'relative', overflow: 'hidden',
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                        background: 'linear-gradient(90deg, transparent, rgba(96,196,255,0.35), transparent)',
                    }} />

                    <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', fontWeight: 700,
                        color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <Send size={15} style={{ color: '#60c4ff', opacity: 0.7 }} />
                        Send a message
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            <FormField id="contact-name" label="Name" placeholder="John Doe" value={name} onChange={setName} />
                            <FormField id="contact-email" label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
                        </div>

                        <FormField id="contact-subject" label="Subject" placeholder="Project idea, collab, hiring..." value={subject} onChange={setSubject} />
                        <FormField id="contact-message" label="Message" placeholder="What's on your mind?" textarea value={message} onChange={setMessage} />

                        {/* Error message */}
                        {submitState === 'error' && errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                    padding: '0.75rem 1rem', borderRadius: '8px',
                                    border: '1px solid rgba(248,113,113,0.25)',
                                    background: 'rgba(248,113,113,0.06)',
                                }}
                            >
                                <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                                <span style={{
                                    fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
                                    color: 'rgba(248,113,113,0.8)', lineHeight: 1.5,
                                }}>
                                    {errorMsg}
                                </span>
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            onClick={handleSubmit}
                            disabled={!isValid || submitState === 'sending'}
                            whileHover={isValid && submitState === 'idle' ? { scale: 1.02, y: -2 } : {}}
                            whileTap={isValid && submitState === 'idle' ? { scale: 0.97 } : {}}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '0.5rem', padding: '0.85rem 1.75rem', borderRadius: '10px',
                                border: `1px solid ${btnBorder}`,
                                background: btnBg,
                                color: btnColor,
                                fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
                                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: isValid && submitState === 'idle' ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                boxShadow: submitState === 'sent'
                                    ? '0 0 20px rgba(52,211,153,0.12)'
                                    : isValid ? '0 0 20px rgba(96,196,255,0.1)' : 'none',
                                width: '100%',
                            }}
                        >
                            {submitState === 'idle' && <><Send size={13} /> Send Message</>}
                            {submitState === 'sending' && (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            width: '13px', height: '13px',
                                            border: '2px solid rgba(96,196,255,0.3)',
                                            borderTopColor: '#60c4ff', borderRadius: '50%',
                                        }}
                                    />
                                    Sending...
                                </>
                            )}
                            {submitState === 'sent' && <><Check size={13} /> Message sent!</>}
                            {submitState === 'error' && <><AlertCircle size={13} /> Failed — try again</>}
                        </motion.button>

                        {/* Success note */}
                        {submitState === 'sent' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    fontFamily: "'DM Mono', monospace", fontSize: '0.62rem',
                                    color: 'rgba(52,211,153,0.6)', margin: 0,
                                    textAlign: 'center', lineHeight: 1.6,
                                }}
                            >
                                ✔ You'll receive a confirmation email shortly. I'll get back to you within 24–48 hrs.
                            </motion.p>
                        )}

                        {/* Disclaimer (idle only) */}
                        {submitState === 'idle' && (
                            <p style={{
                                fontFamily: "'DM Mono', monospace", fontSize: '0.58rem',
                                color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em',
                                margin: 0, textAlign: 'center', lineHeight: 1.6,
                            }}>
                                Or email directly at{' '}
                                <a href={`mailto:${MY_EMAIL}`} style={{ color: 'rgba(96,196,255,0.45)', textDecoration: 'none' }}>
                                    {MY_EMAIL}
                                </a>
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes jdm-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.85); }
                }
                input::placeholder, textarea::placeholder {
                    color: rgba(255,255,255,0.18);
                    font-family: 'DM Mono', monospace;
                    font-size: 0.75rem;
                }
                input, textarea { caret-color: #60c4ff; }
            `}</style>
        </div>
    );
}