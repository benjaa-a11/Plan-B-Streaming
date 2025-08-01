import { getRadioById, getRadios } from "@/lib/actions";
import RadioView from "@/components/radio-view";
import RadioNotFound from "@/components/radio-not-found";

export const revalidate = 0;

export default async function RadioPlayerPage({ params }: { params: { id: string } }) {
  const [radio, allRadios] = await Promise.all([
    getRadioById(params.id),
    getRadios()
  ]);

  if (!radio) {
    return <RadioNotFound />;
  }
  
  // Get a list of other radios, excluding the current one, limited to 4
  const otherRadios = allRadios.filter(r => r.id !== params.id).slice(0, 4);

  return <RadioView radio={radio} allRadios={allRadios} otherRadios={otherRadios} />;
}
