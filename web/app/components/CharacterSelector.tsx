'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  EmploymentData,
  EmploymentProfile,
  PlayerProfile,
} from '@/lib/types/discrimination';
import CharacterSprite from '@/app/components/ui/CharacterSprite';

type Props = { data: EmploymentData };

// ---------------------------------------------------------------------------
// Axis order constants — preserved from the design spec display order
// ---------------------------------------------------------------------------

const ORIGIN_ORDER = [
  'franco_francais',
  'europeen_est',
  'asiatique',
  'maghrebin',
  'africain_subsaharien',
] as const;

const RESIDENCE_ORDER = [
  'quartier_affluent',
  'hors_qpv',
  'qpv_moderé',
  'qpv_grand_ensemble',
] as const;

const GENDER_ORDER = [
  'homme_secteur_mixte',
  'femme_secteur_mixte',
  'homme_secteur_feminise',
  'femme_secteur_masculinise',
  'femme_25_35_mixte',
] as const;

const EDUCATION_ORDER = [
  'sans_diplome',
  'bac_pro',
  'bac3_universite',
  'bac5_universite',
  'grande_ecole',
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
  ariaLabel: string;
  profiles: EmploymentProfile[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  footnote?: string;
}

function SelectorPanel({
  heading,
  ariaLabel,
  profiles,
  selectedId,
  onSelect,
  footnote,
}: SelectorPanelProps) {
  return (
    <div
      className="panel-pixel flex flex-col gap-3 min-h-0 overflow-y-auto"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      <p className="text-pixel" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
        {heading}
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
              style={{ textAlign: 'left', width: '100%', whiteSpace: 'normal', boxShadow: 'none' }}
              onClick={() => onSelect(profile.id)}
            >
              <span className="text-pixel" style={{ display: 'block' }}>{profile.label}</span>
              {profile.example && (
                <span className="text-description" style={{ display: 'block', fontSize: '0.85rem', opacity: 0.8, marginTop: '0.15rem' }}>
                  {profile.example}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {footnote && (
        <p
          className="text-description"
          style={{ color: 'var(--color-text-dark)', fontSize: '0.85rem', opacity: 0.8 }}
        >
          {footnote}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type AxisKey = 'origin' | 'residence' | 'gender' | 'education';

export default function CharacterSelector({ data }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<PlayerProfile>>({});
  const [lastTouchedAxis, setLastTouchedAxis] = useState<AxisKey | null>(null);

  const { impact_coefficients } = data;

  // Sort profiles into design-spec display order
  const originProfiles    = sortByOrder(impact_coefficients.origin.profiles,    ORIGIN_ORDER);
  const residenceProfiles = sortByOrder(impact_coefficients.residence.profiles, RESIDENCE_ORDER);
  const genderProfiles    = sortByOrder(impact_coefficients.gender.profiles,    GENDER_ORDER);
  const educationProfiles = sortByOrder(impact_coefficients.education.profiles, EDUCATION_ORDER);

  // Determine if all four axes are selected
  const isComplete =
    profile.origin    !== undefined &&
    profile.residence !== undefined &&
    profile.gender    !== undefined &&
    profile.education !== undefined;

  // Axis selection handlers — each records which axis was last touched
  function selectOrigin(id: string) {
    setProfile((prev) => ({ ...prev, origin: id as PlayerProfile['origin'] }));
    setLastTouchedAxis('origin');
  }
  function selectResidence(id: string) {
    setProfile((prev) => ({
      ...prev,
      residence: id as PlayerProfile['residence'],
    }));
    setLastTouchedAxis('residence');
  }
  function selectGender(id: string) {
    setProfile((prev) => ({ ...prev, gender: id as PlayerProfile['gender'] }));
    setLastTouchedAxis('gender');
  }
  function selectEducation(id: string) {
    setProfile((prev) => ({
      ...prev,
      education: id as PlayerProfile['education'],
    }));
    setLastTouchedAxis('education');
  }

  // Resolve the note for the last touched axis
  function resolveActiveNote(): string {
    if (lastTouchedAxis === null) return '';
    if (lastTouchedAxis === 'origin') {
      return originProfiles.find((p) => p.id === profile.origin)?.notes ?? '';
    }
    if (lastTouchedAxis === 'residence') {
      return residenceProfiles.find((p) => p.id === profile.residence)?.notes ?? '';
    }
    if (lastTouchedAxis === 'gender') {
      return genderProfiles.find((p) => p.id === profile.gender)?.notes ?? '';
    }
    return educationProfiles.find((p) => p.id === profile.education)?.notes ?? '';
  }

  const displayedNote = useTypewriter(resolveActiveNote());

  return (
    <main className="scanlines min-h-screen lg:h-screen lg:overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8 lg:h-full">

        {/* ScreenTitle */}
        <header className="flex flex-col gap-2 flex-shrink-0">
          <h1 className="text-pixel text-glow-green text-base">
            CRÉE TON PROFIL
          </h1>
          <p className="text-description" style={{ color: 'var(--color-primary)' }}>
            Chaque choix affecte tes chances de rappel — les effets se multiplient.
          </p>
        </header>

        {/* 12-column grid */}
        <div className="grid grid-cols-12 gap-6 items-stretch min-h-0 flex-1">

          {/* LEFT COLUMN — col-span-8 — selectors */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 min-h-0 overflow-y-auto">

            {/* 2×2 selector grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectorPanel
                heading="ORIGINE"
                ariaLabel="Sélectionnez l'origine du candidat"
                profiles={originProfiles}
                selectedId={profile.origin}
                onSelect={selectOrigin}
              />
              <SelectorPanel
                heading="RÉSIDENCE"
                ariaLabel="Sélectionnez le lieu de résidence du candidat"
                profiles={residenceProfiles}
                selectedId={profile.residence}
                onSelect={selectResidence}
              />
              <SelectorPanel
                heading="GENRE × SECTEUR"
                ariaLabel="Sélectionnez le genre et le secteur du candidat"
                profiles={genderProfiles}
                selectedId={profile.gender}
                onSelect={selectGender}
              />
              <SelectorPanel
                heading="DIPLÔME"
                ariaLabel="Sélectionnez le niveau de diplôme du candidat"
                profiles={educationProfiles}
                selectedId={profile.education}
                onSelect={selectEducation}
              />
            </div>

            {/* Shared typewriter note zone */}
            <p
              className="text-description flex-shrink-0"
              style={{ minHeight: '2.5rem', fontSize: '0.8rem', color: 'var(--color-gray)' }}
            >
              {displayedNote}
            </p>

          </div>

          {/* RIGHT COLUMN — col-span-4 — sprite + submit */}
          <div className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-0">

            {/* Sprite panel */}
            <div className="panel-8bit flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden gap-3">
              <p
                className="text-pixel text-xs"
                style={{ color: 'var(--color-primary)' }}
              >
                CANDIDAT(E)
              </p>
              <CharacterSprite
                origin={profile.origin}
                gender={profile.gender}
              />
            </div>

            {/* Submit button */}
            <button
              className={`btn-8bit btn-8bit--large w-full mt-auto flex-shrink-0${isComplete ? ' btn-8bit--danger' : ''}`}
              disabled={!isComplete}
              aria-label="Lancer la simulation avec ce profil"
              onClick={
                isComplete
                  ? () => {
                      const p = profile as PlayerProfile;
                      router.push(
                        `/simulation?origin=${p.origin}&residence=${p.residence}&gender=${p.gender}&education=${p.education}`,
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
