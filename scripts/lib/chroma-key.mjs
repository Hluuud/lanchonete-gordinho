/**
 * Distância euclidiana de uma cor RGB até o branco de referência do fundo
 * das artes do mascote (`Boneco.png`, `Versoes_boneco.png`).
 */
export function distanceToWhite(r, g, b) {
  const dr = 255 - r;
  const dg = 255 - g;
  const db = 255 - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Alfa (0-255) de um pixel a partir da distância até o branco: dentro de
 * `innerThreshold` é fundo puro (alfa 0); fora de `outerThreshold` é
 * conteúdo opaco (alfa 255); entre os dois, interpola linearmente (pena),
 * evitando uma borda serrilhada ao redor do personagem.
 */
export function alphaFromDistance(
  distance,
  innerThreshold = 12,
  outerThreshold = 60,
) {
  if (distance <= innerThreshold) return 0;
  if (distance >= outerThreshold) return 255;
  const t = (distance - innerThreshold) / (outerThreshold - innerThreshold);
  return Math.round(t * 255);
}
