import type {
  PlayerProfile,
  SimulationSearchParams,
  OriginProfileId,
  ResidenceProfileId,
  GenderProfileId,
  EducationProfileId,
} from '@/lib/types/discrimination';

// These sets must stay in sync with the union types in discrimination.ts
const VALID_ORIGINS = new Set<OriginProfileId>([
  'franco_francais',
  'europeen_est',
  'asiatique',
  'maghrebin',
  'africain_subsaharien',
]);

const VALID_RESIDENCES = new Set<ResidenceProfileId>([
  'quartier_affluent',
  'hors_qpv',
  'qpv_moderé',
  'qpv_grand_ensemble',
]);

const VALID_GENDERS = new Set<GenderProfileId>([
  'homme_secteur_mixte',
  'femme_secteur_mixte',
  'homme_secteur_feminise',
  'femme_secteur_masculinise',
  'femme_25_35_mixte',
]);

const VALID_EDUCATIONS = new Set<EducationProfileId>([
  'sans_diplome',
  'bac_pro',
  'bac3_universite',
  'bac5_universite',
  'grande_ecole',
]);

function isOriginProfileId(value: string): value is OriginProfileId {
  return VALID_ORIGINS.has(value as OriginProfileId);
}

function isResidenceProfileId(value: string): value is ResidenceProfileId {
  return VALID_RESIDENCES.has(value as ResidenceProfileId);
}

function isGenderProfileId(value: string): value is GenderProfileId {
  return VALID_GENDERS.has(value as GenderProfileId);
}

function isEducationProfileId(value: string): value is EducationProfileId {
  return VALID_EDUCATIONS.has(value as EducationProfileId);
}

/**
 * Parses URL search params into a validated PlayerProfile.
 * Returns null if any required param is missing or invalid.
 */
export function parseSimulationParams(
  params: SimulationSearchParams
): PlayerProfile | null {
  const { origin, residence, gender, education } = params;

  if (
    origin === undefined ||
    residence === undefined ||
    gender === undefined ||
    education === undefined
  ) {
    return null;
  }

  if (
    !isOriginProfileId(origin) ||
    !isResidenceProfileId(residence) ||
    !isGenderProfileId(gender) ||
    !isEducationProfileId(education)
  ) {
    return null;
  }

  return { origin, residence, gender, education };
}
