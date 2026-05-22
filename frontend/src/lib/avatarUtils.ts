// =============================================================================
// lib/avatarUtils.ts – Avatar helpers (modular + legacy RPM support)
// =============================================================================
import { renderAvatarSVG, DEFAULT_AVATAR as DEFAULT_CONFIG } from './avatarConfig';
import type { Avatar } from '../types/game';

/** Extract the avatar ID from a full RPM GLB URL */
export function getAvatarId(url: string): string {
  return url
    .replace('https://models.readyplayer.me/', '')
    .replace('.glb', '')
    .split('?')[0];
}

export function getHeadshotUrl(url: string): string {
  if (!url) return '';
  const id = getAvatarId(url);
  return `https://models.readyplayer.me/${id}.png`;
}

export function getPortraitUrl(url: string, size = 256): string {
  if (!url) return '';
  const id = getAvatarId(url);
  return `https://models.readyplayer.me/${id}.png?scene=fullbody-portrait-v1-transparent&size=${size}`;
}

/** Default empty avatar */
export const DEFAULT_AVATAR = { url: '' };

/** Get player initials for the fallback avatar */
export function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

/** Generate a deterministic background color from a player name */
export function getAvatarColor(name: string): string {
  const COLORS = ['#c0392b', '#8e44ad', '#1a5276', '#117a65', '#784212', '#2c3e50'];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[Math.abs(hash)];
}

/** Check if an avatar has been customized (modular system) */
export function hasCustomAvatar(avatar: Avatar | null | undefined): boolean {
  return avatar != null && avatar.head !== undefined;
}

/** Get an SVG data URL for a modular avatar (usable as an img src) */
export function getAvatarSvgDataUrl(avatar: Avatar, size = 48): string {
  const svg = renderAvatarSVG(
    avatar.head ?? 0,
    avatar.body ?? 0,
    avatar.accessory ?? 0,
    avatar.colors ?? DEFAULT_CONFIG.colors,
    size,
  );
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Get avatar thumbnail: returns SVG data URL for custom avatars, RPM headshot for legacy, or empty string */
export function getAvatarThumbnail(avatar: Avatar | null | undefined, size = 48): string {
  if (!avatar) return '';
  if (hasCustomAvatar(avatar)) return getAvatarSvgDataUrl(avatar, size);
  if (avatar.url) return getHeadshotUrl(avatar.url);
  return '';
}
