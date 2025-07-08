import { getAllChannelsForAdmin } from "@/lib/actions";
import ChannelDataTable from "@/components/admin/channel-data-table";

export const dynamic = 'force-dynamic';

export default async function AdminChannelsPage() {
  // Fetch all channels for the admin panel, including hidden ones.
  const channels = await getAllChannelsForAdmin(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestionar Canales</h1>
        <p className="text-muted-foreground">
          Añade, edita o elimina los canales de televisión de la aplicación.
        </p>
      </div>
      <ChannelDataTable data={channels} />
    </div>
  );
}
