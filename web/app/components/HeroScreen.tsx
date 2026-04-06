'use client';

import dynamic from 'next/dynamic';

const DitherBackground = dynamic(() => import('./ui/DitherBackground'), { ssr: false });

const TEXT_SHADOW = '0 0 12px rgba(26,18,10,0.9), 0 2px 4px rgba(0,0,0,0.8)';

export default function HeroScreen() {
  return (
    <section
      className="min-h-screen relative overflow-hidden"
      aria-label="Présentation — Reo le Prisme"
      style={{ background: 'var(--color-bg)' }}
    >
      <DitherBackground
        waveColor={[0, 0.3, 0]}
        waveSpeed={0.04}
        waveFrequency={2.8}
        waveAmplitude={0.3}
        colorNum={4}
        pixelSize={3}
        enableMouseInteraction={true}
        mouseRadius={0.18}
      />

      {/* Content — pointer-events none so mouse reaches canvas */}
      <div
        className="hero-content"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.75rem',
          textAlign: 'center',
          padding: '4rem 1.5rem',
        }}
      >
        <p
          className="text-pixel"
          style={{ fontSize: '0.55rem', color: 'var(--color-surface-dim)', letterSpacing: '0.3em', textShadow: TEXT_SHADOW }}
        >
          Développé par Reo
        </p>

        <h1
          className="text-pixel text-glow-green"
          style={{
            fontSize: 'clamp(1.2rem, 4vw, 2.6rem)',
            color: 'var(--color-surface)',
            lineHeight: 1.7,
            textShadow: '0 0 20px rgba(0,0,0,1), 0 0 8px rgba(26,18,10,1)',
          }}
        >
          Simule tes chances.
        </h1>

        <p
          className="text-description"
          style={{
            maxWidth: '46ch',
            fontSize: '1rem',
            color: 'var(--color-surface)',
            lineHeight: 1.9,
            textShadow: TEXT_SHADOW,
          }}
        >
          Ton origine, ton quartier, ton genre, chaque détail compte.
          Construis ton profil et découvre.
        </p>

        <p
          className="text-pixel"
          style={{ fontSize: '0.55rem', color: 'var(--color-surface-dim)', letterSpacing: '0.1em', textShadow: TEXT_SHADOW }}
        >
          Basé sur 12 études françaises · taux de référence 24,7 %
        </p>

        {/* Button needs pointer-events restored */}
        <a
          href="#simulateur"
          className="btn-8bit btn-8bit--large"
          style={{ pointerEvents: 'auto' }}
        >
          <span className="text-pixel">Commencer →</span>
        </a>
      </div>
    </section>
  );
}
