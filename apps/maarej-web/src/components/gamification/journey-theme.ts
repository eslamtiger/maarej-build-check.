import type { IdentityVisualThemeConfig } from "@/data/student-v105-identity-view";

export type JourneyShapeVariant = "orb" | "diamond" | "hex" | "crest";

export type JourneyVisualTheme = {
  background: string;
  washIndigo: string;
  washBlue: string;
  pathCompleteStart: string;
  pathCompleteEnd: string;
  pathIncomplete: string;
  activeNode: string;
  completedNode: string;
  upcomingNode: string;
  warning: string;
  reward: string;
  surface: string;
  text: string;
  muted: string;
};

export const journeyTheme: JourneyVisualTheme = {
  background: "#F5F9FC",
  washIndigo: "#F0EEFF",
  washBlue: "#EAF6FA",
  pathCompleteStart: "#4B3FD6",
  pathCompleteEnd: "#8A81F0",
  pathIncomplete: "#DCE7EC",
  activeNode: "#4B3FD6",
  completedNode: "#4B3FD6",
  upcomingNode: "#FFFFFF",
  warning: "#DD8A32",
  reward: "#E8B83F",
  surface: "#FFFFFF",
  text: "#172635",
  muted: "#687986",
};

export const defaultIdentityVisual: IdentityVisualThemeConfig = {
  primaryAccent: journeyTheme.pathCompleteStart,
  secondaryAccent: journeyTheme.pathCompleteEnd,
  symbol: "spark",
  shapeVariant: "hex",
};
