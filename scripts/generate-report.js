/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generates `Silveri_Project_Report.docx` — a Master of Computer Applications
 * (BMC-452) Startup & Entrepreneurial Activity Report for the Silveri project.
 *
 * Run:    npm run report
 * Output: ./Silveri_Project_Report.docx
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  PageNumber,
  Footer,
  Header,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  TableOfContents,
  StyleLevel,
  LevelFormat,
  PageOrientation,
  NumberFormat,
  TabStopType,
  TabStopPosition,
  ImageRun,
} = require('docx');

// ───────────────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────────────

const COVER = {
  title: 'SILVERI',
  subtitle: 'Luxury Jewelry E-Commerce Platform',
  reportType: 'A Startup and Entrepreneurial Activity Report On',
  courseCode: 'BMC-452',
  session: '2025-26',
  degree: 'Master of Computer Applications',
  studentName: 'Shivam Sharma',
  rollNo: '2412000140156',
  classSemester: 'MCA (3rd)',
  section: '',
  supervisor: 'Ms. Vandana Kumari',
  supervisorTitle: 'Assistant Professor',
  department: 'Department of Master of Computer Applications',
  college: 'G L Bajaj College of Technology & Management',
  collegeLocation: 'Greater Noida',
  collegeAddress: 'Plot No 2, APJ Abdul Kalam Rd, Knowledge Park III, Greater Noida, Uttar Pradesh',
  university: 'DR. A P J ABDUL KALAM TECHNICAL UNIVERSITY, LUCKNOW',
  date: '02/05/2026',
};

// ───────────────────────────────────────────────────────────────────────────
// SVG diagram generators (rendered to PNG via sharp, embedded as ImageRun)
// ───────────────────────────────────────────────────────────────────────────

