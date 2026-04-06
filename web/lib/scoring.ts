import type {
  PlayerProfile,
  EmploymentData,
  ScoringResult,
  AxisScore,
} from './types/discrimination';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInterpretation(score: number): string {
  if (score < 0.5) {
    return 'Discrimination sévère — vos chances sont drastiquement réduites.';
  }
  if (score < 0.75) {
    return 'Discrimination significative — vous recevez bien moins de rappels.';
  }
  if (score < 0.95) {
    return 'Discrimination modérée — vous êtes pénalisé(e) à profil égal.';
  }
  if (score < 1.05) {
    return 'Profil neutre — pas d\'avantage ni de désavantage statistique.';
  }
  return 'Profil avantagé — vous recevez statistiquement plus de rappels.';
}

// ---------------------------------------------------------------------------
// Pure scoring function
// ---------------------------------------------------------------------------

export function computeScore(
  profile: PlayerProfile,
  data: EmploymentData,
): ScoringResult {
  const { impact_coefficients, combination_rules } = data;

  const axisEntries: {
    axisName: string;
    axis: typeof impact_coefficients.origin;
    profileId: string;
  }[] = [
    { axisName: 'origin',    axis: impact_coefficients.origin,    profileId: profile.origin },
    { axisName: 'residence', axis: impact_coefficients.residence,  profileId: profile.residence },
    { axisName: 'gender',    axis: impact_coefficients.gender,     profileId: profile.gender },
    { axisName: 'education', axis: impact_coefficients.education,  profileId: profile.education },
  ];

  const axisBreakdown: AxisScore[] = axisEntries.map(({ axisName, axis, profileId }) => {
    const found = axis.profiles.find((p) => p.id === profileId);

    if (!found) {
      throw new Error(
        `Profile id "${profileId}" not found in axis "${axisName}".`,
      );
    }

    return {
      axisName,
      profileId: found.id as AxisScore['profileId'],
      coefficient: found.coefficient,
      label: found.label,
    };
  });

  const rawScore = axisBreakdown.reduce(
    (product, axis) => product * axis.coefficient,
    1,
  );

  const cappedScore = Math.min(
    combination_rules.cap.max,
    Math.max(combination_rules.cap.min, rawScore),
  );

  return {
    rawScore,
    cappedScore,
    axisBreakdown,
    interpretation: getInterpretation(cappedScore),
  };
}
