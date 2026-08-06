/**
 * Poses do mascote "Gordinho" recortadas por `scripts/cutout-mascot.mjs` a
 * partir de `public/brand/Versoes_boneco.png`. Uma entrada por pose
 * realmente usada — adicionar uma nova exige gerar o PNG primeiro (ver
 * Task 13 do plano da Sprint 8.1).
 */
export type MascotPoseName =
  | "holding-burger"
  | "pointing-up"
  | "resting"
  | "welcoming";

export const MASCOT_POSES: Record<
  MascotPoseName,
  { src: string; alt: string }
> = {
  "holding-burger": {
    src: "/brand/mascote-pose-holding-burger.png",
    alt: "Gordinho segurando um hambúrguer",
  },
  "pointing-up": {
    src: "/brand/mascote-pose-pointing-up.png",
    alt: "Gordinho apontando para cima",
  },
  resting: {
    src: "/brand/mascote-pose-resting.png",
    alt: "Gordinho descansando",
  },
  welcoming: {
    src: "/brand/mascote-pose-welcoming.png",
    alt: "Gordinho de braços abertos, dando as boas-vindas",
  },
};
