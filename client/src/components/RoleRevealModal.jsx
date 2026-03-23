import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ROLES } from '../shared/constants';
import { getAvatarForRole } from '../utils/avatars';
import { getTheme } from '../utils/themes';
import { Bug } from 'lucide-react';
import { playDecryptTick, playDecryptComplete } from '../utils/sounds';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>{}[]=/\\|~';
const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/**
 * DecryptText — Scrambles through random characters before revealing the real text.
 * Each character resolves left-to-right with a digital decryption effect.
 */
function DecryptText({ text, delay = 0, className = '', onComplete }) {
  const [display, setDisplay] = useState('');
  const [started, setStarted] = useState(false);
  const resolvedRef = useRef(0);
  const intervalRef = useRef(null);
  const tickCountRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started || !text) return;
    resolvedRef.current = 0;
    tickCountRef.current = 0;

    intervalRef.current = setInterval(() => {
      tickCountRef.current++;
      const resolved = resolvedRef.current;

      // Every 3 ticks, lock in the next character
      if (tickCountRef.current % 3 === 0 && resolved < text.length) {
        resolvedRef.current++;
        // Play tick sound every 2 chars to avoid audio spam
        if (resolvedRef.current % 2 === 0) {
          try { playDecryptTick(); } catch (_) {}
        }
      }

      const current = resolvedRef.current;
      let result = text.slice(0, current);
      // Fill remaining with random characters
      for (let i = current; i < text.length; i++) {
        result += text[i] === ' ' ? ' ' : randomChar();
      }
      setDisplay(result);

      if (current >= text.length) {
        clearInterval(intervalRef.current);
        try { playDecryptComplete(); } catch (_) {}
        if (onComplete) onComplete();
      }
    }, 50);

    return () => clearInterval(intervalRef.current);
  }, [started, text, onComplete]);

  if (!started) {
    // Show scrambled placeholder before start
    return (
      <span className={className}>
        {text ? text.split('').map((c, i) => c === ' ' ? ' ' : randomChar()).join('') : ''}
      </span>
    );
  }

  return <span className={className}>{display}</span>;
}

/**
 * RoleRevealModal – Full-screen overlay with a decryption animation
 * that reveals the player's role with cybersecurity-themed visuals.
 */
