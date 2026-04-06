import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getEmploymentData } from '@/lib/data-access/employment';
import { computeScore } from '@/lib/scoring';
import { parseSimulationParams } from '@/lib/utils/params';
import CharacterSprite from '@/app/components/ui/CharacterSprite';
import type { SimulationSearchParams } from '@/lib/types/discrimination';
import { REFERENCE_RATE } from '@/lib/constants';

interface PageProps {
  searchParams: Promise<SimulationSearchParams>;
}

function getScoreColor(score: number): string {
  if (score < 0.75) return 'var(--color-accent)';
  if (score < 0.95) return 'var(--color-amber)';
  return 'var(--color-primary)';
}

function getScoreGlowClass(score: number): string {
  if (score < 0.75) return 'text-glow-red';
  if (score < 0.95) return 'text-glow-amber';
  return 'text-glow-green';
}

const AXIS_DISPLAY: Record<string, string> = {
  origin:    'Origine',
  residence: 'Résidence',
  gender:    'Genre',
  education: 'Diplôme',
};

function buildCallout(score: number): string {
  const responseRate = Math.round(score * REFERENCE_RATE * 10) / 10;
  if (score >= 1.02) {
    const advantagePct = Math.round((score - 1) * 100);
    return `Ce profil est statistiquement avantagé de ${advantagePct}\u00a0% dans l'accès à l'emploi en France. Sur 100 candidatures, vous obtenez environ ${responseRate} rappels contre ${REFERENCE_RATE} pour le profil de référence.`;
  }
  if (score >= 0.95) {
    return `Ce profil est proche du taux de référence. Sur 100 candidatures, vous obtenez environ ${responseRate} rappels contre ${REFERENCE_RATE} pour le profil de référence.`;
  }
  const discriminationPct = Math.round((1 - score) * 100);
  return `Avec ce profil, vous êtes discriminé·e à hauteur de ${discriminationPct}\u00a0% dans l'accès à l'emploi en France. Sur 100 candidatures, vous obtenez environ ${responseRate} rappels contre ${REFERENCE_RATE} pour le profil de référence.`;
}

export default async function SimulationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = parseSimulationParams(params);

  if (!profile) {
    redirect('/');
  }

  const data = await getEmploymentData();
  const scoring = computeScore(profile, data);

  const scoreColor = getScoreColor(scoring.cappedScore);
  const scoreGlowClass = getScoreGlowClass(scoring.cappedScore);
  const calloutText = buildCallout(scoring.cappedScore);

  return (
    <main className="scanlines min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8 lg:h-full">

        {/* Header */}
        <header className="flex flex-col gap-2 flex-shrink-0">
          <h1 className="text-pixel text-glow-green text-base">
            RÉSULTATS DE SIMULATION
          </h1>
          <p className="text-description" style={{ color: 'var(--color-primary)' }}>
            Résultats pour le profil construit — basés sur des études françaises contrôlées.
          </p>
        </header>

        {/* Main grid: score + sprite */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">

          {/* Score panel — spans 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-h-0 lg:overflow-y-auto lg:h-full">

            {/* Score card */}
            <div
              className="panel-8bit flex flex-col gap-4 flex-shrink-0"
              role="status"
              aria-label="Score de rappel simulé"
            >
              <p className="text-pixel" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                SCORE DE RAPPEL
              </p>

              <p
                className={`text-pixel text-center ${scoreGlowClass}`}
                style={{ fontSize: '3.5rem', color: scoreColor }}
              >
                {scoring.cappedScore.toFixed(2)}
              </p>

              <p
                className="text-pixel text-center text-xs"
                style={{ color: scoreColor }}
              >
                ≈ {Math.round(scoring.cappedScore * 100)} % du profil de référence
              </p>

              <p className="text-description text-center" style={{ color: 'var(--color-text-dark)' }}>
                {scoring.interpretation}
              </p>
            </div>

            {/* Discrimination callout */}
            <div
              className="flex-shrink-0"
              style={{
                background: 'var(--color-bg)',
                borderLeft: `3px solid ${scoreColor}`,
                padding: '1.25rem 1.5rem',
                boxShadow: `4px 4px 0 0 var(--color-gray-dim)`,
              }}
            >
              <p
                className="text-description"
                style={{ color: 'var(--color-surface)', fontSize: '1rem', lineHeight: 2 }}
              >
                {calloutText}
              </p>
            </div>

            {/* Axis breakdown */}
            <div className="panel-8bit flex flex-col gap-3 flex-shrink-0">
              <p className="text-pixel" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                DÉTAIL PAR AXE
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(5.5rem, auto) 1fr',
                  columnGap: '1.25rem',
                  rowGap: '0.6rem',
                  alignItems: 'baseline',
                }}
              >
                {scoring.axisBreakdown.map((axis) => (
                  <Fragment key={axis.axisName}>
                    <span
                      className="text-pixel"
                      style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}
                    >
                      {AXIS_DISPLAY[axis.axisName] ?? axis.axisName}
                    </span>
                    <span
                      className="text-description"
                      style={{ color: 'var(--color-text-dark)', fontSize: '0.95rem' }}
                    >
                      {axis.label}
                    </span>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Sources — single compact line */}
            <p className="text-description flex-shrink-0" style={{ fontSize: '0.75rem', color: 'var(--color-surface-dim)' }}>
              Sources : {data.meta.sources.map((src) => src.name).join(' · ')}
            </p>

          </div>

          {/* Right column — sprite + CTA */}
          <div className="flex flex-col items-center gap-6 flex-shrink-0 lg:sticky lg:top-8">
            <div className="panel-8bit flex flex-col items-center gap-3 w-full">
              <p className="text-pixel text-xs" style={{ color: 'var(--color-primary)' }}>
                CANDIDAT(E)
              </p>
              <CharacterSprite origin={profile.origin} gender={profile.gender} />
            </div>

            <Link
              href="/"
              className="btn-8bit btn-8bit--large"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
            >
              <span className="text-pixel">← REJOUER</span>
            </Link>

            <p className="text-description text-center" style={{ fontSize: '0.75rem', color: 'var(--color-surface-dim)' }}>
              Taux de référence : {REFERENCE_RATE} %
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
