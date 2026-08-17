const SPECS: Array<[string, string]> = [
  ["WIDTH", '8.25 IN'],
  ["LENGTH", '31.5 IN'],
  ["WHEELBASE", '14.25 IN'],
  ["CONSTRUCTION", "7-PLY MAPLE + CARBON FIBER"],
  ["CONCAVE", "MEDIUM"],
  ["NOSE / TAIL", '6.5 IN / 6.0 IN'],
];

export function SpecSheet() {
  return (
    <dl className="spec-sheet">
      {SPECS.map(([label, value]) => (
        <div className="spec-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
