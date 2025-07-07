import { getTeams } from "@/lib/actions";
import TeamDataTable from "@/components/admin/team-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
  const teams = await getTeams(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Equipos</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina los equipos de la aplicación.
        </p>
      </div>
      <TeamDataTable data={teams} />
    </div>
  );
}
