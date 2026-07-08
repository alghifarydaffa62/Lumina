export default function LtvGauge({ ratio }: { ratio: number }) {
  const clamped = Math.min(ratio, 100)
  const angle = (clamped / 100) * 360
  const RADIUS = 60
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const offset = CIRCUMFERENCE - (angle / 360) * CIRCUMFERENCE

  const color =
    clamped < 40
      ? '#22c55e'
      : clamped < 70
        ? '#eab308'
        : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
        <text
          x="80"
          y="70"
          textAnchor="middle"
          className="fill-slate-800 text-2xl font-bold"
        >
          {clamped.toFixed(0)}%
        </text>
        <text
          x="80"
          y="92"
          textAnchor="middle"
          className="fill-slate-500 text-xs"
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
