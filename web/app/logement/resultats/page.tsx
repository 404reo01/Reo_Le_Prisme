import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getHousingData } from '@/lib/data-access/housing';
import { parseHousingParams } from '@/lib/utils/housing-params';
import ImpactSection from '@/app/components/ui/ImpactSection';
import type { HousingData, HousingSearchParams, ImpactStats } from '@/lib/types/discrimination';
import { REFERENCE_RATE } from '@/lib/constants';

interface PageProps {
  searchParams: Promise<HousingSearchParams>;
}

// ---------------------------------------------------------------------------
// Score color helpers
// ---------------------------------------------------------------------------

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

function getInterpretation(score: number): string {
  if (score < 0.5) return 'Discrimination sévère — vos chances sont drastiquement réduites.';
  if (score < 0.75) return 'Discrimination significative — vous recevez bien moins de visites.';
  if (score < 0.95) return 'Discrimination modérée — vous êtes pénalisé(e) à dossier égal.';
  if (score < 1.05) return 'Profil neutre — pas d\'avantage ni de désavantage statistique.';
  return 'Profil avantagé — vous obtenez statistiquement plus de visites.';
}

// ---------------------------------------------------------------------------
// Axis display labels
// ---------------------------------------------------------------------------

const AXIS_DISPLAY: Record<string, string> = {
  origin:         'Origine',
  income:         'Revenus',
  household_type: 'Foyer',
  age:            'Âge',
};

function buildCallout(score: number): string {
  const visitRate = Math.round(score * REFERENCE_RATE * 10) / 10;
  if (score >= 1.02) {
    const advantagePct = Math.round((score - 1) * 100);
    return `Ce profil est statistiquement avantagé de ${advantagePct}\u00a0% dans l'accès au logement en France. Sur 100 dossiers déposés, vous obtenez environ ${visitRate} visites contre ${REFERENCE_RATE} pour le profil de référence.`;
  }
  if (score >= 0.95) {
    return `Ce profil est proche du taux de référence. Sur 100 dossiers déposés, vous obtenez environ ${visitRate} visites contre ${REFERENCE_RATE} pour le profil de référence.`;
  }
  const discriminationPct = Math.round((1 - score) * 100);
  return `Avec ce profil, vous êtes discriminé·e à hauteur de ${discriminationPct}\u00a0% dans l'accès au logement en France. Sur 100 dossiers déposés, vous obtenez environ ${visitRate} visites contre ${REFERENCE_RATE} pour le profil de référence.`;
}

