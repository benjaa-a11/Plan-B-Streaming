import { getTournaments } from "@/lib/actions";
import TournamentDataTable from "@/components/admin/tournament-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminTournamentsPage() {
  const tournaments = await getTournaments(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Torneos</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina las competencias y sus logos.
        </p>
      </div>
      <TournamentDataTable data={tournaments} />
    </div>
  );
}
