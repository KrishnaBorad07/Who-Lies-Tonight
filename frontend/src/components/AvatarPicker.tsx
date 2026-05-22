// =============================================================================
// components/AvatarPicker.tsx – Custom modular avatar creator
// Lets players pick a base character, outfit, accessory, and customize colors.
// =============================================================================
import { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HEADS,
  BODIES,
  ACCESSORIES,
  AVATAR_COLORS,
  COLOR_KEYS,
  DEFAULT_AVATAR as DEFAULT_CONFIG,
  renderAvatarSVG,
} from '../lib/avatarConfig';
import type { Avatar } from '../types/game';

export const DEFAULT_AVATAR: Avatar = {
  url: '',
  head: DEFAULT_CONFIG.head,
  body: DEFAULT_CONFIG.body,
  accessory: DEFAULT_CONFIG.accessory,
  colors: { ...DEFAULT_CONFIG.colors },
};

const CHARACTER_PRESETS = [
  { label: 'The Don', head: 0, body: 0, accessory: 0, colors: { skin: '#8b7355', hair: '#1a1a1a', outfit: '#1a1a1a', accent: '#ffd700' } },
  { label: 'The Shadow', head: 5, body: 1, accessory: 1, colors: { skin: '#c49a6c', hair: '#2a1a1a', outfit: '#2a1a1a', accent: '#9b00ff' } },
  { label: 'The Enforcer', head: 8, body: 4, accessory: 4, colors: { skin: '#6b4a3a', hair: '#1a1a1a', outfit: '#3a2a1a', accent: '#ff0000' } },
  { label: 'The Charmer', head: 4, body: 3, accessory: 6, colors: { skin: '#d4a67d', hair: '#3a2a1a', outfit: '#1a1a2a', accent: '#00d4ff' } },
  { label: 'The Ghost', head: 2, body: 5, accessory: 9, colors: { skin: '#ffffff', hair: '#888888', outfit: '#4a4a4a', accent: '#00ff88' } },
];

type EditTab = 'preset' | 'face' | 'outfit' | 'accessory' | 'colors';

function AvatarPreview({ head, body, accessory, colors, size = 160 }: {
  head: number; body: number; accessory: number; colors: Record<string, string>; size?: number;
}) {
  const svgStr = useMemo(() => renderAvatarSVG(head, body, accessory, colors, size), [head, body, accessory, colors, size]);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: svgStr }}
      style={{ width: size, height: size * 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    />
  );
}

