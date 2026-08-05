/**
 * Gerador de assets de marca.
 *
 * Entrada: `public/brand/logo.png` + `lib/brand/tokens.json` + `lib/brand/splash-targets.json`.
 * Saída: favicon, ícones PWA, ícone Apple, splash screens do iOS e imagem
 * Open Graph padrão — sempre. Além disso, `tokens.source` aceita três fontes
 * opcionais (`logoHorizontal`, `logoMono`, `watermark`): quando apontadas
 * para um arquivo existente, geram `public/brand/{logo-horizontal,logo-mono,
 * watermark}.png`; ausentes ou apontando para um arquivo que não existe, são
 * puladas com aviso — o pipeline nunca falha por falta de variante.
 *
 * Rodar `pnpm brand:assets` depois de trocar a logo ou uma cor. Os arquivos
 * gerados são commitados: o build (Vercel) não roda este script.
 *
 * Uso: node scripts/generate-brand-assets.mjs
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const tokens = JSON.parse(
  await readFile(join(root, "lib/brand/tokens.json"), "utf8"),
);
const splashTargets = JSON.parse(
  await readFile(join(root, "lib/brand/splash-targets.json"), "utf8"),
);

const logoPath = join(root, tokens.source.logo);
const { surfaceDark, accent, backgroundLight } = tokens.colors;

const written = [];

async function write(relativePath, buffer) {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  written.push(`${relativePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

/**
 * A logo original é um selo circular desenhado dentro de um quadrado branco
 * opaco. Sobre o marrom da marca (ou numa aba escura) esse quadrado aparece
 * como uma moldura suja — então recortamos a moldura branca (`trim`) e
 * aplicamos uma máscara circular, devolvendo um PNG com fundo transparente.
 *
 * `sourcePath`/`mask` existem para as variantes opcionais (logo horizontal,
 * monocromática, marca d'água): todo chamador existente usa os defaults
 * (`logoPath`, máscara circular) e continua produzindo exatamente o mesmo
 * PNG de antes.
 */
