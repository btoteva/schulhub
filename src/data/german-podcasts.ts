export interface GermanPodcastItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  spotifyEpisodeId: string;
  spotifyUrl: string;
}

export const germanPodcasts: GermanPodcastItem[] = [
  {
    id: "3",
    title: "642: 6 Fehler, die auch fortgeschrittene Deutschlerner machen",
    subtitle: "Easy German",
    duration: "28 min",
    spotifyEpisodeId: "55EaAdxl0MZkscnFyMuSoN",
    spotifyUrl: "https://open.spotify.com/episode/55EaAdxl0MZkscnFyMuSoN?si=7c7b41760f684cb2",
  },
  {
    id: "2",
    title: "641: Die 50-Dollar-Odyssee",
    subtitle: "Easy German",
    duration: "32 min",
    spotifyEpisodeId: "1taJR0BdaKcwVpkJ2jzly4",
    spotifyUrl: "https://open.spotify.com/episode/1taJR0BdaKcwVpkJ2jzly4?si=f02d41f145ce4841",
  },
  {
    id: "1",
    title: "Mit dem Gewürzschlüsselanhänger um die Welt",
    subtitle: "Easy German",
    duration: "31 min",
    spotifyEpisodeId: "0WWNqmAGTSHYaVWNQZLtFq",
    spotifyUrl: "https://open.spotify.com/episode/0WWNqmAGTSHYaVWNQZLtFq?si=1801cdfa59cd4dc8",
  },
];
