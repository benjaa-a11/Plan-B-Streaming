import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, Users, Eye, Clock, Hourglass } from "lucide-react";
import TrafficSourceChart from "@/components/admin/analytics/traffic-source-chart";
import UserActivityChart from "@/components/admin/analytics/user-activity-chart";

// Simulación de datos de analíticas
const analyticsData = {
    activeUsers: 42,
    visitsToday: 1873,
    avgSessionDuration: "3m 45s",
    bounceRate: "27.4%",
    userActivity: [
        { date: "Hace 7d", users: 1200 },
        { date: "Hace 6d", users: 1500 },
        { date: "Hace 5d", users: 1400 },
        { date: "Hace 4d", users: 1800 },
        { date: "Hace 3d", users: 1600 },
        { date: "Hace 2d", users: 2100 },
        { date: "Hoy", users: 1873 },
    ],
    trafficSources: [
        { name: "Directo", value: 45, fill: "hsl(var(--chart-1))" },
        { name: "Búsqueda Org.", value: 30, fill: "hsl(var(--chart-2))" },
        { name: "Referidos", value: 15, fill: "hsl(var(--chart-3))" },
        { name: "Social", value: 10, fill: "hsl(var(--chart-4))" },
    ],
    popularPages: [
        { path: "/", title: "Inicio", views: "1.2k" },
        { path: "/peliculas", title: "Películas", views: "980" },
        { path: "/canal/espn", title: "Canal: ESPN", views: "750" },
        { path: "/radio", title: "Radio", views: "500" },
        { path: "/canal/tnt-sports", title: "Canal: TNT Sports", views: "430" },
    ],
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Estadísticas</h1>
                <p className="text-lg text-muted-foreground">Una vista general del tráfico y la interacción en tu aplicación.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="opacity-0 animate-fade-in-up">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">Usuarios en la última hora</p>
                    </CardContent>
                </Card>
                <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visitas Hoy</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analyticsData.visitsToday.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">+20.1% desde ayer</p>
                    </CardContent>
                </Card>
                <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duración Media</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.avgSessionDuration}</div>
                        <p className="text-xs text-muted-foreground">Duración de sesión</p>
                    </CardContent>
                </Card>
                <Card className="opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
                        <Hourglass className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.bounceRate}</div>
                        <p className="text-xs text-muted-foreground">-2% desde ayer</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <CardTitle>Actividad de Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <UserActivityChart data={analyticsData.userActivity} />
                    </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3 opacity-0 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                    <CardHeader>
                        <CardTitle>Fuentes de Tráfico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TrafficSourceChart data={analyticsData.trafficSources} />
                    </CardContent>
                </Card>
            </div>
            
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Páginas Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Página</TableHead>
                                    <TableHead className="text-right">Visitas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {analyticsData.popularPages.map((page) => (
                                    <TableRow key={page.path}>
                                        <TableCell>
                                            <div className="font-medium">{page.title}</div>
                                            <div className="text-sm text-muted-foreground">{page.path}</div>
                                        </TableCell>
                                        <TableCell className="text-right">{page.views}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