async function logo(size, { sourcePath = logoPath, mask = "circle" } = {}) {
  const trimmed = await sharp(sourcePath)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(size, size, { fit: "contain", background: "#00000000" })
    .toBuffer();

  if (mask !== "circle") {
    return sharp(trimmed).png({ compressionLevel: 9 }).toBuffer();
  }

  const circle = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff" /></svg>`,
  );

  return sharp(trimmed)
    .composite([{ input: circle, blend: "dest-in" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Variante retangular (não-quadrada) de uma fonte de marca — lockup
 * horizontal, versão monocromática ou marca d'água. Sem máscara circular:
 * uma logo horizontal recortada em círculo perderia o texto lateral. Mesmo
 * `trim()` de moldura branca da `logo()`, porque não sabemos de antemão se a
 * arte enviada já vem com fundo transparente.
 */
async function variantAsset(sourcePath, { width, height }) {
  const trimmed = await sharp(sourcePath)
    .trim({ background: "#ffffff", threshold: 12 })
    .resize(width, height, { fit: "contain", background: "#00000000" })
    .toBuffer();

  return sharp(trimmed).png({ compressionLevel: 9 }).toBuffer();
}

/**
 * Resolve uma fonte opcional de `tokens.source` (`logoHorizontal`,
 * `logoMono`, `watermark`). Ausente ou apontando para um arquivo que não
 * existe: `null` + aviso — nunca derruba o script por falta de material.
 */
function resolveOptionalSource(key) {
  const relativePath = tokens.source[key];
  if (!relativePath) return null;

  const absolutePath = join(root, relativePath);
  if (!existsSync(absolutePath)) {
    console.warn(
      `Aviso: tokens.source.${key} aponta para "${relativePath}", mas o arquivo não existe — pulando essa variante.`,
    );
    return null;
  }

  return absolutePath;
}

/**
 * Logo centralizada sobre fundo opaco. `coverage` é a fração do menor lado
 * ocupada pela logo — o resto vira respiro. Ícone maskable precisa de respiro
 * grande porque o Android recorta as bordas em círculo/squircle.
 */
async function plate({ width, height, coverage, background = surfaceDark }) {
  const logoSize = Math.round(Math.min(width, height) * coverage);
  const logoBuffer = await logo(logoSize);

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logoBuffer, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Envelopa um PNG num container .ico (formato aceita PNG desde o Vista). */
function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: ícone
  header.writeUInt16LE(1, 4); // quantidade de imagens

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // largura (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // altura
  entry.writeUInt8(0, 2); // paleta
  entry.writeUInt8(0, 3); // reservado
  entry.writeUInt16LE(1, 4); // planos
  entry.writeUInt16LE(32, 6); // bits por pixel
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

/** Quebra o nome em linhas curtas para caber no bloco de texto do Open Graph. */
function wrap(text, maxChars) {
  const lines = [];
  let current = "";

  for (const word of text.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines;
}

function escapeXml(text) {
  return text.replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char],
  );
}

/**
 * Imagem de compartilhamento (1200x630 é o formato que WhatsApp, Facebook,
 * Twitter/X e LinkedIn recortam melhor). Logo à esquerda, nome e tagline à
 * direita sobre o marrom escuro da marca.
 */
async function openGraphImage() {
  const width = 1200;
  const height = 630;
  const safeWidth = 1000;
  const logoSize = 240;
  const logoTop = 66;

  // Sem medição real de fonte (o sharp não expõe métricas), estimamos a
  // largura por caractere e encolhemos a fonte até a linha mais longa caber.
  // Layout centralizado justamente porque perdoa erro de estimativa.
  const fit = (lines, maxFontSize, widthPerChar) => {
    const longest = Math.max(...lines.map((line) => line.length));
    return Math.min(
      maxFontSize,
      Math.floor(safeWidth / (longest * widthPerChar)),
    );
  };

  const nameLines = wrap(tokens.name.toUpperCase(), 15);
  const nameFontSize = fit(nameLines, 96, 0.74);
  const taglineLines = wrap(tokens.tagline, 42);
  const taglineFontSize = fit(taglineLines, 36, 0.53);

  const nameLineHeight = nameFontSize * 1.02;
  const taglineLineHeight = taglineFontSize * 1.3;
  const textTop = logoTop + logoSize + 52;

  const text = (lines, fontSize, lineHeight, top, family, weight, fill) =>
    lines
      .map(
        (line, index) =>
          `<text x="${width / 2}" y="${top + fontSize + index * lineHeight}" text-anchor="middle" font-family="${family}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${escapeXml(line)}</text>`,
      )
      .join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="28%" r="66%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.32" />
      <stop offset="100%" stop-color="${surfaceDark}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${surfaceDark}" />
  <rect width="${width}" height="${height}" fill="url(#glow)" />
  <rect x="0" y="${height - 14}" width="${width}" height="14" fill="${accent}" />
  ${text(nameLines, nameFontSize, nameLineHeight, textTop, "Arial Black, Arial, Helvetica, sans-serif", 900, backgroundLight)}
  ${text(taglineLines, taglineFontSize, taglineLineHeight, textTop + nameLines.length * nameLineHeight + 18, "Arial, Helvetica, sans-serif", 700, accent)}
</svg>`;

  return sharp(Buffer.from(svg))
    .composite([
      {
        input: await logo(logoSize),
        left: Math.round((width - logoSize) / 2),
        top: logoTop,
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// --- favicon e ícones ---------------------------------------------------

// `app/icon.png` vira o <link rel="icon"> automático do Next; fundo
// transparente para a logo não brigar com o tema da aba.
await write("app/icon.png", await logo(512));
await write("public/favicon.ico", pngToIco(await logo(32), 32));

// iOS não respeita transparência no ícone da home screen: fundo opaco.
await write(
  "app/apple-icon.png",
  await plate({ width: 180, height: 180, coverage: 0.84 }),
);

await write(
  "public/icons/icon-192.png",
  await plate({ width: 192, height: 192, coverage: 0.86 }),
);
await write(
  "public/icons/icon-512.png",
  await plate({ width: 512, height: 512, coverage: 0.86 }),
);
await write(
  "public/icons/icon-maskable-512.png",
  await plate({ width: 512, height: 512, coverage: 0.6 }),
);

// --- splash screens do iOS ----------------------------------------------

for (const target of splashTargets) {
  const width = target.cssWidth * target.dpr;
  const height = target.cssHeight * target.dpr;
  await write(
    `public/splash/apple-splash-${width}x${height}.png`,
    await plate({ width, height, coverage: 0.42 }),
  );
}

// --- Open Graph ----------------------------------------------------------

await write("public/brand/og-default.png", await openGraphImage());

// --- Variantes opcionais de marca ----------------------------------------

const horizontalSource = resolveOptionalSource("logoHorizontal");
if (horizontalSource) {
  await write(
    "public/brand/logo-horizontal.png",
    await variantAsset(horizontalSource, { width: 960, height: 280 }),
  );
}

const monoSource = resolveOptionalSource("logoMono");
if (monoSource) {
  await write(
    "public/brand/logo-mono.png",
    await variantAsset(monoSource, { width: 512, height: 512 }),
  );
}

const watermarkSource = resolveOptionalSource("watermark");
if (watermarkSource) {
  await write(
    "public/brand/watermark.png",
    await variantAsset(watermarkSource, { width: 1024, height: 1024 }),
  );
}

console.log(`${written.length} assets gerados:`);
for (const line of written) console.log(`  ${line}`);
