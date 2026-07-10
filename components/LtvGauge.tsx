export default function LtvGauge({ ratio }: { ratio: number }) {
  const clamped = Math.min(ratio, 100)
  const angle = (clamped / 100) * 360
  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (angle / 360) * CIRCUMFERENCE

  const color =
    clamped < 40
      ? '#b08d3e'
      : clamped < 70
        ? '#d4af5a'
        : '#6e5827'

  return (
    <div className="flex w-full max-w-65 flex-col items-center gap-2">
      <svg viewBox="0 0 200 200" className="w-full">
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="rgba(236,236,231,0.1)"
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
          className="fill-bone text-3xl font-semibold font-mono"
        >
          {clamped.toFixed(0)}%
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          className="fill-titanium text-sm font-mono tracking-widest2"
        >
          LTV Health
        </text>
      </svg>
      <p className="font-mono text-[11px] tracking-widest2 uppercase text-bone-faint">
        {clamped < 40
          ? 'Healthy'
          : clamped < 70
            ? 'Moderate'
            : 'Critical'}
      </p>
    </div>
  )
}
