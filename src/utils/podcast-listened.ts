const STORAGE_KEY = "schulhub-podcast-listened";

function getList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function saveList(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function isPodcastListened(episodeId: string): boolean {
  return getList().includes(episodeId);
}

export function setPodcastListened(episodeId: string, listened: boolean): void {
  const list = getList();
  const has = list.includes(episodeId);
  if (listened && !has) {
    saveList([...list, episodeId]);
  } else if (!listened && has) {
    saveList(list.filter((id) => id !== episodeId));
  }
}

export function togglePodcastListened(episodeId: string): boolean {
  const list = getList();
  const has = list.includes(episodeId);
  if (has) {
    saveList(list.filter((id) => id !== episodeId));
    return false;
  } else {
    saveList([...list, episodeId]);
    return true;
  }
}
