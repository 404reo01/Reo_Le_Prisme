import { getHousingData } from '@/lib/data-access/housing';
import HousingSelector from '@/app/components/HousingSelector';

export default async function LogementPage() {
  const data = await getHousingData();
  return <HousingSelector data={data} />;
}
