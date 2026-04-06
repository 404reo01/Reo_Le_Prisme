'use server';

import { computeScore } from '@/lib/scoring';
import { getEmploymentData } from '@/lib/data-access/employment';
import type {
  PlayerProfile,
  ScoringResult,
  SimulationResult,
  ActionResult,
} from '@/lib/types/discrimination';
import { REFERENCE_RATE } from '@/lib/constants';

export async function computeScoreAction(
  profile: PlayerProfile,
): Promise<ActionResult<ScoringResult>> {
  try {
    const data = await getEmploymentData();
    const result = computeScore(profile, data);
    return { success: true, data: result };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}

/**
 * Returns a fully enriched SimulationResult for the given player profile.
 * Contract: pure input/output — no side effects outside of data fetching.
 */
export async function computeSimulationAction(
  profile: PlayerProfile,
): Promise<ActionResult<SimulationResult>> {
  try {
    const data = await getEmploymentData();
    const scoring = computeScore(profile, data);

    const callbacksPer100 =
      Math.round(scoring.cappedScore * REFERENCE_RATE * 10) / 10;
    const referenceCallbacksPer100 = REFERENCE_RATE;
    const responseRatePct = callbacksPer100;
    const extraCvs =
      callbacksPer100 >= REFERENCE_RATE
        ? 0
        : Math.round(100 / callbacksPer100 - 100 / REFERENCE_RATE);

    return {
      success: true,
      data: {
        profile,
        scoring,
        callbacksPer100,
        referenceCallbacksPer100,
        responseRatePct,
        extraCvs,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}
