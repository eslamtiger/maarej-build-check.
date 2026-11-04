import type { IdentityTheme } from "./journey-theme";

// Visual configuration is keyed by stable identity ID, never by display name.
// Unconfigured identities have no borrowed character; the Hero shows their emblem.
const identityThemes: Readonly<Record<string, Partial<IdentityTheme>>> = {
  "identity-current": {
    characterAsset: {
      src: "/identity-learner-indigo.png",
      alt: "شخصية شابة تحمل دفترًا وتمثل الهوية التعليمية الحالية",
    },
  },
};

export function configuredIdentityTheme(identity?: {
  id: string;
  identityTheme?: Partial<IdentityTheme>;
} | null): Partial<IdentityTheme> | undefined {
  if (!identity) return undefined;
  return identity.identityTheme ?? identityThemes[identity.id];
}