export default async function LogementResultatsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profile = parseHousingParams(params);

  if (!profile) {
    redirect('/logement');
  }

  const data: HousingData = await getHousingData();

  const { impact_coefficients, combination_rules } = data;

  const axes = [
    { axisKey: 'origin',         axis: impact_coefficients.origin,         profileId: profile.origin },
    { axisKey: 'income',         axis: impact_coefficients.income,         profileId: profile.income },
    { axisKey: 'household_type', axis: impact_coefficients.household_type, profileId: profile.householdType },
    { axisKey: 'age',            axis: impact_coefficients.age,            profileId: profile.age },
  ];

  const rawScore = axes.reduce((product, { axis, profileId }) => {
    const found = axis.profiles.find((p) => p.id === profileId);
    return product * (found?.coefficient ?? 1);
  }, 1);

  const cappedScore = Math.min(
    combination_rules.cap.max,
    Math.max(combination_rules.cap.min, rawScore),
  );

  const visitsPer100 = Math.round(cappedScore * REFERENCE_RATE * 10) / 10;
  const responseRatePct = visitsPer100;
  const referenceRatePct = REFERENCE_RATE;
  const extraCvs =
    visitsPer100 >= REFERENCE_RATE
      ? 0
      : Math.max(0, Math.round(100 / visitsPer100 - 100 / REFERENCE_RATE));

  const scoreColor = getScoreColor(cappedScore);
  const scoreGlowClass = getScoreGlowClass(cappedScore);
  const interpretation = getInterpretation(cappedScore);
  const calloutText = buildCallout(cappedScore);

  const stats: ImpactStats = {
    responseRatePct,
    referenceRatePct,
    extraCvs,
    callbacksPer100: visitsPer100,
  };

  return (
    <main className="scanlines min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <header className="flex flex-col gap-2">
          <h1 className="text-pixel text-glow-green text-base">
            RÉSULTATS — LOGEMENT
          </h1>
          <p className="text-description" style={{ color: 'var(--color-primary)' }}>
            Résultats pour le profil construit — basés sur des études françaises contrôlées.
          </p>
        </header>

        {/* Main grid: score + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Score panel — spans 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Score card */}
            <div
              className="panel-8bit flex flex-col gap-4"
              role="status"
              aria-label="Score de visite simulé"
            >
              <p className="text-pixel" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                SCORE DE VISITE
              </p>

              <p
                className={`text-pixel text-center ${scoreGlowClass}`}
                style={{ fontSize: '3.5rem', color: scoreColor }}
              >
                {cappedScore.toFixed(2)}
              </p>

              <p
                className="text-pixel text-center text-xs"
                style={{ color: scoreColor }}
              >
                ≈ {Math.round(cappedScore * 100)} % du profil de référence
              </p>

              <p className="text-description text-center" style={{ color: 'var(--color-text-dark)' }}>
                {interpretation}
              </p>
            </div>

            {/* Discrimination callout */}
            <div
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

            {/* Impact section */}
            <ImpactSection stats={stats} scoreColor={scoreColor} scoreGlowClass={scoreGlowClass} />

            {/* Visit stats */}
            <div className="panel-8bit flex flex-col gap-4">
              <p className="text-pixel" style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                VISITES SUR 100 CANDIDATURES
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* This profile */}
                <div
                  className="panel-8bit p-3 sm:p-8 flex flex-col items-center gap-2"
                  style={{ border: `2px solid ${scoreColor}`, boxShadow: `4px 4px 0 0 var(--color-primary-dim)` }}
                >
                  <p className="text-pixel text-xs" style={{ color: 'var(--color-primary)' }}>CE PROFIL</p>
                  <p
                    className={`text-pixel ${scoreGlowClass}`}
                    style={{ fontSize: '2rem', color: scoreColor }}
                  >
                    {visitsPer100}
                  </p>
                  <p className="text-description" style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', textAlign: 'center' }}>
                    visites estimées
                  </p>
                </div>

                {/* Reference profile */}
                <div className="panel-8bit p-3 sm:p-8 flex flex-col items-center gap-2">
                  <p className="text-pixel text-xs" style={{ color: 'var(--color-primary)' }}>RÉFÉRENCE</p>
                  <p
                    className="text-pixel text-glow-green"
                    style={{ fontSize: '2rem', color: 'var(--color-primary)' }}
                  >
                    {REFERENCE_RATE}
                  </p>
                  <p className="text-description" style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)', textAlign: 'center' }}>
                    visites estimées
                  </p>
                </div>
              </div>

              <p className="text-description" style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>
                Taux de référence : {REFERENCE_RATE} % (couple sans enfants, Franco-Français, revenus élevés, 25–45 ans — ISM Corum 2021).
              </p>
            </div>

            {/* Axis breakdown */}
            <div className="panel-8bit flex flex-col gap-3">
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
                {axes.map(({ axisKey, axis, profileId }) => {
                  const found = axis.profiles.find((p) => p.id === profileId);
                  const label = found?.label ?? profileId;

                  return (
                    <Fragment key={axisKey}>
                      <span
                        className="text-pixel"
                        style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}
                      >
                        {AXIS_DISPLAY[axisKey] ?? axisKey}
                      </span>
                      <span
                        className="text-description"
                        style={{ color: 'var(--color-text-dark)', fontSize: '0.95rem' }}
                      >
                        {label}
                      </span>
                    </Fragment>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right column — CTA */}
          <div className="flex flex-col items-center gap-6 lg:sticky lg:top-8">
            <Link
              href="/logement"
              className="btn-8bit btn-8bit--large"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
            >
              <span className="text-pixel">← REJOUER</span>
            </Link>
          </div>

        </div>

        {/* Sources footer */}
        <footer
          className="panel-8bit flex flex-col gap-2"
          style={{ background: 'transparent', border: '1px solid var(--color-gray-dim)', boxShadow: 'none' }}
        >
          <p className="text-pixel" style={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}>
            SOURCES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {data.meta.sources.map((src) => (
              <p key={src.id} className="text-description" style={{ fontSize: '0.8rem', color: 'var(--color-surface-dim)' }}>
                {src.id} — {src.name} ({src.notes})
              </p>
            ))}
          </div>
        </footer>

      </div>
    </main>
  );
}
