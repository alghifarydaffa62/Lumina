export default function LtvGauge({ ratio }: { ratio: number }) {
  const clamped = Math.min(ratio, 100)
  const angle = (clamped / 100) * 360
  const RADIUS = 80
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (angle / 360) * CIRCUMFERENCE

  const color =
    clamped < 40
      ? '#22c55e'
      : clamped < 70
        ? '#eab308'
        : '#ef4444'

  return (
    <div className="flex w-full max-w-[260px] flex-col items-center gap-2">
      <svg viewBox="0 0 200 200" className="w-full">
        <circle
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
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
          className="fill-slate-800 text-3xl font-bold"
        >
          {clamped.toFixed(0)}%
        </text>
        <text
          x="100"
          y="118"
          textAnchor="middle"
          className="fill-slate-500 text-sm"
        >
          LTV Health
        </text>
      </svg>
      <p className="text-xs text-slate-400">
        {clamped < 40
          ? 'Healthy'
          : clamped < 70
            ? 'Moderate'
            : 'Critical'}
      </p>
    </div>
  )
}
