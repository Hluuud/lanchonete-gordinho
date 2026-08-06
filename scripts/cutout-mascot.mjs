// scripts/cutout-mascot.mjs
/**
 * Recorta o mascote "Gordinho" das artes de origem, removendo o fundo
 * branco por chroma-key (distância até o branco, com pena/feather nas
 * bordas) e gerando as variantes usadas na Sprint 8.1.
 *
 * Rodar sempre que a arte-fonte (`public/brand/Boneco.png`) mudar. Os
 * arquivos gerados são commitados: o build (Vercel) não roda este script.
 *
 * Uso: node scripts/cutout-mascot.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { alphaFromDistance, distanceToWhite } from "./lib/chroma-key.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Fundo branco uniforme das duas artes-fonte do mascote. */
const INNER_THRESHOLD = 12;
const OUTER_THRESHOLD = 60;

/**
 * Remove o fundo branco de um PNG RGB, devolvendo um buffer PNG RGBA com
 * alfa calculado por pixel. Preserva a cor original do pixel — só o canal
 * alfa muda — para não escurecer bordas translúcidas.
 */
async function removeWhiteBackground(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.from(data);
  for (let i = 0; i < rgba.length; i += 4) {
    const distance = distanceToWhite(rgba[i], rgba[i + 1], rgba[i + 2]);
    rgba[i + 3] = alphaFromDistance(
      distance,
      INNER_THRESHOLD,
      OUTER_THRESHOLD,
    );
  }

  return sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function write(relativePath, buffer) {
  const target = join(root, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  console.log(`${relativePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  const cutout = await removeWhiteBackground(
    join(root, "public/brand/Boneco.png"),
  );

  // trim() acha o bounding box do conteúdo opaco a partir do canto superior
  // esquerdo (agora transparente) — sobra só a figura do Gordinho.
  //
  // Nota: chamar .metadata() num pipeline com .trim() pendente devolve as
  // dimensões ORIGINAIS (pré-trim), não as recortadas — o trim só é
  // resolvido de fato no toBuffer(). Por isso lemos width/height do
  // `info` retornado por toBuffer({ resolveWithObject: true }).
  const {
    data: trimmedBuffer,
    info: { width, height },
  } = await sharp(cutout).trim().toBuffer({ resolveWithObject: true });

  await write(
    "public/brand/mascote-full.png",
    await sharp(trimmedBuffer)
      .resize({ width: 800 })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  // Avatar: quadrado a partir do topo da figura já recortada — cabeça e
  // ombros cabem na largura inteira de um personagem em pé. Centralizado
  // horizontalmente para o caso (raro) de a figura ser mais larga que alta.
  const avatarSide = Math.min(width, height);
  const avatar = await sharp(trimmedBuffer)
    .extract({
      left: Math.round((width - avatarSide) / 2),
      top: 0,
      width: avatarSide,
      height: avatarSide,
    })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await write("public/brand/mascote-avatar.png", avatar);

  // Personagens da folha de poses "vazam" para fora da grade nominal 4x2:
  // a linha inferior tem cabeças que começam ~50px acima do limite da
  // célula, a pose "recostado" tem o braço da pose vizinha ("espátula")
  // invadindo ~10px pela direita, e a pose "mãos abertas" tem a própria
  // mão esquerda cortada no limite da célula (e o topo da cabeça da pose
  // "espátula", da linha de baixo, vazando por baixo). Margens abaixo
  // ajustam a extração para compensar — valores obtidos por inspeção
  // visual pixel a pixel da folha de origem (ver task-13-report.md).
  await cutoutPose({
    col: 1,
    row: 1,
    marginTop: 50,
    outputName: "mascote-pose-holding-burger",
  });
  await cutoutPose({
    col: 0,
    row: 1,
    marginTop: 56,
    outputName: "mascote-pose-pointing-up",
  });
  await cutoutPose({
    col: 2,
    row: 1,
    marginTop: 50,
    marginRight: -14,
    outputName: "mascote-pose-resting",
  });
  await cutoutPose({
    col: 3,
    row: 0,
    marginLeft: 50,
    marginBottom: -77,
    outputName: "mascote-pose-welcoming",
  });
}

const POSE_SHEET_COLS = 4;
const POSE_SHEET_ROWS = 2;

/**
 * Recorta uma célula da folha de poses (`Versoes_boneco.png`), remove o
 * fundo branco e salva. As margens (em px, na resolução original da
 * folha) permitem estender ou reduzir a célula nominal em qualquer
 * direção — necessário porque os personagens da folha não respeitam
 * estritamente os limites da grade 4x2.
 */
async function cutoutPose({
  col,
  row,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  outputName,
}) {
  const sheetPath = join(root, "public/brand/Versoes_boneco.png");
  const { width: sheetWidth, height: sheetHeight } =
    await sharp(sheetPath).metadata();
  const cellWidth = sheetWidth / POSE_SHEET_COLS;
  const cellHeight = sheetHeight / POSE_SHEET_ROWS;

  const cellBuffer = await sharp(sheetPath)
    .extract({
      left: Math.round(col * cellWidth) - marginLeft,
      top: Math.round(row * cellHeight) - marginTop,
      width: Math.round(cellWidth) + marginLeft + marginRight,
      height: Math.round(cellHeight) + marginTop + marginBottom,
    })
    .toBuffer();

  const { data, info } = await sharp(cellBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.from(data);
  for (let i = 0; i < rgba.length; i += 4) {
    const distance = distanceToWhite(rgba[i], rgba[i + 1], rgba[i + 2]);
    rgba[i + 3] = alphaFromDistance(
      distance,
      INNER_THRESHOLD,
      OUTER_THRESHOLD,
    );
  }

  const cutoutBuffer = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const trimmed = await sharp(cutoutBuffer).trim().resize({ width: 600 }).png({ compressionLevel: 9 }).toBuffer();

  await write(`public/brand/${outputName}.png`, trimmed);
}

await main();
