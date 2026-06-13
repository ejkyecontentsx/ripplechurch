export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasRichTextContent(html: string): boolean {
  return stripHtmlTags(html).length > 0;
}

export function truncatePlainText(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function getPlainPreview(htmlOrText: string, max = 180): string {
  const plain = stripHtmlTags(htmlOrText);
  return truncatePlainText(plain, max);
}
