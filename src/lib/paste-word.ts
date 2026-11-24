// Cleans HTML pasted into the editor. Word sends list items as plain paragraphs with a fake bullet,
// and web pages bring pictures the editor must not keep.

function isListItem(el: Element): boolean {
  return el.tagName === "P" && (/MsoListParagraph/i.test(el.className) || /mso-list:/i.test(el.getAttribute("style") ?? ""));
}

function levelOf(el: Element): number {
  const m = /mso-list:[^;"']*level(\d+)/i.exec(el.getAttribute("style") ?? "");
  return m ? Math.min(Math.max(Number(m[1]), 1), 6) : 1;
}

type Frame = { level: number; list: HTMLElement; last: HTMLElement | null };

function buildList(doc: Document, group: Element[]): DocumentFragment {
  const frag = doc.createDocumentFragment();
  const stack: Frame[] = [];
  for (const p of group) {
    const level = levelOf(p);
    const marker = p.querySelector('span[style*="mso-list"]');
    const markerText = (marker?.textContent ?? "").trim();
    marker?.remove();
    const ordered = /^(\d+|[a-z]|[ivxlcdm]+)[.)]$/i.test(markerText);

    while (stack.length > 0 && stack[stack.length - 1].level > level) stack.pop();
    let top: Frame | undefined = stack[stack.length - 1];
    if (!top || top.level < level) {
      const list = doc.createElement(ordered ? "ol" : "ul");
      if (top?.last) top.last.appendChild(list);
      else frag.appendChild(list);
      top = { level, list, last: null };
      stack.push(top);
    }
    const li = doc.createElement("li");
    li.innerHTML = p.innerHTML;
    top.list.appendChild(li);
    top.last = li;
  }
  return frag;
}

function cleanWord(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const done = new Set<Element>();
  for (const start of Array.from(doc.querySelectorAll("p")).filter(isListItem)) {
    if (done.has(start)) continue;
    const group: Element[] = [];
    for (let cur: Element | null = start; cur && isListItem(cur); cur = cur.nextElementSibling) {
      group.push(cur);
      done.add(cur);
    }
    start.parentNode?.insertBefore(buildList(doc, group), start);
    group.forEach((p) => p.remove());
  }

  // Empty paragraphs that Word uses as spacing.
  for (const p of Array.from(doc.querySelectorAll("p"))) {
    if (p.textContent?.replace(/[\s\u00a0]/g, "") === "" && !p.querySelector("img")) p.remove();
  }
  return doc.body.innerHTML;
}

export function cleanPastedHtml(input: string): string {
  let html = input.replace(/<\/?o:p[^>]*>/gi, "");
  if (/Mso|mso-/.test(html)) html = cleanWord(html);
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => (/\/storage\/v1\/object\/public\//.test(tag) ? tag : ""))
    .replace(/<(\/?)h1\b/gi, "<$1h2")
    .replace(/<(\/?)h[4-6]\b/gi, "<$1h3");
}