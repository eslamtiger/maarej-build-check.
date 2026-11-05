// Maarej mark: steps climbing toward a goal (معارج = ascents). Rises right-to-left, like Arabic reading.
export function MaarejMark({ size = 40 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <rect width="40" height="40" rx="12" fill="#4B3FD6"/>
    <path d="M31 30h-7v-6h-7v-6h-7v-5" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="9" r="3.4" fill="#FFB53D"/>
  </svg>;
}
