import { getRadios } from "@/lib/actions";
import RadioBrowser from "@/components/radio-browser";

export const dynamic = 'force-dynamic';

export default async function RadioPage() {
  const radios = await getRadios();

  return <RadioBrowser radios={radios} />;
}
