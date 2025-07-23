import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tv, Film, Radio, Shield, Users, CalendarDays } from "lucide-react";
import { getChannels, getMovies, getRadios, getTeams, getTournaments } from "@/lib/actions";
import { getAdminAgenda } from "@/lib/admin-actions";

export default async function AdminDashboard() {
  const [channels, movies, radios, teams, tournaments, agenda] = await Promise.all([
    getChannels(true),
    getMovies(true),
    getRadios(true),
    getTeams(true),
    getTournaments(true),
    getAdminAgenda()
  ]);

  const stats = [
    { title: "Canales", count: channels.length, icon: Tv, color: "text-sky-500" },
    { title: "Películas", count: movies.length, icon: Film, color: "text-orange-500" },
    { title: "Radios", count: radios.length, icon: Radio, color: "text-rose-500" },
    { title: "Partidos", count: agenda.length, icon: CalendarDays, color: "text-amber-500" },
    { title: "Torneos", count: tournaments.length, icon: Shield, color: "text-emerald-500" },
    { title: "Equipos", count: teams.length, icon: Users, color: "text-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Una vista general del contenido de Plan B Streaming.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground">
                registros totales
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