function CreatorModal({ initial, onSave, onClose }: {
  initial: Avatar; onSave: (a: Avatar) => void; onClose: () => void;
}) {
  const [head, setHead] = useState(initial.head ?? 0);
  const [body, setBody] = useState(initial.body ?? 0);
  const [accessory, setAccessory] = useState(initial.accessory ?? 0);
  const [colors, setColors] = useState<Record<string, string>>(
    initial.colors ? { ...initial.colors } : { ...DEFAULT_CONFIG.colors }
  );
  const [tab, setTab] = useState<EditTab>('preset');

  const setColor = (key: string, val: string) => setColors((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    onSave({ url: '', head, body, accessory, colors: { ...colors } });
  };

  const applyPreset = (p: typeof CHARACTER_PRESETS[0]) => {
    setHead(p.head);
    setBody(p.body);
    setAccessory(p.accessory);
    setColors({ ...p.colors });
  };

  const tabs: { key: EditTab; label: string }[] = [
    { key: 'preset', label: 'PRESETS' },
    { key: 'face', label: 'FACE' },
    { key: 'outfit', label: 'OUTFIT' },
    { key: 'accessory', label: 'GEAR' },
    { key: 'colors', label: 'COLORS' },
  ];

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.25rem', flexShrink: 0,
        background: 'rgba(5,5,5,0.95)',
        borderBottom: '1px solid rgba(255,215,0,0.15)',
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--noir-gold)', letterSpacing: '0.15em' }}>
          CREATE YOUR CHARACTER
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSave}
            style={{
              background: 'rgba(0,255,100,0.15)', border: '1px solid rgba(0,255,100,0.4)',
              borderRadius: 4, color: '#00ff88', padding: '0.45rem 1rem',
              fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer',
            }}
          >
            SAVE
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.4)',
              borderRadius: 4, color: '#ff6666', padding: '0.45rem 1rem',
              fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: live preview */}
        <div style={{
          width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          background: 'radial-gradient(ellipse at center, #1a0808, #050505)',
          borderRight: '1px solid rgba(255,0,0,0.15)',
        }}>
          <div style={{
            border: '2px solid rgba(255,0,0,0.3)', borderRadius: '50%',
            padding: 16, background: 'radial-gradient(circle, rgba(255,0,0,0.06), transparent)',
            boxShadow: '0 0 30px rgba(255,0,0,0.1)',
          }}>
            <AvatarPreview head={head} body={body} accessory={accessory} colors={colors} size={180} />
          </div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '0.6rem',
            color: 'rgba(255,100,100,0.5)', letterSpacing: '0.15em',
          }}>
            LIVE PREVIEW
          </p>
        </div>

        {/* Right: editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,215,0,0.12)',
            background: 'rgba(10,10,10,0.9)', flexShrink: 0,
          }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '0.7rem 0.5rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontSize: '0.6rem', letterSpacing: '0.12em',
                  background: tab === t.key ? 'rgba(255,0,0,0.12)' : 'transparent',
                  color: tab === t.key ? '#ff4444' : 'rgba(255,200,200,0.4)',
                  borderBottom: tab === t.key ? '2px solid #ff4444' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '1.2rem' }}>
            {tab === 'preset' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.8rem' }}>
                {CHARACTER_PRESETS.map((p, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => applyPreset(p)}
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,0,0,0.2)',
                      borderRadius: 8, padding: '1rem', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,0,0,0.6)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,0,0,0.2)'; }}
                  >
                    <AvatarPreview head={p.head} body={p.body} accessory={p.accessory} colors={p.colors} size={80} />
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.6rem',
                      color: 'rgba(255,200,200,0.7)', letterSpacing: '0.1em',
                    }}>
                      {p.label.toUpperCase()}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {tab === 'face' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                {HEADS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setHead(h.id)}
                    style={{
                      background: head === h.id ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.03)',
                      border: head === h.id ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '0.8rem 0.5rem', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{h.emoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                      color: head === h.id ? '#ff6666' : 'rgba(255,200,200,0.5)', letterSpacing: '0.08em',
                    }}>
                      {h.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'outfit' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.6rem' }}>
                {BODIES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBody(b.id)}
                    style={{
                      background: body === b.id ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.03)',
                      border: body === b.id ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '0.8rem 0.5rem', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{b.emoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                      color: body === b.id ? '#ff6666' : 'rgba(255,200,200,0.5)', letterSpacing: '0.08em',
                    }}>
                      {b.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'accessory' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.6rem' }}>
                {ACCESSORIES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAccessory(a.id)}
                    style={{
                      background: accessory === a.id ? 'rgba(255,0,0,0.15)' : 'rgba(255,255,255,0.03)',
                      border: accessory === a.id ? '2px solid #ff4444' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8, padding: '0.8rem 0.5rem', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{a.emoji}</span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.55rem',
                      color: accessory === a.id ? '#ff6666' : 'rgba(255,200,200,0.5)', letterSpacing: '0.08em',
                    }}>
                      {a.label.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === 'colors' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {COLOR_KEYS.map((key) => (
                  <div key={key}>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.6rem',
                      color: 'rgba(255,200,200,0.6)', letterSpacing: '0.12em',
                      marginBottom: '0.5rem', textTransform: 'uppercase',
                    }}>
                      {key}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {AVATAR_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(key, c)}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                            background: c,
                            border: colors[key] === c ? '3px solid #ff4444' : '2px solid rgba(255,255,255,0.12)',
                            boxShadow: colors[key] === c ? '0 0 12px rgba(255,0,0,0.5)' : 'none',
                            transition: 'all 0.15s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return createPortal(
    <AnimatePresence>{modal}</AnimatePresence>,
    document.body
  );
}

// ── Main AvatarPicker component ───────────────────────────────────────────────
interface AvatarPickerProps {
  value: Avatar;
  onChange: (avatar: Avatar) => void;
  playerName?: string;
}

export function AvatarPicker({ value, onChange, playerName = 'You' }: AvatarPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const hasAvatar = value.head !== undefined;

  const handleSave = useCallback((avatar: Avatar) => {
    onChange(avatar);
    setShowModal(false);
  }, [onChange]);

  const head = value.head ?? 0;
  const body = value.body ?? 0;
  const accessory = value.accessory ?? 0;
  const colors = value.colors ?? DEFAULT_CONFIG.colors;

  return (
    <>
      <style>{`
        @keyframes avatarRingPulse {
          0%,100% { box-shadow: 0 0 12px #ff000044, 0 0 30px #ff000022; }
          50%      { box-shadow: 0 0 22px #ff000088, 0 0 55px #ff000044; }
        }
        @keyframes statusPulse {
          0%,100% { opacity: 1; box-shadow: 0 0 5px #00ff88; }
          50%      { opacity: 0.5; box-shadow: 0 0 12px #00ff88; }
        }
        .change-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.22s;
        }
        .change-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 55%);
          pointer-events: none;
        }
        .change-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 28px rgba(255,0,0,0.5), 0 6px 24px rgba(255,0,0,0.25) !important;
        }
        .change-btn:active { transform: translateY(1px); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem' }}>

        {/* Section label */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '0.6rem',
            letterSpacing: '0.22em', color: 'rgba(255,100,100,0.6)',
            textTransform: 'uppercase',
          }}>
            YOUR CHARACTER
          </p>
          <div style={{ width: '60px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,0,0,0.4), transparent)', margin: '4px auto 0' }} />
        </div>

        {/* ── Preview ── */}
        {hasAvatar ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.5rem', padding: '0.5rem 0',
            }}
          >
            <div style={{
              border: '3px solid rgba(255,30,30,0.5)',
              borderRadius: '50%',
              padding: 8,
              boxShadow: '0 0 24px rgba(255,0,0,0.3), 0 0 60px rgba(255,0,0,0.1)',
              animation: 'avatarRingPulse 3s ease-in-out infinite',
              background: 'radial-gradient(circle, rgba(255,0,0,0.05), transparent)',
            }}>
              <AvatarPreview head={head} body={body} accessory={accessory} colors={colors} size={120} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: [0.4, 0.75, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: 160, gap: '0.75rem',
            }}
          >
            <div style={{
              width: 110, height: 110, borderRadius: '50%',
              border: '2px dashed rgba(255,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(255,0,0,0.05), transparent)',
            }}>
              <AvatarPreview head={0} body={0} accessory={0} colors={DEFAULT_CONFIG.colors} size={80} />
            </div>
            <p style={{ color: 'rgba(255,100,100,0.5)', fontSize: '0.7rem', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
              NO CHARACTER YET
            </p>
          </motion.div>
        )}

        {/* ── Change / Create button ── */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowModal(true)}
          className="btn-noir btn-filled-red w-full change-btn"
          style={{
            fontSize: '1rem',
            padding: '0.95rem 1rem',
            letterSpacing: '0.14em',
            fontWeight: 700,
            boxShadow: '0 0 20px rgba(255,0,0,0.3)',
          }}
        >
          {hasAvatar ? 'CHANGE CHARACTER' : 'CREATE YOUR CHARACTER'}
        </motion.button>

        {/* ── Status ── */}
        {hasAvatar && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#00ff88',
              animation: 'statusPulse 2s ease-in-out infinite',
            }} />
            <p style={{ color: '#00ff88', fontSize: '0.72rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
              CHARACTER READY
            </p>
          </motion.div>
        )}
      </div>

      {showModal && (
        <CreatorModal initial={value} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
