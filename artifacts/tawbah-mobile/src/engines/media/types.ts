export type CategoryId = "quran" | "dawah" | "fatwa" | "stories" | "radio";

export interface Program {
  id: string;
  name: string;
  host?: string;
  category: CategoryId;
  featured?: boolean;
  hot?: boolean;
  badge?: string;
  color: string;
  colorTo: string;
  icon: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  logo?: string;
  color?: string;
  colorTo?: string;
  note?: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  mediaUrl: string;
}

export interface PodcastCategory {
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  color: string;
  colorTo: string;
  episodes: PodcastEpisode[];
}

export interface MediaCategory {
  id: CategoryId;
  label: string;
  icon: string;
  color: string;
}

export type PlaybackState = "idle" | "loading" | "playing" | "paused" | "error";

export interface ActiveMedia {
  id: string;
  type: "radio" | "episode";
  title: string;
  subtitle?: string;
  url: string;
  useProxy: boolean;
}
