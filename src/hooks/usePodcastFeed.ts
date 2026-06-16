import { useState, useEffect, useCallback, useMemo } from "react";
import type { GermanPodcastItem } from "../data/german-podcasts";
import type {
  PodcastChannelInfo,
  FetchPodcastFeedOptions,
} from "../services/podcastFeedApi";
import {
  fetchPodcastFeed,
  fetchPodcastFeedFromUrl,
} from "../services/podcastFeedApi";

export interface UsePodcastFeedResult {
  items: GermanPodcastItem[];
  channel: PodcastChannelInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UsePodcastFeedConfig extends FetchPodcastFeedOptions {
  /** Optional feed URL. When omitted, defaults to the Easy German feed. */
  feedUrl?: string;
}

/**
 * Fetches a podcast RSS feed and exposes channel info, items and loading/error state.
 *
 * Defaults to the Easy German feed (preserves backward compatibility);
 * pass `{ feedUrl, subtitle, defaultChannelTitle }` to point at any other feed.
 */
export function usePodcastFeed(
  config?: UsePodcastFeedConfig,
): UsePodcastFeedResult {
  const [items, setItems] = useState<GermanPodcastItem[]>([]);
  const [channel, setChannel] = useState<PodcastChannelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const feedUrl = config?.feedUrl;
  const subtitle = config?.subtitle;
  const defaultChannelTitle = config?.defaultChannelTitle;

  const fetchOptions = useMemo<FetchPodcastFeedOptions>(
    () => ({ subtitle, defaultChannelTitle }),
    [subtitle, defaultChannelTitle],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = feedUrl
        ? await fetchPodcastFeedFromUrl(feedUrl, fetchOptions)
        : await fetchPodcastFeed();
      setItems(data.items);
      setChannel(data.channel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load podcast feed");
      setItems([]);
      setChannel(null);
    } finally {
      setLoading(false);
    }
  }, [feedUrl, fetchOptions]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, channel, loading, error, refetch: load };
}
