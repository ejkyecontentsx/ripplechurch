import { sanitizeRichHtml } from "@/lib/richText";

type Props = {
  html: string;
  className?: string;
};

export default function RichTextContent({ html, className = "" }: Props) {
  const sanitized = sanitizeRichHtml(html);

  return (
    <div
      className={`rich-text text-base leading-relaxed text-muted ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
