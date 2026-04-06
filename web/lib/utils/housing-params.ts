import type {
  HousingProfile,
  HousingSearchParams,
  IncomeProfileId,
  HouseholdTypeProfileId,
  AgeProfileId,
  OriginProfileId,
} from '@/lib/types/discrimination';

const VALID_ORIGINS = new Set<OriginProfileId>([
  'franco_francais', 'europeen_est', 'asiatique', 'maghrebin', 'africain_subsaharien',
]);
const VALID_INCOMES = new Set<IncomeProfileId>([
  'revenus_eleves', 'revenus_moyens', 'revenus_modestes', 'allocataire_apl', 'rsa_minima_sociaux',
]);
const VALID_HOUSEHOLD_TYPES = new Set<HouseholdTypeProfileId>([
  'couple_sans_enfants', 'celibataire', 'famille_2_enfants', 'famille_3_enfants_plus', 'parent_isole',
]);
const VALID_AGES = new Set<AgeProfileId>([
  'adulte_25_45', 'jeune_18_24', 'adulte_45_60', 'senior_60_plus',
]);

function isOriginProfileId(v: string): v is OriginProfileId { return VALID_ORIGINS.has(v as OriginProfileId); }
function isIncomeProfileId(v: string): v is IncomeProfileId { return VALID_INCOMES.has(v as IncomeProfileId); }
function isHouseholdTypeProfileId(v: string): v is HouseholdTypeProfileId { return VALID_HOUSEHOLD_TYPES.has(v as HouseholdTypeProfileId); }
function isAgeProfileId(v: string): v is AgeProfileId { return VALID_AGES.has(v as AgeProfileId); }

export function parseHousingParams(params: HousingSearchParams): HousingProfile | null {
  const { origin, income, householdType, age } = params;
  if (!origin || !income || !householdType || !age) return null;
  if (!isOriginProfileId(origin) || !isIncomeProfileId(income) ||
      !isHouseholdTypeProfileId(householdType) || !isAgeProfileId(age)) return null;
  return { origin, income, householdType, age };
}
