export default function LtvGauge({ ratio }: { ratio: number }) {
  const clamped = Math.min(ratio, 100)
  const angle = (clamped / 100) * 360
  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (angle / 360) * CIRCUMFERENCE

  const color =
    clamped < 40
      ? '#3f5d48' // forest — healthy
      : clamped < 70
        ? '#b08d3e' // brass — moderate
        : '#7a3b3b' // oxblood — critical

  return (
    <div className="flex w-full max-w-65 flex-col items-center gap-2">
      <svg viewBox="0 0 200 200" className="w-full">
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="rgba(23,24,26,0.08)"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="fill-ink text-3xl font-semibold font-mono"
        >
          {clamped.toFixed(0)}%
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          className="fill-ink-faint text-sm font-mono tracking-widest2"
        >
          LTV Health
        </text>
      </svg>
      <p
        className="font-mono text-[11px] tracking-widest2 uppercase"
        style={{ color }}
      >
        {clamped < 40
          ? 'Healthy'
          : clamped < 70
            ? 'Moderate'
            : 'Critical'}
      </p>
    </div>
  )
}