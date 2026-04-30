// Truncate sanitized HTML to a teaser by keeping the first N block-level elements.
// Strips images and code blocks from teaser to keep it text-only + light.
export function buildTeaserHtml(html: string, maxBlocks = 3, maxChars = 700): string {
  // Match top-level block elements (p, h1-h4, ul, ol, blockquote)
  const blockRe = /<(p|h[1-4]|ul|ol|blockquote)[^>]*>[\s\S]*?<\/\1>/gi;
  const matches = html.match(blockRe) ?? [];
  const out: string[] = [];
  let chars = 0;
  for (const block of matches) {
    if (out.length >= maxBlocks) break;
    if (chars + block.length > maxChars) break;
    // Skip blocks that are mostly images
    if (/^<p[^>]*>\s*<img/i.test(block)) continue;
    out.push(block);
    chars += block.length;
  }
  return out.join("\n");
}
