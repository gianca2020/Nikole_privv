// Lay-flat stitched binding: waxed thread passing through the fold, with the cross-over loops
// at both ends. Purely decorative, so it is hidden from assistive tech and ignores the pointer.
export default function StitchedSpine({ spread, hidden }) {
  return (
    <div className="stitched-spine" data-spread={spread} data-hidden={hidden} aria-hidden="true">
      <svg viewBox="0 0 20 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="thread-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8d7a52" />
            <stop offset="0.5" stopColor="#d8c79a" />
            <stop offset="1" stopColor="#7d6a44" />
          </linearGradient>
        </defs>
        {/* long visible stitches along the fold */}
        {Array.from({ length: 9 }, (_, i) => {
          const y = 36 + i * 41
          return (
            <g key={i}>
              <path d={`M10 ${y}V${y + 27}`} stroke="#2b2316" strokeOpacity="0.35" strokeWidth="3.4" strokeLinecap="round" transform="translate(1 1)" />
              <path d={`M10 ${y}V${y + 27}`} stroke="url(#thread-shade)" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="10" cy={y} r="2.1" fill="#33291a" fillOpacity="0.55" />
              <circle cx="10" cy={y + 27} r="2.1" fill="#33291a" fillOpacity="0.55" />
            </g>
          )
        })}
        {/* knotted cross-over at the top and bottom */}
        {[12, 388].map((y) => (
          <path key={y} d={`M4 ${y - 6}L16 ${y + 6}M16 ${y - 6}L4 ${y + 6}`} stroke="url(#thread-shade)" strokeWidth="2.4" strokeLinecap="round" />
        ))}
      </svg>
    </div>
  )
}
