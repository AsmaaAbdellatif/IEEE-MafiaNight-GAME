import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ROLES } from '../shared/constants';
import { getAvatarForPlayer } from '../utils/avatars';
import { Search, Bug, Wrench, Moon, Skull, CheckCircle, AlertTriangle, Crosshair, Terminal, Lock, Unlock, Zap } from 'lucide-react';
import { playMiniGameKey, playMiniGameSuccess } from '../utils/sounds';

/* ── Encrypted code snippets for the mini-game ── */
const CRACK_CHALLENGES = [
  { encrypted: 'Xli$wivziv$mw$gsqtvsqmwih', answer: 'The server is compromised', shift: 4, hint: 'Caesar cipher, shift 4' },
  { encrypted: 'eggiww$kvergxih', answer: 'access granted', shift: 4, hint: 'Caesar cipher, shift 4' },
  { encrypted: 'svvmkly$kpqopkv', answer: 'override firewall', shift: 7, hint: 'Caesar cipher, shift 7' },
  { encrypted: 'gdkkvnqc$ejcpigf', answer: 'password changed', shift: 2, hint: 'Caesar cipher, shift 2' },
  { encrypted: 'uifsf!jt!b!cbdlepps', answer: 'there is a backdoor', shift: 1, hint: 'Caesar cipher, shift 1' },
  { encrypted: 'hqfubswlrq$nhb$irxqg', answer: 'encryption key found', shift: 3, hint: 'Caesar cipher, shift 3' },
  { encrypted: 'wjhzwnyd%httlwwji', answer: 'security breached', shift: 5, hint: 'Caesar cipher, shift 5' },
  { encrypted: 'ytkrj%nskynts%ktzsi', answer: 'shell injection found', shift: 5, hint: 'Caesar cipher, shift 5' },
];

/**
 * DevCrackMiniGame — A cipher-cracking mini-game for developers during night phase.
 * Players decode encrypted messages by typing the correct plaintext.
 */
