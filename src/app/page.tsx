import { getChannels, getAgendaMatches } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";
import MatchesHero from "@/components/matches-hero";

export const revalidate = 0; // Force dynamic rendering and no caching

export default async function Home() {
  const [channels, matches] = await Promise.all([
    getChannels(),
    getAgendaMatches(),
  ]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MatchesHero matches={matches} />
        <ChannelBrowser channels={channels} />
      </div>
    </>
  );
}
