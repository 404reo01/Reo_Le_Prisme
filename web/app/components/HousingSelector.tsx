'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  HousingData,
  EmploymentProfile,
  HousingProfile,
} from '@/lib/types/discrimination';

type Props = { data: HousingData };

// ---------------------------------------------------------------------------
// Axis order constants — preserved from design spec display order
// ---------------------------------------------------------------------------

const ORIGIN_ORDER = [
  'franco_francais',
  'europeen_est',
  'asiatique',
  'maghrebin',
  'africain_subsaharien',
] as const;

const INCOME_ORDER = [
  'revenus_eleves',
  'revenus_moyens',
  'revenus_modestes',
  'allocataire_apl',
  'rsa_minima_sociaux',
] as const;

const HOUSEHOLD_ORDER = [
  'couple_sans_enfants',
  'celibataire',
  'famille_2_enfants',
  'famille_3_enfants_plus',
  'parent_isole',
] as const;

const AGE_ORDER = [
  'adulte_25_45',
  'jeune_18_24',
  'adulte_45_60',
  'senior_60_plus',
] as const;

// ---------------------------------------------------------------------------
// Helper: sort profiles by a given id order array
// ---------------------------------------------------------------------------

function sortByOrder(
  profiles: EmploymentProfile[],
  order: readonly string[],
): EmploymentProfile[] {
  return [...profiles].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
  );
}

// ---------------------------------------------------------------------------
// Hook: typewriter effect
// ---------------------------------------------------------------------------

function useTypewriter(text: string, speed = 35): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      return;
    }
    setDisplayed('');
    let index = 0;
    const id = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

// ---------------------------------------------------------------------------
// Sub-component: individual selector panel
// ---------------------------------------------------------------------------

