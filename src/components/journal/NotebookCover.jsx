import './cover.css'

// The approved "PRIVATE BOOK 4" cover, in sage. Real text throughout; the handwriting is
// decorative, so it is hidden from assistive tech and the control carries the label.
export default function NotebookCover({ onOpen, openLabel = 'Open the notebook' }) {
  return (
    <div className="nbc">
      <div className="pages" aria-hidden="true" />
      <div className="cover">
        <div aria-hidden="true">
          <div className="spine-shade" />
          <div className="fold" />
          <svg className="stitch" viewBox="0 0 10 100" preserveAspectRatio="none">
            <path className="thread-hi" d="M5 0V100" />
            <path className="thread" d="M5 0V100" />
          </svg>
          <div className="top-title faded-ink">BOOK <span className="circle">4.</span></div>
          <div className="side-notes left"><span>CHART OF SMOKING</span><span>PLEASURE</span><span>ENEMY EXPEND.</span></div>
          <div className="printed-logo"><span>MEMO</span><span>BOOK</span></div>
          <div className="side-notes right"><span>S.A. LIST OF</span><span>ARTICLES; R/O</span></div>
          <div className="private-title"><span className="faded-ink">PRIVATE:</span></div>
          <div className="book-four"><span className="first faded-ink">BOOK.</span><span className="last faded-ink">4.</span></div>
          <div className="logo-small">R<br />V<br />L</div>
          <div className="heavyweight">HEAVYWEIGHT PAPER</div>
          <div className="rule" />
          <div className="bottom-meta">NO. S-2508<br />100 LVS.<br />U.S.A.</div>
          <div className="stain" />
          <div className="corner-wear" />
        </div>
        {onOpen && <button type="button" className="nbc-open" onClick={onOpen}>{openLabel}</button>}
      </div>
    </div>
  )
}

export function BackCover() {
  return <div className="nbc-back" aria-hidden="true" />
}