export default function RoleRevealModal({ role, description, fellowHackers, onClose }) {
  const theme = getTheme(role);
  const [phase, setPhase] = useState(0); // 0=scanning, 1=decrypting, 2=revealed
  const [scanLines, setScanLines] = useState(0);

  const borderMap = {
    [ROLES.DEVELOPER]: 'border-cyber-blue/40',
    [ROLES.HACKER]: 'border-cyber-red/40',
    [ROLES.SECURITY_LEAD]: 'border-cyber-yellow/40',
    [ROLES.ADMIN]: 'border-cyber-green/40',
  };

  const glowMap = {
    [ROLES.DEVELOPER]: 'shadow-[0_0_40px_rgba(0,187,255,0.3)]',
    [ROLES.HACKER]: 'shadow-[0_0_40px_rgba(255,51,102,0.3)]',
    [ROLES.SECURITY_LEAD]: 'shadow-[0_0_40px_rgba(255,204,0,0.3)]',
    [ROLES.ADMIN]: 'shadow-[0_0_40px_rgba(0,255,136,0.3)]',
  };

  // Phase 0: scanning animation for 1.2s, then start decryption
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanLines(prev => prev + 1);
    }, 80);

    const timer = setTimeout(() => {
      clearInterval(scanInterval);
      setPhase(1);
    }, 1200);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(timer);
    };
  }, []);

  const onNameDecrypted = useCallback(() => {
    setTimeout(() => setPhase(2), 300);
  }, []);

  const roleDisplayName = (role || '').replace('_', ' ').toUpperCase();
  const subtitle = role === ROLES.HACKER ? 'INFILTRATE & CORRUPT' :
    role === ROLES.ADMIN ? 'PROTECT & REPAIR' :
    role === ROLES.SECURITY_LEAD ? 'INVESTIGATE & EXPOSE' :
    'BUILD & SURVIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 font-mono text-xs animate-matrix-fall whitespace-nowrap"
            style={{
              left: `${(i / 15) * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
            }}
          >
            {Array.from({ length: 20 }).map(() => randomChar()).join('\n')}
          </div>
        ))}
      </div>

      <div className={`cyber-card max-w-sm w-full mx-4 border-2 ${borderMap[role] || borderMap[ROLES.DEVELOPER]} animate-slide-up ${glowMap[role] || ''}`}
        style={{ boxShadow: `0 0 60px ${theme.primary}25, inset 0 0 60px ${theme.primary}08` }}
      >
        {/* Scanning header */}
        {phase === 0 && (
          <div className="text-center py-6 animate-fade-in">
            <div className="inline-block px-4 py-1 border border-green-500/40 rounded bg-green-900/20 mb-4">
              <p className="text-green-400 text-xs font-display tracking-[0.3em] animate-pulse">
                DECRYPTING ASSIGNMENT...
              </p>
            </div>
            <div className="font-mono text-[10px] text-green-500/60 space-y-0.5 max-h-24 overflow-hidden">
              {Array.from({ length: scanLines }).map((_, i) => (
                <p key={i} className="animate-fade-in">
                  [{String(i).padStart(3, '0')}] {['SCANNING CIPHER BLOCK...', 'DECODING ROLE MATRIX...', 'VERIFYING CLEARANCE...', 'LOADING IDENTITY...', 'PARSING ACCESS LEVEL...'][i % 5]}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Decryption reveal */}
        {phase >= 1 && (
          <>
            {/* Role-themed top stripe */}
            <div className="h-1 rounded-full mb-6 mx-8 animate-fade-in" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }} />

            {/* Role Avatar with scan effect */}
            <div className="flex justify-center mb-6 animate-scale-in">
              <div className="relative">
                <img src={getAvatarForRole(role)} alt={role} className="w-32 h-32 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                {phase === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-scan-line rounded-full" />
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">{theme.icon && <theme.icon size={24} />}</div>
              </div>
            </div>

            {/* Role Name — decryption effect */}
            <h2 className={`text-2xl font-bold text-center ${theme.titleColor} ${theme.titleGlow} mb-1 tracking-widest font-display`}>
              <DecryptText text={roleDisplayName} delay={200} onComplete={onNameDecrypted} />
            </h2>

            {/* Subtitle — decrypts after name */}
            <p className={`text-xs text-center ${theme.subtitleColor} mb-4 tracking-wider font-cyber`}>
              {phase >= 2 ? (
                <DecryptText text={subtitle} delay={0} />
              ) : (
                <span className="opacity-0">{subtitle}</span>
              )}
            </p>

            {/* Description — fades in after decryption */}
            <div className={`transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <p className="text-gray-300 text-sm text-center leading-relaxed mb-4 font-cyber">
                {description}
              </p>

              {/* Fellow Hackers (only shown to hackers) */}
              {role === ROLES.HACKER && fellowHackers.length > 0 && (
                <div className="bg-cyber-red/10 border border-cyber-red/20 rounded p-3 mb-4 animate-fade-in">
                  <p className="text-xs text-cyber-red uppercase tracking-wider mb-2 font-display">Fellow Hackers</p>
                  <div className="space-y-1">
                    {fellowHackers.map(h => (
                      <p key={h.id} className="text-sm text-gray-300 flex items-center gap-1 font-cyber"><Bug size={14} /> {h.name}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCESS GRANTED badge */}
              <div className="text-center mb-4 animate-fade-in">
                <span className="inline-block px-3 py-1 text-[10px] font-display tracking-[0.3em] border rounded"
                  style={{ borderColor: `${theme.primary}60`, color: theme.primary, backgroundColor: `${theme.primary}10` }}>
                  ACCESS GRANTED
                </span>
              </div>

              {/* Close */}
              <button onClick={onClose} className={`${theme.btnClass} w-full font-display tracking-wider`}>
                I Understand My Role
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
