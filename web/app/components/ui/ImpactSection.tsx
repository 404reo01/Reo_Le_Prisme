import type { ImpactStats } from '@/lib/types/discrimination';

interface Props {
  stats: ImpactStats;
  scoreColor: string;
  scoreGlowClass: string;
}

export default function ImpactSection({ stats, scoreColor, scoreGlowClass }: Props) {
  const { responseRatePct, referenceRatePct, extraCvs } = stats;

  return (
    <section
      aria-label="Impact réel du profil"
      className="panel-8bit flex flex-col gap-4"
      style={{ borderColor: scoreColor }}
    >
      <p className="text-pixel" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
        IMPACT RÉEL
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Cell 1 — Response rate */}
        <div
          className="panel-8bit flex flex-col items-center gap-2"
          aria-label={`Taux de réponse : ${responseRatePct.toFixed(1)} %`}
          style={{ border: `2px solid ${scoreColor}`, padding: '1rem 0.75rem' }}
        >
          <p className="text-pixel text-xs" style={{ color: 'var(--color-gray)' }}>TAUX DE RÉPONSE</p>
          <p className={`text-pixel ${scoreGlowClass}`} style={{ fontSize: '2rem', color: scoreColor }}>
            {responseRatePct.toFixed(1)} %
          </p>
          <p className="text-description" style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textAlign: 'center' }}>
            Taux de réponse
          </p>
        </div>

        {/* Cell 2 — Reference (always green) */}
        <div
          className="panel-8bit flex flex-col items-center gap-2"
          aria-label={`Profil de référence : ${referenceRatePct.toFixed(1)} %`}
          style={{ padding: '1rem 0.75rem' }}
        >
          <p className="text-pixel text-xs" style={{ color: 'var(--color-gray)' }}>RÉFÉRENCE</p>
          <p className="text-pixel text-glow-green" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
            {referenceRatePct.toFixed(1)} %
          </p>
          <p className="text-description" style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textAlign: 'center' }}>
            Profil de référence
          </p>
        </div>

        {/* Cell 3 — Extra effort */}
        <div
          className="panel-8bit flex flex-col items-center gap-2"
          aria-label={`CVs supplémentaires : ${extraCvs}`}
          style={{ border: `2px solid ${scoreColor}`, padding: '1rem 0.75rem' }}
        >
          <p className="text-pixel text-xs" style={{ color: 'var(--color-gray)' }}>EFFORT SUPPL.</p>
          <p
            className={`text-pixel ${extraCvs > 0 ? scoreGlowClass : 'text-glow-green'}`}
            style={{ fontSize: '2rem', color: extraCvs > 0 ? scoreColor : 'var(--color-primary)' }}
          >
            {extraCvs > 0 ? `+${extraCvs}` : '0'} CVs
          </p>
          <p className="text-description" style={{ fontSize: '0.8rem', color: 'var(--color-gray)', textAlign: 'center' }}>
            CVs supplémentaires
          </p>
        </div>
      </div>

      {/* Section footer note */}
      <p className="text-description" style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
        {extraCvs > 0
          ? `Pour obtenir autant de rappels que le profil de référence, ce candidat doit envoyer ${extraCvs} CV${extraCvs > 1 ? 's' : ''} supplémentaire${extraCvs > 1 ? 's' : ''}.`
          : 'Ce profil est au niveau ou au-dessus du profil de référence.'}
      </p>
    </section>
  );
}
