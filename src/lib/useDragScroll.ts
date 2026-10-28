import { useCallback } from 'react'

/**
 * Lets a horizontal strip scroll with a mouse: vertical wheel moves it sideways and
 * click-dragging pans it. Touch keeps the browser's native swipe.
 * Returns a callback ref, so it also works for elements that mount later.
 */
export function useDragScroll<T extends HTMLElement>() {
  return useCallback((el: T | null) => {
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      const max = el.scrollWidth - el.clientWidth
      const next = Math.max(0, Math.min(max, el.scrollLeft + e.deltaY))
      if (next === el.scrollLeft) return // at an end: let the page scroll
      el.scrollLeft = next
      e.preventDefault()
    }

    let startX = 0
    let startLeft = 0
    let pointer: number | undefined
    let dragged = false

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      pointer = e.pointerId
      startX = e.clientX
      startLeft = el.scrollLeft
      dragged = false
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) < 5) return
      if (!dragged) { dragged = true; el.setPointerCapture(e.pointerId); el.classList.add('dragging') }
      el.scrollLeft = startLeft - dx
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return
      pointer = undefined
      el.classList.remove('dragging')
    }
    // A drag shouldn't also count as a click on the chip/tab under the cursor.
    const onClick = (e: MouseEvent) => {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('click', onClick, true)
    }
  }, [])
}
