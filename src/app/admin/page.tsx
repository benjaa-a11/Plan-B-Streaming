import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tv, Film, Radio, Shield, Users, CalendarDays } from "lucide-react";

export default function AdminDashboard() {
  const sections = [
    { title: "Canales", description: "Añade, edita o elimina canales de TV en vivo.", href: "/admin/channels", icon: Tv },
    { title: "Películas", description: "Administra el catálogo completo de películas.", href: "/admin/movies", icon: Film },
    { title: "Radios", description: "Administra las estaciones de radio disponibles.", href: "/admin/radios", icon: Radio },
    { title: "Agenda", description: "Gestiona los partidos y eventos deportivos.", href: "/admin/agenda", icon: CalendarDays },
    { title: "Torneos", description: "Administra los torneos y competencias.", href: "/admin/tournaments", icon: Shield },
    { title: "Equipos", description: "Administra los equipos y sus logos.", href: "/admin/teams", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-lg text-muted-foreground">Gestiona todo el contenido de tu aplicación de streaming desde un único lugar.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
            <Card key={section.title}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" /> {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                    <Link href={section.href}>Gestionar {section.title}</Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
