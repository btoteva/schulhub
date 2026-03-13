export interface GermanPodcastItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  spotifyEpisodeId: string;
  spotifyUrl: string;
  /** Direct MP3/audio URL (e.g. from RSS). When set, our player with volume control is used. */
  audioUrl?: string;
}

export const germanPodcasts: GermanPodcastItem[] = [
  {
    id: "7",
    title: "646: Das ist mir Wurst",
    subtitle: "Easy German",
    duration: "30 min",
    spotifyEpisodeId: "6UmwUSXVZN5Q7o5X3cw1Xw",
    spotifyUrl: "https://open.spotify.com/episode/6UmwUSXVZN5Q7o5X3cw1Xw?si=ad2e733d9b5648fe",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp646.mp3?dest-id=3776181",
  },
  {
    id: "6",
    title: "645: Ein Job bei Easy German: Top oder Flop?",
    subtitle: "Easy German",
    duration: "33 min",
    spotifyEpisodeId: "1ZJEJZgHuAq091UvrmSUWR",
    spotifyUrl: "https://open.spotify.com/episode/1ZJEJZgHuAq091UvrmSUWR?si=52eb0cdd7d374904",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp645.mp3?dest-id=3776181",
  },
  {
    id: "5",
    title: "644: Die Deutschen sind einfach überall",
    subtitle: "Easy German",
    duration: "33 min",
    spotifyEpisodeId: "2LgtjOPBTIIM3tMdp0O4hs",
    spotifyUrl: "https://open.spotify.com/episode/2LgtjOPBTIIM3tMdp0O4hs?si=26b4a0fc23a54e4e",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp644.mp3?dest-id=3776181",
  },
  {
    id: "4",
    title: "643: Eine Frage des Erwartungsmanagements",
    subtitle: "Easy German",
    duration: "31 min",
    spotifyEpisodeId: "0qK5YaKX3QeU86RWkyx3dX",
    spotifyUrl: "https://open.spotify.com/episode/0qK5YaKX3QeU86RWkyx3dX?si=45589c1aa687413a",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp643.mp3?dest-id=3776181",
  },
  {
    id: "3",
    title: "642: 6 Fehler, die auch fortgeschrittene Deutschlerner machen",
    subtitle: "Easy German",
    duration: "28 min",
    spotifyEpisodeId: "55EaAdxl0MZkscnFyMuSoN",
    spotifyUrl: "https://open.spotify.com/episode/55EaAdxl0MZkscnFyMuSoN?si=7c7b41760f684cb2",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp642.mp3?dest-id=3776181",
  },
  {
    id: "2",
    title: "641: Die 50-Dollar-Odyssee",
    subtitle: "Easy German",
    duration: "32 min",
    spotifyEpisodeId: "1taJR0BdaKcwVpkJ2jzly4",
    spotifyUrl: "https://open.spotify.com/episode/1taJR0BdaKcwVpkJ2jzly4?si=f02d41f145ce4841",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp641.mp3?dest-id=3776181",
  },
  {
    id: "1",
    title: "Mit dem Gewürzschlüsselanhänger um die Welt",
    subtitle: "Easy German",
    duration: "31 min",
    spotifyEpisodeId: "0WWNqmAGTSHYaVWNQZLtFq",
    spotifyUrl: "https://open.spotify.com/episode/0WWNqmAGTSHYaVWNQZLtFq?si=1801cdfa59cd4dc8",
    audioUrl: "https://easy-german.cdn.svmaudio.com/secure/af6cfb97-64a0-421a-aeab-b7531633e485/egp640.mp3?dest-id=3776181",
  },
];
