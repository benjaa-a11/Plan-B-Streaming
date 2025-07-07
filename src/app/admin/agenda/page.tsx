import { getChannels, getTeams, getTournaments } from "@/lib/actions";
import { getAdminAgenda } from "@/lib/admin-actions";
import AgendaDataTable from "@/components/admin/agenda-data-table";
import type { AdminAgendaMatch } from "@/types";

export const dynamic = 'force-dynamic';

export default async function AdminAgendaPage() {
  // Fetch all necessary data in parallel for the form
  const [agenda, teams, tournaments, channels] = await Promise.all([
    getAdminAgenda(),
    getTeams(true),
    getTournaments(true),
    getChannels(true)
  ]);

  const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));
  const tournamentOptions = tournaments.map(t => ({ value: t.tournamentId, label: t.name }));
  const channelOptions = channels.map(c => ({ value: c.id, label: c.name }));

  // Create lookup maps for efficient data enrichment
  const teamsMap = new Map(teams.map(t => [t.id, t.name]));
  const tournamentsMap = new Map(tournaments.map(t => [t.tournamentId, t.name]));

  // Enrich agenda data with names for display in the data table
  const enrichedAgenda: AdminAgendaMatch[] = agenda.map(match => ({
    ...match,
    team1Name: teamsMap.get(match.team1) || match.team1,
    team2Name: teamsMap.get(match.team2) || match.team2,
    tournamentName: tournamentsMap.get(match.tournamentId) || match.tournamentId,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Agenda</h1>
        <p className="text-muted-foreground">
          Crea, edita o elimina los partidos y eventos deportivos.
        </p>
      </div>
      <AgendaDataTable 
        data={enrichedAgenda}
        teamOptions={teamOptions}
        tournamentOptions={tournamentOptions}
        channelOptions={channelOptions}
      />
    </div>
  );
}
