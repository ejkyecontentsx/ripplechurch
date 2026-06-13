import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeRichHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });
}

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
    .replace(/\s+/g, " ")
    .trim();
}

export function truncatePlainText(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export function getPlainPreview(htmlOrText: string, max = 180): string {
  const plain = stripHtml(htmlOrText);
  return truncatePlainText(plain, max);
}

export function hasRichTextContent(html: string): boolean {
  return stripHtml(html).length > 0;
}
