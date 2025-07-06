import { getRadioById, getRadios } from "@/lib/actions";
import RadioView from "@/components/radio-view";
import RadioNotFound from "@/components/radio-not-found";

export const revalidate = 0;

export default async function RadioPlayerPage({ params }: { params: { id: string } }) {
  const radio = await getRadioById(params.id);

  if (!radio) {
    return <RadioNotFound />;
  }
  
  const otherRadios = (await getRadios()).filter(r => r.id !== params.id).slice(0, 5);

  return <RadioView radio={radio} otherRadios={otherRadios} />;
}
