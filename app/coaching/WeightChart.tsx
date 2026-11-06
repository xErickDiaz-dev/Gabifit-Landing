// Mini-gráfico de peso en SVG puro (sin librerías). Hook-free para poder
// usarse tanto en componentes server (CRM) como client (portal).

export type WeightPoint = { date: string; weight: number };

export default function WeightChart({
  points,
  height = 160,
}: {
  points: WeightPoint[];
  height?: number;
}) {
  const data = points.filter((p) => typeof p.weight === "number");
  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center border-2 border-dashed border-[color:var(--ink)]/20 text-center">
        <p className="font-meta text-[10px] text-[color:var(--ink-soft)]">
          Registra al menos 2 pesos para ver tu curva
        </p>
      </div>
    );
  }

  const W = 600;
  const H = height;
  const padX = 12;
  const padY = 18;
  const weights = data.map((d) => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const x = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
  const y = (w: number) => padY + (1 - (w - min) / span) * (H - padY * 2);

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.weight)}`).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${H - padY} L ${x(0)} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Curva de peso">
      <defs>
        <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--grape)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--grape)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wfill)" />
      <path d={line} fill="none" stroke="var(--grape)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.weight)} r="3.5" fill="var(--paper)" stroke="var(--grape)" strokeWidth="2" />
      ))}
      {/* extremos */}
      <text x={padX} y={y(data[0].weight) - 8} fontSize="13" fill="var(--ink-soft)" fontFamily="serif">
        {data[0].weight}
      </text>
      <text
        x={W - padX}
        y={y(data[data.length - 1].weight) - 8}
        fontSize="13"
        fill="var(--ink)"
        textAnchor="end"
        fontFamily="serif"
      >
        {data[data.length - 1].weight} kg
      </text>
    </svg>
  );
}
