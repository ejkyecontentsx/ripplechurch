interface RippleLogoProps {
  className?: string;
  variant?: "light" | "dark";
  showText?: boolean;
  animated?: boolean;
  subtitle?: string;
}

export default function RippleLogo({
  className = "",
  variant = "light",
  showText = true,
  animated = true,
  subtitle = "Book of Waves",
}: RippleLogoProps) {
  const isDark = variant === "dark";
  const strokeOuter = isDark ? "rgba(74, 144, 217, 0.25)" : "rgba(74, 144, 217, 0.2)";
  const strokeMid = isDark ? "rgba(74, 144, 217, 0.4)" : "rgba(74, 144, 217, 0.35)";
  const strokeInner = isDark ? "#4a90d9" : "#4a90d9";
  const figureFill = isDark ? "#ffffff" : "#1a1a2e";
  const titleFill = isDark ? "#ffffff" : "#1a1a2e";
  const subtitleFill = isDark ? "rgba(255,255,255,0.6)" : "#666666";

  const rings = [
    { r: 85, stroke: strokeInner, width: 2 },
    { r: 135, stroke: strokeMid, width: 1.5 },
    { r: 185, stroke: strokeOuter, width: 1.2 },
  ];

  return (
    <svg
      viewBox="0 0 680 520"
      className={className}
      role="img"
      aria-label="Ripple Church"
    >
      <g transform="translate(340, 225)">
        {rings.map((ring, i) => (
          <circle
            key={ring.r}
            r={ring.r}
            fill="none"
            stroke={ring.stroke}
            strokeWidth={ring.width}
            className={animated ? `ripple-ring` : undefined}
            style={animated ? { animationDelay: `${i}s` } : undefined}
          />
        ))}
        <circle cx="0" cy="-48" r="18" fill={figureFill} />
        <path
          d="M-28 -18 Q-34 16 -30 46 L30 46 Q34 16 28 -18 Q12 -30 0 -30 Q-12 -30 -28 -18Z"
          fill={figureFill}
        />
      </g>
      {showText && (
        <>
          <text
            x="340"
            y="468"
            textAnchor="middle"
            fill={titleFill}
            fontSize="22"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            RIPPLE CHURCH
          </text>
          <text
            x="340"
            y="492"
            textAnchor="middle"
            fill={subtitleFill}
            fontSize="11"
            fontWeight="300"
            fontFamily="system-ui, sans-serif"
          >
            {subtitle}
          </text>
        </>
      )}
    </svg>
  );
}
