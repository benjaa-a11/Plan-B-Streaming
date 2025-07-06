import { getRadios } from "@/lib/actions";
import RadioBrowser from "@/components/radio-browser";

export const dynamic = 'force-dynamic';

export default async function RadioPage() {
  const radios = await getRadios();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Radios en Vivo</h1>
        <p className="mt-1 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">Sintoniza tus estaciones favoritas.</p>
      </div>
      <RadioBrowser radios={radios} />
    </div>
  );
}
