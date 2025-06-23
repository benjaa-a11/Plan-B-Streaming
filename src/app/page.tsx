import { getChannels, getTodaysMatches } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";
import MdcHero from "@/components/mdc-hero";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [channels, matches] = await Promise.all([
    getChannels(),
    getTodaysMatches(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <MdcHero matches={matches} />
      <ChannelBrowser channels={channels} />
    </div>
  );
}
