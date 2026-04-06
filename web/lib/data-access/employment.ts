import type { EmploymentData } from '@/lib/types/discrimination';
import rawData from '@/data/employment.json';

export async function getEmploymentData(): Promise<EmploymentData> {
  return rawData as EmploymentData;
}
