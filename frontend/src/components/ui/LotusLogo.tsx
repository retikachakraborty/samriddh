import React from 'react';

interface LotusLogoProps {
  className?: string;
  size?: number;
}

/**
 * High-fidelity recognizable lotus flower SVG.
 * Symmetrical overlapping petals, multi-layered pink gradients, gold stamen.
 */
export const LotusLogo: React.FC<LotusLogoProps> = ({ className = 'w-6 h-6', size }) => {
  const style = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Soft, glowing outer petals gradient */}
        <linearGradient id="lotusOuterGrad" x1="60" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF2F4" />
          <stop offset="50%" stopColor="#F7CED8" />
          <stop offset="100%" stopColor="#D9778F" />
        </linearGradient>

        {/* Vibrant pink mid petals gradient */}
        <linearGradient id="lotusMidGrad" x1="60" y1="10" x2="60" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBCFE8" />
          <stop offset="40%" stopColor="#F0A7b9" />
          <stop offset="100%" stopColor="#C2395F" />
        </linearGradient>

        {/* Deep, rich core petals gradient */}
        <linearGradient id="lotusCoreGrad" x1="60" y1="5" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDF2F4" />
          <stop offset="30%" stopColor="#E57793" />
          <stop offset="100%" stopColor="#A32A4C" />
        </linearGradient>

        {/* Radiant central/crown petal gradient */}
        <linearGradient id="lotusCrownGrad" x1="60" y1="0" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF5F7" />
          <stop offset="45%" stopColor="#E57793" />
          <stop offset="100%" stopColor="#882541" />
        </linearGradient>

        {/* Glowing gold stamen gradient */}
        <radialGradient id="goldStamen" cx="60" cy="65" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </radialGradient>

        {/* Water base soft reflection shadow */}
        <radialGradient id="baseShadow" cx="60" cy="88" r="40" fx="60" fy="88">
          <stop offset="0%" stopColor="#1B4332" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1B4332" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Water reflection / base glow */}
      <ellipse cx="60" cy="88" rx="42" ry="7" fill="url(#baseShadow)" />

      {/* LAYER 1: Lowermost wide-spreading outer petals (Back layer) */}
      {/* Outer Left Petal */}
      <path
        d="M60 84 Q24 76 8 50 Q6 36 24 38 Q42 40 60 72 Z"
        fill="url(#lotusOuterGrad)"
        fillOpacity="0.85"
        stroke="#D9778F"
        strokeWidth="0.5"
      />
      {/* Outer Right Petal */}
      <path
        d="M60 84 Q96 76 112 50 Q114 36 96 38 Q78 40 60 72 Z"
        fill="url(#lotusOuterGrad)"
        fillOpacity="0.85"
        stroke="#D9778F"
        strokeWidth="0.5"
      />

      {/* LAYER 2: Mid-level spreading petals */}
      {/* Mid Left Petal */}
      <path
        d="M60 84 C38 72 20 54 22 36 C24 22 38 28 48 38 C54 44 58 62 60 84 Z"
        fill="url(#lotusMidGrad)"
        fillOpacity="0.9"
        stroke="#C2395F"
        strokeWidth="0.5"
      />
      {/* Mid Right Petal */}
      <path
        d="M60 84 C82 72 100 54 98 36 C96 22 82 28 72 38 C66 44 62 62 60 84 Z"
        fill="url(#lotusMidGrad)"
        fillOpacity="0.9"
        stroke="#C2395F"
        strokeWidth="0.5"
      />

      {/* LAYER 3: Inner guard petals */}
      {/* Inner Left Petal */}
      <path
        d="M60 84 C46 68 32 46 36 24 C40 12 50 18 54 32 C58 42 59 62 60 84 Z"
        fill="url(#lotusCoreGrad)"
        stroke="#A32A4C"
        strokeWidth="0.5"
      />
      {/* Inner Right Petal */}
      <path
        d="M60 84 C74 68 88 46 84 24 C80 12 70 18 66 32 C62 42 61 62 60 84 Z"
        fill="url(#lotusCoreGrad)"
        stroke="#A32A4C"
        strokeWidth="0.5"
      />

      {/* LAYER 4: Central Symmetrical Crown Petal (Hero central shape) */}
      <path
        d="M60 5 C50 30 46 56 60 84 C74 56 70 30 60 5 Z"
        fill="url(#lotusCrownGrad)"
        stroke="#882541"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* LAYER 5: Glowing Golden Center Pod / Pistil */}
      <ellipse cx="60" cy="72" rx="10" ry="5" fill="url(#goldStamen)" />
      
      {/* Golden Stamen Filaments (Symmetrical pollen tips rising from core) */}
      <g stroke="#FDE047" strokeWidth="0.75" opacity="0.9">
        {/* Filament lines */}
        <line x1="50" y1="72" x2="46" y2="65" />
        <line x1="53" y1="73" x2="50" y2="64" />
        <line x1="57" y1="74" x2="56" y2="63" />
        <line x1="60" y1="74" x2="60" y2="62" />
        <line x1="63" y1="74" x2="64" y2="63" />
        <line x1="67" y1="73" x2="70" y2="64" />
        <line x1="70" y1="72" x2="74" y2="65" />
      </g>
      
      {/* Pollen heads */}
      <circle cx="46" cy="65" r="1.2" fill="#F59E0B" />
      <circle cx="50" cy="64" r="1.2" fill="#FDE047" />
      <circle cx="56" cy="63" r="1.2" fill="#FDE047" />
      <circle cx="60" cy="62" r="1.5" fill="#FFFBEB" />
      <circle cx="64" cy="63" r="1.2" fill="#FDE047" />
      <circle cx="70" cy="64" r="1.2" fill="#FDE047" />
      <circle cx="74" cy="65" r="1.2" fill="#F59E0B" />
    </svg>
  );
};
