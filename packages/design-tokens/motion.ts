export const motionTokens = {
  duration: {
    fast: 0.14,
    base: 0.22,
    slow: 0.42,
  },
  easing: {
    standard: [0.2, 0.8, 0.2, 1] as const,
    emphasized: [0.16, 1, 0.3, 1] as const,
  },
} as const;
