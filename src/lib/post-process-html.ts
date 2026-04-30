// Post-process sanitized HTML before rendering:
// - <img>: add loading="lazy" + decoding="async" + referrerpolicy="no-referrer"
// - <a> external: ensure rel + target attrs
export function postProcessHtml(html: string): string {
  // Add lazy + decoding to img tags that lack them
  let out = html.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    let a = attrs;
    if (!/loading=/i.test(a)) a += ` loading="lazy"`;
    if (!/decoding=/i.test(a)) a += ` decoding="async"`;
    if (!/referrerpolicy=/i.test(a)) a += ` referrerpolicy="no-referrer"`;
    return `<img${a}>`;
  });

  // Ensure external <a> have target + rel (already handled by sanitize transformTags
  // for <a>, this is defense-in-depth for any future change)
  out = out.replace(/<a\b([^>]*)>/gi, (full, attrs: string) => {
    if (!/href=/i.test(attrs)) return full;
    if (/href=["']?(?:#|\/(?!\/))/i.test(attrs)) return full; // internal links untouched
    let a = attrs;
    if (!/target=/i.test(a)) a += ` target="_blank"`;
    if (!/rel=/i.test(a)) a += ` rel="noopener noreferrer"`;
    return `<a${a}>`;
  });

  return out;
}
