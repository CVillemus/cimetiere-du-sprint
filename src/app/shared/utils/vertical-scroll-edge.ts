/** Sens d'un geste vertical : `forward` descend dans le contenu, `backward` remonte. */
export type VerticalScrollDirection = 'forward' | 'backward';

/** Un dépassement de quelques pixels (arrondis, marges) ne doit pas « manger » un balayage. */
const SCROLL_EDGE_TOLERANCE_IN_PIXELS: number = 24;

/**
 * Indique si un contenu défilant, sous `element` et à l'intérieur de `boundary`, peut encore
 * défiler dans ce sens. Sur téléphone, un balayage vertical fait d'abord défiler la slide ;
 * il ne change de tombe qu'une fois arrivé au bord.
 */
export function canScrollFurther(
  element: Element | null,
  boundary: Element,
  direction: VerticalScrollDirection,
): boolean {
  let currentElement: Element | null = element;
  while (currentElement !== null && boundary.contains(currentElement)) {
    if (currentElement instanceof HTMLElement && isVerticallyScrollable(currentElement)) {
      const remainingScrollInPixels: number =
        direction === 'forward'
          ? currentElement.scrollHeight - currentElement.clientHeight - currentElement.scrollTop
          : currentElement.scrollTop;
      if (remainingScrollInPixels > SCROLL_EDGE_TOLERANCE_IN_PIXELS) {
        return true;
      }
    }
    currentElement = currentElement.parentElement;
  }
  return false;
}

function isVerticallyScrollable(element: HTMLElement): boolean {
  const overflowY: string = getComputedStyle(element).overflowY;
  const allowsScrolling: boolean = overflowY === 'auto' || overflowY === 'scroll';
  return allowsScrolling && element.scrollHeight > element.clientHeight;
}