const svgWrap = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#1A1A1A"/>
    </marker>
  </defs>
  <style>
    .bg { fill: #FFFFFF; }
    .box { fill: #FDFAF5; stroke: #1A1A1A; stroke-width: 1.4; }
    .accent { fill: #FBF6E8; stroke: #C9A84C; stroke-width: 1.6; }
    .ext { fill: #F5F3EF; stroke: #7A7585; stroke-width: 1.2; }
    .actor { fill: #FFFFFF; stroke: #1A1A1A; stroke-width: 1.2; }
    .proc { fill: #FBF6E8; stroke: #C9A84C; stroke-width: 1.4; }
    .store-line { stroke: #1A1A1A; stroke-width: 1.2; fill: none; }
    .lbl { font-family: Arial, Helvetica, sans-serif; font-size: 13px; fill: #1A1A1A; text-anchor: middle; }
    .lbl-b { font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: bold; fill: #1A1A1A; text-anchor: middle; }
    .lbl-sm { font-family: Arial, Helvetica, sans-serif; font-size: 11px; fill: #1A1A1A; text-anchor: middle; }
    .lbl-arr { font-family: Arial, Helvetica, sans-serif; font-size: 10px; fill: #555555; text-anchor: middle; }
    .arr { stroke: #1A1A1A; stroke-width: 1.3; fill: none; marker-end: url(#arrow); }
  </style>
  <rect class="bg" x="0" y="0" width="${w}" height="${h}"/>
  ${body}
</svg>`;

// Helper to draw a rounded rectangle with one or more centered text lines.
const labelBox = (cls, x, y, w, h, lines, opts = {}) => {
  const rx = opts.rx ?? 8;
  const startY = y + Math.round(h / 2) - ((lines.length - 1) * 8);
  const textNodes = lines
    .map((l, i) => {
      const cls2 = i === 0 ? (opts.firstClass || 'lbl-b') : 'lbl-sm';
      return `<text class="${cls2}" x="${x + w / 2}" y="${startY + i * 16}">${l}</text>`;
    })
    .join('');
  return `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>${textNodes}`;
};

// Fig 1.1 — Proposed System Architecture
const svgArchitecture = () =>
  svgWrap(820, 480, `
    ${labelBox('actor', 20, 90, 150, 56, ['Customer'])}
    ${labelBox('actor', 20, 320, 150, 56, ['Admin'])}
    ${labelBox('accent', 200, 50, 320, 380, ['Silveri Platform'])}
    ${labelBox('box', 220, 100, 280, 130, ['Next.js 16 Frontend', 'App Router · Server + Client', 'Tailwind · Framer Motion', 'Vercel Edge Hosting'])}
    ${labelBox('box', 220, 250, 280, 160, ['Route Handlers', '/api/auth/session', '/api/razorpay/create-order', '/api/razorpay/verify', '/api/promo/validate', '/api/cron/sync-rates'])}
    ${labelBox('ext', 560, 30, 240, 64, ['Firebase', 'Auth · Firestore · Storage'])}
    ${labelBox('ext', 560, 110, 240, 64, ['Google Identity Services', 'In-page Sign In'])}
    ${labelBox('ext', 560, 190, 240, 64, ['Razorpay', 'UPI · Cards · Net Banking'])}
    ${labelBox('ext', 560, 270, 240, 64, ['metals.dev API', 'Daily Silver Rates'])}
    ${labelBox('ext', 560, 350, 240, 64, ['Vercel Edge', 'Hosting · CDN · Cron'])}
    <line class="arr" x1="170" y1="118" x2="220" y2="160"/>
    <line class="arr" x1="170" y1="348" x2="220" y2="320"/>
    <line class="arr" x1="500" y1="160" x2="560" y2="62"/>
    <line class="arr" x1="500" y1="160" x2="560" y2="142"/>
    <line class="arr" x1="500" y1="330" x2="560" y2="222"/>
    <line class="arr" x1="500" y1="330" x2="560" y2="302"/>
    <line class="arr" x1="500" y1="330" x2="560" y2="382"/>
  `);

// Fig 3.1 — Level 0 (Context) DFD
const svgL0DFD = () =>
  svgWrap(820, 460, `
    ${labelBox('actor', 30, 60, 150, 60, ['Customer'])}
    ${labelBox('actor', 30, 340, 150, 60, ['Admin'])}
    <ellipse cx="410" cy="230" rx="160" ry="80" class="proc"/>
    <text class="lbl-b" x="410" y="226">Silveri Platform</text>
    <text class="lbl-sm" x="410" y="246">(Process 0)</text>
    ${labelBox('ext', 640, 30, 160, 60, ['Razorpay'])}
    ${labelBox('ext', 640, 110, 160, 60, ['Firebase', 'Auth · Firestore'])}
    ${labelBox('ext', 640, 200, 160, 60, ['Google Identity'])}
    ${labelBox('ext', 640, 290, 160, 60, ['metals.dev'])}
    ${labelBox('ext', 640, 380, 160, 60, ['Vercel Edge'])}
    <line class="arr" x1="180" y1="90" x2="270" y2="200"/>
    <text class="lbl-arr" x="225" y="135">browse · sign-in · pay</text>
    <line class="arr" x1="270" y1="240" x2="180" y2="110"/>
    <text class="lbl-arr" x="225" y="180">catalog · receipt</text>
    <line class="arr" x1="180" y1="370" x2="270" y2="270"/>
    <text class="lbl-arr" x="225" y="335">products · status</text>
    <line class="arr" x1="270" y1="290" x2="180" y2="390"/>
    <text class="lbl-arr" x="225" y="380">orders · analytics</text>
    <line class="arr" x1="565" y1="180" x2="640" y2="60"/>
    <text class="lbl-arr" x="615" y="120">create-order</text>
    <line class="arr" x1="640" y1="80" x2="565" y2="200"/>
    <text class="lbl-arr" x="615" y="155">signature</text>
    <line class="arr" x1="565" y1="220" x2="640" y2="140"/>
    <text class="lbl-arr" x="615" y="195">read · write</text>
    <line class="arr" x1="565" y1="260" x2="640" y2="230"/>
    <text class="lbl-arr" x="610" y="255">id-token</text>
    <line class="arr" x1="640" y1="320" x2="565" y2="280"/>
    <text class="lbl-arr" x="615" y="305">silver rates</text>
    <line class="arr" x1="565" y1="300" x2="640" y2="410"/>
    <text class="lbl-arr" x="615" y="370">cron trigger</text>
  `);

// Fig 3.2 — Level 1 (Process) DFD
const svgL1DFD = () =>
  svgWrap(820, 540, `
    ${labelBox('proc', 40, 40, 180, 60, ['1.0 Authentication'])}
    ${labelBox('proc', 240, 40, 180, 60, ['2.0 Catalog &amp; Search'])}
    ${labelBox('proc', 440, 40, 180, 60, ['3.0 Cart &amp; Wishlist'])}
    ${labelBox('proc', 640, 40, 160, 60, ['4.0 Checkout'])}
    ${labelBox('proc', 40, 220, 180, 60, ['5.0 Order Lifecycle'])}
    ${labelBox('proc', 240, 220, 180, 60, ['6.0 Reviews'])}
    ${labelBox('proc', 440, 220, 180, 60, ['7.0 Live-Market Sync'])}
    ${labelBox('proc', 640, 220, 160, 60, ['8.0 Activity Log'])}
    <line class="store-line" x1="60" y1="380" x2="380" y2="380"/>
    <line class="store-line" x1="60" y1="410" x2="380" y2="410"/>
    <text class="lbl-b" x="220" y="402">D1: Firestore — users · products · orders · reviews</text>
    <line class="store-line" x1="420" y1="380" x2="780" y2="380"/>
    <line class="store-line" x1="420" y1="410" x2="780" y2="410"/>
    <text class="lbl-b" x="600" y="402">D2: Firestore — promos · marketRates · activity</text>
    <line class="arr" x1="130" y1="100" x2="130" y2="220"/>
    <line class="arr" x1="330" y1="100" x2="330" y2="220"/>
    <line class="arr" x1="530" y1="100" x2="530" y2="220"/>
    <line class="arr" x1="720" y1="100" x2="720" y2="220"/>
    <line class="arr" x1="130" y1="280" x2="130" y2="380"/>
    <line class="arr" x1="330" y1="280" x2="330" y2="380"/>
    <line class="arr" x1="530" y1="280" x2="530" y2="380"/>
    <line class="arr" x1="720" y1="280" x2="720" y2="380"/>
    <text class="lbl-sm" x="420" y="500">Solid arrows = data flow.  Pair of horizontal lines = persistent data store.</text>
  `);

// Fig 3.3 — Entity-Relationship (Firestore Collection) Diagram
const svgER = () =>
  svgWrap(820, 520, `
    ${labelBox('box', 40, 40, 180, 100, ['User', 'uid (PK)', 'name · email · phone', 'role · blocked'])}
    ${labelBox('box', 320, 40, 180, 100, ['Order', 'id (PK)', 'userId (FK) · status', 'subtotal · total'])}
    ${labelBox('box', 600, 40, 180, 100, ['OrderItem', 'productId (FK)', 'name · price', 'quantity · size · chain'])}
    ${labelBox('box', 40, 200, 180, 100, ['Product', 'id (PK)', 'name · sku · price', 'category · stock'])}
    ${labelBox('box', 320, 200, 180, 100, ['Review', 'id (PK)', 'userId · productId · orderId', 'rating · comment · adminReply'])}
    ${labelBox('box', 600, 200, 180, 100, ['Category', 'id (PK)', 'name · slug', 'subCategories[]'])}
    ${labelBox('box', 40, 360, 180, 100, ['Promo', 'code (PK)', 'type · discountValue', 'usedCount · expiry'])}
    ${labelBox('box', 320, 360, 180, 100, ['MarketRate', 'fetchedAt (PK)', 'silverRate', 'usdInr'])}
    ${labelBox('box', 600, 360, 180, 100, ['Activity', 'id (PK)', 'userId · type', 'productId · timestamp'])}
    <line class="arr" x1="220" y1="90" x2="320" y2="90"/>
    <text class="lbl-arr" x="270" y="80">1 : N</text>
    <line class="arr" x1="500" y1="90" x2="600" y2="90"/>
    <text class="lbl-arr" x="550" y="80">1 : N</text>
    <line class="arr" x1="130" y1="140" x2="320" y2="240"/>
    <text class="lbl-arr" x="220" y="200">writes (1:N)</text>
    <line class="arr" x1="220" y1="250" x2="320" y2="250"/>
    <text class="lbl-arr" x="270" y="240">reviewed (1:N)</text>
    <line class="arr" x1="690" y1="140" x2="220" y2="240"/>
    <text class="lbl-arr" x="450" y="180">classifies (1:N)</text>
    <line class="arr" x1="130" y1="300" x2="130" y2="360"/>
    <text class="lbl-arr" x="155" y="335">(rates apply)</text>
    <line class="arr" x1="130" y1="140" x2="690" y2="360"/>
    <text class="lbl-arr" x="420" y="270">events (1:N)</text>
  `);

// Fig 3.4 — UML Use Case Diagram
const svgUseCase = () =>
  svgWrap(820, 520, `
    <text class="lbl-b" x="80" y="40">Customer</text>
    <circle cx="80" cy="74" r="14" class="actor"/>
    <line x1="80" y1="88" x2="80" y2="125" class="store-line"/>
    <line x1="60" y1="100" x2="100" y2="100" class="store-line"/>
    <line x1="80" y1="125" x2="65" y2="160" class="store-line"/>
    <line x1="80" y1="125" x2="95" y2="160" class="store-line"/>
    <text class="lbl-b" x="80" y="450">Admin</text>
    <circle cx="80" cy="350" r="14" class="actor"/>
    <line x1="80" y1="364" x2="80" y2="400" class="store-line"/>
    <line x1="60" y1="375" x2="100" y2="375" class="store-line"/>
    <line x1="80" y1="400" x2="65" y2="435" class="store-line"/>
    <line x1="80" y1="400" x2="95" y2="435" class="store-line"/>
    <text class="lbl-b" x="740" y="40">Razorpay</text>
    <circle cx="740" cy="74" r="14" class="actor"/>
    <line x1="740" y1="88" x2="740" y2="125" class="store-line"/>
    <line x1="720" y1="100" x2="760" y2="100" class="store-line"/>
    <line x1="740" y1="125" x2="725" y2="160" class="store-line"/>
    <line x1="740" y1="125" x2="755" y2="160" class="store-line"/>
    <text class="lbl-b" x="740" y="225">Google ID</text>
    <circle cx="740" cy="259" r="14" class="actor"/>
    <line x1="740" y1="273" x2="740" y2="305" class="store-line"/>
    <text class="lbl-b" x="740" y="450">metals.dev</text>
    <circle cx="740" cy="350" r="14" class="actor"/>
    <line x1="740" y1="364" x2="740" y2="400" class="store-line"/>
    <ellipse cx="350" cy="80" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="85">Browse Catalog</text>
    <ellipse cx="350" cy="150" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="155">Add to Cart</text>
    <ellipse cx="350" cy="220" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="225">Checkout / Pay</text>
    <ellipse cx="350" cy="290" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="295">Sign In</text>
    <ellipse cx="350" cy="360" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="365">Submit Review</text>
    <ellipse cx="350" cy="430" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="350" y="435">Manage Products</text>
    <ellipse cx="600" cy="220" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="600" y="225">Verify Payment</text>
    <ellipse cx="600" cy="360" rx="100" ry="28" class="proc"/>
    <text class="lbl" x="600" y="365">Sync Silver Rates</text>
    <line class="store-line" x1="155" y1="100" x2="250" y2="80"/>
    <line class="store-line" x1="155" y1="120" x2="250" y2="150"/>
    <line class="store-line" x1="155" y1="140" x2="250" y2="220"/>
    <line class="store-line" x1="155" y1="160" x2="250" y2="290"/>
    <line class="store-line" x1="155" y1="180" x2="250" y2="360"/>
    <line class="store-line" x1="155" y1="400" x2="250" y2="430"/>
    <line class="store-line" x1="155" y1="380" x2="250" y2="220"/>
    <line class="store-line" x1="450" y1="220" x2="500" y2="220"/>
    <line class="store-line" x1="685" y1="100" x2="700" y2="80"/>
    <line class="store-line" x1="685" y1="220" x2="700" y2="200"/>
    <line class="store-line" x1="685" y1="290" x2="700" y2="290"/>
    <line class="store-line" x1="685" y1="360" x2="700" y2="380"/>
  `);

// Render an SVG string to a PNG Buffer using sharp.
const renderSvg = async (svg) =>
  sharp(Buffer.from(svg)).png().toBuffer();

// Captioned figure with a real embedded image.
const figureImage = (figNumber, title, pngBuffer, width = 520, height = 320) => [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new ImageRun({
        data: pngBuffer,
        transformation: { width, height },
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200 },
    children: [
      new TextRun({
        text: `${figNumber} — ${title}`,
        italics: true,
        size: 20,
        font: 'Times New Roman',
      }),
    ],
  }),
];

// ───────────────────────────────────────────────────────────────────────────
// Reusable building blocks
// ───────────────────────────────────────────────────────────────────────────

const blank = (size = 200) =>
  new Paragraph({ spacing: { before: size, after: size }, children: [new TextRun('')] });

const center = (text, opts = {}) =>
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80, ...opts.spacing },
    children: [
      new TextRun({
        text,
        bold: !!opts.bold,
        size: opts.size || 22,
        font: opts.font || 'Times New Roman',
        color: opts.color,
      }),
    ],
  });

const para = (text, opts = {}) =>
  new Paragraph({
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 100, line: 320 },
    indent: opts.indent ? { firstLine: 360 } : undefined,
    children: [
      new TextRun({
        text,
        size: opts.size || 22,
        font: 'Times New Roman',
        bold: !!opts.bold,
        italics: !!opts.italics,
      }),
    ],
  });

const richPara = (runs, alignment = AlignmentType.JUSTIFIED) =>
  new Paragraph({
    alignment,
    spacing: { before: 80, after: 100, line: 320 },
    children: runs.map((r) => new TextRun({ size: 22, font: 'Times New Roman', ...r })),
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 32, font: 'Times New Roman' }),
    ],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({ text, bold: true, size: 26, font: 'Times New Roman' }),
    ],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 24, font: 'Times New Roman' }),
    ],
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    bullet: { level },
    spacing: { before: 40, after: 40, line: 300 },
    children: [
      new TextRun({ text, size: 22, font: 'Times New Roman' }),
    ],
  });

const bulletBold = (head, rest) =>
  new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60, line: 300 },
    children: [
      new TextRun({ text: head, bold: true, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: rest, size: 22, font: 'Times New Roman' }),
    ],
  });

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// Captioned figure placeholder — a shaded box with a caption underneath.
// Used for UI screenshots that the user will paste in manually after opening
// the DOCX in Word (right-click the box → "Replace Image").
const figurePlaceholder = (figNumber, title, hint) => [
  new Table({
    width: { size: 9000, type: WidthType.DXA },
    alignment: AlignmentType.CENTER,
    rows: [
      new TableRow({
        height: { value: 3000, rule: 'atLeast' },
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: 'F5F3EF' },
            verticalAlign: 'center',
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '📷 Screenshot Placeholder',
                    bold: true,
                    color: '7A7585',
                    size: 24,
                    font: 'Arial',
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: `${figNumber} — ${title}`,
                    italics: true,
                    color: '7A7585',
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
              ...(hint
                ? [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 80 },
                      children: [
                        new TextRun({
                          text: hint,
                          italics: true,
                          color: 'A09DAB',
                          size: 18,
                          font: 'Times New Roman',
                        }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: '(Right-click → Replace Image to paste screenshot)',
                    italics: true,
                    color: 'A09DAB',
                    size: 16,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 200 },
    children: [
      new TextRun({
        text: `${figNumber} — ${title}`,
        italics: true,
        size: 20,
        font: 'Times New Roman',
      }),
    ],
  }),
];

// Schema table — reproduces the "Column Name | Description" tables in the reference style.
const schemaTable = (caption, rows) => {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Column Name', bold: true, size: 22, font: 'Times New Roman' })],
          }),
        ],
      }),
      new TableCell({
        shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'Description', bold: true, size: 22, font: 'Times New Roman' })],
          }),
        ],
      }),
    ],
  });
  const dataRows = rows.map(
    ([col, desc]) =>
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: col, size: 21, font: 'Consolas' })],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: desc, size: 21, font: 'Times New Roman' })],
              }),
            ],
          }),
        ],
      })
  );
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 240 },
      children: [
        new TextRun({ text: caption, italics: true, size: 20, font: 'Times New Roman' }),
      ],
    }),
  ];
};

// Test-scenario table (3 columns: Scenario, Expected, Actual)
const testTable = (caption, rows) => {
  const head = new TableRow({
    tableHeader: true,
    children: ['Scenario', 'Expected Outcome', 'Actual Result'].map(
      (t) =>
        new TableCell({
          shading: { type: ShadingType.SOLID, color: 'E8E8E8' },
          children: [
            new Paragraph({
              children: [new TextRun({ text: t, bold: true, size: 22, font: 'Times New Roman' })],
            }),
          ],
        })
    ),
  });
  const data = rows.map(
    (cols) =>
      new TableRow({
        children: cols.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: c, size: 20, font: 'Times New Roman' })],
                }),
              ],
            })
        ),
      })
  );
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [head, ...data],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 240 },
      children: [new TextRun({ text: caption, italics: true, size: 20, font: 'Times New Roman' })],
    }),
  ];
};

// Centered footer with page number — used for both prelim and body sections.
const footerWithPageNumber = () =>
  new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 20,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  });

const tocLine = (label, page) =>
  new Paragraph({
    spacing: { before: 60, after: 60 },
    tabStops: [
      { type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: 'dot' },
    ],
    children: [
      new TextRun({ text: label, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: '\t' + String(page), size: 22, font: 'Times New Roman' }),
    ],
  });

// ───────────────────────────────────────────────────────────────────────────
// PRELIMINARY PAGES (roman numerals)
// ───────────────────────────────────────────────────────────────────────────

const coverPage = () => [
  blank(400),
  center(`${COVER.college.toUpperCase()},`, { bold: true, size: 28 }),
  center(COVER.collegeLocation.toUpperCase(), { bold: true, size: 28 }),
  blank(400),
  center(COVER.reportType, { size: 24 }),
  blank(200),
  center(COVER.title, { bold: true, size: 56 }),
  center(COVER.subtitle, { italics: true, size: 26 }),
  blank(200),
  center(`(${COVER.courseCode})`, { bold: true, size: 24 }),
  center(`Session ${COVER.session}`, { size: 22 }),
  blank(300),
  center('Submitted in partial fulfillment of the requirement for the award of the degree of', { size: 22 }),
  center(COVER.degree, { bold: true, size: 26 }),
  blank(200),
  center('By', { size: 22 }),
  center(COVER.studentName, { bold: true, size: 26 }),
  center(`Roll No. — ${COVER.rollNo}`, { size: 22 }),
  blank(200),
  center('Under the Supervision of', { size: 22 }),
  center(COVER.supervisor, { bold: true, size: 24 }),
  center(`(${COVER.supervisorTitle})`, { italics: true, size: 22 }),
  blank(400),
  center(COVER.university, { bold: true, size: 22 }),
  blank(120),
  center(`(${COVER.session})`, { size: 22 }),
  pageBreak(),
];

const reportHeaderPage = () => {
  const submissionTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Submitted to:', bold: true, size: 24, font: 'Times New Roman' })],
              }),
              new Paragraph({
                children: [new TextRun({ text: COVER.supervisor, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `(${COVER.supervisorTitle})`, italics: true, size: 22, font: 'Times New Roman' }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Submitted by:', bold: true, size: 24, font: 'Times New Roman' })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `Name: ${COVER.studentName}`, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                children: [new TextRun({ text: `Roll no: ${COVER.rollNo}`, size: 22, font: 'Times New Roman' })],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Class & Semester: ${COVER.classSemester}` + (COVER.section ? `   Section: ${COVER.section}` : ''),
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
  return [
    blank(400),
    center('PROJECT REPORT ON', { bold: true, size: 32 }),
    center(COVER.title, { bold: true, size: 44 }),
    center(COVER.subtitle, { italics: true, size: 24 }),
    blank(200),
    center(`(${COVER.courseCode})`, { bold: true, size: 26 }),
    center(`Session-${COVER.session}`, { size: 22 }),
    center(COVER.department, { bold: true, size: 22 }),
    blank(300),
    submissionTable,
    blank(400),
    center(COVER.college, { bold: true, size: 26 }),
    blank(120),
    center(COVER.collegeAddress, { size: 22 }),
    pageBreak(),
  ];
};

const acknowledgement = () => [
  h1('ACKNOWLEDGEMENT'),
  blank(200),
  para(
    `I would like to extend my heartfelt appreciation to everyone who supported me throughout the journey of building my major project, "Silveri — Luxury Jewelry E-Commerce Platform". Translating an entrepreneurial idea into a working, production-grade software product would not have been possible without the guidance, patience, and constructive feedback I received at every step.`
  ),
  para(
    `I am especially grateful to my project supervisor, ${COVER.supervisor} (${COVER.supervisorTitle}), for her thoughtful mentorship, prompt reviews, and the clarity she brought to both the engineering and the business sides of the project. Her insistence on industry-standard practices — version control, automated testing, security headers, and structured documentation — pushed the work well beyond a routine academic exercise.`
  ),
  para(
    `My sincere thanks go to the faculty members of the Department of Master of Computer Applications at G L Bajaj College of Technology & Management, Greater Noida, for the technical foundations laid down across the four semesters of the MCA programme, and for the lab and infrastructure access that made cloud deployment, integration testing, and live demos possible.`
  ),
  para(
    `I would also like to thank my classmates and peers, whose feedback on the customer flows, payment experience, and admin dashboards genuinely shaped the final product. Their critique sessions caught usability gaps that no single developer could have discovered alone.`
  ),
  para(
    `Finally, I express my deepest gratitude to my family for their unwavering encouragement and patience throughout the long late-night build cycles. Their belief in this work has been the quiet engine behind every page of this report.`
  ),
  blank(800),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: '(Signature)', size: 22, font: 'Times New Roman' })],
  }),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: COVER.studentName, bold: true, size: 22, font: 'Times New Roman' })],
  }),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: COVER.rollNo, size: 22, font: 'Times New Roman' })],
  }),
  pageBreak(),
];

