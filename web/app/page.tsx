import { getEmploymentData } from '@/lib/data-access/employment';
import CharacterSelector from '@/app/components/CharacterSelector';
import HeroScreen from '@/app/components/HeroScreen';

export default async function Home() {
  const data = await getEmploymentData();
  return (
    <>
      <HeroScreen />
      <section id="simulateur">
        <CharacterSelector data={data} />
      </section>
    </>
  );
}
