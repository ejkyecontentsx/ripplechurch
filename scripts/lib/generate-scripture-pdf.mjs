import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");

const FONT_URL =
  "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf";
const FONT_BOLD_URL =
  "https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf";

async function ensureJapaneseFonts() {
  const fontDir = path.join(root, "assets/fonts");
  const regular = path.join(fontDir, "NotoSansCJKjp-Regular.otf");
  const bold = path.join(fontDir, "NotoSansCJKjp-Bold.otf");

  if (!fs.existsSync(fontDir)) fs.mkdirSync(fontDir, { recursive: true });

  for (const [url, dest] of [
    [FONT_URL, regular],
    [FONT_BOLD_URL, bold],
  ]) {
    if (!fs.existsSync(dest)) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to download font: ${url}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
  }

  return { regular, bold };
}

export async function generateScripturePdf(locale) {
  const contentPath = path.join(root, `content/book-of-waves-${locale}.json`);
  const outPath = path.join(root, `public/scripture-${locale}.pdf`);
  const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

  const useJapanese = locale === "ja";
  let fonts = null;
  if (useJapanese) {
    fonts = await ensureJapaneseFonts();
  }

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    info: {
      Title: `${content.title} — Ripple Church`,
      Author: "Ripple Church",
    },
  });

  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const accent = "#4a90d9";
  const text = "#1a1a2e";
  const muted = "#666666";
  const quoteColor = "#4a5568";

  const fontRegular = useJapanese ? fonts.regular : "Helvetica";
  const fontBold = useJapanese ? fonts.bold : "Helvetica-Bold";
  const fontItalic = useJapanese ? fonts.regular : "Helvetica-Oblique";

  function ensureSpace(height = 80) {
    if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
  }

  function sectionTitle(title) {
    ensureSpace(60);
    doc.moveDown(0.6);
    doc.fillColor(accent).font(fontBold).fontSize(16).text(title);
    doc.moveDown(0.4);
  }

  function bodyText(str, options = {}) {
    ensureSpace();
    doc.fillColor(text).font(fontRegular).fontSize(11).text(str, {
      align: "left",
      lineGap: 4,
      ...options,
    });
    doc.moveDown(0.5);
  }

  function labelText(str) {
    ensureSpace(40);
    doc.fillColor(accent).font(fontBold).fontSize(11).text(str);
    doc.moveDown(0.2);
  }

  function quoteText(str) {
    ensureSpace(40);
    doc.fillColor(quoteColor).font(fontItalic).fontSize(10).text(`「${str}」`, {
      indent: 16,
      lineGap: 3,
    });
    doc.moveDown(0.6);
  }

  doc.fillColor(text).font(fontBold).fontSize(28).text("⚡", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(22).text("RIPPLE CHURCH", { align: "center" });
  doc.moveDown(0.8);
  doc.fillColor(accent).fontSize(30).text(content.title, { align: "center" });
  doc.moveDown(0.3);
  doc.fillColor(muted).font(fontRegular).fontSize(13).text(content.subtitle, { align: "center" });
  doc.moveDown(1.2);
  doc.fillColor(muted).fontSize(11).text(content.edition, { align: "center" });

  doc.addPage();

  sectionTitle(content.preface.title);
  content.preface.paragraphs.forEach((p) => bodyText(p));

  doc.addPage();

  sectionTitle(content.genesis.title);
  content.genesis.paragraphs.forEach((p) => bodyText(p));

  doc.addPage();

  sectionTitle(content.commandmentsIntro.title);
  bodyText(content.commandmentsIntro.text);

  content.commandments.forEach((cmd) => {
    ensureSpace(120);
    doc.moveDown(0.3);
    const cmdTitle = content.labels.commandmentFormat
      .replace("{number}", String(cmd.number))
      .replace("{title}", cmd.title);
    doc.fillColor(accent).font(fontBold).fontSize(14).text(cmdTitle);
    doc.moveDown(0.4);

    labelText(content.labels.declaration);
    bodyText(cmd.declaration);

    labelText(content.labels.commentary);
    bodyText(cmd.commentary);

    if (cmd.quote) {
      quoteText(cmd.quote);
    }
  });

  doc.addPage();

  sectionTitle(content.joinDeclaration.title);
  content.joinDeclaration.lines.forEach((line) => bodyText(line));
  doc.moveDown(0.8);
  bodyText(content.joinDeclaration.donation);
  bodyText(content.joinDeclaration.donationNote);
  doc.moveDown(1);
  doc.fillColor(accent).font(fontBold).fontSize(14).text("⚡ RIPPLE CHURCH ⚡", {
    align: "center",
  });
  doc.moveDown(0.4);
  doc.fillColor(text).font(fontRegular).fontSize(12).text(content.joinDeclaration.closing, {
    align: "center",
  });
  doc.moveDown(1);
  doc.fillColor(muted).fontSize(10).text("ripplechurch.net", { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  const stats = fs.statSync(outPath);
  console.log(`Generated ${outPath} (${Math.round(stats.size / 1024)} KB)`);
}