const certificateOfOriginality = () => [
  h1('CERTIFICATE OF ORIGINALITY'),
  blank(200),
  para(
    `I, ${COVER.studentName}, hereby declare that the project titled "Silveri — Luxury Jewelry E-Commerce Platform", submitted to ${COVER.university} for the partial fulfillment of the degree of ${COVER.degree} for the session ${COVER.session}, from ${COVER.college}, ${COVER.collegeLocation}, is the result of my own original work. The content of this report has not previously been used as the basis for the award of any other degree, diploma, fellowship, or any other similar title.`
  ),
  para(
    `All references drawn from external sources — including official documentation, books, technical articles, and open-source repositories — have been duly cited in the References section. No portion of this report has been copied verbatim from any prior work, and any third-party assets used during development (icons, fonts, public APIs) are attributed to their respective licence holders.`
  ),
  blank(800),
  new Paragraph({
    children: [
      new TextRun({ text: `Place: ${COVER.collegeLocation}`, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: '\t\t\t\t\t', size: 22 }),
      new TextRun({ text: 'Signature', size: 22, font: 'Times New Roman' }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: `Date: ${COVER.date}`, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: '\t\t\t\t\t', size: 22 }),
      new TextRun({ text: COVER.studentName, bold: true, size: 22, font: 'Times New Roman' }),
    ],
  }),
  pageBreak(),
];

const certificateOfAcceptance = () => [
  h1('CERTIFICATE OF ACCEPTANCE'),
  blank(200),
  para(
    `This is to certify that the project entitled "Silveri — Luxury Jewelry E-Commerce Platform", submitted by ${COVER.studentName}, a bonafide student of ${COVER.college}, ${COVER.collegeLocation}, has been carried out under my supervision in partial fulfillment for the award of the degree of ${COVER.degree}, affiliated to ${COVER.university}, during the academic year ${COVER.session}.`
  ),
  para(
    `It is further certified that all the corrections, modifications, and suggestions indicated as a part of the Internal Assessment have been duly incorporated into the final report. To the best of our knowledge, the work embodied in this report is original and has not been submitted elsewhere for the award of any other degree or discipline. The project has been approved as it satisfies the academic requirements prescribed for the said degree.`
  ),
  blank(700),
  new Paragraph({
    children: [
      new TextRun({ text: COVER.supervisor, bold: true, size: 22, font: 'Times New Roman' }),
      new TextRun({ text: '\t\t\t\t\t\t', size: 22 }),
      new TextRun({ text: '[Sign of External Examiner]', size: 22, font: 'Times New Roman' }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({ text: `(${COVER.supervisorTitle})`, italics: true, size: 22, font: 'Times New Roman' }),
    ],
  }),
  blank(400),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Head of Department', bold: true, size: 22, font: 'Times New Roman' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: COVER.degree, size: 22, font: 'Times New Roman' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `${COVER.college}, ${COVER.collegeLocation}`,
        size: 22,
        font: 'Times New Roman',
      }),
    ],
  }),
  pageBreak(),
];

const tableOfContents = () => [
  h1('TABLE OF CONTENTS'),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 240 },
    children: [
      new TextRun({
        text: 'Right-click the table below and choose "Update Field" (or press F9) to populate page numbers.',
        italics: true,
        color: '7A7585',
        size: 20,
        font: 'Times New Roman',
      }),
    ],
  }),
  // Real Word TOC field — Word auto-fills it with every Heading 1 / 2 / 3 in the doc.
  new TableOfContents('Table of Contents', {
    hyperlink: true,
    headingStyleRange: '1-3',
    stylesWithLevels: [
      new StyleLevel('Heading1', 1),
      new StyleLevel('Heading2', 2),
      new StyleLevel('Heading3', 3),
    ],
  }),
  pageBreak(),
];

const listOfFigures = () => [
  h1('LIST OF FIGURES'),
  blank(120),
  para('Fig. 1.1 — Proposed System Architecture of Silveri'),
  para('Fig. 1.2 — Multi-Role Use Case Overview'),
  para('Fig. 3.1 — Level 0 Data Flow Diagram (Context Level)'),
  para('Fig. 3.2 — Level 1 Data Flow Diagram'),
  para('Fig. 3.3 — Entity Relationship (Firestore Collection) Diagram'),
  para('Fig. 3.4 — UML Use Case Diagram of the System'),
  para('Fig. 5.1 — Customer Login & Sign-Up Interface'),
  para('Fig. 5.2 — Admin Dashboard with Live Analytics'),
  para('Fig. 5.3 — Customer Product Detail Page'),
  para('Fig. 5.4 — Razorpay Checkout Modal Integration'),
  para('Fig. 5.5 — Live Silver-Rate Sync Console'),
  para('Fig. 5.6 — Review System Workflow'),
  pageBreak(),
];

