import { describe, expect, it } from "vitest";

import { hasHeroMedia, resolveHeroMedia } from "@/features/menu/media";

const VIDEO = {
  sources: [{ src: "/hero.mp4", type: "video/mp4" }],
  poster: "/hero-poster.jpg",
};
const POSTER_ONLY = { sources: [], poster: "/hero-poster.jpg" };
const NOTHING = { sources: [], poster: null };

describe("resolveHeroMedia", () => {
  it("escolhe vídeo quando há fonte e o usuário não pediu movimento reduzido", () => {
    expect(resolveHeroMedia(VIDEO, false)).toBe("video");
  });

  it("cai no pôster quando há vídeo mas o usuário pediu movimento reduzido", () => {
    expect(resolveHeroMedia(VIDEO, true)).toBe("poster");
  });

  it("cai no pôster quando não há vídeo mas há pôster", () => {
    expect(resolveHeroMedia(POSTER_ONLY, false)).toBe("poster");
    expect(resolveHeroMedia(POSTER_ONLY, true)).toBe("poster");
  });

  it("cai no placeholder quando não há vídeo nem pôster", () => {
    expect(resolveHeroMedia(NOTHING, false)).toBe("placeholder");
    expect(resolveHeroMedia(NOTHING, true)).toBe("placeholder");
  });
});

describe("hasHeroMedia", () => {
  it("é true com vídeo, com pôster, ou com os dois", () => {
    expect(hasHeroMedia(VIDEO)).toBe(true);
    expect(hasHeroMedia(POSTER_ONLY)).toBe(true);
  });

  it("é false sem vídeo e sem pôster, independente de reduced-motion", () => {
    expect(hasHeroMedia(NOTHING)).toBe(false);
  });
});
