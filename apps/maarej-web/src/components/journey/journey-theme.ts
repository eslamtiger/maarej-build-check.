import type { IdentityVisualThemeConfig } from "@/data/student-v105-identity-view";

export type IdentityTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Shared art direction: stylized youth, modern, aspirational, educational,
  // semi-illustrated. No fantasy, armor, weapons, child mascots or photo realism.
  characterAsset?: { src: string; alt: string };
  emblem: "shield" | "compass" | "spark";
  landmarkStyle: "crest" | "hex" | "round";
  surfacePattern: "contour" | "grid" | "orbit";
};

// Visual adapter only. Existing identity architecture and eligibility are unchanged.
export function resolveIdentityTheme(
  visual?: IdentityVisualThemeConfig,
  configuredTheme?: Partial<IdentityTheme>,
  overrides?: Partial<IdentityTheme>,
): IdentityTheme {
  return {
    primaryColor: visual?.primaryAccent ?? "#635BDF",
    secondaryColor: visual?.secondaryAccent ?? "#219EBC",
    accentColor: "#E9B64B",
    emblem: visual?.symbol === "compass" ? "compass" : visual?.symbol === "spark" ? "spark" : "shield",
    landmarkStyle: visual?.shapeVariant === "hex" ? "hex" : visual?.shapeVariant === "orb" ? "round" : "crest",
    surfacePattern: visual?.shapeVariant === "orb" ? "orbit" : "contour",
    ...configuredTheme,
    ...overrides,
  };
}
