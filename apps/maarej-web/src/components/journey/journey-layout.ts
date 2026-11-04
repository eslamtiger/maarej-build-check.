export type JourneyMarker = { id: string; nodeIndex: number; kind: "reward" | "achievement" };
// Each chronological row owns landmark + opposite label lanes. Related markers
// reserve separate rows in the outer side lane; their count contributes to height.
export function journeyLayout(count: number, currentIndex: number, markers: readonly JourneyMarker[] = []) {
  const valid = markers.filter(marker => marker.nodeIndex >= 0 && marker.nodeIndex < count);
  const height = Math.max(420, 136 + Math.max(0, count - 1) * 104 + valid.length * 88);
  let cursor = height - 68;
  const markerPositions: Record<string, { x: number; y: number }> = {};
  const positions = Array.from({ length: count }, (_, index) => {
    const left = Math.abs(index - currentIndex) % 2 === 0;
    const caption = index > currentIndex ? .60 : .69;
    const position = { x: left ? .25 : .75, y: cursor / height, tx: left ? caption : 1-caption, ty: cursor / height };
    const related = valid.filter(marker => marker.nodeIndex === index);
    related.forEach((marker, slot) => {
      const side = marker.kind === "reward" ? .10 : .13;
      markerPositions[marker.id] = { x: left ? side : 1-side, y: (cursor - 96 - slot * 88) / height };
    });
    cursor -= 104 + related.length * 88;
    return position;
  });
  const segments = positions.slice(1).map((b, index) => {
    const a = positions[index], bend = (a.y-b.y)*height*.46;
    return `M ${a.x*360} ${a.y*height} C ${a.x*360} ${a.y*height-bend} ${b.x*360} ${b.y*height+bend} ${b.x*360} ${b.y*height}`;
  });
  return { height, positions, segments, markerPositions };
}
// Same contour geometry repeated at native proportions for any data-sized path.
export function journeyContours(height: number) {
  return Array.from({length: Math.ceil(height / 240)}, (_, index) =>
    [0,19,38].map(offset => {
      const y = height - index*240 - offset;
      return `M 10 ${y} C 230 ${y-55} 40 ${y-145} 350 ${y-215}`;
    })).flat();
}
