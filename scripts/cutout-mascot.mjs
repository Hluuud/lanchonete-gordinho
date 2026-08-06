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
}

await main();
