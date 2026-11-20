import { useLayoutEffect, useRef } from 'react'
import { FlipBook, Page } from '@openpageflip/react'
import '@openpageflip/core/styles.css'
import NotebookCover, { BackCover } from './NotebookCover'
import StitchedSpine from './StitchedSpine'
import { SECTIONS, lastPage, pageForSection, sectionForPage } from '../../lib/sections'

// A page of the book: the texture and gutter shading are CSS, the content scrolls inside.
function Sheet({ side, children }) {
  return (
    <div className={`nb-sheet nb-sheet--${side}`}>
      <div className="nb-scroll">{children}</div>
    </div>
  )
}

// Only the current section's content is live. When a page stops being live its last HTML is kept,
// inert and hidden from assistive tech, so the leaf that is turning away still looks like itself
// without mounting a second copy of anything (no duplicate requests or editors).
function LiveSlot({ live, title, children }) {
  const ref = useRef(null)
  const frozen = useRef('')
  useLayoutEffect(() => {
    if (live && ref.current) frozen.current = ref.current.innerHTML.replace(/ id="[^"]*"/g, '')
  })
  if (live) return <div ref={ref}>{children}</div>
  if (frozen.current) return <div inert aria-hidden="true" dangerouslySetInnerHTML={{ __html: frozen.current }} />
  return (
    <div aria-hidden="true" className="nb-face">
      <p className="eyebrow">Nikole’s memo book</p>
      <p className="nb-face-title">{title}</p>
    </div>
  )
}

export function SectionNote({ index }) {
  const section = SECTIONS[index]
  return (
    <aside className="section-note" aria-hidden="true">
      <p className="eyebrow">Nikole’s memo book</p>
      <div className="section-number">0{index + 1}<span>/04</span></div>
      <p className="handwritten">{section.note}</p>
      <p className="mono-meta">In this section</p>
      <p>{section.blurb}</p>
      <span className="margin-note">keep making things.</span>
    </aside>
  )
}

/**
 * The notebook. The URL decides which section is open (`index`); the book animates to match, and a
 * turn the reader makes by hand (drag or swipe) asks the router to follow via `onSection`.
 *
 * `sections[i]` = { left, right, single }: `left`/`right` fill the two pages of a spread, `single`
 * fills the one page used on phones. A `left` of null shows the section's note.
 */
export default function Book({ bookRef, spread, closed, index, sections, onSection, onOpen, onOpenByHand, onCloseByHand }) {
  const last = lastPage(spread)
  const page = closed ? 0 : pageForSection(index, spread)
  const latest = useRef({})
  latest.current = { index, closed, spread, onSection, onOpenByHand, onCloseByHand, page, last }

  const handleFlip = ({ page: landed }) => {
    const s = latest.current
    if (landed === 0) {
      if (!s.closed) s.onCloseByHand()
      return
    }
    if (landed >= s.last) {
      // The back cover is only decoration: turn back to the section the router is showing.
      window.setTimeout(() => bookRef.current?.flipTo(s.page), 250)
      return
    }
    const target = sectionForPage(landed, s.spread)
    if (s.closed) {
      s.onOpenByHand(target)
      return
    }
    if (target !== s.index) s.onSection(target)
  }

  const slots = SECTIONS.flatMap((section, i) => {
    const entry = sections[i]
    const live = i === index
    if (!spread) {
      return [
        <Page key={`s${i}`}>
          <Sheet side="right"><LiveSlot live={live} title={section.label}>{entry.single}</LiveSlot></Sheet>
        </Page>,
      ]
    }
    return [
      <Page key={`l${i}`}>
        <Sheet side="left">
          {entry.left ? <LiveSlot live={live} title={section.label}>{entry.left}</LiveSlot> : <SectionNote index={i} />}
        </Sheet>
      </Page>,
      <Page key={`r${i}`}>
        <Sheet side="right"><LiveSlot live={live} title={section.label}>{entry.right}</LiveSlot></Sheet>
      </Page>,
    ]
  })

  return (
    <div className="book-frame" data-spread={spread} data-closed={closed}>
      <FlipBook
        ref={bookRef}
        width={532}
        height={800}
        size="stretch"
        minWidth={200}
        layout={spread ? 'spread' : 'single'}
        cover
        flipDuration={900}
        shadowOpacity={0.9}
        page={page}
        onFlip={handleFlip}
        className="nb-book"
      >
        <Page density="hard"><NotebookCover onOpen={closed ? onOpen : undefined} /></Page>
        {slots}
        <Page density="hard"><BackCover /></Page>
      </FlipBook>
      <StitchedSpine spread={spread} hidden={closed} />
    </div>
  )
}
