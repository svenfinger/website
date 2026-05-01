/** Minimal hardening before injecting CMS SVG markup; source URL is Sanity CDN we control. */
export function sanitizeInlineSvg(markup: string): string | null {
  const trimmed = markup.trim()
  if (!/^<\?xml\b/i.test(trimmed) && !/^<svg\b/i.test(trimmed)) return null
  let out = trimmed
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/<\/script>/gi, '')
  out = out.replace(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  out = out.replace(/\bxlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, '')
  return /<svg\b/i.test(out) ? out : null
}