function DevCrackMiniGame() {
  const [challengeIdx, setChallengeIdx] = useState(() => Math.floor(Math.random() * CRACK_CHALLENGES.length));
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const inputRef = useRef(null);

  const challenge = CRACK_CHALLENGES[challengeIdx];

  const nextChallenge = useCallback(() => {
    setFlash(true);
    try { playMiniGameSuccess(); } catch (_) {}
    setTimeout(() => {
      setSolved(s => s + 1);
      setChallengeIdx(prev => {
        let next;
        do { next = Math.floor(Math.random() * CRACK_CHALLENGES.length); } while (next === prev && CRACK_CHALLENGES.length > 1);
        return next;
      });
      setInput('');
      setShowHint(false);
      setFlash(false);
    }, 800);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setInput(val);
    try { playMiniGameKey(); } catch (_) {}

    if (val.toLowerCase().trim() === challenge.answer.toLowerCase()) {
      nextChallenge();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (input.toLowerCase().trim() !== challenge.answer.toLowerCase()) {
        setShakeWrong(true);
        setTimeout(() => setShakeWrong(false), 500);
      }
    }
  };

  // Visualize how close the player's guess is
  const getMatchDisplay = () => {
    const answer = challenge.answer.toLowerCase();
    const guess = input.toLowerCase();
    return answer.split('').map((ch, i) => {
      if (i < guess.length && guess[i] === ch) {
        return <span key={i} className="text-cyber-green">{ch}</span>;
      } else if (i < guess.length) {
        return <span key={i} className="text-cyber-red">{ch === ' ' ? '\u00A0' : '_'}</span>;
      }
      return <span key={i} className="text-gray-600">{ch === ' ' ? '\u00A0' : '_'}</span>;
    });
  };

  return (
    <div className={`cyber-card animate-slide-up ${flash ? 'border-cyber-green/60 bg-cyber-green/5' : ''} transition-all`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-cyber-blue font-bold flex items-center gap-1.5 font-display">
          <Terminal size={14} /> Code Cracker
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-cyber">DECODED:</span>
          <span className="text-xs font-bold text-cyber-green font-display">{solved}</span>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 mb-3 font-cyber">
        Decrypt the intercepted message while you wait. Type the plaintext below.
      </p>

      {/* Encrypted message display */}
      <div className="bg-black/60 border border-cyber-blue/30 rounded-lg p-3 mb-3 font-mono">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={12} className="text-cyber-red" />
          <span className="text-[10px] text-cyber-red uppercase tracking-widest font-display">Intercepted Message</span>
        </div>
        <p className="text-sm text-cyber-yellow font-bold tracking-wide break-all font-cyber">
          {challenge.encrypted}
        </p>
      </div>

      {/* Match progress */}
      <div className="bg-black/40 rounded px-3 py-2 mb-3 font-mono text-sm tracking-wider min-h-[2rem] flex items-center flex-wrap">
        {getMatchDisplay()}
      </div>

      {/* Input */}
      <div className={`${shakeWrong ? 'animate-shake' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type decoded message..."
          className="w-full cyber-input text-sm font-cyber"
          autoFocus
        />
      </div>

      {/* Hint + Cipher Table — compact row */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`text-[10px] transition-colors flex items-center gap-1 font-cyber ${showHint ? 'text-cyber-yellow' : 'text-gray-500 hover:text-cyber-yellow'}`}
          >
            <Zap size={10} /> Hint
          </button>
          <button
            onClick={() => setShowTable(!showTable)}
            className={`text-[10px] transition-colors flex items-center gap-1 font-cyber ${showTable ? 'text-cyber-blue' : 'text-gray-500 hover:text-cyber-blue'}`}
          >
            <Terminal size={10} /> Cipher Table
          </button>
        </div>
        {flash && (
          <span className="text-xs text-cyber-green font-bold flex items-center gap-1 animate-fade-in font-display">
            <Unlock size={12} /> DECRYPTED!
          </span>
        )}
      </div>
      {showHint && (
        <p className="text-[10px] text-cyber-yellow/70 mt-1 font-cyber animate-fade-in">
          {challenge.hint}
        </p>
      )}

      {/* Compact cipher table — 6 columns, 5 rows */}
      {showTable && (() => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const cols = 6;
        const rows = [];
        for (let r = 0; r < Math.ceil(alphabet.length / cols); r++) {
          rows.push(alphabet.slice(r * cols, r * cols + cols));
        }
        return (
          <div className="mt-2 bg-black/60 border border-cyber-blue/20 rounded-lg p-2 animate-fade-in">
            <p className="text-[9px] text-gray-500 mb-1 font-cyber uppercase tracking-widest">Shift -{challenge.shift}: <span className="text-cyber-yellow">encrypted</span> → <span className="text-cyber-green">decoded</span></p>
            <div className="grid grid-cols-6 gap-px font-mono text-[10px]">
              {alphabet.map(ch => {
                const decoded = String.fromCharCode(((ch.charCodeAt(0) - 65 - challenge.shift + 26) % 26) + 65);
                return (
                  <div key={ch} className="flex items-center justify-center gap-1 py-1 px-1 bg-cyber-darker/60 border border-cyber-border/20 rounded-sm">
                    <span className="text-cyber-yellow font-bold">{ch}</span>
                    <span className="text-gray-600 text-[8px]">→</span>
                    <span className="text-cyber-green font-bold">{decoded}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Score bar */}
      {solved > 0 && (
        <div className="mt-3 pt-2 border-t border-cyber-border">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.min(solved, 10) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyber-green shadow-[0_0_4px_rgba(0,255,136,0.5)]" />
            ))}
            {solved > 10 && <span className="text-[10px] text-cyber-green font-cyber">+{solved - 10}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * NightPanel – Night action UI for Hackers, QA, and Admin.
 * - QA can investigate 2 players
 * - Hackers must agree unanimously (shows vote status)
 * - Developers see a "waiting" message
 */
export default function NightPanel({
  myRole,
  myId,
  alivePlayers,
  onNightAction,
  investigationResult,
  fellowHackers,
  amAlive,
  hackerVoteStatus,
}) {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset on hacker vote disagreement
  useEffect(() => {
    if (hackerVoteStatus?.disagreement) {
      setSubmitted(false);
      setSelectedTarget(null);
    }
  }, [hackerVoteStatus]);

  const handleSubmit = () => {
    if (!selectedTarget) return;
    onNightAction(selectedTarget);
    setSubmitted(true);
  };

  // What targets can this role pick?
  const getTargets = () => {
    switch (myRole) {
      case ROLES.HACKER:
        return alivePlayers.filter(p => !fellowHackers.find(h => h.id === p.id) && p.id !== myId);
      case ROLES.SECURITY_LEAD:
        // Exclude self only
        return alivePlayers.filter(p => p.id !== myId);
      case ROLES.ADMIN:
        return alivePlayers;
      default:
        return [];
    }
  };

  const targets = getTargets();

  const getActionLabel = () => {
    if (myRole === ROLES.SECURITY_LEAD) {
      return {
        action: 'Investigate Player',
        Icon: Search,
        color: 'cyber-yellow',
      };
    }
    const labels = {
      [ROLES.HACKER]: { action: 'Inject Critical Bug', Icon: Bug, color: 'cyber-red' },
      [ROLES.ADMIN]: { action: 'Debug (Protect) Player', Icon: Wrench, color: 'cyber-green' },
      [ROLES.DEVELOPER]: { action: 'Sleep', Icon: Moon, color: 'gray-400' },
    };
    return labels[myRole] || labels[ROLES.DEVELOPER];
  };

  const config = getActionLabel();

  if (!amAlive) {
    return (
      <div className="cyber-card text-center animate-fade-in">
        <p className="text-gray-500 text-sm py-4 flex items-center justify-center gap-2">
          <Skull size={16} /> You have been eliminated. Watch the night unfold…
        </p>
      </div>
    );
  }

  // Developer mini-game during night
  if (myRole === ROLES.DEVELOPER) {
    return <DevCrackMiniGame />;
  }

  // QA — waits during night, acts at sunrise
  if (myRole === ROLES.SECURITY_LEAD) {
    return (
      <div className="cyber-card text-center animate-slide-up">
        <p className="text-5xl mb-3 flex justify-center"><Search size={40} /></p>
        <p className="text-gray-400 text-sm">
          Night is active… The hackers are making their move.
        </p>
        <p className="text-yellow-400 text-xs mt-2 font-semibold">
          At sunrise, you'll investigate the code. Stay alert!
        </p>
      </div>
    );
  }

  // Admin — waits during night, acts at sunrise
  if (myRole === ROLES.ADMIN) {
    return (
      <div className="cyber-card text-center animate-slide-up">
        <p className="text-5xl mb-3 animate-float flex justify-center"><Wrench size={40} /></p>
        <p className="text-gray-400 text-sm">
          Night is active… The hackers are making their move.
        </p>
        <p className="text-green-400 text-xs mt-2 font-semibold">
          At sunrise, you'll receive the attacked code and choose the correct fix to protect the target!
        </p>
      </div>
    );
  }

  return (
    <div className="cyber-card animate-slide-up">
      <h3 className={`text-xs uppercase tracking-wider text-${config.color} font-bold mb-3 flex items-center gap-1.5`}>
        {config.Icon && <config.Icon size={14} />} {config.action}
      </h3>

      {/* Investigation results from previous night (array format) */}
      {myRole === ROLES.SECURITY_LEAD && investigationResult && Array.isArray(investigationResult) && investigationResult.length > 0 && (
        <div className="mb-3 space-y-1">
          {investigationResult.map((res, i) => (
            <div key={i} className={`p-2 rounded text-xs ${
              res.isHacker
                ? 'bg-cyber-red/10 border border-cyber-red/30 text-cyber-red'
                : 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
            }`}>
              Investigation: <strong>{res.targetName}</strong> is{' '}
              {res.isHacker ? <><Bug size={12} className="inline" /> a HACKER!</> : <><CheckCircle size={12} className="inline" /> NOT a Hacker.</>}
            </div>
          ))}
        </div>
      )}

      {/* Legacy single investigation result support */}
      {myRole === ROLES.SECURITY_LEAD && investigationResult && !Array.isArray(investigationResult) && (
        <div className={`mb-3 p-2 rounded text-xs ${
          investigationResult.isHacker
            ? 'bg-cyber-red/10 border border-cyber-red/30 text-cyber-red'
            : 'bg-cyber-green/10 border border-cyber-green/30 text-cyber-green'
        }`}>
          Last investigation: <strong>{investigationResult.targetName}</strong> is{' '}
          {investigationResult.isHacker ? <><Bug size={12} className="inline" /> a HACKER!</> : <><CheckCircle size={12} className="inline" /> NOT a Hacker.</>}
        </div>
      )}
      {myRole === ROLES.HACKER && hackerVoteStatus && (
        <div className={`mb-3 p-2 rounded text-xs border ${
          hackerVoteStatus.disagreement
            ? 'bg-cyber-red/10 border-cyber-red/30'
            : 'bg-cyber-darker border-cyber-red/20'
        }`}>
          {hackerVoteStatus.disagreement && (
            <p className="text-cyber-red font-bold mb-1 flex items-center gap-1"><AlertTriangle size={12} /> You must ALL agree on the same target! Votes reset.</p>
          )}
          {Object.values(hackerVoteStatus.votes || {}).map((v, i) => (
            <p key={i} className="text-gray-400 flex items-center gap-1">
              <Bug size={12} /> {v.hackerName} → <span className="text-cyber-red">{v.targetName}</span>
            </p>
          ))}
          {!hackerVoteStatus.disagreement && (
            <p className="text-gray-500 mt-1 text-[10px]">
              {hackerVoteStatus.allVoted
                ? '✓ All hackers voted'
                : `${Object.keys(hackerVoteStatus.votes || {}).length}/${hackerVoteStatus.totalHackers} hackers voted`}
            </p>
          )}
        </div>
      )}

      {submitted ? (
        <div className="text-center py-6">
          <p className="text-4xl mb-2 animate-float flex justify-center"><Bug size={32} /></p>
          <p className="text-cyber-green text-sm font-semibold">✓ Vote submitted. Waiting for other hackers…</p>
          <p className="text-gray-500 text-xs mt-2">Once both hackers agree, the <span className="text-cyber-green font-bold">target's code</span> will appear for you to inject a bug.</p>
        </div>
      ) : myRole === ROLES.HACKER ? (
        /* ── Hacker big fragment vote cards ── */
        <>
          {/* ── Clear instructions box ── */}
          <div className="mb-4 p-3 rounded-lg border border-cyber-red/30 bg-cyber-red/5">
            <p className="text-sm text-gray-200 font-semibold mb-1 flex items-center gap-1.5"><Skull size={14} className="text-cyber-red" /> Your Mission:</p>
            <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
              <li>You have <span className="text-cyber-red font-bold">5 minutes</span> to choose a player to eliminate.</li>
              <li>Both hackers <span className="text-yellow-400 font-bold">must vote on the same player</span> — if you disagree, votes reset!</li>
              <li>Once you agree, the <span className="text-cyber-green font-bold">target's code</span> will appear so you can choose which bug to inject.</li>
              <li>After injecting, press <span className="text-cyber-blue font-bold">Skip</span> or wait for time to run out.</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mb-3 text-center">Choose your target — all hackers must agree:</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {targets.map((p, idx) => {
              const isSelected = selectedTarget === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedTarget(p.id); setSubmitted(false); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 animate-slide-up
                    ${isSelected
                      ? 'border-cyber-red bg-cyber-red/20 text-cyber-red shadow-lg shadow-cyber-red/20'
                      : 'border-cyber-border bg-cyber-darker text-gray-300 hover:border-cyber-red/50 hover:bg-cyber-red/5'
                    }
                  `}
                  style={{ animationDelay: `${idx * 70}ms`, animationFillMode: 'both' }}
                >
                  <img src={getAvatarForPlayer(p.name)} alt={p.name} className={`w-14 h-14 rounded-full border-2 ${isSelected ? 'border-cyber-red' : 'border-gray-700'}`} />
                  <span className="font-bold text-sm">{p.name}</span>
                  {isSelected && <span className="text-xs text-cyber-red animate-pulse flex items-center gap-1"><Crosshair size={12} /> Selected</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedTarget}
            className="w-full cyber-btn cyber-btn-red disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Bug size={14} className="inline-block mr-1" /> Cast Vote — Inject Bug
          </button>
        </>
      ) : (
        /* ── Other roles (QA during night — shouldn't render, but fallback) ── */
        <>
          <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
            {targets.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setSelectedTarget(p.id)}
                className={`w-full flex items-center gap-3 rounded px-3 py-2 text-sm transition-all animate-slide-right
                  ${selectedTarget === p.id
                    ? `bg-${config.color}/20 border border-${config.color}/40 text-${config.color}`
                    : 'bg-cyber-darker border border-transparent hover:border-cyber-border text-gray-300'
                  }
                `}
                style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
              >
                <img src={getAvatarForPlayer(p.name)} alt={p.name} className="w-8 h-8 rounded-full bg-black/40" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!selectedTarget}
            className={`w-full cyber-btn ${myRole === ROLES.ADMIN ? 'cyber-btn-green' : 'cyber-btn-blue'}`}
          >
            Confirm {config.action}
          </button>
        </>
      )}
    </div>
  );
}
