import { getRadios } from "@/lib/actions";
import RadioDataTable from "@/components/admin/radio-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminRadiosPage() {
  // Fetch all radios, including placeholders if DB is empty, for the admin panel
  const radios = await getRadios(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Radios</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina las estaciones de radio de la aplicación.
        </p>
      </div>
      <RadioDataTable data={radios} />
    </div>
  );
}

    