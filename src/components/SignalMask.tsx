// SVG mask for SIGNAL text shape
export default function SignalMask() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <mask id="signal-mask">
          <rect width="100%" height="100%" fill="black" />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="120"
            fontFamily="'Courier New', monospace"
            fontWeight="900"
            letterSpacing="0.2em"
          >
            SIGNAL
          </text>
        </mask>
      </defs>
    </svg>
  );
}
