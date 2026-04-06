import type { HousingData } from '@/lib/types/discrimination';
import rawData from '@/data/housing.json';

export async function getHousingData(): Promise<HousingData> {
  return rawData as HousingData;
}
