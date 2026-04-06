'use client';

import type { GenderProfileId, OriginProfileId } from '@/lib/types/discrimination';

interface CharacterSpriteProps {
  origin?: OriginProfileId;
  gender?: GenderProfileId;
}

const SKIN_COLORS: Record<OriginProfileId, string> = {
  franco_francais:      '#f5c499',
  europeen_est:         '#f2c090',
  asiatique:            '#e8b07a',
  maghrebin:            '#c4904e',
  africain_subsaharien: '#8b5e3c',
};

const SHIRT_COLORS: Record<OriginProfileId, string> = {
  franco_francais:      '#4E6851',
  europeen_est:         '#5a7a5e',
  asiatique:            '#3d5c42',
  maghrebin:            '#6b4e31',
  africain_subsaharien: '#7a5533',
};

const HAIR_COLORS: Record<GenderProfileId, string> = {
  homme_secteur_mixte:       '#5c3d1a',
  femme_secteur_mixte:       '#3d1a1a',
  homme_secteur_feminise:    '#5c3d1a',
  femme_secteur_masculinise: '#1a1a1a',
  femme_25_35_mixte:         '#8b5e3c',
};

const IS_FEMALE: Record<GenderProfileId, boolean> = {
  homme_secteur_mixte:       false,
  femme_secteur_mixte:       true,
  homme_secteur_feminise:    false,
  femme_secteur_masculinise: true,
  femme_25_35_mixte:         true,
};

const DEFAULT_SKIN  = '#5a5040';
const DEFAULT_HAIR  = '#5a5040';
const DEFAULT_SHIRT = '#2e2518';

const T: React.CSSProperties = { transition: 'fill var(--transition-slow)' };

export default function CharacterSprite({ origin, gender }: CharacterSpriteProps) {
  const skinColor  = origin ? SKIN_COLORS[origin]  : DEFAULT_SKIN;
  const shirtColor = origin ? SHIRT_COLORS[origin] : DEFAULT_SHIRT;
  const hairColor  = gender ? HAIR_COLORS[gender]  : DEFAULT_HAIR;
  const isFemale   = gender ? IS_FEMALE[gender]    : false;

  return (
    <div className="sprite-wrapper sprite-idle">
      <svg
        viewBox="0 0 16 24"
        width={128}
        height={192}
        className="pixel-art"
        aria-hidden="true"
      >
        <g>
          {isFemale ? (
            <>
              <rect x={4} y={0} width={8} height={3} fill={hairColor} style={T} />
              <rect x={4} y={3} width={1} height={5} fill={hairColor} style={T} />
              <rect x={11} y={3} width={1} height={5} fill={hairColor} style={T} />
              <rect x={4} y={8} width={1} height={3} fill={hairColor} style={T} />
              <rect x={11} y={8} width={1} height={3} fill={hairColor} style={T} />
            </>
          ) : (
            <rect x={5} y={0} width={6} height={2} fill={hairColor} style={T} />
          )}
          <rect x={5} y={2} width={6} height={6} fill={skinColor} style={T} />
          <rect x={6} y={5} width={1} height={1} fill="#2a1a0a" />
          <rect x={9} y={5} width={1} height={1} fill="#2a1a0a" />
          <rect x={4} y={8} width={8} height={5} fill={shirtColor} style={T} />
          <rect x={2} y={8}  width={2} height={4} fill={skinColor} style={T} />
          <rect x={12} y={8} width={2} height={4} fill={skinColor} style={T} />
          <rect x={2}  y={12} width={2} height={2} fill={skinColor} style={T} />
          <rect x={12} y={12} width={2} height={2} fill={skinColor} style={T} />
          <rect x={4} y={13} width={3} height={6} fill="#2a3a2d" />
          <rect x={9} y={13} width={3} height={6} fill="#2a3a2d" />
          <rect x={3} y={19} width={4} height={2} fill="#1a120a" />
          <rect x={9} y={19} width={4} height={2} fill="#1a120a" />
        </g>
      </svg>
    </div>
  );
}
