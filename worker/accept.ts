// RFC 9110: the most specific matching range determines each representation's
// quality. Server order is the final tie breaker (HTML is our default).
export function negotiate(
  accept: string | null,
  available: string[],
): string | undefined {
  if (accept === null) return available[0];
  const ranges = (accept.match(/(?:[^,"]|"(?:\\.|[^"\\])*")+/g) ?? []).map(
    (entry) => {
      const [type, ...parameters] = entry
        .split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((part) => part.trim());
      let q = 1;
      const params: string[] = [];
      for (const parameter of parameters) {
        const [name, ...valueParts] = parameter.split("=");
        const value = valueParts.join("=").replace(/^"|"$/g, "");
        if (name.toLowerCase() === "q") {
          q = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value)
            ? Number(value)
            : 0;
          break;
        }
        params.push(`${name.toLowerCase()}=${value.toLowerCase()}`);
      }
      return { type: type.toLowerCase(), q, params };
    },
  );
  let chosen: string | undefined;
  let bestQuality = 0;
  let bestSpecificity = -1;
  for (const candidate of available) {
    let quality = 0;
    let specificity = -1;
    for (const range of ranges) {
      if (range.params.some((p) => p !== "charset=utf-8")) continue;
      const match =
        range.type === candidate
          ? 2
          : range.type === `${candidate.split("/")[0]}/*`
            ? 1
            : range.type === "*/*"
              ? 0
              : -1;
      if (match < 0) continue;
      const score = match * 10 + range.params.length;
      if (score > specificity || (score === specificity && range.q > quality)) {
        specificity = score;
        quality = range.q;
      }
    }
    if (
      quality > bestQuality ||
      (quality > 0 && quality === bestQuality && specificity > bestSpecificity)
    ) {
      chosen = candidate;
      bestQuality = quality;
      bestSpecificity = specificity;
    }
  }
  return chosen;
}