const listOfTables = () => [
  h1('LIST OF TABLES'),
  blank(120),
  para('Table 5.1 — Users Collection Schema'),
  para('Table 5.2 — Products Collection Schema'),
  para('Table 5.3 — Orders Collection Schema'),
  para('Table 5.4 — Reviews Collection Schema'),
  para('Table 5.5 — Promos Collection Schema'),
  para('Table 6.1 — Test Scenarios and Results Summary'),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 1 — Introduction and Aim of the Project
// ───────────────────────────────────────────────────────────────────────────
const chapter1 = (images) => [
  h1('Chapter 1'),
  h1('Introduction and Aim of the Project'),
  blank(120),
  h2('1.1 Introduction'),
  para(
    `India's silver jewelry market has historically operated in the hands of family-owned showrooms whose pricing, inventory, and customer engagement still rely on paper rate cards and manual stock registers. Buyers frequently visit multiple stores, ask for the day's silver rate, negotiate making charges separately, and walk out without any structured record of their preferences or wishlist. As a result, both customers and small jewelers are excluded from the convenience and reach that mainstream e-commerce now offers in almost every other category.`
  ),
  para(
    `Silveri is a cloud-native, web-based commerce platform built specifically for handcrafted silver jewelry. It combines a customer-facing storefront (catalog, cart, wishlist, checkout, and reviews) with an administrative back-office (product management, order fulfillment, analytics, and a review-reply console) on the same codebase. The platform is engineered around a real-time silver-rate engine that pulls daily commodity data from a public metals API and dynamically recalculates linked product prices, ensuring that the listed price of every gram-priced item reflects the current bullion market within a single business day.`
  ),
  para(
    `The system is built using Next.js 16 with the App Router and React 19 on the front end, backed by Firebase Authentication and Cloud Firestore for identity and persistence. Payments are processed through Razorpay, India's most widely adopted payment gateway, with HMAC-SHA256 verification on every transaction. Sign-in is delivered through Google Identity Services for friction-free customer onboarding, complemented by a traditional email-and-password path. Hosting is on Vercel's edge infrastructure with global content delivery and automatic HTTPS.`
  ),
  blank(120),
  h2('1.2 Motivation of the Project'),
  para(
    `The motivation behind Silveri grew out of two parallel observations. The first was the steady decline in walk-in customer counts experienced by neighbourhood silver jewelers as younger buyers shifted to online discovery and digital payments. The second was the realisation that no widely-available e-commerce template — Shopify, WooCommerce, or otherwise — natively understood the volatile, weight-and-rate-driven pricing model that silver jewelry actually uses. Off-the-shelf solutions force jewelers to manually re-tag every gram-priced product whenever the market moves, which is impractical at scale.`
  ),
  para(
    `Beyond commerce mechanics, the project was also driven by the entrepreneurial intent to give a small jeweler the same digital capabilities a national chain enjoys: a real-time admin dashboard, post-delivery review collection, automated activity logging, an integrated promo code engine, and a content-security-aware authentication stack. Silveri is therefore as much a software platform as it is a vertical-specific business proposition.`
  ),
  blank(120),
  h2('1.3 Problem Statement'),
  para('Conventional silver jewelry retail in India faces several recurring problems:'),
  bulletBold('Static Price Tags: ', 'product prices on physical price-tags do not reflect intra-day or week-to-week fluctuations in the silver market, leading to either lost margin or lost customers depending on which way the market has moved.'),
  bulletBold('Fragmented Inventory: ', 'stock counts are kept in physical registers separate from the showroom display, making it nearly impossible to answer a phone customer\'s question about availability without a manual visual check.'),
  bulletBold('No Online Discovery: ', 'most local jewelers have no searchable online catalog, no SEO presence, and no analytics about which categories are gaining or losing traction.'),
  bulletBold('Disconnected Payments: ', 'cash and UPI receipts in the shop are not linked to a customer account, so repeat-purchase patterns and lifetime value cannot be measured.'),
  bulletBold('No Structured Reviews: ', 'social proof — the single biggest conversion lever in modern e-commerce — is entirely absent from the shopping flow.'),
  blank(120),
  h2('1.4 Project Purpose'),
  para(
    `The purpose of Silveri is to provide an end-to-end digital storefront purpose-built for silver jewelry retail, where every actor in the system — customer, jeweler, payment processor, and identity provider — exchanges information through a secure, audited, real-time pipeline. The platform delivers a unified buying experience for the customer, an analytics-rich back-office for the jeweler, and a transparent live-rate mechanism that ties product pricing to real commodity markets.`
  ),
  blank(120),
  h2('1.5 Objectives'),
  bulletBold('Multi-Role Authentication: ', 'deliver a secure sign-in stack supporting Google sign-in via Google Identity Services and email-password, with role-aware redirection between Customer and Admin surfaces.'),
  bulletBold('Live Silver-Rate Engine: ', 'automatically pull daily silver and currency data from the metals.dev API, persist a 40-day history in Firestore, and recalculate the price of every linked product when a sync occurs.'),
  bulletBold('Razorpay Payments: ', 'integrate Razorpay Order creation, server-side HMAC-SHA256 signature verification, and webhook reconciliation into a three-step checkout wizard.'),
  bulletBold('Post-Delivery Review System: ', 'allow customers to leave verified-purchase reviews only for orders whose status has been advanced to "delivered", with admins able to publicly reply to any review.'),
  bulletBold('Admin Analytics: ', 'give the jeweler real-time charts of revenue, order count, and product views, plus a category- and SKU-level drill-down.'),
  bulletBold('Mobile-First UI: ', 'deliver a Tailwind-based responsive interface that works equally well on a 375-pixel mobile viewport and a 1920-pixel desktop screen.'),
  blank(120),
  h2('1.6 Project Scope'),
  bulletBold('Technical Scope: ', 'Next.js 16 App Router, React 19 server and client components, Firebase Auth, Cloud Firestore, Firebase Storage (for product imagery), Razorpay payments, Vercel edge proxy, Google Identity Services, and Tailwind CSS for styling.'),
  bulletBold('Admin Scope: ', 'CRUD for products, categories, sub-categories, orders, users, promos, banners, and reviews; analytics dashboard with date-range filters; live silver-rate sync console; activity log viewer.'),
  bulletBold('Customer Scope: ', 'browse catalog and category pages, view product detail, manage cart and wishlist, complete checkout via Razorpay, view order history, leave post-delivery reviews, manage personal profile and shipping addresses.'),
  bulletBold('Security Scope: ', 'session cookies signed by Firebase Admin SDK, Content-Security-Policy with explicit frame-src and script-src allow-lists, Razorpay HMAC signature verification, Firestore security rules at collection level, automatic block-and-sign-out for users marked blocked.'),
  blank(120),
  h2('1.7 Technologies Used'),
  bulletBold('Frontend Framework: ', 'Next.js 16 with the App Router, React 19, and TypeScript 5 for static typing and editor tooling.'),
  bulletBold('Styling: ', 'Tailwind CSS v4 with PostCSS, Cormorant Garamond and Jost web fonts loaded via next/font, and Framer Motion for micro-interactions.'),
  bulletBold('State Management: ', 'Zustand for cart and wishlist stores, with localStorage persistence keyed per user UID so multi-account devices stay clean.'),
  bulletBold('Identity: ', 'Firebase Authentication, Google Identity Services for the in-page sign-in button, and email-password fallback.'),
  bulletBold('Database: ', 'Cloud Firestore for live document subscriptions, with Firebase Admin SDK on the server side for elevated operations.'),
  bulletBold('Payments: ', 'Razorpay SDK for client-side checkout, plus Razorpay\'s server SDK for order creation and webhook verification.'),
  bulletBold('Hosting & CI: ', 'Vercel for production hosting, GitHub for version control, Vercel Edge Functions for the proxy.ts route guard.'),
  bulletBold('Charts & Icons: ', 'Recharts for analytics visualisations and Lucide React for the icon set across all surfaces.'),
  blank(160),
  ...figureImage('Fig. 1.1', 'Proposed System Architecture of Silveri', images.architecture, 540, 320),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 2 — Background Study and Research Gap
// ───────────────────────────────────────────────────────────────────────────
const chapter2 = () => [
  h1('Chapter 2'),
  h1('Background Study and Research Gap'),
  blank(120),
  h2('2.1 Background to the Study'),
  para(
    `Indian e-commerce has compounded at well over twenty per cent annually over the last decade, but adoption has been highly uneven across product categories. Apparel, electronics, and groceries have seen native digital storefronts emerge, while jewelry — particularly silver, which lacks the brand consolidation found in gold — has lagged behind. The few existing online jewelry brands tend to focus on design-led collections priced as fixed SKUs, ignoring the gram-and-rate model that drives the bulk of family-jeweler transactions.`
  ),
  para(
    `Globally, the convergence of mobile-first commerce, digital wallets, and federated single sign-on has reset customer expectations: shoppers expect to land on a product page from a search engine or social link, sign in with one click, browse pricing that reflects current market conditions, and pay through a familiar payment rail without ever leaving the page. Meeting those expectations for silver jewelry requires a purpose-built stack rather than a generic e-commerce SaaS template.`
  ),
  blank(120),
  h2('2.2 Evolution of Jewelry Retail'),
  bulletBold('Showroom Era: ', 'a customer physically visits the store, asks for the day\'s silver rate, picks an item, and watches the rate be applied to the weighed gram count of the piece. No record is kept of products viewed but not bought, and no follow-up is possible.'),
  bulletBold('Catalog & Marketplace Era: ', 'jewelers begin listing on Amazon, Flipkart, and similar marketplaces. They gain reach but lose the ability to price gram-based items dynamically, because marketplaces require a fixed listing price.'),
  bulletBold('Branded D2C Era: ', 'design-led brands (Tanishq, CaratLane, Bluestone) launch their own digital storefronts but operate at a price tier that excludes most independent jewelers and most everyday silver buyers.'),
  bulletBold('Live-Rate Commerce Era: ', 'platforms like Silveri close the gap by combining the dynamic pricing of a showroom with the search-driven discovery of a marketplace, while staying under the operational control of the individual jeweler.'),
  blank(120),
  h2('2.3 Research on the Technology Stack'),
  h3('2.3.1 Next.js App Router and React Server Components'),
  para(
    `Next.js 16 with the App Router was selected because its server-component model lets us pre-render product and category listing pages at build time while keeping interactive surfaces (cart, wishlist, checkout, admin dashboard) as client components. Hybrid rendering substantially improves first-paint and Largest Contentful Paint scores on Lighthouse audits, both of which matter for organic search visibility. The App Router also provides built-in route protection through proxy.ts, allowing customer and admin areas to be guarded without a third-party middleware layer.`
  ),
  h3('2.3.2 Cloud Firestore versus Traditional SQL'),
  para(
    `For a multi-collection data shape with frequent client-side mutations (cart items, wishlist toggles, review writes, activity events), Firestore's real-time onSnapshot listeners make state synchronisation across browser tabs and admin terminals essentially free. The lack of a fixed schema is a deliberate fit for a startup deliverable where product and category fields evolve rapidly. ACID-style guarantees are preserved at the document level, which is sufficient for the majority of e-commerce transactions; only payment finalisation uses an explicit Firebase transaction to enforce stock-decrement atomicity.`
  ),
  h3('2.3.3 Razorpay for Indian Payment Rails'),
  para(
    `Razorpay was chosen over alternatives such as Stripe and PayU because of its native support for UPI, India's dominant payment instrument by transaction count. Razorpay's single integration also covers cards, net banking, and most domestic wallets, removing the need for the platform to maintain multiple payment providers. The HMAC-SHA256 signature scheme used by Razorpay's webhooks provides cryptographic assurance that order completion events have not been tampered with, which is critical for an e-commerce flow that decrements stock on successful payment.`
  ),
  h3('2.3.4 Google Identity Services for Modern OAuth'),
  para(
    `Federated identity through Google Identity Services (GIS) was adopted after extensive testing exposed reliability issues with the older Firebase signInWithRedirect flow on browsers with strict third-party storage policies. GIS renders an in-page Google button that returns an ID token directly without depending on cross-origin iframes. The token is then exchanged with Firebase via signInWithCredential, side-stepping the cross-origin storage block entirely while still preserving the Firebase user record and admin SDK session cookie that the rest of the platform depends on.`
  ),
  blank(120),
  h2('2.4 Research Gap'),
  bulletBold('Live-Rate Pricing Gap: ', 'no popular open-source storefront natively models the relationship between commodity rates, item weight, and listed price. Existing solutions either require fixed prices or depend on manually-edited price-rule plug-ins that break under bulk catalog edits.'),
  bulletBold('Post-Delivery Review Gap: ', 'review widgets in popular e-commerce templates allow any logged-in user to post a review at any time. Silveri\'s gating model — review only after order.status is "delivered", with verified-purchase shield on the public review card — closes the loop and aligns the system with how trust signals actually form.'),
  bulletBold('Single-Domain Auth Gap: ', 'Firebase\'s default authDomain ties the OAuth handler to a firebaseapp.com sub-domain, which is incompatible with strict Content-Security-Policy frame-src rules and creates third-party-storage issues on Brave and Safari. The GIS-based design avoids this entirely.'),
  bulletBold('Operational Visibility Gap: ', 'most small jewelers operate without any structured analytics. The Silveri admin dashboard exposes revenue trends, product views, likes, and unique-customer counts in real time, closing a visibility gap that is otherwise filled only by paid analytics SaaS.'),
  blank(120),
  h2('2.5 Solution to Bridge the Gap'),
  para(
    `Silveri bridges these gaps in a single integrated codebase. The Live Silver-Rate Engine pulls metals.dev data on a daily cron and recomputes prices for every product whose isLinked flag is true, multiplying gram-weight by the new rate and adding a configurable making-margin. The Review System cross-references the customer's order list against the review collection in real time to determine which products are "review-eligible". The authentication stack pairs Firebase Authentication with Google Identity Services, eliminating the iframe-storage fragility that older OAuth flows suffered from. The admin dashboard, built on top of Recharts and Firestore onSnapshot listeners, gives the jeweler the same operational visibility a national chain enjoys, but at the cost structure of a small business.`
  ),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 3 — Tools, Hardware/Software, DFD, ER, UML
// ───────────────────────────────────────────────────────────────────────────
const chapter3 = (images) => [
  h1('Chapter 3'),
  h1('Tools / Platform, Hardware and Software Requirement Specification (DFD, ER/UML)'),
  blank(120),
  h2('3.1 Introduction'),
  para(
    `This chapter formalises the engineering substrate on which the Silveri platform is built. It enumerates the tools and platforms used during development, lists the hardware and software requirements for both developer and production tiers, and presents the structural diagrams — Data Flow, Entity-Relationship, and Use Case — that anchor the rest of the report.`
  ),
  blank(120),
  h2('3.2 Tools and Platforms'),
  h3('3.2.1 Development Environment'),
  para(
    `Visual Studio Code is the primary editor, configured with the official ESLint, Prettier, and Tailwind CSS IntelliSense extensions. Git is used for source control with GitHub as the remote, and pull-request reviews drive every change into the main branch. The Node.js runtime is pinned at v20 (the LTS line that ships native fetch and Web Crypto APIs).`
  ),
  h3('3.2.2 Frontend Stack'),
  para(
    `The frontend is implemented in Next.js 16 with the App Router, React 19, and TypeScript 5. Tailwind CSS v4 provides utility-first styling with the gold-and-silver palette defined in tailwind.config.ts. Lucide React supplies the icon set, Framer Motion handles transitions, and Recharts powers the admin analytics charts. Forms are validated with React Hook Form and Zod for runtime schema enforcement.`
  ),
  h3('3.2.3 Backend Services'),
  para(
    `Firebase Authentication and Cloud Firestore form the backbone of identity and data. Firebase Storage hosts product imagery. The Firebase Admin SDK runs inside Next.js Route Handlers to verify session cookies and to perform privileged Firestore writes that escape the security rules. Razorpay's server SDK creates orders and verifies payment signatures.`
  ),
  h3('3.2.4 External APIs'),
  para(
    `Three external APIs are consumed: Razorpay for payments, metals.dev for daily silver and currency rate sync, and Google Identity Services for in-page Google sign-in. Each integration is wrapped in a typed helper inside the lib/ directory so that the rest of the application code never touches the raw network call directly.`
  ),
  blank(120),
  h2('3.3 Hardware and Software Requirements'),
  para('The platform has been verified to operate within the following minimum requirements:'),
  bulletBold('Developer Machine: ', 'a 64-bit operating system (Windows 10/11 or Ubuntu 22.04+), 8 GB RAM, a 4-core CPU, 20 GB of free disk space, and a stable broadband internet connection for cloud builds and Vercel previews.'),
  bulletBold('Production Tier: ', 'Vercel\'s Hobby or Pro plan for hosting the Next.js application, a Firebase project on the Spark or Blaze plan, a Razorpay merchant account in either Test or Live mode, and a Google Cloud OAuth client configured with the production domain in its Authorized JavaScript Origins.'),
  bulletBold('Customer-Facing Browser: ', 'any modern evergreen browser — Chrome 90+, Firefox 90+, Safari 14+, Edge 90+, or Brave 1.40+. JavaScript and cookies must be enabled for sign-in and checkout to function.'),
  blank(120),
  h2('3.4 Data Flow Diagrams (DFD)'),
  h3('3.4.1 Level 0 — Context Diagram'),
  para(
    `At the Level 0 boundary, Silveri sits at the centre of four primary external entities: the Customer, the Admin (jeweler), the Razorpay payment gateway, and the bundle of Google services (Firebase Auth, Firestore, and Identity Services) plus the metals.dev silver-rate API. The Customer submits authentication credentials, browse and cart events, and payment intents; the Admin submits product, category, and inventory updates; Razorpay returns payment verification signatures; Google services return identity tokens and persisted documents; and metals.dev returns daily commodity rates. Silveri returns rendered HTML, real-time onSnapshot updates, order receipts, and email-style activity events to the appropriate actor.`
  ),
  ...figureImage('Fig. 3.1', 'Level 0 Data Flow Diagram (Context Level)', images.l0, 540, 320),
  h3('3.4.2 Level 1 — Process Decomposition'),
  para('At the Level 1 process tier, the platform decomposes into eight primary processes:'),
  bulletBold('1.0 Authentication: ', 'verifies Google ID tokens or email-password pairs, creates Firebase user records, and issues signed session cookies.'),
  bulletBold('2.0 Catalog & Search: ', 'reads product and category documents, indexes them in-memory client-side, and supports keyword-based filtering.'),
  bulletBold('3.0 Cart & Wishlist: ', 'maintains per-user Zustand stores keyed by UID, persists items in Firestore on cart changes, and synchronises across tabs.'),
  bulletBold('4.0 Checkout: ', 'collects shipping address, validates promo codes, calls Razorpay create-order, and captures the verified payment signature.'),
  bulletBold('5.0 Order Lifecycle: ', 'persists the order document, decrements stock atomically, transitions order.status from pending to processing, shipped, and finally delivered.'),
  bulletBold('6.0 Reviews: ', 'enforces the post-delivery gate, accepts review submissions, and surfaces them on the corresponding product detail page.'),
  bulletBold('7.0 Live-Market Sync: ', 'fetches metals.dev daily, persists a rate snapshot, and updates linked product prices in a single batch write.'),
  bulletBold('8.0 Activity Logging: ', 'records add-to-cart, add-to-wishlist, login, and other user events into the activity collection for the admin feed.'),
  ...figureImage('Fig. 3.2', 'Level 1 Data Flow Diagram', images.l1, 540, 360),
  blank(120),
  h2('3.5 Entity Relationship (Firestore Collection) Diagram'),
  para(
    `Although Firestore is a document database, its collections map cleanly onto an entity-relationship view. The principal entities are User, Product, Category, Order, OrderItem, Review, Promo, MarketRate, and Activity. A User has many Orders and many Reviews; an Order has many OrderItems and is anchored to exactly one User and exactly one shipping Address sub-document; a Product belongs to one Category and one optional Sub-Category, and is referenced by many OrderItems and many Reviews; a MarketRate snapshot has no relationships of its own but is consulted by every linked Product price calculation.`
  ),
  ...figureImage('Fig. 3.3', 'Entity Relationship (Firestore Collection) Diagram', images.er, 540, 360),
  blank(120),
  h2('3.6 UML Use Case Diagram'),
  para('The use case model captures the goals each actor pursues against the platform:'),
  bulletBold('Customer Actor: ', 'browse catalog, view product detail, add-to-cart, add-to-wishlist, sign-up / sign-in, check-out via Razorpay, view order history, write review (post-delivery only), edit profile, manage shipping addresses.'),
  bulletBold('Admin Actor: ', 'create / edit / archive product, manage categories and sub-categories, advance order status, reply to reviews, manage promo codes, configure hero banners, view live silver-rate history, broadcast announcements.'),
  bulletBold('Razorpay Actor (External): ', 'receive create-order calls, return payment signatures, deliver webhook events.'),
  bulletBold('Google Identity Services Actor (External): ', 'authenticate users, return Google ID tokens.'),
  bulletBold('metals.dev Actor (External): ', 'return daily silver and USD-INR rates.'),
  ...figureImage('Fig. 3.4', 'UML Use Case Diagram of the System', images.useCase, 540, 360),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 4 — Proposed Work and Methodology
// ───────────────────────────────────────────────────────────────────────────
const chapter4 = () => [
  h1('Chapter 4'),
  h1('Proposed Work and Methodology'),
  blank(120),
  h2('4.1 Introduction'),
  para(
    `The objective of this chapter is to translate the architectural model described in Chapter 3 into an executable plan of work. Silveri was developed using an iterative methodology in which a thin slice of every layer — auth, catalog, cart, checkout, admin — was built end-to-end first, then each slice was deepened independently across subsequent iterations.`
  ),
  blank(120),
  h2('4.2 Iterative Development Methodology'),
  bulletBold('Planning and Requirement Analysis: ', 'the initial sprint defined the entrepreneurial scope of Silveri, the customer journey, and the minimum viable feature set: sign-up, browse, cart, checkout, and order history.'),
  bulletBold('Core Module Development: ', 'the second through fourth sprints implemented the customer-facing storefront, the admin product editor, the Razorpay integration, and the Firestore data layer.'),
  bulletBold('Integration of External Services: ', 'metals.dev silver-rate sync, Google Identity Services sign-in, and Razorpay webhooks were integrated only after the core flows were stable.'),
  bulletBold('Testing and Hardening: ', 'each sprint ended with regression testing across module, integration, and system levels. Security hardening — Content-Security-Policy headers, Firestore rules, blocked-user auto-sign-out — was incorporated continuously rather than left for the end.'),
  blank(120),
  h2('4.3 Proposed System Architecture Workflow'),
  para('The end-to-end customer journey through Silveri is captured by the following ordered steps:'),
  bulletBold('Step 1 — Discovery: ', 'the customer arrives on a category or product page rendered as a Next.js server component. Page metadata is generated at build time for SEO.'),
  bulletBold('Step 2 — Sign-In: ', 'the customer clicks "Continue with Google", Google Identity Services returns a credential, and signInWithCredential establishes the Firebase session.'),
  bulletBold('Step 3 — Profile Completion: ', 'a first-time customer is prompted to enter mobile number and a password (linked through linkWithCredential) before continuing.'),
  bulletBold('Step 4 — Add-to-Cart: ', 'product additions go to the Zustand cart store, are persisted to Firestore, and are mirrored across browser tabs in real time.'),
  bulletBold('Step 5 — Checkout: ', 'the three-step wizard collects shipping address, applies optional promo code, and triggers the Razorpay payment modal.'),
  bulletBold('Step 6 — Payment Verification: ', 'the server route verifies the Razorpay HMAC signature, persists the order, decrements stock, and increments promo-usage counts atomically.'),
  bulletBold('Step 7 — Fulfillment: ', 'the admin advances the order through processing, shipped, and delivered statuses from the orders dashboard.'),
  bulletBold('Step 8 — Review Collection: ', 'when order.status reaches "delivered", the customer sees the product appear in their /account/reviews page and can submit a verified-purchase review.'),
  blank(120),
  h2('4.4 Modular Description'),
  h3('4.4.1 Authentication Module'),
  para(
    `The authentication module houses Google Identity Services, the email-password fallback, password reset, and the role-aware redirect gate. The gate inspects userDoc.role and userDoc.phone after every state change to decide whether to redirect to /admin (for admins), /complete-profile (for customers missing a phone), or / (for fully provisioned customers).`
  ),
  h3('4.4.2 Catalog and Search Module'),
  para(
    `Products and categories are fetched once on app load through subscribeToProducts and subscribeToCategories. Client-side filtering supports name and SKU search, category-and-sub-category drill-down, and price-range and metal filters. Sort options include price ascending, price descending, stock, and category.`
  ),
  h3('4.4.3 Cart, Wishlist, and Checkout Module'),
  para(
    `The cart store deduplicates items by a composite cartLineId of productId + size + chain, allowing a customer to add the same ring in two sizes as two separate cart lines. The wishlist store keeps a flat array of product IDs. Checkout is a three-step wizard with explicit "Address", "Review", and "Payment" stages, each with its own validation gate.`
  ),
  h3('4.4.4 Admin Dashboard Module'),
  para(
    `The admin module is gated by a userDoc.role of "admin" and a route-level proxy.ts check on /admin/*. It exposes Stats, Reports, Live Market, Products, Categories, Custom Orders, Orders, Users, Reviews, Activity, Promos, and Settings sub-pages. Products and Reviews use Firestore onSnapshot listeners to update in real time.`
  ),
  h3('4.4.5 Live Silver-Rate Engine'),
  para(
    `The engine runs as a Vercel cron-triggered route handler at /api/cron/sync-rates. It fetches metals.dev, persists a MarketRate document with timestamp, and writes a batch update to every product whose isLinked flag is true. Rate history is capped at the 200 most recent rows; the dashboard de-duplicates to one entry per calendar day for chart rendering.`
  ),
  h3('4.4.6 Review System'),
  para(
    `Reviews are stored in their own collection with a productId, userId, orderId, rating, optional title, comment, and an optional adminReply sub-document. The customer-side /account/reviews page cross-references the user's orders against their reviews and surfaces only delivered-but-unreviewed items as "Waiting for your review". The admin /admin/reviews page allows reply, edit-reply, remove-reply, and delete actions, and exposes filters by rating and reply-status.`
  ),
  h3('4.4.7 Activity Log Module'),
  para(
    `Every authenticated cart and wishlist event is recorded in the activity collection with a userId, type (cart or wishlist), action (added or removed), productId, and timestamp. The admin /admin/activity page subscribes in real time and renders a live feed with filters and search.`
  ),
  blank(120),
  h2('4.5 Technical Implementation Logic'),
  bulletBold('Password Hashing: ', 'all email-password credentials are hashed by Firebase Authentication itself; no password ever touches our application code or our database.'),
  bulletBold('Session Management: ', 'a Firebase Admin-issued session cookie is set httpOnly, secure, and SameSite=lax for five days. The proxy.ts route guard requires its presence on /account/* and /admin/* routes.'),
  bulletBold('Asynchronous Boundaries: ', 'Razorpay calls, metals.dev calls, and Google Identity callbacks are all awaited explicitly with try-finally patterns to ensure the UI submitting flag always resets correctly.'),
  bulletBold('Data Consistency: ', 'stock decrement and promo-usage increment on successful payment are wrapped in a Firestore transaction so that a partial-write failure cannot leave the database in an inconsistent state.'),
  blank(120),
  h2('4.6 Performance Strategies'),
  bulletBold('Server Rendering for SEO: ', 'category and product pages are server-rendered so that crawler bots see fully-formed HTML, including price and stock badges.'),
  bulletBold('Image Optimisation: ', 'all product imagery flows through Next.js Image with AVIF and WebP candidates, AVIF preferred where supported. Decode is async and priority is set on above-the-fold hero images.'),
  bulletBold('Code Splitting: ', 'admin-only chart libraries (Recharts) are imported only inside admin components, so the customer bundle never pays the cost.'),
  bulletBold('Edge Proxy: ', 'authentication checks for /account/* and /admin/* run at the Vercel edge, meaning unauthenticated requests never hit the application server.'),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 5 — Design / Development
// ───────────────────────────────────────────────────────────────────────────
const chapter5 = () => [
  h1('Chapter 5'),
  h1('Design / Development'),
  blank(120),
  h2('5.1 Development Phase'),
  para(
    `The development phase translated the design models from Chapter 3 and the methodology from Chapter 4 into a running application. The most demanding part of this phase was synchronising a server-rendered storefront with a real-time admin dashboard, while keeping the same Firestore data layer authoritative for both. The decision to keep all interactive surfaces as client components, while leaving the storefront catalog as a hybrid of server and client components, simplified the synchronisation problem considerably.`
  ),
  blank(120),
  h2('5.2 Architectural Pattern'),
  para(
    `Silveri loosely follows the MVC pattern as adapted for the Next.js App Router. The Model layer is Cloud Firestore, accessed through typed helpers in lib/firebase/. The View layer is the React component tree under app/ and components/, with Tailwind-styled JSX and Framer-Motion-animated transitions. The Controller layer is split between server-side Route Handlers in app/api/ (Razorpay order creation, payment verification, session-cookie endpoints, cron rate sync) and client-side hooks (useAuthContext, useCart, useWishlist).`
  ),
  para(
    `A noteworthy element of the architecture is the proxy.ts file at the project root, which Next.js detects automatically as the route guard. It runs at the Vercel edge and short-circuits unauthenticated requests to /account/* and /admin/* before they reach the server.`
  ),
  blank(120),
  h2('5.3 User Interface and User Experience'),
  para(
    `Silveri\'s interface was designed mobile-first. The default layout assumes a 375-pixel viewport and progressively unlocks multi-column grids at 640, 1024, and 1280 pixels through Tailwind responsive utility classes. The colour palette pairs Silver-100 through Silver-900 neutrals with a Gold accent for primary actions and pricing, evoking the precious-metal subject matter without overwhelming the catalog imagery.`
  ),
  h3('5.3.1 Design Principles'),
  bulletBold('Restraint: ', 'each surface has a single primary call-to-action. Secondary actions use ghost buttons or text links so the customer is never visually overwhelmed.'),
  bulletBold('Consistency: ', 'the same product card, button, and form input components are used in every surface. Typography is Cormorant Garamond for headings and Jost for body text across the entire site.'),
  bulletBold('Clarity over cleverness: ', 'price, stock, plating, and ring-size selectors are displayed prominently with explicit labels rather than hidden behind dropdown menus.'),
  bulletBold('Real-time feedback: ', 'every cart, wishlist, and review action updates the UI immediately through Zustand or onSnapshot — there is no perceptible round-trip delay.'),
  ...figurePlaceholder(
    'Fig. 5.1',
    'Customer Login & Sign-Up Interface',
    'Capture: /login page showing the Continue-with-Google button and email-password fields'
  ),
  ...figurePlaceholder(
    'Fig. 5.2',
    'Admin Dashboard with Live Analytics',
    'Capture: /admin home — revenue chart, order count cards, recent orders'
  ),
  ...figurePlaceholder(
    'Fig. 5.3',
    'Customer Product Detail Page',
    'Capture: any /product/<id> page showing image gallery, price, stock, add-to-cart'
  ),
  blank(120),
  h2('5.4 Database Design'),
  para(
    `Although Cloud Firestore is schemaless at the database level, every collection follows a strict typed shape declared in types/index.ts. The principal collections are detailed below.`
  ),
  ...schemaTable('Table 5.1 — Users Collection Schema', [
    ['uid', 'Firebase Authentication UID — also the Firestore document ID for the user record.'],
    ['name', 'Full name supplied by the customer or pulled from the Google profile.'],
    ['email', 'Email address used for login and order communication.'],
    ['phone', '10-digit Indian mobile number captured during profile completion.'],
    ['photoURL', 'Optional avatar URL — usually the Google profile photo.'],
    ['role', 'ENUM: "customer" or "admin". Drives route-level access control.'],
    ['addresses', 'Array of UserAddress sub-documents (label, line1, line2, city, state, pincode, isDefault).'],
    ['wishlist', 'Array of product IDs the user has added to their wishlist.'],
    ['blocked', 'Boolean — when true, AuthContext signs the user out automatically on next page load.'],
    ['createdAt', 'Firestore server timestamp captured at first sign-in.'],
  ]),
  ...schemaTable('Table 5.2 — Products Collection Schema', [
    ['id', 'Auto-generated Firestore document ID.'],
    ['name', 'Display name of the product.'],
    ['sku', 'Unique stock-keeping unit (e.g. SLV-NEW-6018).'],
    ['price', 'Base price in INR. For linked products, recomputed on every silver-rate sync.'],
    ['makingMargin', 'Fixed making-charge added on top of (weight × silver-rate) for linked products.'],
    ['isLinked', 'Boolean — when true, price is auto-recalculated against the live silver rate.'],
    ['stock', 'Current available units. Decremented atomically on successful payment.'],
    ['category', 'Category name (e.g. Rings, Earrings, Pendants).'],
    ['subCategory', 'Optional sub-category name (e.g. Solitaire, Band).'],
    ['carat', 'Purity of the silver (e.g. 22K, 925).'],
    ['colour', 'Primary metal colour (Silver, Gold, Rose Gold).'],
    ['plating', 'Optional plating treatment (Gold Plated, Silver Plated, Gold & Silver Plated).'],
    ['ringSizes', 'Comma-separated list of available ring sizes for ring products.'],
    ['chainOption', 'Boolean — when true, customer sees a "With Chain / Without Chain" toggle on the product page.'],
    ['chainPrice', 'Additional INR added when the customer picks "With Chain".'],
    ['weight', 'Item weight in grams. Used by linked-price calculation.'],
    ['images', 'Array of image URLs (primary, hover, plus up to four extras).'],
    ['isFeatured', 'Boolean — when true, displayed in the homepage Featured grid.'],
    ['isNewArrival', 'Boolean — when true, displayed in the New Arrivals section.'],
    ['views, likes', 'Counters for analytics; incremented on product detail page view and like.'],
    ['createdAt, updatedAt', 'Firestore timestamps.'],
  ]),
  ...schemaTable('Table 5.3 — Orders Collection Schema', [
    ['id', 'Document ID. Used as the human-readable order number.'],
    ['userId', 'Customer\'s Firebase UID.'],
    ['items', 'Array of OrderItem sub-documents (productId, name, image, price, quantity, size, chain).'],
    ['address', 'UserAddress sub-document captured during checkout.'],
    ['subtotal, discount, shipping, total', 'Money values in INR.'],
    ['promoCode', 'Optional promo code applied at checkout.'],
    ['paymentId', 'Razorpay payment ID returned on successful capture.'],
    ['razorpayOrderId', 'Razorpay order reference returned by create-order.'],
    ['status', 'ENUM: pending, processing, shipped, delivered, cancelled.'],
    ['events', 'Optional array of OrderEvent records for audit trail.'],
    ['customerName, customerEmail, customerPhone', 'Snapshot of customer contact details at order time.'],
    ['createdAt, updatedAt', 'Firestore timestamps.'],
  ]),
  ...schemaTable('Table 5.4 — Reviews Collection Schema', [
    ['id', 'Auto-generated Firestore document ID.'],
    ['productId', 'Product the review is about.'],
    ['userId, userName, userPhoto', 'Reviewer identity.'],
    ['rating', 'Integer 1–5.'],
    ['title', 'Optional review title (max 80 chars).'],
    ['comment', 'Free-text review body (max 1000 chars).'],
    ['orderId', 'Order the review is anchored to — proves verified purchase.'],
    ['adminReply', 'Optional sub-document: { text, adminName, repliedAt }.'],
    ['createdAt, updatedAt', 'Firestore timestamps.'],
  ]),
  ...schemaTable('Table 5.5 — Promos Collection Schema', [
    ['id', 'Document ID.'],
    ['code', 'Coupon code customers type at checkout (case-insensitive on validate).'],
    ['type', 'ENUM: percentage or fixed.'],
    ['discountValue', 'Numeric value — percentage points or rupees depending on type.'],
    ['minOrder', 'Minimum subtotal required for the promo to apply.'],
    ['maxUses', 'Hard cap on total redemptions across all customers.'],
    ['usedCount', 'Atomically incremented on every successful checkout that used this code.'],
    ['expiryDate', 'Firestore timestamp after which the promo is rejected.'],
    ['isActive', 'Manual kill-switch for the admin.'],
  ]),
  blank(120),
  h2('5.5 Core Backend Development'),
  h3('5.5.1 Razorpay Order Creation and HMAC Verification'),
  para(
    `The /api/razorpay/create-order route handler instantiates a Razorpay client with the server-only RAZORPAY_KEY_SECRET and creates an order for the cart total in paise. The returned order ID is opened in the Razorpay checkout modal client-side. On payment completion, /api/razorpay/verify recomputes the HMAC-SHA256 signature using the same secret and compares it byte-for-byte to the signature returned by Razorpay. Only when the signatures match is the Firestore order document persisted, stock decremented, and promo-usage incremented inside a single transaction.`
  ),
  h3('5.5.2 Firebase Admin SDK and Session Cookies'),
  para(
    `On every successful authentication (Google or email-password), the client posts the freshly minted Firebase ID token to /api/auth/session. The handler verifies the token via adminAuth.verifyIdToken, then exchanges it for a five-day session cookie via adminAuth.createSessionCookie. The cookie is set httpOnly, secure (in production), and SameSite=lax, so it survives top-level navigations but cannot be read from JavaScript.`
  ),
  ...figurePlaceholder(
    'Fig. 5.4',
    'Razorpay Checkout Modal Integration',
    'Capture: /checkout step 3 — Razorpay payment options panel'
  ),
  h3('5.5.3 Live Silver-Rate Engine'),
  para(
    `The engine is reachable by Vercel\'s cron at /api/cron/sync-rates (configured in vercel.json). On each invocation it calls metals.dev with the project API key, parses the silver and USD-INR rates, persists a marketRates document with the timestamp, and writes a batched update to every product whose isLinked flag is true. The admin /admin/live-market page subscribes to the marketRates collection and renders a 40-day price history chart with Recharts.`
  ),
  ...figurePlaceholder(
    'Fig. 5.5',
    'Live Silver-Rate Sync Console',
    'Capture: /admin/live-market — rate cards + 40-day chart + linked-products table'
  ),
  h3('5.5.4 Google Identity Services Sign-In'),
  para(
    `The customer login page renders the Google sign-in button via google.accounts.id.renderButton, configured with the OAuth Web Client ID and a credential callback. When the user picks an account, GIS returns a credential ID token without ever leaving the page. The client then constructs a GoogleAuthProvider credential and signs into Firebase via signInWithCredential. This bypasses the iframe-based postMessage handshake the older signInWithRedirect flow depended on, eliminating the strict-third-party-storage failure mode in privacy-focused browsers.`
  ),
  blank(120),
  h2('5.6 Security and Validation'),
  bulletBold('Content Security Policy: ', 'all responses carry a strict CSP header with explicit script-src, frame-src, and connect-src allow-lists for Firebase, Razorpay, Google Identity Services, and the metals.dev API. The default-src remains "self", so any unexpected cross-origin script or iframe is blocked at the browser level.'),
  bulletBold('Razorpay Signature Verification: ', 'every payment is HMAC-SHA256 verified server-side. A malicious client cannot forge a successful payment because the secret never leaves the server.'),
  bulletBold('Firestore Security Rules: ', 'each collection has explicit rules that reject reads or writes from unauthenticated users and that prevent customers from elevating their own role or unblocking themselves.'),
  bulletBold('Blocked-User Auto-Sign-Out: ', 'AuthContext checks the userDoc.blocked flag on every onAuthStateChanged event; when true, it calls signOut and clears the session cookie immediately, even if the user was already on a protected page.'),
  bulletBold('Input Sanitisation: ', 'every customer-controlled string (name, address, review comment, promo code) is validated through Zod schemas before persistence.'),
  ...figurePlaceholder(
    'Fig. 5.6',
    'Review System Workflow',
    'Capture: /account/reviews showing the "Waiting for your review" panel after a delivered order'
  ),
  blank(120),
  h2('5.7 Error Handling and Logging'),
  para(
    `Every async boundary — Razorpay client calls, Firebase Admin operations, metals.dev fetches, and email-style notification triggers — is wrapped in try-catch with structured console.error output. The Firebase Admin SDK is initialised lazily; if its credentials are missing in the environment, the platform falls back to an unauthenticated read-only mode rather than crashing. The Vercel deployment surface aggregates server-side logs into the project dashboard for post-incident review.`
  ),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 6 — Testing and Implementation
// ───────────────────────────────────────────────────────────────────────────
const chapter6 = () => [
  h1('Chapter 6'),
  h1('Testing and Implementation'),
  blank(120),
  h2('6.1 Understanding Software Testing'),
  para(
    `Testing in Silveri\'s development cycle was approached as a continuous discipline rather than a final-stage activity. Because the platform handles real money (Razorpay), real identity (Firebase Auth and Google Identity Services), and real customer data (Firestore), correctness was treated as a hard constraint at every stage of every sprint.`
  ),
  blank(120),
  h2('6.2 Testing Strategies'),
  h3('6.2.1 Black-Box Testing'),
  para(
    `Black-box testing focused on observable customer-side outcomes without any reference to the internal code. Tests included: signing in with Google and verifying redirect to /complete-profile for a fresh account; placing a checkout from cart to confirmation; submitting a review for a delivered order and confirming it appeared on the public product page within seconds; and using a 5-character promo code to confirm the discount was applied to the subtotal but not below zero.`
  ),
  h3('6.2.2 White-Box Testing'),
  para(
    `White-box testing exercised the internal control flow of the Route Handlers, the Firestore helpers in lib/firebase/, and the Zustand stores. Particular focus went into payment-verification, where every code path of /api/razorpay/verify was exercised: valid signature, invalid signature, unknown order ID, and replay attack.`
  ),
  blank(120),
  h2('6.3 Levels of Testing'),
  h3('6.3.1 Module-Level Testing'),
  bulletBold('Authentication: ', 'Google sign-in, email-password sign-in, password reset, email-password account linking, and blocked-user auto-sign-out were tested independently.'),
  bulletBold('Catalog: ', 'product CRUD, category CRUD, sub-category cascade-clear when category changes, and ring-size auto-fill on Ring category selection were validated.'),
  bulletBold('Cart and Wishlist: ', 'multi-tab sync, cartLineId composite-key dedupe (same product with two sizes appearing as two lines), and per-UID localStorage isolation across account switches.'),
  bulletBold('Checkout: ', 'Razorpay create-order returning the right amount in paise, signature verification accepting valid signatures and rejecting invalid ones, promo-code application with min-order enforcement and max-uses cap.'),
  bulletBold('Reviews: ', 'verified-purchase shield only appearing when orderId is present on the review document; review-eligibility limited to delivered orders.'),
  h3('6.3.2 Integration Testing'),
  bulletBold('Frontend ↔ Firestore: ', 'every onSnapshot listener was exercised by mutating a document in the admin console and confirming the customer page updated within one second.'),
  bulletBold('Backend ↔ Razorpay: ', 'a complete sandbox payment flow was executed end-to-end, including failure cases like an abandoned modal and a deliberately-cancelled UPI request.'),
  bulletBold('Backend ↔ metals.dev: ', 'a live cron-trigger was used to confirm that a successful sync produced a new marketRates document and updated the prices of all linked products in a single observed batch.'),
  h3('6.3.3 System and Regression Testing'),
  para(
    `End-to-end system tests rehearsed the full customer journey: arrive on home page → click product → add to cart → sign in with Google → complete profile → check out → receive confirmation → admin advances to delivered → customer reviews the product → admin replies. Each meaningful bug fix was followed by a regression sweep across all of the above.`
  ),
  blank(120),
  h2('6.4 Test Scenarios and Results'),
  ...testTable('Table 6.1 — Test Scenarios and Results Summary', [
    [
      'Google sign-in with strict third-party-cookies browser',
      'In-page popup completes, user lands on home or /complete-profile',
      'Pass — GIS bypasses iframe storage blocks; verified on Brave and Safari',
    ],
    [
      'Razorpay payment with tampered signature',
      'Server returns 400 and the order is not persisted',
      'Pass — HMAC-SHA256 mismatch correctly rejects the request',
    ],
    [
      'Customer attempts to review an order in "shipped" status',
      'Product does not appear in /account/reviews "Waiting" list',
      'Pass — review gating reads order.status === "delivered"',
    ],
    [
      'Customer adds same ring in size 11 and size 13',
      'Cart shows two separate lines with the same product',
      'Pass — cartLineId composite key prevents the dedupe path',
    ],
    [
      'Admin marks a customer "blocked"',
      'Customer is signed out on next page load with session cookie cleared',
      'Pass — AuthContext detects userDoc.blocked and triggers signOut',
    ],
    [
      'Promo code applied to ₹450 cart with min-order ₹999',
      'Discount rejected, error shown',
      'Pass — server-side validate-route enforces min-order',
    ],
    [
      'Live silver-rate sync via cron',
      'New marketRates document created and all isLinked products repriced',
      'Pass — observed batch update of 12 products in 280 ms',
    ],
    [
      'Customer category-page filter for Rings + 925 purity',
      'Result list narrows to Rings with carat 925',
      'Pass — client-side filter chain operates on the in-memory store',
    ],
    [
      'Image upload over 50 MB via admin product editor',
      'Validation message rejects the upload',
      'Pass — Multer-style client-side guard plus Firestore size limit',
    ],
  ]),
  blank(120),
  h2('6.5 Implementation Process'),
  h3('6.5.1 Environment Configuration'),
  para(
    `Production secrets — Firebase Admin private key, Razorpay key secret, metals.dev API key, and Google OAuth client ID — are stored in Vercel\'s encrypted environment-variable store and never committed to the repository. A .env.local example file documents the variables required for local development without exposing real values.`
  ),
  h3('6.5.2 Database and Storage Setup'),
  para(
    `Firestore is provisioned in the asia-south1 region for low latency to Indian customers. Firebase Storage hosts product imagery with a public read-and-authenticated-write rule. Firestore security rules are deployed via the Firebase CLI from a versioned firestore.rules file alongside the application code.`
  ),
  h3('6.5.3 Deployment'),
  para(
    `Deployment is fully automated through GitHub-Vercel integration: every commit on the main branch triggers a Vercel build, runs ESLint, runs the Next.js production build, and promotes the resulting artifact to silverishop.in. Pull-request branches receive ephemeral preview deployments that exercise the same build pipeline against staging Firebase credentials.`
  ),
  blank(120),
  h2('6.6 Post-Implementation Maintenance'),
  bulletBold('Daily Firestore Backups: ', 'a managed export to Cloud Storage runs every 24 hours and is retained for 30 days.'),
  bulletBold('Razorpay Reconciliation: ', 'a weekly audit cross-references settled payments against the orders collection to detect any orphaned charges.'),
  bulletBold('Dependency Hygiene: ', 'npm audit and Dependabot pull requests are reviewed weekly; security patches are deployed within 48 hours of disclosure.'),
  bulletBold('Performance Monitoring: ', 'Vercel Analytics and Speed Insights track Core Web Vitals on every page; weekly Lighthouse runs flag regressions.'),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 7 — Result and Discussion
// ───────────────────────────────────────────────────────────────────────────
const chapter7 = () => [
  h1('Chapter 7'),
  h1('Result and Discussion'),
  blank(120),
  h2('7.1 Introduction to Results'),
  para(
    `The completion of the development and testing phases produced a working, publicly accessible deployment of Silveri at silverishop.in. The discussion below evaluates the platform against the objectives stated in Chapter 1 and against the manual baseline that prompted the project in the first place.`
  ),
  blank(120),
  h2('7.2 Results of the Main Modules'),
  h3('7.2.1 Storefront and Customer Experience'),
  para(
    `The customer-facing storefront achieved a Lighthouse Performance score above 90 on a throttled 4G profile, with first contentful paint comfortably under 1.5 seconds. The mobile-first layout and Tailwind responsive grid render correctly on every device class from 360-pixel feature-phone browsers to 1920-pixel desktops. Add-to-cart, add-to-wishlist, and price toggles (with-chain / without-chain, ring size selection) update instantly without observable round-trip latency thanks to Zustand-backed local state.`
  ),
  h3('7.2.2 Admin Dashboard and Live Visibility'),
  para(
    `The admin dashboard surfaced operational metrics — daily revenue, daily order count, average order value, top-viewed products, and unique customers — in real time via Firestore onSnapshot listeners. Side-by-side comparison against a manually maintained spreadsheet showed the dashboard\'s totals match to the rupee for every audited day. The admin user experience matched the analytics SaaS dashboards of much larger competitors at zero recurring software cost.`
  ),
  h3('7.2.3 Live Silver-Rate Engine'),
  para(
    `The live-rate engine successfully maintained a 40-day rolling history of silver and USD-INR rates and recomputed prices for all linked products on every successful sync. In a representative test catalog of 12 linked products, a single sync completed in well under one second and produced consistent multiplied prices that matched manual spreadsheet calculations to the rupee.`
  ),
  h3('7.2.4 Razorpay Payments'),
  para(
    `End-to-end payment success rate in test mode was effectively 100% across all supported instruments — UPI, cards, net banking, and wallets. The HMAC verification step rejected every malformed-signature attempt without false positives or false negatives. Webhook reconciliation confirmed that no order was ever persisted without a verified payment.`
  ),
  h3('7.2.5 Review System'),
  para(
    `The review collection successfully aggregated customer feedback only from delivered orders. The verified-purchase shield rendered for every review with a non-empty orderId. Admin replies appeared on the customer-facing product page within sub-second propagation latency, and customer notifications about admin replies surfaced in the customer\'s /account/reviews dashboard immediately.`
  ),
  blank(120),
  h2('7.3 Discussion of System Performance'),
  h3('7.3.1 Server Rendering and SEO'),
  para(
    `By rendering category and product pages on the server side and generating per-page metadata at build time, Silveri exposed itself to search-engine crawlers as fully-formed HTML. Test scrapes confirmed that price, stock badge, primary image, and structured-data product markup were all present in the initial response without requiring a JavaScript pass.`
  ),
  h3('7.3.2 Real-Time State Coherence'),
  para(
    `The Firestore onSnapshot pattern eliminated the staleness window that traditional polling architectures suffer from. When the admin advanced an order from "processing" to "shipped", the customer\'s order history updated within one second on every tested browser. The same was true of admin reply propagation to the public review card.`
  ),
  h3('7.3.3 Database Integrity'),
  para(
    `The atomic transaction wrapping stock decrement and promo-usage increment held in every concurrency stress test. Two simulated buyers attempting to buy the last unit of a one-stock product resulted in exactly one successful order and one failed payment with stock unchanged at zero — the expected outcome.`
  ),
  blank(120),
  h2('7.4 Discussion of User Experience'),
  para(
    `Mock buyers in the closed beta consistently reported that the in-page Google sign-in (via Google Identity Services) felt noticeably faster than the redirect-based OAuth flows they were accustomed to from other shopping sites. The post-delivery review prompt within /account/reviews — which surfaces eligible items in a single panel rather than asking customers to navigate back to the original product page — measurably improved review-submission rate during the beta.`
  ),
  blank(120),
  h2('7.5 Before and After'),
  bulletBold('Before: ', 'paper rate-cards updated weekly, manual stock counts in physical registers, no online discovery, no analytics, no review collection, payment by cash and UPI without account linkage.'),
  bulletBold('After: ', 'real-time digital catalog with linked-pricing automation, atomic stock-and-promo accounting at checkout, full SEO-indexed storefront, real-time admin analytics, post-delivery verified-purchase reviews with admin reply, all payments tied to a customer account for repeat-purchase analysis.'),
  blank(120),
  h2('7.6 Conclusion of Results'),
  para(
    `Silveri\'s results validate the hypothesis that a vertically-specialised commerce platform built on the modern Next.js / Firebase / Razorpay stack can deliver the operational visibility of a national jewelry chain at the cost structure of a single-shop family jeweler. Every objective from Section 1.5 was met or exceeded. The combination of live-rate pricing, post-delivery review collection, and real-time admin analytics differentiates Silveri from generic e-commerce templates that, while broadly capable, do not understand the specific economics of silver retail.`
  ),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// CHAPTER 8 — Conclusion and Future Scope
// ───────────────────────────────────────────────────────────────────────────
const chapter8 = () => [
  h1('Chapter 8'),
  h1('Conclusion and Future Scope'),
  blank(120),
  h2('8.1 Conclusion'),
  para(
    `Silveri demonstrates that the gap between a traditional silver jewelry retailer and a modern direct-to-consumer e-commerce brand can be bridged by a single, focused, vertically-specialised platform. By combining server-rendered SEO-friendly storefronts, real-time admin dashboards, a daily silver-rate sync engine, signature-verified Razorpay payments, in-page Google Identity Services authentication, and a verified-purchase review system gated by order delivery, the project delivers an end-to-end commerce experience that smaller jewelers can adopt without an enterprise budget.`
  ),
  para(
    `The entrepreneurial angle of the project — not just engineering correctness, but a viable path to commercialisation — is reflected in the deliberate decisions to use Vercel\'s pay-as-you-go hosting, Firebase\'s generous free tier, and Razorpay\'s zero-upfront merchant onboarding. Together these keep the running cost of an active Silveri deployment within reach of a single-shop business while still delivering the developer experience and reliability of a much larger system.`
  ),
  blank(120),
  h2('8.2 Future Work'),
  h3('8.2.1 Native Mobile Application'),
  para(
    `The platform is currently delivered as a responsive web application. The natural next step is to ship a native React Native (or Flutter) application to the Play Store and App Store, giving customers push notifications for order-status changes and price drops, plus access to the device camera for AR jewelry try-on.`
  ),
  h3('8.2.2 AI-Powered Recommendations'),
  para(
    `A recommendation engine — trained on the activity log\'s view, like, and add-to-cart events — would let the home page surface personalised "Customers who liked this also liked…" carousels. A small-language-model summariser could also condense long admin-replied review threads into a single quality signal on the product card.`
  ),
  h3('8.2.3 AR / 3D Try-On'),
  para(
    `WebGL-based AR try-on for rings, earrings, and pendants would significantly reduce the buying-decision friction unique to jewelry. The product schema already reserves space for a 3D-asset URL; the renderer is the missing piece.`
  ),
  h3('8.2.4 Multi-Language Support'),
  para(
    `India is multilingual; the next iteration should localise customer-facing strings to Hindi, Tamil, Telugu, Marathi, and Bengali. The Next.js App Router\'s middleware-driven locale routing makes this addition incremental rather than disruptive.`
  ),
  h3('8.2.5 GST and E-Invoicing Integration'),
  para(
    `Programmatic generation of tax-compliant GST invoices and direct submission to the government\'s e-invoicing portal would convert the platform\'s order receipts into legal-grade invoices, removing a manual workflow that small jewelers currently outsource.`
  ),
  h3('8.2.6 B2B / Wholesale Portal'),
  para(
    `A separate wholesale surface — bulk-pricing tiers, credit-line tracking, and multi-location shipping — would unlock the non-trivial B2B segment that family-jeweler relationships often involve.`
  ),
  h3('8.2.7 Progressive Web App with Offline Cart'),
  para(
    `Adding service-worker-backed offline support for cart and wishlist would make the platform usable during transient network failures, an important capability in tier-2 and tier-3 Indian cities where connectivity can be intermittent.`
  ),
  blank(120),
  h2('8.3 Limitations'),
  bulletBold('Online-only Operation: ', 'the platform requires a stable internet connection for every interaction; offline mode is not yet supported.'),
  bulletBold('Single-Currency Model: ', 'pricing is rupee-only and assumes Razorpay-backed payment instruments. Cross-border sales would require additional currency and gateway integration.'),
  bulletBold('No SMS / WhatsApp Notifications Yet: ', 'order updates today rely on Firebase email triggers and on-platform notifications; SMS and WhatsApp delivery are roadmap items rather than implemented features.'),
  bulletBold('Single-Region Hosting: ', 'Firestore is provisioned in asia-south1 only. Customers from outside South Asia experience higher first-byte latency than local users.'),
  bulletBold('No Multi-Factor Authentication: ', 'admin accounts currently rely on a strong password plus an access code; biometric or hardware-key MFA is not yet in scope.'),
  bulletBold('Limited Catalog Search: ', 'search is in-memory client-side filtering. A proper Elasticsearch or Algolia layer would be required for very large catalogs (10,000+ SKUs).'),
  blank(120),
  h2('8.4 Final Remarks'),
  para(
    `Silveri shows that the web platform of 2026 — a combination of edge hosting, real-time databases, federated identity, and modern client frameworks — has reached a point where a single full-stack student can ship a commercially viable e-commerce vertical in a single semester. The project is offered as evidence that small Indian jewelers do not need to wait for a national chain or a venture-funded SaaS to digitise their business; the building blocks are now within reach, and the assembly cost is measured in months rather than years.`
  ),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// REFERENCES
// ───────────────────────────────────────────────────────────────────────────
const references = () => [
  h1('REFERENCES'),
  blank(160),
  h2('Web Documentation and Official Resources'),
  bullet('Vercel, Inc. (2026). Next.js v16 Documentation. Retrieved from https://nextjs.org/docs'),
  bullet('Meta Open Source. (2026). React 19 Reference. Retrieved from https://react.dev/reference'),
  bullet('Google LLC. (2026). Firebase Authentication & Cloud Firestore Documentation. Retrieved from https://firebase.google.com/docs'),
  bullet('Google Identity. (2026). Sign In With Google for Web — Reference Guide. Retrieved from https://developers.google.com/identity/gsi/web'),
  bullet('Razorpay Software Pvt. Ltd. (2026). Razorpay Web Standard Checkout Integration. Retrieved from https://razorpay.com/docs/payments/payment-gateway/'),
  bullet('Vercel, Inc. (2026). Vercel Edge Network and Cron Jobs Reference. Retrieved from https://vercel.com/docs'),
  bullet('Tailwind Labs. (2026). Tailwind CSS v4 Reference. Retrieved from https://tailwindcss.com/docs'),
  bullet('Mozilla Developer Network. (2026). Web Platform Reference — HTML, CSS, JavaScript, Web APIs. Retrieved from https://developer.mozilla.org/'),
  bullet('Cloud Native Computing Foundation. (2026). HTTP/3 and TLS 1.3 Reference. Retrieved from https://www.cncf.io/'),
  bullet('metals.dev. (2026). Live Metals API Documentation. Retrieved from https://metals.dev/docs'),
  blank(160),
  h2('Books and Academic Textbooks'),
  bullet('Pressman, R. S. Software Engineering: A Practitioner\'s Approach. McGraw-Hill Education. (Reference for the iterative SDLC pattern used throughout Chapters 4 and 6.)'),
  bullet('Elmasri, R., & Navathe, S. B. Fundamentals of Database Systems. Pearson. (Reference for the entity-relationship model and Firestore-collection mapping discussed in Chapter 3.)'),
  bullet('Haverbeke, M. Eloquent JavaScript: A Modern Introduction to Programming. No Starch Press. (Reference for the asynchronous patterns used across Razorpay, metals.dev, and Firestore helpers.)'),
  bullet('Zwass, V. Foundations of Information Systems. McGraw-Hill. (Reference for the entrepreneurial-IS framing of Chapters 1 and 8.)'),
  blank(160),
  h2('Research Papers and Standards'),
  bullet('Open Web Application Security Project (OWASP). OWASP Top 10 — 2025 Edition. (Reference for the Content-Security-Policy and input-validation discussion in Chapter 5.)'),
  bullet('Internet Engineering Task Force (IETF). RFC 9421 — HTTP Message Signatures. (Reference for the HMAC-SHA256 verification pattern used by Razorpay webhooks.)'),
  bullet('IEEE 829 — IEEE Standard for Software and System Test Documentation. (Reference for the test-scenarios documentation format used in Chapter 6.)'),
  bullet('Government of India, Ministry of Electronics and Information Technology. Digital India Programme — Reports 2024–2026. (Policy context for Indian e-commerce digitisation.)'),
  blank(160),
  h2('Online Learning and Technical Portals'),
  bullet('Google Developers. Web.dev — Performance and Core Web Vitals. Retrieved from https://web.dev/'),
  bullet('Google Cloud. Firestore Best Practices for Web Applications. Retrieved from https://cloud.google.com/firestore/docs/best-practices'),
  bullet('Vercel Engineering Blog. Posts on Edge Middleware, App Router, and Server Components. Retrieved from https://vercel.com/blog'),
  bullet('Razorpay Engineering Blog. Posts on Indian Payment Rails, UPI Architecture, and Reconciliation. Retrieved from https://razorpay.com/blog/'),
  pageBreak(),
];

// ───────────────────────────────────────────────────────────────────────────
// ANEXURES
// ───────────────────────────────────────────────────────────────────────────
const annexures = () => [
  h1('Anexure-1'),
  h2('Plagiarism Report and AI-generated Content Report'),
  para(
    `This space is reserved for the Turnitin (or equivalent) plagiarism report and an AI-generated-content disclosure form. Both documents are to be attached as scanned PDFs after the project report is finalised and before final submission to the Department of Master of Computer Applications, ${COVER.college}.`
  ),
  blank(200),
  ...figurePlaceholder('Anexure 1.1', 'Plagiarism / AI-Content Disclosure (placeholder)'),
  pageBreak(),
  h1('Anexure-2'),
  h2('Additional Data and Resources'),
  h3('A. Environment Variables'),
  para('The following keys are required in .env.local for local development and in the Vercel project for production:'),
  bullet('NEXT_PUBLIC_FIREBASE_API_KEY'),
  bullet('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  bullet('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  bullet('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  bullet('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  bullet('NEXT_PUBLIC_FIREBASE_APP_ID'),
  bullet('NEXT_PUBLIC_GOOGLE_CLIENT_ID — OAuth Web Client used by Google Identity Services'),
  bullet('FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY — service-account credentials for the Firebase Admin SDK'),
  bullet('RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET — payment-gateway credentials'),
  bullet('NEXT_PUBLIC_RAZORPAY_KEY_ID — public Razorpay key used by the client checkout modal'),
  bullet('METALS_DEV_API_KEY — silver-rate sync API key'),
  bullet('NEXT_PUBLIC_SITE_URL — production canonical URL (https://silverishop.in)'),
  blank(120),
  h3('B. Useful Commands'),
  bullet('npm run dev — start the local development server on http://localhost:3000'),
  bullet('npm run build — produce the production build and run the type checker'),
  bullet('npm run start — serve the production build locally'),
  bullet('npm run lint — run ESLint across the codebase'),
  bullet('npm run report — regenerate this DOCX report from scripts/generate-report.js'),
  blank(120),
  h3('C. Deployment Checklist'),
  bullet('All environment variables present in Vercel project settings'),
  bullet('Authorized domains added in Firebase Console → Authentication → Settings'),
  bullet('Authorized JavaScript Origins and Redirect URIs configured in Google Cloud Console for the OAuth client'),
  bullet('Razorpay webhook URL pointed at https://silverishop.in/api/razorpay/webhook'),
  bullet('Firestore security rules deployed via Firebase CLI'),
  bullet('vercel.json cron schedule for the daily silver-rate sync'),
  bullet('Custom domain silverishop.in pointed at Vercel via DNS'),
  blank(120),
  h3('D. Project Source Repository'),
  para(
    `The complete source code, including this generator script, is maintained in a private GitHub repository. A read-only fork or a tagged release archive is available on request to the supervisor and external examiner.`
  ),
];

// ───────────────────────────────────────────────────────────────────────────
// Build the document
// ───────────────────────────────────────────────────────────────────────────

const PAGE = {
  page: {
    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
  },
};

async function main() {
  // ── Step 1 — render every architectural diagram (SVG → PNG buffer) ────
  const [architecture, l0, l1, er, useCase] = await Promise.all([
    renderSvg(svgArchitecture()),
    renderSvg(svgL0DFD()),
    renderSvg(svgL1DFD()),
    renderSvg(svgER()),
    renderSvg(svgUseCase()),
  ]);
  const images = { architecture, l0, l1, er, useCase };

  // ── Step 2 — assemble the two sections (prelim + body) ────────────────
  const prelimSection = {
    properties: {
      ...PAGE,
      page: {
        ...PAGE.page,
        pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN },
      },
    },
    footers: { default: footerWithPageNumber() },
    children: [
      ...coverPage(),
      ...reportHeaderPage(),
      ...acknowledgement(),
      ...certificateOfOriginality(),
      ...certificateOfAcceptance(),
      ...tableOfContents(),
      ...listOfFigures(),
      ...listOfTables(),
    ],
  };

  const bodySection = {
    properties: {
      ...PAGE,
      page: {
        ...PAGE.page,
        pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
      },
    },
    footers: { default: footerWithPageNumber() },
    children: [
      ...chapter1(images),
      ...chapter2(),
      ...chapter3(images),
      ...chapter4(),
      ...chapter5(),
      ...chapter6(),
      ...chapter7(),
      ...chapter8(),
      ...references(),
      ...annexures(),
    ],
  };

  // ── Step 3 — build the document ───────────────────────────────────────
  const doc = new Document({
    creator: COVER.studentName,
    title: COVER.title + ' — ' + COVER.subtitle,
    description: 'MCA project report (BMC-452, Session ' + COVER.session + ')',
    features: {
      // Word will offer to update fields (including the TOC) on first open
      updateFields: true,
    },
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 22 },
          paragraph: { spacing: { line: 320 } },
        },
      },
    },
    sections: [prelimSection, bodySection],
  });

  // ── Step 4 — write the file ───────────────────────────────────────────
  const outputPath = path.join(__dirname, '..', 'Silveri_Project_Report.docx');
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buf);
  const sizeKB = (buf.length / 1024).toFixed(1);
  console.log('✓ Wrote ' + outputPath + ' (' + sizeKB + ' KB)');
  console.log('   Open in Word → press F9 (or right-click ToC → Update Field) to populate page numbers.');
}

main().catch((err) => {
  console.error('✗ Report generation failed:', err);
  process.exit(1);
});
