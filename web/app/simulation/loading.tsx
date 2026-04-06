export default function SimulationLoading() {
  return (
    <>
      <style>{`
        @keyframes typewriter-loading {
          from { width: 0ch }
          to   { width: 20ch }
        }
      `}</style>
      <div
        className="scanlines min-h-screen flex flex-col items-center justify-center gap-8 px-6"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <p
          className="text-pixel text-glow-green"
          style={{ fontSize: '0.75rem', color: 'var(--color-primary)', letterSpacing: '0.1em' }}
        >
          REO LE PRISME
        </p>

        <p
          className="text-pixel"
          style={{
            fontSize: '1rem',
            color: 'var(--color-surface)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '20ch',
            borderRight: '3px solid var(--color-accent)',
            animation: 'typewriter-loading 1.6s steps(20) forwards, cursor-blink 0.8s step-end infinite 1.6s',
          }}
        >
          ANALYSE DES BIAIS...
        </p>

        <div className="w-full max-w-xs flex flex-col gap-2">
          <div className="pixel-loader" aria-hidden="true">
            <div className="pixel-loader__bar" />
          </div>
          <p className="text-pixel text-xs" style={{ color: 'var(--color-gray)', textAlign: 'center' }}>
            CHARGEMENT...
          </p>
        </div>

        <p
          className="text-description text-center"
          style={{ color: 'var(--color-gray)', fontSize: '0.9rem', maxWidth: '28rem' }}
        >
          Calcul de votre score de discrimination...
        </p>
      </div>
    </>
  );
}
