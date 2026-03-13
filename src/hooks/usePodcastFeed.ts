import { useState, useEffect, useCallback } from "react";
import type { GermanPodcastItem } from "../data/german-podcasts";
import type { PodcastChannelInfo } from "../services/podcastFeedApi";
import { fetchPodcastFeed } from "../services/podcastFeedApi";

export interface UsePodcastFeedResult {
  items: GermanPodcastItem[];
  channel: PodcastChannelInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches the Easy German podcast feed from the proxy URL.
 * Returns channel info, items, and loading/error state.
 */
export function usePodcastFeed(): UsePodcastFeedResult {
  const [items, setItems] = useState<GermanPodcastItem[]>([]);
  const [channel, setChannel] = useState<PodcastChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPodcastFeed();
      setItems(data.items);
      setChannel(data.channel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load podcast feed");
      setItems([]);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, channel, loading, error, refetch: load };
}
