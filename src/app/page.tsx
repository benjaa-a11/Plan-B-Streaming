import { getChannels, getHeroMatches } from "@/lib/actions";
import ChannelBrowser from "@/components/channel-browser";
import MatchesHero from "@/components/matches-hero";

export default async function Home() {
  const [channels, matches] = await Promise.all([
    getChannels(),
    getHeroMatches(),
  ]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {matches.length > 0 && <MatchesHero matches={matches} />}
        <ChannelBrowser channels={channels} />
      </div>
    </>
  );
}
