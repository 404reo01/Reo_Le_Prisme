// ---------------------------------------------------------------------------
// Strict ID unions — derived from employment.json profile `id` fields
// ---------------------------------------------------------------------------

export type OriginProfileId =
  | 'franco_francais'
  | 'europeen_est'
  | 'asiatique'
  | 'maghrebin'
  | 'africain_subsaharien';

export type ResidenceProfileId =
  | 'quartier_affluent'
  | 'hors_qpv'
  | 'qpv_moderé'
  | 'qpv_grand_ensemble';

export type GenderProfileId =
  | 'homme_secteur_mixte'
  | 'femme_secteur_mixte'
  | 'homme_secteur_feminise'
  | 'femme_secteur_masculinise'
  | 'femme_25_35_mixte';

export type EducationProfileId =
  | 'sans_diplome'
  | 'bac_pro'
  | 'bac3_universite'
  | 'bac5_universite'
  | 'grande_ecole';

// ---------------------------------------------------------------------------
// Player choices
// ---------------------------------------------------------------------------

export interface PlayerProfile {
  origin: OriginProfileId;
  residence: ResidenceProfileId;
  gender: GenderProfileId;
  education: EducationProfileId;
}

// ---------------------------------------------------------------------------
// Scoring output
// ---------------------------------------------------------------------------

export interface AxisScore {
  axisName: string;
  profileId: OriginProfileId | ResidenceProfileId | GenderProfileId | EducationProfileId;
  coefficient: number;
  label: string;
}

export interface ScoringResult {
  rawScore: number;
  cappedScore: number;
  axisBreakdown: AxisScore[];
  interpretation: string;
}

// ---------------------------------------------------------------------------
// Generic server action result
// ---------------------------------------------------------------------------

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ---------------------------------------------------------------------------
// Shape of employment.json
// ---------------------------------------------------------------------------

export interface EmploymentProfile {
  id: string;
  label: string;
  coefficient: number;
  example?: string;
  callback_rate_pct?: number;
  notes?: string;
}

export interface EmploymentAxis {
  description: string;
  reference_profile: string;
  source_ids: string[];
  profiles: EmploymentProfile[];
}

export interface EmploymentData {
  meta: {
    title: string;
    description: string;
    sources: {
      id: string;
      name: string;
      url: string;
      notes: string;
    }[];
    methodology: string;
    last_updated: string;
  };
  impact_coefficients: {
    origin: EmploymentAxis;
    residence: EmploymentAxis;
    gender: EmploymentAxis;
    education: EmploymentAxis;
  };
  combination_rules: {
    description: string;
    formula: string;
    cap: {
      min: number;
      max: number;
      notes: string;
    };
    example_worst_case: {
      label: string;
      origin: OriginProfileId;
      residence: ResidenceProfileId;
      gender: GenderProfileId;
      education: EducationProfileId;
      score: number;
      interpretation: string;
    };
    example_best_case: {
      label: string;
      origin: OriginProfileId;
      residence: ResidenceProfileId;
      gender: GenderProfileId;
      education: EducationProfileId;
      score: number;
      interpretation: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Simulation page — URL search params shape
// ---------------------------------------------------------------------------

export interface SimulationSearchParams {
  origin?: string;
  residence?: string;
  gender?: string;
  education?: string;
}

// ---------------------------------------------------------------------------
// Simulation results — enriched data for rendering
// ---------------------------------------------------------------------------

export interface SimulationResult {
  profile: PlayerProfile;
  scoring: ScoringResult;
  /** Estimated callbacks for every 100 CVs sent (based on reference rate 24.7%) */
  callbacksPer100: number;
  /** Reference profile callbacks per 100 CVs (always 24.7) */
  referenceCallbacksPer100: number;
  /**
   * Extra CVs this profile must send to receive the same number of callbacks
   * as the reference profile per 100 CVs.
   * Formula: Math.round(100 / callbacksPer100 - 100 / referenceCallbacksPer100), min 0.
   * 0 when callbacksPer100 >= referenceCallbacksPer100.
   */
  extraCvs: number;
  /** cappedScore * referenceRate, rounded to one decimal place */
  responseRatePct: number;
}

// ---------------------------------------------------------------------------
// Housing JSON shape — axis keys differ from EmploymentData
// ---------------------------------------------------------------------------

export interface HousingAxis {
  description: string;
  reference_profile: string;
  source_ids: string[];
  profiles: EmploymentProfile[];
}

export interface HousingData {
  meta: {
    title: string;
    description: string;
    sources: {
      id: string;
      name: string;
      url: string;
      notes: string;
    }[];
    methodology: string;
    last_updated: string;
  };
  impact_coefficients: {
    origin: HousingAxis;
    income: HousingAxis;
    household_type: HousingAxis;
    age: HousingAxis;
  };
  combination_rules: {
    description?: string;
    formula?: string;
    cap: {
      min: number;
      max: number;
      notes?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Housing domain — strict ID unions derived from housing.json profile `id` fields
// ---------------------------------------------------------------------------

export type IncomeProfileId =
  | 'revenus_eleves'
  | 'revenus_moyens'
  | 'revenus_modestes'
  | 'allocataire_apl'
  | 'rsa_minima_sociaux';

export type HouseholdTypeProfileId =
  | 'couple_sans_enfants'
  | 'celibataire'
  | 'famille_2_enfants'
  | 'famille_3_enfants_plus'
  | 'parent_isole';

export type AgeProfileId =
  | 'adulte_25_45'
  | 'jeune_18_24'
  | 'adulte_45_60'
  | 'senior_60_plus';

export interface HousingProfile {
  origin: OriginProfileId;
  income: IncomeProfileId;
  householdType: HouseholdTypeProfileId;
  age: AgeProfileId;
}

// ---------------------------------------------------------------------------
// Housing page — URL search params shape
// ---------------------------------------------------------------------------

export interface HousingSearchParams {
  origin?: string;
  income?: string;
  householdType?: string;
  age?: string;
}

// ---------------------------------------------------------------------------
// Housing results — enriched data for rendering
// ---------------------------------------------------------------------------

export interface HousingResult {
  profile: HousingProfile;
  scoring: ScoringResult;
  /** Estimated visit grants per 100 applications sent */
  visitsPer100: number;
  /** Reference profile visits per 100 applications */
  referenceVisitsPer100: number;
  /**
   * Extra applications this profile must send to receive the same number of
   * visit grants as the reference profile per 100 applications.
   * Formula: Math.round(100 / visitsPer100 - 100 / referenceVisitsPer100), min 0.
   * 0 when visitsPer100 >= referenceVisitsPer100.
   */
  extraApplications: number;
  /** cappedScore * referenceRate, rounded to one decimal place */
  responseRatePct: number;
}

// ---------------------------------------------------------------------------
// Character accessories — visual overlays for CharacterSprite
// ---------------------------------------------------------------------------

export type AccessoryLayer = 'head' | 'body' | 'face';

export interface CharacterAccessory {
  id: string;
  layer: AccessoryLayer;
  cssClass: string;
}

// ---------------------------------------------------------------------------
// Impact statistics — derived display values for the simulation page
// ---------------------------------------------------------------------------

export interface ImpactStats {
  /** Estimated response rate for this profile (%) */
  responseRatePct: number;
  /** Baseline reference rate, always 24.7 */
  referenceRatePct: number;
  /** Extra CVs this profile must send to match the reference callback count */
  extraCvs: number;
  /** Estimated callbacks received per 100 CVs sent */
  callbacksPer100: number;
}
