import type {
  CharacterAccessory,
  OriginProfileId,
  EducationProfileId,
  GenderProfileId,
  PlayerProfile,
} from '@/lib/types/discrimination';

// ---------------------------------------------------------------------------
// Origin → head accessory mapping
// ---------------------------------------------------------------------------

const ORIGIN_HEAD: Readonly<Record<OriginProfileId, string | null>> = {
  franco_francais: null,
  europeen_est: 'accessory-head-europeen-est',
  asiatique: 'accessory-head-asiatique',
  maghrebin: 'accessory-head-maghrebin',
  africain_subsaharien: 'accessory-head-africain-subsaharien',
};

// ---------------------------------------------------------------------------
// Education → body accessory mapping
// ---------------------------------------------------------------------------

const EDUCATION_BODY: Readonly<Record<EducationProfileId, string | null>> = {
  sans_diplome: 'accessory-body-sans-diplome',
  bac_pro: 'accessory-body-bac-pro',
  bac3_universite: 'accessory-body-bac3',
  bac5_universite: 'accessory-body-bac5',
  grande_ecole: 'accessory-body-grande-ecole',
};

// ---------------------------------------------------------------------------
// Gender → face accessory mapping (optional — only certain profiles)
// ---------------------------------------------------------------------------

const GENDER_FACE: Readonly<Partial<Record<GenderProfileId, string>>> = {
  femme_secteur_masculinise: 'accessory-face-femme-masculinise',
  femme_25_35_mixte: 'accessory-face-femme-25-35',
};

// ---------------------------------------------------------------------------
// Pure function — builds the list of applicable accessories for a profile
// ---------------------------------------------------------------------------

export function getCharacterAccessories(profile: PlayerProfile): CharacterAccessory[] {
  const accessories: CharacterAccessory[] = [];

  const headClass = ORIGIN_HEAD[profile.origin];
  if (headClass !== null) {
    accessories.push({ id: `head-${profile.origin}`, layer: 'head', cssClass: headClass });
  }

  const bodyClass = EDUCATION_BODY[profile.education];
  if (bodyClass !== null) {
    accessories.push({ id: `body-${profile.education}`, layer: 'body', cssClass: bodyClass });
  }

  const faceClass = GENDER_FACE[profile.gender];
  if (faceClass !== undefined) {
    accessories.push({ id: `face-${profile.gender}`, layer: 'face', cssClass: faceClass });
  }

  return accessories;
}
