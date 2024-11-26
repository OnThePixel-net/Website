export interface ChangelogEntry {
  title: string;
  date: string;
  content: string;
}

export const changelogs: ChangelogEntry[] = [
  {
    title: "New Feature: Dark Mode",
    date: "2023-11-15",
    content: "Implemented a new dark mode feature for better night-time viewing experience."
  }
];

