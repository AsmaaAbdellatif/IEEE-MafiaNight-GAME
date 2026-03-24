import React from 'react';
import { ROLES } from '../shared/constants';
import { getAvatarForPlayer, getAvatarForRole } from '../utils/avatars';
import { Bug, Wrench, Search, Code2, Crown, Skull, XCircle, SkipForward } from 'lucide-react';

/**
 * PlayerList – Displays alive / dead players with role badges.
 * Shows your own role, and if you're a Hacker, highlights fellow hackers.
 */
export default function PlayerList({ alivePlayers, deadPlayers, myId, myRole, fellowHackers, defenders, voteTally, skippedPlayerIds }) {
  const roleIcons = {
    [ROLES.DEVELOPER]: Code2,
    [ROLES.HACKER]: Bug,
    [ROLES.SECURITY_LEAD]: Search,
    [ROLES.ADMIN]: Wrench,
  };

  const roleColors = {
    [ROLES.DEVELOPER]: 'text-blue-400',
    [ROLES.HACKER]: 'text-cyber-red',
    [ROLES.SECURITY_LEAD]: 'text-cyan-400',
    [ROLES.ADMIN]: 'text-yellow-400',
  };

  // Build sets for quick lookup
  const hackerIds = new Set((fellowHackers || []).map(h => h.id || h));
  const skipperIds = new Set(skippedPlayerIds || []);
  const iAmHacker = myRole === ROLES.HACKER;

  // Determine visible role for a player
  const getVisibleRole = (player) => {
    if (player.id === myId) return myRole; // Always see own role
    if (iAmHacker && hackerIds.has(player.id)) return ROLES.HACKER; // Hackers see each other
    return null; // Unknown
  };

  const RoleBadge = ({ role }) => {
    if (!role) return null;
    const Icon = roleIcons[role];
    const color = roleColors[role] || 'text-gray-400';
    return (
      <span className={`flex items-center gap-0.5 text-[10px] ${color} bg-black/30 rounded px-1 py-0.5`}>
        {Icon && <Icon size={10} />}
        <span className="capitalize">{role}</span>
      </span>
    );
  };

  return (
    <div className="cyber-card">
      <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-bold">
        Players
      </h3>

      {/* Alive */}
      <div className="space-y-1.5 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-cyber-green/70">
          Alive ({alivePlayers.length})
        </p>
        {alivePlayers.map(p => {
          const isMe = p.id === myId;
          const isDefender = defenders?.includes(p.id);
          const voteCount = voteTally?.[p.id] || 0;
          const visibleRole = getVisibleRole(p);
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded px-2 py-1.5 text-sm
                ${isMe ? 'bg-cyber-green/10 border border-cyber-green/20' : 'bg-cyber-darker'}
                ${isDefender ? 'ring-1 ring-cyber-yellow/50' : ''}
              `}
            >
              <span className="flex items-center gap-1.5">
                <img src={getAvatarForPlayer(p.name)} alt={p.name} className="w-6 h-6 rounded-full bg-black/40" />
                <span className={isMe ? 'text-cyber-green font-semibold' : 'text-gray-300'}>
                  {p.name}
                </span>
                {p.isHost && <span className="text-[10px]"><Crown size={12} /></span>}
                {isMe && <span className="text-[10px] text-cyber-green/60">(you)</span>}
              </span>
              <span className="flex items-center gap-1.5">
                {visibleRole && <RoleBadge role={visibleRole} />}
                {voteCount > 0 && (
                  <span className="text-xs text-cyber-red font-bold">{voteCount} votes</span>
                )}
                {skipperIds.has(p.id) && (
                  <span className="flex items-center gap-0.5 text-[10px] text-cyber-yellow bg-cyber-yellow/10 rounded px-1.5 py-0.5 font-bold">
                    <SkipForward size={9} /> SKIP
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dead — glitched out display */}
      {deadPlayers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-cyber-red/70 font-display flex items-center gap-1">
            <Skull size={10} /> Terminated ({deadPlayers.length})
          </p>
          {deadPlayers.map((p, idx) => (
            <div
              key={p.id}
              className="relative flex items-center justify-between rounded px-2 py-1.5 text-sm bg-cyber-darker border border-cyber-red/10 overflow-hidden animate-fade-in group"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
            >
              {/* Glitch scanline overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-red/5 via-transparent to-cyber-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-0 right-0 h-px bg-cyber-red/20" />

              <div className="flex items-center gap-1.5 relative">
                <div className="relative">
                  <img src={getAvatarForPlayer(p.name)} alt={p.name} className="w-5 h-5 rounded-full grayscale brightness-50 bg-black/40" />
                  <XCircle size={10} className="absolute -top-0.5 -right-0.5 text-cyber-red" />
                </div>
                <span className="text-gray-600 line-through font-cyber">{p.name}</span>
              </div>
              <span className="text-[9px] text-cyber-red/40 font-mono font-display tracking-widest">OFFLINE</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