interface SelectorPanelProps {
  heading: string;
  source: string;
  ariaLabel: string;
  profiles: EmploymentProfile[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  footnote?: string;
  displayedNotes?: string;
}

function SelectorPanel({
  heading,
  source,
  ariaLabel,
  profiles,
  selectedId,
  onSelect,
  footnote,
  displayedNotes,
}: SelectorPanelProps) {
  return (
    <div
      className="panel-8bit flex flex-col gap-3 min-h-0 overflow-y-auto"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      <p className="text-pixel" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
        {heading}
      </p>
      <p
        className="text-pixel"
        style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}
      >
        {source}
      </p>
      <div className="flex flex-col gap-2">
        {profiles.map((profile) => {
          const isSelected = profile.id === selectedId;
          return (
            <button
              key={profile.id}
              role="radio"
              aria-checked={isSelected}
              className={isSelected ? 'btn-8bit btn-8bit--ghost' : 'btn-8bit'}
              style={{ textAlign: 'left', width: '100%', whiteSpace: 'normal' }}
              onClick={() => onSelect(profile.id)}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', width: '100%' }}>
                <span style={{ flex: 1 }}>
                  <span className="text-pixel" style={{ display: 'block' }}>{profile.label}</span>
                  {profile.example && (
                    <span className="text-description" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-gray)', marginTop: '0.15rem' }}>
                      {profile.example}
                    </span>
                  )}
                </span>
                <span className="text-pixel" style={{ color: 'var(--color-gray)', whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.85rem' }}>
                  ×{profile.coefficient.toFixed(2)}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {footnote && (
        <p
          className="text-description"
          style={{ color: 'var(--color-gray)' }}
        >
          {footnote}
        </p>
      )}
      {displayedNotes && (
        <div
          className="panel-8bit"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-primary)',
          }}
        >
          <p
            className="text-description typewriter-cursor"
            style={{ color: '#000000' }}
          >
            {displayedNotes}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HousingSelector({ data }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<HousingProfile>>({});

  const { impact_coefficients } = data;

  // Sort profiles into design-spec display order
  const originProfiles    = sortByOrder(impact_coefficients.origin.profiles,         ORIGIN_ORDER);
  const incomeProfiles    = sortByOrder(impact_coefficients.income.profiles,         INCOME_ORDER);
  const householdProfiles = sortByOrder(impact_coefficients.household_type.profiles, HOUSEHOLD_ORDER);
  const ageProfiles       = sortByOrder(impact_coefficients.age.profiles,            AGE_ORDER);

  // Determine if all four axes are selected
  const isComplete =
    profile.origin        !== undefined &&
    profile.income        !== undefined &&
    profile.householdType !== undefined &&
    profile.age           !== undefined;

  // Axis selection handlers
  function selectOrigin(id: string) {
    setProfile((prev) => ({ ...prev, origin: id as HousingProfile['origin'] }));
  }
  function selectIncome(id: string) {
    setProfile((prev) => ({ ...prev, income: id as HousingProfile['income'] }));
  }
  function selectHousehold(id: string) {
    setProfile((prev) => ({ ...prev, householdType: id as HousingProfile['householdType'] }));
  }
  function selectAge(id: string) {
    setProfile((prev) => ({ ...prev, age: id as HousingProfile['age'] }));
  }

  // Axis breakdown helpers
  function getAxisCoefficient(
    profiles: EmploymentProfile[],
    selectedId: string | undefined,
  ): string {
    if (selectedId === undefined) return '-.--';
    const found = profiles.find((p) => p.id === selectedId);
    return found ? `×${found.coefficient.toFixed(2)}` : '-.--';
  }

  function getAxisLabel(
    profiles: EmploymentProfile[],
    selectedId: string | undefined,
  ): string {
    if (selectedId === undefined) return '—';
    const found = profiles.find((p) => p.id === selectedId);
    return found ? found.label : '—';
  }

  // Typewriter notes for each axis
  const selectedOriginProfile    = originProfiles.find((p) => p.id === profile.origin);
  const selectedIncomeProfile    = incomeProfiles.find((p) => p.id === profile.income);
  const selectedHouseholdProfile = householdProfiles.find((p) => p.id === profile.householdType);
  const selectedAgeProfile       = ageProfiles.find((p) => p.id === profile.age);

  const displayedOriginNotes    = useTypewriter(selectedOriginProfile?.notes    ?? '');
  const displayedIncomeNotes    = useTypewriter(selectedIncomeProfile?.notes    ?? '');
  const displayedHouseholdNotes = useTypewriter(selectedHouseholdProfile?.notes ?? '');
  const displayedAgeNotes       = useTypewriter(selectedAgeProfile?.notes       ?? '');

  return (
    <main className="scanlines min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 lg:h-full">

        {/* ScreenTitle */}
        <header className="flex flex-col gap-2 flex-shrink-0">
          <h1 className="text-pixel text-glow-green text-base">
            CRÉEZ VOTRE PROFIL LOCATAIRE
          </h1>
          <p className="text-description" style={{ color: 'var(--color-primary)' }}>
            Chaque choix affecte vos chances de trouver un logement — les effets se multiplient.
          </p>
        </header>

        {/* 12-column grid */}
        <div className="grid grid-cols-12 gap-6 items-stretch min-h-0 flex-1">

          {/* LEFT COLUMN — col-span-8 — selectors */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto">

            {/* 2×2 selector grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectorPanel
                heading="ORIGINE — Patronyme & Prénom"
                source="Source : ISM Corum 2021, Défenseur des droits 2022"
                ariaLabel="Sélectionnez l'origine du candidat"
                profiles={originProfiles}
                selectedId={profile.origin}
                onSelect={selectOrigin}
                displayedNotes={displayedOriginNotes}
              />
              <SelectorPanel
                heading="REVENUS — Situation financière"
                source="Source : CNCDH 2021, Défenseur des droits 2022"
                ariaLabel="Sélectionnez la situation financière du candidat"
                profiles={incomeProfiles}
                selectedId={profile.income}
                onSelect={selectIncome}
                displayedNotes={displayedIncomeNotes}
              />
              <SelectorPanel
                heading="FOYER — Composition du ménage"
                source="Source : CNCDH 2021, Défenseur des droits 2022"
                ariaLabel="Sélectionnez la composition du foyer"
                profiles={householdProfiles}
                selectedId={profile.householdType}
                onSelect={selectHousehold}
                displayedNotes={displayedHouseholdNotes}
              />
              <SelectorPanel
                heading="ÂGE — Âge du locataire"
                source="Source : Défenseur des droits 2022"
                ariaLabel="Sélectionnez l'âge du candidat"
                profiles={ageProfiles}
                selectedId={profile.age}
                onSelect={selectAge}
                displayedNotes={displayedAgeNotes}
              />
            </div>

          </div>

          {/* RIGHT COLUMN — col-span-4 — axis summary + submit */}
          <div className="col-span-12 lg:col-span-4 flex flex-col items-center gap-6 lg:sticky lg:top-8 flex-shrink-0">

            {/* Axis breakdown mini-panel */}
            <div className="panel-8bit w-full flex flex-col gap-2">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(5rem, auto) 1fr auto',
                  columnGap: '1rem',
                  rowGap: '0.35rem',
                  alignItems: 'baseline',
                }}
              >
                {(
                  [
                    { name: 'Origine', profiles: originProfiles,    selectedId: profile.origin },
                    { name: 'Revenus', profiles: incomeProfiles,    selectedId: profile.income },
                    { name: 'Foyer',   profiles: householdProfiles, selectedId: profile.householdType },
                    { name: 'Âge',     profiles: ageProfiles,       selectedId: profile.age },
                  ] as const
                ).map(({ name, profiles, selectedId }) => (
                  <Fragment key={name}>
                    <span
                      className="text-pixel"
                      style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}
                    >
                      {name}
                    </span>
                    <span
                      className="text-description"
                      style={{ color: 'var(--color-text-dark)', fontSize: '0.95rem' }}
                    >
                      {getAxisLabel(profiles, selectedId)}
                    </span>
                    <span
                      className="text-pixel"
                      style={{ fontSize: '0.7rem', color: 'var(--color-gray)', textAlign: 'right' }}
                    >
                      {getAxisCoefficient(profiles, selectedId)}
                    </span>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* SubmitButton */}
            <button
              className="btn-8bit btn-8bit--large"
              aria-label="Lancer la simulation logement avec ce profil"
              aria-disabled={!isComplete}
              style={!isComplete ? { pointerEvents: 'none', opacity: 0.4 } : undefined}
              onClick={
                isComplete
                  ? () => {
                      const p = profile as HousingProfile;
                      router.push(
                        `/logement/resultats?origin=${p.origin}&income=${p.income}&householdType=${p.householdType}&age=${p.age}`,
                      );
                    }
                  : undefined
              }
            >
              <span className="text-pixel">SIMULER →</span>
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
